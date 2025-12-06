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
        content: `You are analyzing a college transcript to extract the student's FINAL cumulative GPA.

TRANSCRIPT TEXT:
${truncatedText}

CRITICAL INSTRUCTIONS:
1. MULTI-COLUMN LAYOUTS: Many transcripts have TWO COLUMNS of text. When converted to text, columns may be interleaved. The RIGHT column typically contains LATER/MORE RECENT semesters than the left column. You MUST analyze ALL semester data to find the truly final one.

2. USE CREDIT HOURS TO FIND THE FINAL SEMESTER:
   - Look for cumulative credit hours (HE, Hours Earned, Credit Hours, Total Credits, Cumulative Hours)
   - Credits ALWAYS increase each semester
   - The HIGHEST cumulative credit count = the FINAL semester
   - Example: If you see entries with 56 HE and 88 HE, the 88 HE is the FINAL semester

3. Find the cumulative GPA associated with the HIGHEST credit count - that is the FINAL GPA

4. Look for these markers that indicate the end of the transcript:
   - "End of Transcript"
   - "Degree Awarded"
   - "Degree Conferred"
   - Final semester before these markers

5. Look for labels: "Cumulative GPA", "Overall GPA", "Cum GPA", "CGPA", "Career GPA", "Cumulative:"

6. DO NOT use:
   - Semester GPAs (term-only GPAs)
   - Intermediate cumulative GPAs from earlier semesters
   - Any cumulative GPA that does NOT have the highest credit count

7. GPA scale is usually 4.0, but could be 5.0 or 100-point

8. Rate your confidence:
   - "high" if GPA has the highest credit count and is near "End of Transcript" or "Degree Awarded"
   - "medium" if you found a cumulative GPA but aren't 100% sure it's the final one
   - "low" if uncertain or could not find a clearly labeled cumulative GPA

Respond with ONLY valid JSON in this exact format:
{
  "gpa": 3.75,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "Found final cumulative GPA of 3.75 with 88 HE (highest credit count), near 'Degree Awarded'"
}

If you cannot find a cumulative GPA, respond with:
{
  "gpa": null,
  "scale": null,
  "confidence": "low",
  "reasoning": "Could not locate cumulative GPA in transcript. [Explain what you found or why it was unclear]"
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
    // If JSON parsing fails, return low confidence result
    return {
      gpa: null,
      scale: null,
      confidence: 'low',
      reasoning: `Failed to parse extraction response: ${content.text.substring(0, 100)}...`,
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
            text: `You are analyzing a college transcript document to extract the student's FINAL cumulative GPA.

CRITICAL INSTRUCTIONS:
1. MULTI-COLUMN LAYOUTS: Many transcripts have TWO COLUMNS. The RIGHT column typically contains LATER/MORE RECENT semesters than the left column. You MUST check BOTH columns thoroughly.

2. USE CREDIT HOURS TO FIND THE FINAL SEMESTER:
   - Look for cumulative credit hours (HE, Hours Earned, Credit Hours, Total Credits)
   - Credits ALWAYS increase each semester
   - The HIGHEST cumulative credit count = the FINAL semester
   - Example: If left column shows 56 HE and right column shows 88 HE, the 88 HE is the FINAL semester

3. Find the cumulative GPA associated with the HIGHEST credit count - that is the FINAL GPA

4. Look for these markers that indicate the end of the transcript:
   - "End of Transcript"
   - "Degree Awarded"
   - "Degree Conferred"
   - Final semester before these markers

5. Look for labels: "Cumulative GPA", "Overall GPA", "Cum GPA", "CGPA", "Career GPA", "Cumulative:"

6. DO NOT use:
   - Semester GPAs
   - Intermediate cumulative GPAs from earlier semesters
   - GPAs from the left column if the right column has higher credit hours

7. GPA scale is usually 4.0, but could be 5.0 or 100-point

8. Rate your confidence:
   - "high" if GPA has the highest credit count and is near "End of Transcript" or "Degree Awarded"
   - "medium" if you found a cumulative GPA but aren't 100% sure it's the final one
   - "low" if uncertain

Respond with ONLY valid JSON in this exact format:
{
  "gpa": 3.75,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "Found final cumulative GPA of 3.75 in the last semester section (Spring 2024), near 'Degree Awarded'"
}

If you cannot find a cumulative GPA, respond with:
{
  "gpa": null,
  "scale": null,
  "confidence": "low",
  "reasoning": "Could not locate cumulative GPA in transcript. [Explain what you found or why it was unclear]"
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
    // If JSON parsing fails, return low confidence result
    return {
      gpa: null,
      scale: null,
      confidence: 'low',
      reasoning: `Failed to parse vision extraction response: ${content.text.substring(0, 100)}...`,
    }
  }
}
