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
        content: `You are analyzing a college transcript to extract the student's cumulative GPA.

TRANSCRIPT TEXT:
${truncatedText}

INSTRUCTIONS:
1. Find the CUMULATIVE GPA (not semester GPA, not major GPA, not term GPA)
2. Look for labels like "Cumulative GPA", "Overall GPA", "Cum GPA", "CGPA", "Career GPA"
3. Identify the GPA scale (usually 4.0, but could be 5.0 or 100-point)
4. If multiple GPAs are shown, prefer "Cumulative GPA" or "Overall GPA" over semester/term GPAs
5. Rate your confidence:
   - "high" if GPA is clearly labeled as cumulative/overall
   - "medium" if you had to infer it's the cumulative GPA
   - "low" if uncertain or could not find a clearly labeled cumulative GPA

Respond with ONLY valid JSON in this exact format:
{
  "gpa": 3.75,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "Found clearly labeled 'Cumulative GPA: 3.75' in the academic summary section"
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
            text: `You are analyzing a college transcript document to extract the student's cumulative GPA.

INSTRUCTIONS:
1. Find the CUMULATIVE GPA (not semester GPA, not major GPA, not term GPA)
2. Look for labels like "Cumulative GPA", "Overall GPA", "Cum GPA", "CGPA", "Career GPA", "Total GPA"
3. Identify the GPA scale (usually 4.0, but could be 5.0 or 100-point)
4. If multiple GPAs are shown, prefer "Cumulative GPA" or "Overall GPA" over semester/term GPAs
5. Rate your confidence:
   - "high" if GPA is clearly labeled as cumulative/overall
   - "medium" if you had to infer it's the cumulative GPA
   - "low" if uncertain or could not find a clearly labeled cumulative GPA

Respond with ONLY valid JSON in this exact format:
{
  "gpa": 3.75,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "Found clearly labeled 'Cumulative GPA: 3.75' in the academic summary section"
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
