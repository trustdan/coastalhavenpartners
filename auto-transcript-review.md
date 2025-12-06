# Auto Transcript Review

Automated GPA verification system using Google Document AI and Claude to extract and verify GPAs from candidate transcripts.

## Overview

### Problem
- Admins manually review every transcript to verify GPA matches what candidates entered
- Time-consuming and doesn't scale
- Inconsistent review quality

### Solution
- Automatically extract GPA from uploaded transcripts using a cascading approach:
  1. **Google Form Parser** - Structured GPA extraction (cheapest, fastest)
  2. **Claude Text Analysis** - Analyze extracted text if Form Parser fails
  3. **Claude Vision Analysis** - Directly read PDF/images if text extraction fails
- Compare extracted GPA with candidate-entered GPA (0.05 tolerance)
- Auto-verify matches, flag discrepancies for human review
- Support multiple transcripts per candidate (undergrad + graduate)

### Expected Outcomes
- 80-90% of transcripts auto-verified (no human review needed)
- 10-20% flagged for manual review (discrepancies, low confidence, unusual formats)
- Verification time reduced from minutes to seconds per transcript

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Transcript     │────▶│  Google Form     │────▶│  GPA Found?     │
│  Upload         │     │  Parser          │     │  High Confidence│
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                              ┌────────────────YES────────┘
                              │                 NO
                              ▼                 │
                   ┌──────────────────┐         ▼
                   │  Use Form Parser │    ┌──────────────────┐
                   │  Result          │    │  Text Available? │
                   └──────────────────┘    │  (>100 chars)    │
                                           └────────┬─────────┘
                              ┌────────────YES──────┘
                              │                 NO
                              ▼                 │
                   ┌──────────────────┐         ▼
                   │  Claude Text     │    ┌──────────────────┐
                   │  Analysis        │    │  Claude Vision   │
                   └──────────────────┘    │  (Read PDF/Image)│
                              │            └────────┬─────────┘
                              └──────────┬──────────┘
                                         ▼
                              ┌──────────────────┐
                              │  Compare GPA     │
                              │  (0.05 tolerance)│
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                      │
              Match + Med/High                    Mismatch or Low
              Confidence                         Confidence
                    │                                      │
                    ▼                                      ▼
           ┌──────────────┐                      ┌──────────────┐
           │ Auto-Verify  │                      │ Flag for     │
           │ Transcript   │                      │ Review       │
           └──────────────┘                      └──────────────┘
```

### Multiple Transcripts Per Candidate

Candidates can upload multiple transcripts (e.g., undergrad + graduate). The system:
1. Verifies each transcript independently
2. Each transcript has its own `gpa` and `gpa_verified` status
3. Candidate is only marked "verified" when **ALL** transcripts with GPA pass
4. If **ANY** transcript is flagged, candidate stays "flagged"

---

## File Structure

```
apps/www/
├── lib/
│   ├── document-ai.ts           # Google Document AI client
│   │   ├── extractTextFromDocument()      # OCR processor (optional)
│   │   └── extractGPAWithFormParser()     # Form Parser (primary)
│   │
│   ├── gpa-extractor.ts         # Claude-based GPA extraction
│   │   ├── extractGPAFromText()           # Analyze extracted text
│   │   └── extractGPAFromDocument()       # Vision analysis (fallback)
│   │
│   └── transcript-verification.ts  # Main verification logic
│       ├── verifyTranscript()             # Verify single transcript
│       ├── bulkVerifyTranscripts()        # Batch processing
│       ├── getVerificationQueue()         # Admin queue
│       └── getVerificationStats()         # Dashboard stats
│
├── app/(portal)/admin/
│   ├── verification/
│   │   ├── page.tsx                       # Verification dashboard
│   │   ├── verification-card.tsx          # Manual verification UI
│   │   ├── auto-verification-card.tsx     # AI flagged items UI
│   │   └── bulk-verify-button.tsx         # Batch process button
│   └── actions.ts                         # Server actions
```

---

## Environment Variables

```bash
# .env.local

# =============================================
# Google Cloud Document AI
# =============================================

# Project ID from Google Cloud Console
GOOGLE_CLOUD_PROJECT_ID=coastal-haven-partners

# Document AI location (us or eu)
GOOGLE_DOCUMENT_AI_LOCATION=us

# Form Parser Processor ID (PRIMARY - for structured GPA extraction)
# Create at: https://console.cloud.google.com/ai/document-ai
# Processor type: "Form Parser"
GOOGLE_DOCUMENT_AI_FORM_PARSER_ID=24d9469df0013cf5

# OCR Processor ID (OPTIONAL - for text extraction fallback)
# Only needed if Form Parser doesn't return text
# Processor type: "Document OCR"
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=your-processor-id

# Service Account Credentials (base64 encoded JSON)
# Generate: cat google-credentials.json | base64
GOOGLE_CREDENTIALS_BASE64=eyJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsIC...

# =============================================
# Anthropic API (Claude)
# =============================================

# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Setting Up Google Document AI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Document AI API
3. Create a **Form Parser** processor:
   - Navigate to Document AI > Create Processor
   - Select "Form Parser"
   - Region: `us`
   - Copy the Processor ID
4. Create a service account with `Document AI API User` role
5. Download the JSON key file
6. Base64 encode it: `cat google-credentials.json | base64`
7. Add to `.env.local`

---

## Verification Flow Details

### 1. Form Parser (Primary)

```typescript
// Tries to extract structured GPA from document
const formParserResult = await extractGPAWithFormParser(fileBuffer, mimeType)

// Returns:
{
  gpa: 3.75,           // Extracted GPA value
  scale: "4.0",        // GPA scale
  confidence: "high",  // high | medium | low
  reasoning: "Found 'Cumulative GPA' field",
  rawText: "..."       // Full document text
}
```

Form Parser looks for:
- `Cumulative GPA`, `Overall GPA`, `CGPA`, `Career GPA`
- Avoids `Semester GPA`, `Term GPA`, `Quarter GPA`

### 2. Claude Text Analysis (Fallback #1)

If Form Parser doesn't find GPA with good confidence but returns text:

```typescript
const claudeResult = await extractGPAFromText(extractedText)
```

Uses Claude Sonnet 4 to analyze the transcript text and find cumulative GPA.

### 3. Claude Vision Analysis (Fallback #2)

If text extraction fails (< 100 chars), sends document directly to Claude:

```typescript
const visionResult = await extractGPAFromDocument(fileBuffer, mimeType)
```

Claude visually reads the PDF/image and extracts GPA. More expensive but handles edge cases.

### 4. GPA Comparison

```typescript
const GPA_TOLERANCE = 0.05  // Allow 0.05 difference

// Normalize GPA to 4.0 scale
let normalizedGpa = extractedGpa
if (scale === '5.0') normalizedGpa = (extractedGpa / 5.0) * 4.0
if (scale === '100') normalizedGpa = (extractedGpa / 100) * 4.0

// Compare
const gpaDifference = Math.abs(enteredGpa - normalizedGpa)
const gpaMatch = gpaDifference <= GPA_TOLERANCE

// Auto-verify only if match AND confidence is not low
if (gpaMatch && confidence !== 'low') {
  status = 'auto_verified'
}
```

### 5. Candidate Status Logic

After verifying a transcript, the system checks ALL transcripts for that candidate:

```typescript
const allTranscripts = await getTranscriptsForCandidate(candidateId)
const transcriptsWithGpa = allTranscripts.filter(t => t.gpa !== null)

// Only verified if ALL transcripts pass
const allVerified = transcriptsWithGpa.every(t => t.gpa_verified === true)

// Flagged if ANY transcript is not verified
const anyFlagged = transcriptsWithGpa.some(t => t.gpa_verified === false)

if (allVerified) {
  candidateStatus = 'verified'
} else if (anyFlagged) {
  candidateStatus = 'flagged'
}
```

---

## Cost Estimates

| Method | Cost per Transcript | When Used |
|--------|---------------------|-----------|
| Form Parser (Google) | ~$0.001-0.002 | Always (primary) |
| Claude Text Analysis | ~$0.01 | When Form Parser fails but has text |
| Claude Vision | ~$0.02-0.04 | When text extraction fails |

**Typical flow:** Form Parser succeeds → ~$0.002/transcript

**Fallback flow:** Form Parser fails → Claude Vision → ~$0.03/transcript

**Monthly estimates (1,000 transcripts):**
- Best case (80% Form Parser): ~$10-15
- Worst case (all Vision): ~$30-40

---

## Database Schema

### Table: `transcript_verifications`

```sql
create table transcript_verifications (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid not null references candidate_profiles(id),
  transcript_id uuid references candidate_transcripts(id),

  -- Extraction results
  extracted_text text,
  extracted_gpa numeric(3,2),
  extracted_gpa_scale text,
  extraction_confidence text,
  extraction_reasoning text,

  -- Comparison
  entered_gpa numeric(3,2),
  gpa_match boolean,
  gpa_difference numeric(3,2),

  -- Status
  status text not null default 'pending',
  -- Values: pending, processing, auto_verified, flagged, manually_verified, rejected, error

  -- Review
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  error_message text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(transcript_id)
);
```

### Table: `candidate_transcripts`

```sql
-- Each transcript has its own GPA and verification status
candidate_transcripts (
  id uuid,
  candidate_profile_id uuid,
  education_level text,  -- bachelors, masters, mba, phd, professional
  transcript_url text,
  gpa numeric(3,2),
  gpa_verified boolean default false,
  is_verified boolean default false,
  ...
)
```

### Table: `candidate_profiles`

```sql
-- Overall verification status based on ALL transcripts
candidate_profiles (
  ...
  gpa_verification_status text,  -- pending, verified, flagged, rejected
  ...
)
```

---

## Admin UI

### Navigation

Added "Verification" link to admin navigation at `/admin/verification`

### Dashboard Features

1. **Stats Cards**
   - Manual Review count
   - Pending Resumes
   - Pending Transcripts
   - GPA Confirmations

2. **AI Auto-Verification Stats**
   - Auto-Verified count
   - Flagged count
   - Manually Verified count
   - Error count

3. **AI Flagged Queue**
   - Items that need human review
   - Shows extracted GPA vs entered GPA
   - Shows confidence and reasoning
   - Actions: Approve, Reject, View transcript

4. **Bulk Verify Button**
   - Processes all pending transcripts
   - Shows progress and results

---

## Troubleshooting

### "Could not extract sufficient text" Error

**Cause:** Form Parser isn't returning text, and OCR processor isn't configured.

**Solution:** The system now falls back to Claude Vision automatically. If you still see this error:
1. Check `ANTHROPIC_API_KEY` is set
2. Check transcript file is a valid PDF/image
3. File might be corrupted or empty

### Form Parser Not Finding GPA

**Cause:** Transcript format isn't standard, or GPA isn't in a clear field.

**Solution:** Claude Vision fallback handles this. Check the reasoning in the verification record to see what Claude found.

### "Form Parser error" in Reasoning

**Cause:** Google Document AI credentials or configuration issue.

**Check:**
1. `GOOGLE_CLOUD_PROJECT_ID` is correct
2. `GOOGLE_DOCUMENT_AI_FORM_PARSER_ID` is a valid processor ID
3. `GOOGLE_CREDENTIALS_BASE64` is properly encoded
4. Service account has `Document AI API User` role

### Candidate Stuck in "Flagged" Status

**Cause:** One or more transcripts haven't been verified.

**Check:**
1. Go to Verification page
2. Find the candidate
3. Check if all their transcripts are verified
4. Verify or reject any pending transcripts

---

## Testing

### Sample Test Cases

| Transcript Type | Expected Result |
|-----------------|-----------------|
| Clear PDF with "Cumulative GPA: 3.75" | Form Parser → Auto-verify |
| Scanned image transcript | Vision Analysis → Auto-verify |
| GPA labeled "CGPA" | Form Parser → Auto-verify |
| Multiple GPAs (semester + cumulative) | Should find cumulative |
| No GPA label, just numbers | Vision Analysis → Flag (low confidence) |
| GPA mismatch (entered 3.6, actual 3.2) | Flag for review |
| International format (percentage) | Normalize to 4.0 scale |

### Running Verification

1. Go to `/admin/verification`
2. Click "Bulk Verify" to process all pending
3. Review flagged items manually
4. Check stats to monitor accuracy

---

## Future Enhancements

1. **School-specific processors** - Train custom models for common formats
2. **Confidence tuning** - Adjust thresholds based on accuracy data
3. **Automated reprocessing** - Retry errors after fixes
4. **Analytics dashboard** - Track success rates by school
5. **Additional field extraction** - Major, graduation date, honors
