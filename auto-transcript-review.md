# Auto Transcript Review

Automated GPA verification system using Google Document AI and Claude to extract and verify GPAs from candidate transcripts.

## Overview

### Problem
- Admins manually review every transcript to verify GPA matches what candidates entered
- Time-consuming and doesn't scale
- Inconsistent review quality

### Solution
- Automatically extract text from uploaded transcripts using Google Document AI
- Use Claude to parse the extracted text and identify the cumulative GPA
- Compare extracted GPA with candidate-entered GPA
- Auto-verify matches, flag discrepancies for human review

### Expected Outcomes
- 80-90% of transcripts auto-verified (no human review needed)
- 10-20% flagged for manual review (discrepancies, low confidence, unusual formats)
- Verification time reduced from minutes to seconds per transcript

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Transcript     │────▶│  Google Document │────▶│  Claude API     │
│  Upload         │     │  AI (OCR)        │     │  (GPA Parsing)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Admin Review   │◀────│  Verification    │◀────│  Compare &      │
│  Queue (flagged)│     │  Results Table   │     │  Decide         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Flow

1. **Trigger**: When a candidate uploads a transcript (or on-demand from admin)
2. **Extract**: Send PDF/image to Google Document AI for OCR
3. **Parse**: Send extracted text to Claude with structured prompt
4. **Compare**: Check if extracted GPA matches entered GPA (within tolerance)
5. **Decide**:
   - Match + High confidence → Auto-verify
   - Mismatch or Low confidence → Flag for review
6. **Store**: Save extraction results for audit trail

---

## Google Document AI Setup

### 1. Enable APIs in Google Cloud Console

```bash
# Enable Document AI API
gcloud services enable documentai.googleapis.com

# Enable Cloud Storage (for processing)
gcloud services enable storage.googleapis.com
```

### 2. Create a Document AI Processor

1. Go to [Document AI Console](https://console.cloud.google.com/ai/document-ai)
2. Create a new processor:
   - Type: **Document OCR** (for general text extraction)
   - Region: `us` (or your preferred region)
3. Note the processor ID and location

### 3. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create transcript-processor \
  --display-name="Transcript Processor"

# Grant Document AI User role
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:transcript-processor@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/documentai.apiUser"

# Create and download key
gcloud iam service-accounts keys create ./google-credentials.json \
  --iam-account=transcript-processor@PROJECT_ID.iam.gserviceaccount.com
```

### 4. Environment Variables

```bash
# .env.local
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_DOCUMENT_AI_LOCATION=us
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=abc123xyz
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
# Or use base64 encoded credentials for Vercel:
GOOGLE_CREDENTIALS_BASE64=eyJhbGciOiJSUzI1NiIsInR5cCI6...
```

---

## Database Schema

### New Table: `transcript_verifications`

```sql
-- Migration: 20251207000000_transcript_verifications.sql

create table transcript_verifications (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid not null references candidate_profiles(id) on delete cascade,
  transcript_id uuid references candidate_transcripts(id) on delete set null,

  -- Extraction results
  extracted_text text,
  extracted_gpa numeric(3,2),
  extracted_gpa_scale text, -- e.g., "4.0", "5.0", "100"
  extraction_confidence text check (extraction_confidence in ('high', 'medium', 'low')),

  -- Comparison
  entered_gpa numeric(3,2),
  gpa_match boolean,
  gpa_difference numeric(3,2),

  -- Verification status
  status text not null default 'pending' check (status in ('pending', 'processing', 'auto_verified', 'flagged', 'manually_verified', 'rejected', 'error')),

  -- Review info
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_notes text,

  -- Error handling
  error_message text,

  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Ensure one verification per transcript
  unique(transcript_id)
);

-- Index for admin queue
create index idx_transcript_verifications_status on transcript_verifications(status);
create index idx_transcript_verifications_candidate on transcript_verifications(candidate_profile_id);

-- RLS
alter table transcript_verifications enable row level security;

-- Only admins can view/modify
create policy "Admins can manage transcript verifications"
  on transcript_verifications for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Candidates can view their own verification status (but not extracted text)
create policy "Candidates can view own verification status"
  on transcript_verifications for select
  using (
    candidate_profile_id in (
      select id from candidate_profiles where user_id = auth.uid()
    )
  );
```

### Update `candidate_profiles` Table

```sql
-- Add verification status column if not exists
alter table candidate_profiles
add column if not exists gpa_verification_status text
default 'pending'
check (gpa_verification_status in ('pending', 'verified', 'flagged', 'rejected'));
```

---

## Implementation

### 1. Install Dependencies

```bash
cd apps/www
pnpm add @google-cloud/documentai @anthropic-ai/sdk
```

### 2. Google Document AI Client

```typescript
// lib/document-ai.ts

import { DocumentProcessorServiceClient } from '@google-cloud/documentai'

let client: DocumentProcessorServiceClient | null = null

function getClient() {
  if (client) return client

  // Handle credentials from env
  const credentials = process.env.GOOGLE_CREDENTIALS_BASE64
    ? JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString())
    : undefined

  client = new DocumentProcessorServiceClient({ credentials })
  return client
}

export async function extractTextFromDocument(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ text: string; confidence: number }> {
  const client = getClient()

  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
  const location = process.env.GOOGLE_DOCUMENT_AI_LOCATION || 'us'
  const processorId = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`

  const request = {
    name,
    rawDocument: {
      content: fileBuffer.toString('base64'),
      mimeType,
    },
  }

  const [result] = await client.processDocument(request)
  const { document } = result

  // Extract full text
  const text = document?.text || ''

  // Calculate average confidence from text segments
  let totalConfidence = 0
  let segmentCount = 0

  document?.pages?.forEach(page => {
    page.blocks?.forEach(block => {
      if (block.layout?.confidence) {
        totalConfidence += block.layout.confidence
        segmentCount++
      }
    })
  })

  const avgConfidence = segmentCount > 0 ? totalConfidence / segmentCount : 0

  return {
    text,
    confidence: avgConfidence,
  }
}
```

### 3. GPA Extraction with Claude

```typescript
// lib/gpa-extractor.ts

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface GPAExtractionResult {
  gpa: number | null
  scale: string | null
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

export async function extractGPAFromText(
  transcriptText: string
): Promise<GPAExtractionResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a college transcript to extract the student's cumulative GPA.

TRANSCRIPT TEXT:
${transcriptText}

INSTRUCTIONS:
1. Find the CUMULATIVE GPA (not semester GPA, not major GPA)
2. Identify the GPA scale (usually 4.0, but could be 5.0 or 100-point)
3. If multiple GPAs are shown, prefer "Cumulative GPA" or "Overall GPA"
4. Rate your confidence: "high" if GPA is clearly labeled, "medium" if you had to infer, "low" if uncertain

Respond with ONLY valid JSON in this exact format:
{
  "gpa": 3.75,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "Found clearly labeled 'Cumulative GPA: 3.75' on page 1"
}

If you cannot find a GPA, respond with:
{
  "gpa": null,
  "scale": null,
  "confidence": "low",
  "reasoning": "Could not locate cumulative GPA in transcript"
}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    return JSON.parse(content.text) as GPAExtractionResult
  } catch {
    // If JSON parsing fails, return low confidence result
    return {
      gpa: null,
      scale: null,
      confidence: 'low',
      reasoning: 'Failed to parse extraction response',
    }
  }
}
```

### 4. Verification Service

```typescript
// lib/transcript-verification.ts

import { createClient } from '@/lib/supabase/server'
import { extractTextFromDocument } from './document-ai'
import { extractGPAFromText, GPAExtractionResult } from './gpa-extractor'

const GPA_TOLERANCE = 0.05 // Allow 0.05 difference for rounding

export interface VerificationResult {
  success: boolean
  status: 'auto_verified' | 'flagged' | 'error'
  extractedGpa: number | null
  enteredGpa: number
  confidence: string
  reasoning: string
  error?: string
}

export async function verifyTranscript(
  candidateProfileId: string,
  transcriptId: string
): Promise<VerificationResult> {
  const supabase = await createClient()

  try {
    // 1. Get candidate's entered GPA
    const { data: candidate, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('gpa, user_id')
      .eq('id', candidateProfileId)
      .single()

    if (candidateError || !candidate?.gpa) {
      throw new Error('Could not find candidate GPA')
    }

    const enteredGpa = Number(candidate.gpa)

    // 2. Get transcript file from storage
    const { data: transcript, error: transcriptError } = await supabase
      .from('candidate_transcripts')
      .select('file_path, file_type')
      .eq('id', transcriptId)
      .single()

    if (transcriptError || !transcript) {
      throw new Error('Could not find transcript')
    }

    // 3. Download file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('transcripts')
      .download(transcript.file_path)

    if (downloadError || !fileData) {
      throw new Error('Could not download transcript file')
    }

    const fileBuffer = Buffer.from(await fileData.arrayBuffer())
    const mimeType = transcript.file_type || 'application/pdf'

    // 4. Extract text using Document AI
    const { text: extractedText, confidence: ocrConfidence } =
      await extractTextFromDocument(fileBuffer, mimeType)

    if (!extractedText || extractedText.length < 100) {
      throw new Error('Could not extract text from transcript')
    }

    // 5. Extract GPA using Claude
    const gpaResult = await extractGPAFromText(extractedText)

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
        extracted_text: extractedText.substring(0, 10000), // Limit stored text
        extracted_gpa: gpaResult.gpa,
        extracted_gpa_scale: gpaResult.scale,
        extraction_confidence: gpaResult.confidence,
        entered_gpa: enteredGpa,
        gpa_match: gpaMatch,
        gpa_difference: gpaDifference,
        status,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'transcript_id',
      })

    // 8. Update candidate verification status
    if (status === 'auto_verified') {
      await supabase
        .from('candidate_profiles')
        .update({
          gpa_verification_status: 'verified',
          status: 'verified', // Also update main status if needed
        })
        .eq('id', candidateProfileId)
    } else {
      await supabase
        .from('candidate_profiles')
        .update({ gpa_verification_status: 'flagged' })
        .eq('id', candidateProfileId)
    }

    return {
      success: true,
      status,
      extractedGpa: gpaResult.gpa,
      enteredGpa,
      confidence: gpaResult.confidence,
      reasoning: gpaResult.reasoning,
    }

  } catch (error) {
    // Store error for debugging
    await supabase
      .from('transcript_verifications')
      .upsert({
        candidate_profile_id: candidateProfileId,
        transcript_id: transcriptId,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
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
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
```

### 5. Server Actions

```typescript
// app/(portal)/admin/verification/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyTranscript } from '@/lib/transcript-verification'
import { revalidatePath } from 'next/cache'

// Verify a single transcript
export async function verifyTranscriptAction(
  candidateProfileId: string,
  transcriptId: string
) {
  const result = await verifyTranscript(candidateProfileId, transcriptId)
  revalidatePath('/admin/verification')
  return result
}

// Bulk verify all pending transcripts
export async function bulkVerifyTranscripts() {
  const supabase = await createClient()

  // Get all candidates with pending verification
  const { data: pendingCandidates } = await supabase
    .from('candidate_profiles')
    .select(`
      id,
      gpa,
      candidate_transcripts!inner(id, file_path)
    `)
    .eq('gpa_verification_status', 'pending')
    .limit(50) // Process in batches

  if (!pendingCandidates) return { processed: 0, results: [] }

  const results = []

  for (const candidate of pendingCandidates) {
    const transcript = candidate.candidate_transcripts[0]
    if (!transcript) continue

    const result = await verifyTranscript(candidate.id, transcript.id)
    results.push({
      candidateId: candidate.id,
      ...result,
    })

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  revalidatePath('/admin/verification')

  return {
    processed: results.length,
    results,
  }
}

// Get verification queue for admin review
export async function getVerificationQueue() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transcript_verifications')
    .select(`
      *,
      candidate_profiles(
        id,
        gpa,
        school_name,
        profiles(full_name, email)
      )
    `)
    .in('status', ['flagged', 'error'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data
}

// Manual verification decision
export async function manualVerifyTranscript(
  verificationId: string,
  decision: 'verified' | 'rejected',
  notes: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get the verification record
  const { data: verification } = await supabase
    .from('transcript_verifications')
    .select('candidate_profile_id')
    .eq('id', verificationId)
    .single()

  if (!verification) throw new Error('Verification not found')

  // Update verification record
  await supabase
    .from('transcript_verifications')
    .update({
      status: decision === 'verified' ? 'manually_verified' : 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq('id', verificationId)

  // Update candidate status
  await supabase
    .from('candidate_profiles')
    .update({
      gpa_verification_status: decision,
      status: decision === 'verified' ? 'verified' : 'rejected',
    })
    .eq('id', verification.candidate_profile_id)

  revalidatePath('/admin/verification')
}
```

### 6. Trigger on Upload (Optional)

```typescript
// In the transcript upload handler, trigger verification
// app/(portal)/candidate/edit-profile/actions.ts

export async function uploadTranscript(formData: FormData) {
  // ... existing upload logic ...

  // After successful upload, queue verification
  // Could use a background job queue like Inngest, or just call directly
  await verifyTranscript(candidateProfileId, newTranscriptId)
}
```

---

## Admin UI Updates

### Verification Queue Page

Create a new page at `/admin/verification` showing:

1. **Stats Dashboard**
   - Total pending verifications
   - Auto-verified today
   - Flagged for review
   - Error rate

2. **Review Queue**
   - List of flagged/error verifications
   - Show: Candidate name, entered GPA, extracted GPA, confidence, reasoning
   - Actions: View transcript, Approve, Reject

3. **Bulk Actions**
   - "Process All Pending" button
   - Filter by status

### Existing Admin Pages

Update `/admin/candidates` to show:
- GPA verification status badge
- Link to verification details

---

## Cost Estimates

### Google Document AI
- $1.50 per 1,000 pages (Document OCR processor)
- Most transcripts: 1-4 pages
- **~$0.002-0.006 per transcript**

### Claude API (claude-sonnet-4-20250514)
- $3 per million input tokens
- $15 per million output tokens
- Transcript text: ~2,000 tokens avg
- Output: ~100 tokens
- **~$0.008 per transcript**

### Total Cost
- **~$0.01-0.02 per transcript**
- 1,000 transcripts = $10-20
- 10,000 transcripts = $100-200

---

## Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| Scanned/blurry transcript | Document AI still extracts, Claude handles noise |
| Multiple GPAs shown | Claude prompted to find "cumulative" |
| Non-English transcript | Document AI supports 200+ languages, may need translation |
| No GPA found | Flag for manual review |
| Different GPA scale | Claude extracts scale, we normalize |
| Corrupted PDF | Catch error, flag for manual review |
| Rate limit hit | Implement exponential backoff |
| API timeout | Retry with shorter text chunks |

---

## Testing Strategy

### Unit Tests
- GPA extraction prompt accuracy
- GPA comparison logic (tolerance, scale normalization)
- Error handling paths

### Integration Tests
- Full flow with sample transcripts
- Mock Document AI responses
- Mock Claude responses

### Manual Testing
- Test with 10-20 real transcripts from different schools
- Verify accuracy before enabling auto-verification

### Sample Transcripts to Test
1. Clear digital PDF with labeled GPA
2. Scanned transcript (image-based)
3. Transcript with multiple GPAs (semester, cumulative, major)
4. International transcript (different format)
5. Transcript without explicit GPA label

---

## Rollout Plan

### Phase 1: Shadow Mode (Week 1)
- Process transcripts but don't auto-verify
- Store results for review
- Measure accuracy against manual verifications

### Phase 2: Assisted Mode (Week 2)
- Show extraction results to admin
- Admin confirms/rejects
- Build confidence in system

### Phase 3: Auto-Verify High Confidence (Week 3)
- Auto-verify when: match + high confidence
- Flag everything else for review
- Monitor error rates

### Phase 4: Full Automation (Week 4+)
- Auto-verify medium confidence matches
- Only flag low confidence + mismatches
- Periodic audits of auto-verified candidates

---

## Future Enhancements

1. **School-specific processors** - Train custom Document AI processor for common transcript formats
2. **Batch processing** - Use Document AI batch mode for bulk uploads
3. **Caching** - Cache extraction results to avoid reprocessing
4. **Webhooks** - Notify candidates when verified/flagged
5. **Analytics** - Track verification success rates by school
6. **Additional fields** - Extract graduation date, major, honors
