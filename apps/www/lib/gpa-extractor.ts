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

1. PROXIMITY TO "END OF TRANSCRIPT" IS THE STRONGEST INDICATOR:
   - Search the text for "End of Transcript", "Degree Awarded", or "Degree Conferred"
   - The cumulative GPA NEAREST to these phrases is the FINAL GPA
   - This is the most reliable way to identify the final GPA

2. TWO-COLUMN LAYOUTS (text may be interleaved):
   - Many transcripts have TWO COLUMNS - when extracted as text, data from both columns gets mixed
   - You may see what looks like "earlier" semesters appearing AFTER "later" ones in the text
   - IGNORE text order - use credit hours and proximity to "End of Transcript" instead

3. USE CREDIT HOURS TO VERIFY:
   - Look for cumulative credit hours (HE, Hours Earned, Credit Hours, Total Credits)
   - Credits ALWAYS increase each semester
   - The HIGHEST cumulative credit count = the FINAL semester
   - Example: You see "Cumulative: 56 HE, GPA 2.99" and "Cumulative: 88 HE, GPA 3.17"
     → The CORRECT answer is 3.17 (88 HE is higher, so it's the final semester)

4. DECISION PRIORITY:
   a) First: Find "End of Transcript" or "Degree Awarded" - the nearest cumulative GPA wins
   b) Second: Compare ALL credit hour counts - highest credit count wins
   c) Do NOT assume text order = chronological order

5. DO NOT use:
   - Semester GPAs (term-only GPAs, not cumulative)
   - Intermediate cumulative GPAs with LOWER credit counts
   - The first cumulative GPA you find (it's probably not the final one)

6. GPA scale is usually 4.0, but could be 5.0 or 100-point

7. Rate your confidence:
   - "high" if GPA is nearest to "End of Transcript" AND has the highest credit count
   - "medium" if you found a cumulative GPA but aren't 100% sure it's the final one
   - "low" if uncertain

IMPORTANT: Respond with ONLY valid JSON. Start with { and end with }.

Format:
{
  "gpa": 3.17,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "Found final cumulative GPA of 3.17 with 88 HE (highest credit count), nearest to 'Degree Awarded' and 'End of Transcript'"
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

1. ALWAYS CHECK THE RIGHT COLUMN FIRST!
   - Many transcripts have TWO COLUMNS side by side
   - The RIGHT column contains LATER/MORE RECENT semesters
   - The BOTTOM-RIGHT of the document is where the FINAL semester usually appears
   - Even if the left column goes lower on the page, the RIGHT column has the newer data

2. PROXIMITY TO "END OF TRANSCRIPT" IS THE STRONGEST INDICATOR:
   - Find where it says "End of Transcript", "Degree Awarded", or "Degree Conferred"
   - The cumulative GPA NEAREST to these words is the FINAL GPA
   - This GPA is almost always in the RIGHT column, near the bottom

3. USE CREDIT HOURS TO VERIFY:
   - Look for cumulative credit hours (HE, Hours Earned, Credit Hours, Total Credits)
   - Credits ALWAYS increase each semester
   - The HIGHEST cumulative credit count = the FINAL semester
   - Example: Left column shows 56 HE with 2.99 GPA, Right column shows 88 HE with 3.17 GPA
     → The CORRECT answer is 3.17 (88 HE is higher, so it's the final semester)

4. DECISION PRIORITY:
   a) First: Find "End of Transcript" or "Degree Awarded" - the nearest cumulative GPA wins
   b) Second: Compare credit hours - highest credit count wins
   c) Third: Right column beats left column when in doubt

5. DO NOT use:
   - Semester GPAs (term-only GPAs, not cumulative)
   - Intermediate cumulative GPAs from earlier semesters (lower credit counts)
   - GPAs from the left column if the right column has higher credit hours

6. GPA scale is usually 4.0, but could be 5.0 or 100-point

7. Rate your confidence:
   - "high" if GPA is nearest to "End of Transcript" AND has the highest credit count
   - "medium" if you found a cumulative GPA but aren't 100% sure it's the final one
   - "low" if uncertain

IMPORTANT: Respond with ONLY valid JSON. Start with { and end with }.

Format:
{
  "gpa": 3.17,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "Found final cumulative GPA of 3.17 with 88 HE (highest credit count) in right column, directly above 'Degree Awarded' and 'End of Transcript'"
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
