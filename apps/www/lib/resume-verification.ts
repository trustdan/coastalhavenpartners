import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// Lazy initialization to avoid errors when API key isn't set
let anthropic: Anthropic | null = null

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return anthropic
}

// Create admin client for server-side operations
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

export interface ResumeVerificationResult {
  success: boolean
  status: 'auto_verified' | 'flagged' | 'error'
  isValidResume: boolean | null
  appearsAuthentic: boolean | null
  fakeIndicators: string[]
  confidence: number
  reasoning: string
  error?: string
}

interface ClaudeResumeAnalysis {
  isResume: boolean
  appearsAuthentic: boolean
  fakeIndicators: string[]
  confidence: number
  reasoning: string
}

async function analyzeResumeWithClaude(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ClaudeResumeAnalysis> {
  const supportedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ]

  if (!supportedTypes.includes(mimeType)) {
    return {
      isResume: false,
      appearsAuthentic: false,
      fakeIndicators: [`Unsupported file type: ${mimeType}`],
      confidence: 0,
      reasoning: `Cannot analyze file type: ${mimeType}`,
    }
  }

  const base64Data = fileBuffer.toString('base64')
  const isPdf = mimeType === 'application/pdf'

  const response = await getAnthropicClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          isPdf
            ? {
                type: 'document' as const,
                source: {
                  type: 'base64' as const,
                  media_type: mimeType as 'application/pdf',
                  data: base64Data,
                },
              }
            : {
                type: 'image' as const,
                source: {
                  type: 'base64' as const,
                  media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: base64Data,
                },
              },
          {
            type: 'text' as const,
            text: `You are a resume verification assistant. Analyze this document to determine:

1. IS THIS A RESUME/CV?
   - Does it have the structure and format of a professional resume?
   - Contains sections like: Contact Info, Education, Experience, Skills
   - NOT a transcript, essay, cover letter, or other document type

2. DOES IT APPEAR TO BE FOR A REAL PERSON?
   Check for these FAKE/PLACEHOLDER indicators:
   - Generic placeholder names: Jane Doe, John Doe, John Smith, Test User, Sample Resume, Your Name Here, First Last
   - Fake phone numbers: 555-555-5555, 123-456-7890, (555) 555-5555, 000-000-0000
   - Fake/template emails: test@test.com, email@email.com, your.email@example.com, jane.doe@email.com
   - Lorem ipsum or obvious placeholder text
   - Template filler content like "[Your Address Here]", "[Company Name]", "XX/XXXX"
   - Clearly fictional companies or experiences
   - Addresses that are obviously fake (123 Main Street, Anytown, USA)

3. CONFIDENCE LEVEL
   - 0.9-1.0: Clearly a real resume for a real person
   - 0.7-0.89: Likely real but has some minor concerns
   - 0.5-0.69: Uncertain, needs manual review
   - 0.0-0.49: Likely fake or not a resume

RESPOND WITH ONLY JSON (no markdown, no explanation):
{
  "isResume": true,
  "appearsAuthentic": true,
  "fakeIndicators": [],
  "confidence": 0.95,
  "reasoning": "Document is formatted as a professional resume with standard sections. Contains specific personal details including a unique name, professional email, and realistic employment history."
}

If fake indicators found:
{
  "isResume": true,
  "appearsAuthentic": false,
  "fakeIndicators": ["Placeholder name: Jane Doe", "Fake phone: 555-555-5555", "Template email format"],
  "confidence": 0.2,
  "reasoning": "While formatted as a resume, contains multiple placeholder indicators suggesting this is a template or dummy resume."
}

If not a resume:
{
  "isResume": false,
  "appearsAuthentic": false,
  "fakeIndicators": ["Document is not a resume"],
  "confidence": 0.1,
  "reasoning": "This appears to be [describe what it actually is] rather than a resume/CV."
}`,
          },
        ],
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    // Clean up the response - remove any markdown code blocks if present
    let jsonText = content.text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7)
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3)
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3)
    }
    jsonText = jsonText.trim()

    const result = JSON.parse(jsonText) as ClaudeResumeAnalysis

    // Validate the result structure
    return {
      isResume: Boolean(result.isResume),
      appearsAuthentic: Boolean(result.appearsAuthentic),
      fakeIndicators: Array.isArray(result.fakeIndicators) ? result.fakeIndicators : [],
      confidence: typeof result.confidence === 'number' ? Math.min(1, Math.max(0, result.confidence)) : 0,
      reasoning: result.reasoning || 'No reasoning provided',
    }
  } catch {
    console.error('[Resume Verification] Failed to parse Claude response:', content.text)
    return {
      isResume: false,
      appearsAuthentic: false,
      fakeIndicators: ['Failed to parse AI response'],
      confidence: 0,
      reasoning: `Parse error: ${content.text.substring(0, 200)}`,
    }
  }
}

export async function verifyResume(
  candidateProfileId: string,
  resumeId: string
): Promise<ResumeVerificationResult> {
  const supabase = getAdminClient()

  console.log('========== RESUME VERIFICATION ==========')
  console.log('[Resume Verification] Starting', {
    candidateProfileId,
    resumeId,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
  })

  try {
    // 1. Get resume record
    const { data: resume, error: resumeError } = await supabase
      .from('candidate_resumes')
      .select('resume_url, candidate_profile_id')
      .eq('id', resumeId)
      .single()

    if (resumeError || !resume) {
      throw new Error('Could not find resume')
    }

    // 2. Mark verification as processing
    await supabase
      .from('resume_verifications')
      .upsert({
        candidate_profile_id: candidateProfileId,
        resume_id: resumeId,
        status: 'processing',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'resume_id',
      })

    // 3. Download resume file
    const resumeUrl = resume.resume_url
    const response = await fetch(resumeUrl)

    if (!response.ok) {
      throw new Error(`Could not download resume file: ${response.status}`)
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer())

    // Determine MIME type from URL
    const mimeType = resumeUrl.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : resumeUrl.toLowerCase().match(/\.(jpg|jpeg)$/i)
        ? 'image/jpeg'
        : resumeUrl.toLowerCase().endsWith('.png')
          ? 'image/png'
          : 'application/pdf'

    // 4. Analyze with Claude
    console.log('[Resume Verification] Analyzing with Claude...')
    const analysis = await analyzeResumeWithClaude(fileBuffer, mimeType)

    console.log('[Resume Verification] Claude analysis:', {
      isResume: analysis.isResume,
      appearsAuthentic: analysis.appearsAuthentic,
      fakeIndicatorsCount: analysis.fakeIndicators.length,
      confidence: analysis.confidence,
    })

    // 5. Determine verification status
    let status: 'auto_verified' | 'flagged' = 'flagged'

    // Auto-verify if: is a resume AND appears authentic AND high confidence (>= 0.8)
    if (analysis.isResume && analysis.appearsAuthentic && analysis.confidence >= 0.8) {
      status = 'auto_verified'
    }

    // 6. Store verification result
    await supabase
      .from('resume_verifications')
      .upsert({
        candidate_profile_id: candidateProfileId,
        resume_id: resumeId,
        is_valid_resume: analysis.isResume,
        appears_authentic: analysis.appearsAuthentic,
        fake_indicators: analysis.fakeIndicators,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        status,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'resume_id',
      })

    // 7. Update resume verification status if auto-verified
    if (status === 'auto_verified') {
      await supabase
        .from('candidate_resumes')
        .update({
          is_verified: true,
        })
        .eq('id', resumeId)
    }

    // 8. Update candidate profile resume verification status
    // Check all their resumes to determine overall status
    const { data: allResumes } = await supabase
      .from('candidate_resumes')
      .select('id, is_verified')
      .eq('candidate_profile_id', candidateProfileId)

    const { data: allVerifications } = await supabase
      .from('resume_verifications')
      .select('status')
      .eq('candidate_profile_id', candidateProfileId)

    const hasVerifiedResume = allResumes?.some(r => r.is_verified) || false
    const hasFlaggedResume = allVerifications?.some(v => v.status === 'flagged') || false

    let candidateStatus: 'verified' | 'flagged' | 'pending' = 'pending'
    if (hasVerifiedResume && !hasFlaggedResume) {
      candidateStatus = 'verified'
    } else if (hasFlaggedResume) {
      candidateStatus = 'flagged'
    }

    await supabase
      .from('candidate_profiles')
      .update({ resume_verification_status: candidateStatus })
      .eq('id', candidateProfileId)

    console.log('[Resume Verification] COMPLETE', {
      status,
      isResume: analysis.isResume,
      appearsAuthentic: analysis.appearsAuthentic,
      confidence: analysis.confidence,
    })

    return {
      success: true,
      status,
      isValidResume: analysis.isResume,
      appearsAuthentic: analysis.appearsAuthentic,
      fakeIndicators: analysis.fakeIndicators,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
    }

  } catch (error) {
    console.error('[Resume Verification] ERROR', {
      candidateProfileId,
      resumeId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Store error for debugging
    await supabase
      .from('resume_verifications')
      .upsert({
        candidate_profile_id: candidateProfileId,
        resume_id: resumeId,
        status: 'error',
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'resume_id',
      })

    return {
      success: false,
      status: 'error',
      isValidResume: null,
      appearsAuthentic: null,
      fakeIndicators: [],
      confidence: 0,
      reasoning: '',
      error: errorMessage,
    }
  }
}

// Bulk verify all pending resumes
export async function bulkVerifyResumes(limit = 50): Promise<{
  processed: number
  results: Array<{
    candidateId: string
    resumeId: string
    result: ResumeVerificationResult
  }>
}> {
  const supabase = getAdminClient()

  // Get all resumes that need verification (not verified and no existing verification record or error/pending status)
  const { data: pendingResumes, error } = await supabase
    .from('candidate_resumes')
    .select('id, candidate_profile_id')
    .eq('is_verified', false)
    .limit(limit)

  if (error || !pendingResumes) {
    return { processed: 0, results: [] }
  }

  // Filter out resumes that already have a verification in progress or completed
  const resumeIds = pendingResumes.map(r => r.id)
  const { data: existingVerifications } = await supabase
    .from('resume_verifications')
    .select('resume_id, status')
    .in('resume_id', resumeIds)

  const existingMap = new Map(
    existingVerifications?.map(v => [v.resume_id, v.status]) || []
  )

  const toProcess = pendingResumes.filter(r => {
    const existing = existingMap.get(r.id)
    // Process if no existing verification OR if previous attempt errored/pending
    // Does NOT include 'flagged' - use reprocessFlaggedResumes for that
    return !existing || existing === 'error' || existing === 'pending'
  })

  const results: Array<{
    candidateId: string
    resumeId: string
    result: ResumeVerificationResult
  }> = []

  for (const resume of toProcess) {
    const result = await verifyResume(
      resume.candidate_profile_id,
      resume.id
    )

    results.push({
      candidateId: resume.candidate_profile_id,
      resumeId: resume.id,
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
export async function getResumeVerificationQueue() {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('resume_verifications')
    .select(`
      *,
      candidate_profiles(
        id,
        school_name,
        user_id
      )
    `)
    .in('status', ['flagged', 'error'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error

  // Fetch profile info separately
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
export async function getResumeVerificationStats() {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('resume_verifications')
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

// Reprocess only flagged resumes (after code fixes)
export async function reprocessFlaggedResumes(limit = 50): Promise<{
  processed: number
  results: Array<{
    candidateId: string
    resumeId: string
    result: ResumeVerificationResult
  }>
}> {
  const supabase = getAdminClient()

  // Get flagged verifications
  const { data: flaggedVerifications, error } = await supabase
    .from('resume_verifications')
    .select('resume_id, candidate_profile_id')
    .eq('status', 'flagged')
    .limit(limit)

  if (error || !flaggedVerifications || flaggedVerifications.length === 0) {
    return { processed: 0, results: [] }
  }

  const results: Array<{
    candidateId: string
    resumeId: string
    result: ResumeVerificationResult
  }> = []

  for (const verification of flaggedVerifications) {
    if (!verification.resume_id || !verification.candidate_profile_id) continue

    const result = await verifyResume(
      verification.candidate_profile_id,
      verification.resume_id
    )

    results.push({
      candidateId: verification.candidate_profile_id,
      resumeId: verification.resume_id,
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
