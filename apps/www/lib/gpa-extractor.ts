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

export interface GPAExtractionResult {
  gpa: number | null
  scale: string | null
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

export async function extractGPAFromText(
  transcriptText: string
): Promise<GPAExtractionResult> {
  // Truncate text if too long to avoid excessive token usage
  const maxLength = 15000
  const truncatedText = transcriptText.length > maxLength
    ? transcriptText.substring(0, maxLength) + '\n\n[Text truncated...]'
    : transcriptText

  const response = await getAnthropicClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a GPA extraction assistant. Your ONLY job is to find the final cumulative GPA and return a JSON response. Do NOT explain your reasoning in prose - put all reasoning in the JSON "reasoning" field.

TRANSCRIPT TEXT:
${truncatedText}

CRITICAL INSTRUCTIONS FOR FINDING THE FINAL GPA:

STEP 1: FIND ALL "CUMULATIVE" ROWS IN THE TEXT
- Scan the ENTIRE text for every line containing "Cumulative" (not "Semester")
- For each cumulative row, note the three numbers: credit hours, quality points, and GPA
- Credit hours is the SMALLER number (typically 15-120)
- Quality Points is the LARGER number (typically 100-300)
- GPA is usually between 0.0 and 4.0

STEP 2: LIST ALL CUMULATIVE ENTRIES YOU FOUND
Example format: "Found cumulative entries: 56 HE → 2.99 GPA, 73 HE → 3.11 GPA, 88 HE → 3.17 GPA"

STEP 3: COMPARE CREDIT HOURS NUMERICALLY
- Look at ALL the credit hour values you listed
- Find the MAXIMUM value
- The GPA paired with the MAXIMUM credit hours is your answer
- Example: If you found 56, 73, 88 → max is 88 → answer is the GPA paired with 88

STEP 4: VERIFY (but don't override Step 3)
- Check that "End of Transcript" or "Degree Awarded" is near your answer
- If they're near a DIFFERENT GPA, double-check your credit hour identification
- But if you're confident about credit hours, the HIGHEST always wins

COMMON MISTAKES TO AVOID:
- DO NOT pick 56 HE just because it appears near "End of Transcript" if 88 HE exists elsewhere
- DO NOT confuse quality points (131.91) with credit hours (56.00)
- DO NOT assume text order = chronological order (two-column layouts interleave data)
- The text may show 2.99 GPA AFTER 3.17 GPA due to column interleaving - ignore text order!

IDENTIFYING CREDIT HOURS VS QUALITY POINTS:
- Quality Points = GPA × Credit Hours
- Test: 56 × 2.99 ≈ 167 (close to QP), 88 × 3.17 ≈ 279 (close to QP)
- The number that's SMALLER and when multiplied by GPA gives approximately the other number = credit hours

GPA scale is usually 4.0, but could be 5.0 or 100-point

Rate your confidence:
   - "high" if GPA is nearest to "End of Transcript" AND has the highest credit count
   - "medium" if you found a cumulative GPA but aren't 100% sure it's the final one
   - "low" if uncertain

IMPORTANT: Respond with ONLY valid JSON. Start with { and end with }.

Format:
{
  "gpa": 3.17,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "STEP 1-2: Found all cumulative entries in text: 16 HE → 2.66 GPA, 32 HE → 2.90 GPA, 43 HE → 2.95 GPA, 56 HE → 2.99 GPA, 73 HE → 3.11 GPA, 88 HE → 3.17 GPA. STEP 3: Maximum credit hours = 88. GPA paired with 88 HE = 3.17. STEP 4: Verified - text shows 'Degree Awarded' and 'End of Transcript' markers. ANSWER: 3.17"
}

If you cannot find a cumulative GPA:
{
  "gpa": null,
  "scale": null,
  "confidence": "low",
  "reasoning": "Could not locate cumulative GPA in transcript. [Explain what you found]"
}`,
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

    const result = JSON.parse(jsonText) as GPAExtractionResult

    // Validate the result
    if (result.gpa !== null && (typeof result.gpa !== 'number' || result.gpa < 0 || result.gpa > 5)) {
      return {
        gpa: null,
        scale: null,
        confidence: 'low',
        reasoning: `Invalid GPA value extracted: ${result.gpa}`,
      }
    }

    return result
  } catch {
    // Log the full response for debugging
    console.error('[GPA Extractor] Failed to parse Claude response as JSON')
    console.error('[GPA Extractor] Full response:', content.text)

    // Return more of the response for visibility in the UI (500 chars instead of 100)
    return {
      gpa: null,
      scale: null,
      confidence: 'low',
      reasoning: `Failed to parse extraction response: ${content.text.substring(0, 500)}${content.text.length > 500 ? '...' : ''}`,
    }
  }
}

/**
 * Extract GPA directly from a document (PDF or image) using Claude's vision capabilities
 * This is a fallback when text extraction fails
 */
export async function extractGPAFromDocument(
  fileBuffer: Buffer,
  mimeType: string
): Promise<GPAExtractionResult> {
  // Claude supports these media types for vision
  const supportedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ]

  if (!supportedTypes.includes(mimeType)) {
    return {
      gpa: null,
      scale: null,
      confidence: 'low',
      reasoning: `Unsupported file type for vision analysis: ${mimeType}`,
    }
  }

  const base64Data = fileBuffer.toString('base64')

  // For PDFs, use document type; for images, use image type
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
            text: `You are a GPA extraction assistant. Your ONLY job is to find the final cumulative GPA and return a JSON response. Do NOT explain your reasoning in prose - put all reasoning in the JSON "reasoning" field.

CRITICAL INSTRUCTIONS FOR TWO-COLUMN TRANSCRIPTS:

STEP 1: FIND ALL "CUMULATIVE" ROWS
- Scan the ENTIRE document for every row labeled "Cumulative" (not "Semester")
- For each cumulative row, note the three numbers: credit hours, quality points, and GPA
- Credit hours is the SMALLER number (typically 15-120)
- Quality Points is the LARGER number (typically 100-300)
- GPA is usually between 0.0 and 4.0

STEP 2: LIST ALL CUMULATIVE ENTRIES YOU FOUND
Example format: "Found cumulative entries: 56 HE → 2.99 GPA, 73 HE → 3.11 GPA, 88 HE → 3.17 GPA"

STEP 3: COMPARE CREDIT HOURS NUMERICALLY
- Look at ALL the credit hour values you listed
- Find the MAXIMUM value
- The GPA paired with the MAXIMUM credit hours is your answer
- Example: If you found 56, 73, 88 → max is 88 → answer is the GPA paired with 88

STEP 4: VERIFY (but don't override Step 3)
- Check that "End of Transcript" or "Degree Awarded" is near your answer
- If they're near a DIFFERENT GPA, double-check your credit hour identification
- But if you're confident about credit hours, the HIGHEST always wins

COMMON MISTAKES TO AVOID:
- DO NOT pick 56 HE just because it appears near "End of Transcript" if 88 HE exists elsewhere
- DO NOT confuse quality points (131.91) with credit hours (56.00)
- DO NOT assume the last text you read is the final GPA - two-column layouts interleave data
- In the image: LEFT column bottom shows 56 HE/2.99 GPA, RIGHT column shows 88 HE/3.17 GPA
  → 88 > 56, so 3.17 is correct even though 2.99 may appear "after" it in extracted text

IDENTIFYING CREDIT HOURS VS QUALITY POINTS:
- Quality Points = GPA × Credit Hours
- Test: 56 × 2.99 ≈ 167 (close to QP), 88 × 3.17 ≈ 279 (close to QP)
- The number that's SMALLER and when multiplied by GPA gives approximately the other number = credit hours

GPA scale is usually 4.0, but could be 5.0 or 100-point

Rate your confidence:
   - "high" if GPA is nearest to "End of Transcript" AND has the highest credit count
   - "medium" if you found a cumulative GPA but aren't 100% sure it's the final one
   - "low" if uncertain

IMPORTANT: Respond with ONLY valid JSON. Start with { and end with }.

Format:
{
  "gpa": 3.17,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "STEP 1-2: Found all cumulative entries: 16 HE → 2.66 GPA, 32 HE → 2.90 GPA, 43 HE → 2.95 GPA, 56 HE → 2.99 GPA (left column), 73 HE → 3.11 GPA, 88 HE → 3.17 GPA (right column). STEP 3: Maximum credit hours = 88. GPA paired with 88 HE = 3.17. STEP 4: Verified - 88 HE/3.17 GPA is in right column directly above 'Degree Awarded' and 'End of Transcript'. ANSWER: 3.17"
}

If you cannot find a cumulative GPA:
{
  "gpa": null,
  "scale": null,
  "confidence": "low",
  "reasoning": "Could not locate cumulative GPA in transcript. [Explain what you found]"
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

    const result = JSON.parse(jsonText) as GPAExtractionResult

    // Validate the result
    if (result.gpa !== null && (typeof result.gpa !== 'number' || result.gpa < 0 || result.gpa > 5)) {
      return {
        gpa: null,
        scale: null,
        confidence: 'low',
        reasoning: `Invalid GPA value extracted: ${result.gpa}`,
      }
    }

    return result
  } catch {
    // Log the full response for debugging
    console.error('[GPA Extractor Vision] Failed to parse Claude response as JSON')
    console.error('[GPA Extractor Vision] Full response:', content.text)

    // Return more of the response for visibility in the UI (500 chars instead of 100)
    return {
      gpa: null,
      scale: null,
      confidence: 'low',
      reasoning: `Failed to parse vision extraction response: ${content.text.substring(0, 500)}${content.text.length > 500 ? '...' : ''}`,
    }
  }
}
