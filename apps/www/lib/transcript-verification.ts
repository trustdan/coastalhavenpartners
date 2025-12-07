import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { extractGPAFromDocument, countPdfPages } from './gpa-extractor'

// GPA comparison tolerance - allows for minor rounding differences
const GPA_TOLERANCE = 0.05

// Create admin client for server-side operations
// Note: Using 'any' type because transcript_verifications table
// isn't in the generated types yet. Run `pnpm supabase gen types` after migration.
function getAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export interface VerificationResult {
  success: boolean
  status: 'auto_verified' | 'flagged' | 'error'
  extractedGpa: number | null
  enteredGpa: number
  confidence: string
  reasoning: string
  extractionMethod: 'claude' | 'none'
  error?: string
}

export async function verifyTranscript(
  candidateProfileId: string,
  transcriptId: string
): Promise<VerificationResult> {
  const supabase = getAdminClient()

  // Very visible log to confirm new code is running
  console.log('========== TRANSCRIPT VERIFICATION v3 (Claude OCR Only) ==========')
  console.log('[Verification] Starting transcript verification', {
    candidateProfileId,
    transcriptId,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
  })

  try {
    // 1. Get candidate's entered GPA from the transcript record
    const { data: transcript, error: transcriptError } = await supabase
      .from('candidate_transcripts')
      .select('transcript_url, gpa, candidate_profile_id')
      .eq('id', transcriptId)
      .single()

    if (transcriptError || !transcript) {
      throw new Error('Could not find transcript')
    }

    // Get candidate profile GPA if transcript doesn't have one
    let enteredGpa: number
    if (transcript.gpa) {
      enteredGpa = Number(transcript.gpa)
    } else {
      const { data: candidate, error: candidateError } = await supabase
        .from('candidate_profiles')
        .select('gpa')
        .eq('id', candidateProfileId)
        .single()

      if (candidateError || !candidate?.gpa) {
        throw new Error('Could not find candidate GPA')
      }
      enteredGpa = Number(candidate.gpa)
    }

    // 2. Mark verification as processing
    await supabase
      .from('transcript_verifications')
      .upsert({
        candidate_profile_id: candidateProfileId,
        transcript_id: transcriptId,
        entered_gpa: enteredGpa,
        status: 'processing',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'transcript_id',
      })

    // 3. Download transcript file from URL
    const transcriptUrl = transcript.transcript_url
    const response = await fetch(transcriptUrl)

    if (!response.ok) {
      throw new Error(`Could not download transcript file: ${response.status}`)
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer())

    // Determine MIME type from URL or default to PDF
    const mimeType = transcriptUrl.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : transcriptUrl.toLowerCase().match(/\.(jpg|jpeg)$/i)
        ? 'image/jpeg'
        : transcriptUrl.toLowerCase().endsWith('.png')
          ? 'image/png'
          : 'application/pdf'

    // 4. Check page count for PDFs to prevent abuse
    if (mimeType === 'application/pdf') {
      const pageCount = countPdfPages(fileBuffer)
      console.log('[Verification] PDF page count:', pageCount)

      if (pageCount > 5) {
        throw new Error(`Document has ${pageCount} pages, which exceeds the maximum allowed (5 pages). Please upload a shorter transcript or just the page containing your cumulative GPA.`)
      }
    }

    // 5. Use Claude OCR to extract GPA directly from the document
    let gpaResult: {
      gpa: number | null
      scale: string | null
      confidence: 'high' | 'medium' | 'low'
      reasoning: string
    }
    let extractionMethod: 'claude' | 'none' = 'none'

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured. Claude OCR is required for transcript verification.')
    }

    console.log('[Verification] Using Claude Vision OCR...')
    const claudeResult = await extractGPAFromDocument(fileBuffer, mimeType)
    gpaResult = claudeResult
    extractionMethod = 'claude'
    // Log full details for Vercel debugging
    console.log('[Verification] Claude extraction result:', JSON.stringify({
      gpa: claudeResult.gpa,
      scale: claudeResult.scale,
      confidence: claudeResult.confidence,
      reasoningLength: claudeResult.reasoning.length,
      reasoningPreview: claudeResult.reasoning.substring(0, 200),
      isParseError: claudeResult.reasoning.startsWith('[PARSE_ERROR]'),
      isFallback: claudeResult.reasoning.startsWith('Fallback'),
    }, null, 2))

    // 6. Determine verification status
    let status: 'auto_verified' | 'flagged' = 'flagged'
    let gpaMatch = false
    let gpaDifference: number | null = null

    if (gpaResult.gpa !== null) {
      // Normalize GPA to 4.0 scale if needed
      let normalizedGpa = gpaResult.gpa
      if (gpaResult.scale === '5.0') {
        normalizedGpa = (gpaResult.gpa / 5.0) * 4.0
      } else if (gpaResult.scale === '100') {
        normalizedGpa = (gpaResult.gpa / 100) * 4.0
      }

      gpaDifference = Math.abs(enteredGpa - normalizedGpa)
      gpaMatch = gpaDifference <= GPA_TOLERANCE

      // Auto-verify only if match AND high/medium confidence
      if (gpaMatch && gpaResult.confidence !== 'low') {
        status = 'auto_verified'
      }
    }

    // 7. Store verification result
    await supabase
      .from('transcript_verifications')
      .upsert({
        candidate_profile_id: candidateProfileId,
        transcript_id: transcriptId,
        extracted_text: '', // No longer storing extracted text (using vision directly)
        extracted_gpa: gpaResult.gpa,
        extracted_gpa_scale: gpaResult.scale,
        extraction_confidence: gpaResult.confidence,
        extraction_reasoning: `[${extractionMethod}] ${gpaResult.reasoning}`,
        entered_gpa: enteredGpa,
        gpa_match: gpaMatch,
        gpa_difference: gpaDifference,
        status,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'transcript_id',
      })

    // 8. Update transcript verification status based on result
    if (status === 'auto_verified') {
      await supabase
        .from('candidate_transcripts')
        .update({
          gpa_verified: true,
          is_verified: true,
        })
        .eq('id', transcriptId)
    }

    // 9. Update candidate profile status based on ALL their transcripts
    // Only mark as 'verified' if ALL transcripts with GPA are verified
    const { data: allTranscripts } = await supabase
      .from('candidate_transcripts')
      .select('id, gpa, gpa_verified')
      .eq('candidate_profile_id', candidateProfileId)

    const transcriptsWithGpa = allTranscripts?.filter(t => t.gpa !== null) || []
    const allVerified = transcriptsWithGpa.length > 0 &&
      transcriptsWithGpa.every(t => t.gpa_verified === true)
    const anyFlagged = transcriptsWithGpa.some(t => t.gpa_verified === false)

    let candidateStatus: 'verified' | 'flagged' | 'pending' = 'pending'
    if (allVerified) {
      candidateStatus = 'verified'
    } else if (anyFlagged) {
      candidateStatus = 'flagged'
    }

    await supabase
      .from('candidate_profiles')
      .update({ gpa_verification_status: candidateStatus })
      .eq('id', candidateProfileId)

    console.log('[Verification] COMPLETE:', JSON.stringify({
      status,
      extractionMethod,
      extractedGpa: gpaResult.gpa,
      enteredGpa,
      gpaMatch,
      gpaDifference,
      confidence: gpaResult.confidence,
      shouldAutoVerify: gpaMatch && gpaResult.confidence !== 'low',
      toleranceUsed: GPA_TOLERANCE,
    }, null, 2))

    return {
      success: true,
      status,
      extractedGpa: gpaResult.gpa,
      enteredGpa,
      confidence: gpaResult.confidence,
      reasoning: gpaResult.reasoning,
      extractionMethod,
    }

  } catch (error) {
    console.error('[Verification] ERROR', {
      candidateProfileId,
      transcriptId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Store error for debugging
    await supabase
      .from('transcript_verifications')
      .upsert({
        candidate_profile_id: candidateProfileId,
        transcript_id: transcriptId,
        status: 'error',
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'transcript_id',
      })

    return {
      success: false,
      status: 'error',
      extractedGpa: null,
      enteredGpa: 0,
      confidence: 'low',
      reasoning: '',
      extractionMethod: 'none',
      error: errorMessage,
    }
  }
}

// Bulk verify all pending transcripts
export async function bulkVerifyTranscripts(limit = 50): Promise<{
  processed: number
  results: Array<{
    candidateId: string
    transcriptId: string
    result: VerificationResult
  }>
}> {
  const supabase = getAdminClient()

  // Get all transcripts that need verification
  // (have GPA set but not verified, and no existing verification record or pending status)
  const { data: pendingTranscripts, error } = await supabase
    .from('candidate_transcripts')
    .select(`
      id,
      candidate_profile_id,
      gpa
    `)
    .eq('gpa_verified', false)
    .not('gpa', 'is', null)
    .limit(limit)

  if (error || !pendingTranscripts) {
    return { processed: 0, results: [] }
  }

  // Filter out transcripts that already have a verification in progress or completed
  const transcriptIds = pendingTranscripts.map(t => t.id)
  const { data: existingVerifications } = await supabase
    .from('transcript_verifications')
    .select('transcript_id, status')
    .in('transcript_id', transcriptIds)

  const existingMap = new Map(
    existingVerifications?.map(v => [v.transcript_id, v.status]) || []
  )

  const toProcess = pendingTranscripts.filter(t => {
    const existing = existingMap.get(t.id)
    // Process if no existing verification OR if previous attempt errored/pending
    // Does NOT include 'flagged' - use reprocessFlaggedTranscripts for that
    return !existing || existing === 'error' || existing === 'pending'
  })

  const results: Array<{
    candidateId: string
    transcriptId: string
    result: VerificationResult
  }> = []

  for (const transcript of toProcess) {
    const result = await verifyTranscript(
      transcript.candidate_profile_id,
      transcript.id
    )

    results.push({
      candidateId: transcript.candidate_profile_id,
      transcriptId: transcript.id,
      result,
    })

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return {
    processed: results.length,
    results,
  }
}

// Get verification queue for admin review
export async function getVerificationQueue() {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('transcript_verifications')
    .select(`
      *,
      candidate_profiles(
        id,
        gpa,
        school_name,
        user_id
      )
    `)
    .in('status', ['flagged', 'error'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error

  // Fetch profile info separately to avoid nested RLS issues
  const userIds = data?.map(v => v.candidate_profiles?.user_id).filter(Boolean) as string[]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  return data?.map(v => ({
    ...v,
    profile: v.candidate_profiles?.user_id
      ? profileMap.get(v.candidate_profiles.user_id)
      : null,
  })) || []
}

// Get verification stats for dashboard
export async function getVerificationStats() {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('transcript_verifications')
    .select('status')

  if (error) throw error

  const stats = {
    total: data?.length || 0,
    pending: 0,
    processing: 0,
    autoVerified: 0,
    flagged: 0,
    manuallyVerified: 0,
    rejected: 0,
    error: 0,
  }

  data?.forEach(v => {
    switch (v.status) {
      case 'pending': stats.pending++; break
      case 'processing': stats.processing++; break
      case 'auto_verified': stats.autoVerified++; break
      case 'flagged': stats.flagged++; break
      case 'manually_verified': stats.manuallyVerified++; break
      case 'rejected': stats.rejected++; break
      case 'error': stats.error++; break
    }
  })

  return stats
}

// Reprocess only flagged transcripts (after code fixes)
export async function reprocessFlaggedTranscripts(limit = 50): Promise<{
  processed: number
  results: Array<{
    candidateId: string
    transcriptId: string
    result: VerificationResult
  }>
}> {
  const supabase = getAdminClient()

  // Get flagged verifications
  const { data: flaggedVerifications, error } = await supabase
    .from('transcript_verifications')
    .select('transcript_id, candidate_profile_id')
    .eq('status', 'flagged')
    .limit(limit)

  if (error || !flaggedVerifications || flaggedVerifications.length === 0) {
    return { processed: 0, results: [] }
  }

  const results: Array<{
    candidateId: string
    transcriptId: string
    result: VerificationResult
  }> = []

  for (const verification of flaggedVerifications) {
    if (!verification.transcript_id || !verification.candidate_profile_id) continue

    const result = await verifyTranscript(
      verification.candidate_profile_id,
      verification.transcript_id
    )

    results.push({
      candidateId: verification.candidate_profile_id,
      transcriptId: verification.transcript_id,
      result,
    })

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return {
    processed: results.length,
    results,
  }
}
