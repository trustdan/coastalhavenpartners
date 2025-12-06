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

1. IDENTIFY CREDIT HOURS VS QUALITY POINTS (schools use different terms):
   Credit hours may be labeled: HE, Hours Earned, Credits, Credit Hours, Hrs, CH, Units
   Quality points may be labeled: QP, Quality Points, Grade Points, Points

   HOW TO TELL THEM APART (cross-check using math):
   - Quality Points = GPA × Credit Hours
   - So if you see "56.00, 131.91, 2.99" → check: 56 × 2.99 ≈ 167 (not 131.91, but close enough for rounding)
   - The SMALLER number that when multiplied by GPA approximates the larger number = CREDIT HOURS
   - Credit hours are typically 15-120 for undergrad, 30-90 for grad/law school
   - Quality points are typically in the 100s-300s range
   - If unsure, the number that's roughly (GPA × the other number) = Quality Points

2. TWO-COLUMN LAYOUTS (text may be interleaved):
   - Many transcripts have TWO COLUMNS - when extracted as text, data from both columns gets mixed
   - You may see what looks like "earlier" semesters appearing AFTER "later" ones in the text
   - IGNORE text order - use credit hours to find the final GPA

3. FIND THE HIGHEST CREDIT HOURS - THIS IS THE FINAL GPA:
   - Once you identify which numbers are credit hours, find the HIGHEST value in the ENTIRE text
   - Credit hours ALWAYS increase each semester (they accumulate)
   - The row with the HIGHEST credit hours = the FINAL cumulative GPA
   - Example: You see "56.00 HE, 131.91 QP, 2.99 GPA" and "88.00 HE, 232.11 QP, 3.17 GPA"
     → 88 > 56, so the CORRECT answer is 3.17 (regardless of text order or proximity to "End of Transcript")

4. VERIFY WITH "END OF TRANSCRIPT" LOCATION:
   - Search for "End of Transcript", "Degree Awarded", or "Degree Conferred"
   - The GPA with the HIGHEST credit hours should be near these markers
   - If it's NOT near these markers, you may have misidentified credit hours vs quality points

5. DECISION PRIORITY:
   a) First: Identify which numbers are credit hours (smaller values, multiply with GPA to get larger values)
   b) Second: Find the HIGHEST credit hour value anywhere in the text
   c) Third: The cumulative GPA on that same row is your answer
   d) Verify: This GPA should be near "End of Transcript" or "Degree Awarded"

6. DO NOT:
   - Confuse QP (Quality Points) with credit hours
   - Assume text order = chronological order
   - Pick a GPA just because it's near "End of Transcript" without checking credit hours
   - Use intermediate cumulative GPAs from earlier semesters (lower credit hour counts)

7. GPA scale is usually 4.0, but could be 5.0 or 100-point

8. Rate your confidence:
   - "high" if GPA is nearest to "End of Transcript" AND has the highest credit count
   - "medium" if you found a cumulative GPA but aren't 100% sure it's the final one
   - "low" if uncertain

IMPORTANT: Respond with ONLY valid JSON. Start with { and end with }.

Format:
{
  "gpa": 3.17,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "Identified credit hours by checking: 88 × 3.17 ≈ 279 (close to QP 232.11), confirming 88.00 is credit hours not QP. Found highest credit hours = 88.00 with GPA 3.17. Verified: this GPA is in right column near 'Degree Awarded' and 'End of Transcript'. Other cumulative GPAs had lower credit hours (56.00 HE → 2.99 GPA)."
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

1. IDENTIFY CREDIT HOURS VS QUALITY POINTS (schools use different terms):
   Credit hours may be labeled: HE, Hours Earned, Credits, Credit Hours, Hrs, CH, Units
   Quality points may be labeled: QP, Quality Points, Grade Points, Points

   HOW TO TELL THEM APART (cross-check using math):
   - Quality Points = GPA × Credit Hours
   - So if you see "56.00, 131.91, 2.99" → check: 56 × 2.99 ≈ 167 (not 131.91, but close enough for rounding)
   - The SMALLER number that when multiplied by GPA approximates the larger number = CREDIT HOURS
   - Credit hours are typically 15-120 for undergrad, 30-90 for grad/law school
   - Quality points are typically in the 100s-300s range
   - If unsure, the number that's roughly (GPA × the other number) = Quality Points

2. ALWAYS CHECK THE RIGHT COLUMN FIRST!
   - Many transcripts have TWO COLUMNS side by side
   - The RIGHT column contains LATER/MORE RECENT semesters
   - The BOTTOM-RIGHT of the document is where the FINAL semester usually appears
   - Even if the left column goes lower on the page, the RIGHT column has the newer data

3. FIND THE HIGHEST CREDIT HOURS - THIS IS THE FINAL GPA:
   - Once you identify which numbers are credit hours, find the HIGHEST value across the ENTIRE document
   - Credit hours ALWAYS increase each semester (they accumulate)
   - The row with the HIGHEST credit hours = the FINAL cumulative GPA
   - Example: Left column shows "56.00 HE, 131.91 QP, 2.99 GPA"
             Right column shows "88.00 HE, 232.11 QP, 3.17 GPA"
     → 88 > 56, so the CORRECT answer is 3.17 (regardless of where "End of Transcript" appears in relation to text)

4. VERIFY WITH "END OF TRANSCRIPT" LOCATION:
   - Find where "End of Transcript", "Degree Awarded", or "Degree Conferred" appears
   - The GPA with the HIGHEST credit hours should be near these markers
   - If it's NOT near these markers, you may have misidentified credit hours vs quality points
   - In two-column layouts, "End of Transcript" is usually in the RIGHT column

5. DECISION PRIORITY:
   a) First: Identify which numbers are credit hours (smaller values, multiply with GPA to get larger values)
   b) Second: Find the HIGHEST credit hour value anywhere in the document
   c) Third: The cumulative GPA on that same row is your answer
   d) Verify: This GPA should be near "End of Transcript" or "Degree Awarded"

6. DO NOT:
   - Confuse QP (Quality Points) with credit hours
   - Assume text order = chronological order
   - Pick a GPA just because it's near "End of Transcript" without checking credit hours
   - Use intermediate cumulative GPAs from earlier semesters (lower credit hour counts)

7. GPA scale is usually 4.0, but could be 5.0 or 100-point

8. Rate your confidence:
   - "high" if GPA is nearest to "End of Transcript" AND has the highest credit count
   - "medium" if you found a cumulative GPA but aren't 100% sure it's the final one
   - "low" if uncertain

IMPORTANT: Respond with ONLY valid JSON. Start with { and end with }.

Format:
{
  "gpa": 3.17,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "Identified credit hours by checking: 88 × 3.17 ≈ 279 (close to QP 232.11), confirming 88.00 is credit hours not QP. Found highest credit hours = 88.00 with GPA 3.17 in right column. Verified: this GPA is directly above 'Degree Awarded' and 'End of Transcript'. Other cumulative GPAs had lower credit hours (56.00 HE → 2.99 GPA in left column)."
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
