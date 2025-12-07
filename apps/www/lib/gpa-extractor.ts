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

// Maximum allowed pages to prevent abuse (large documents = high API costs)
const MAX_ALLOWED_PAGES = 5

/**
 * Count pages in a PDF buffer without external dependencies.
 * PDFs contain a /Count entry in the Pages dictionary that indicates total pages.
 */
export function countPdfPages(buffer: Buffer): number {
  const content = buffer.toString('binary')

  // Method 1: Look for /Count in the Pages dictionary (most reliable)
  // Pattern: /Type /Pages followed by /Count N (using [\s\S]* instead of .* with s flag)
  const countMatch = content.match(/\/Type\s*\/Pages[\s\S]*?\/Count\s+(\d+)/)
  if (countMatch) {
    return parseInt(countMatch[1], 10)
  }

  // Method 2: Look for standalone /Count patterns (backup)
  const standaloneCountMatch = content.match(/\/Count\s+(\d+)/)
  if (standaloneCountMatch) {
    return parseInt(standaloneCountMatch[1], 10)
  }

  // Method 3: Count /Type /Page entries (less reliable but works for simple PDFs)
  const pageMatches = content.match(/\/Type\s*\/Page[^s]/g)
  if (pageMatches) {
    return pageMatches.length
  }

  // Default: assume 1 page if we can't determine
  return 1
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
        content: `You are a GPA extraction assistant. Your ONLY job is to find the final cumulative GPA.

TRANSCRIPT TEXT:
${truncatedText}

=== THE ONE RULE THAT MATTERS ===
The FINAL cumulative GPA is ALWAYS the one with the HIGHEST CREDIT HOURS.
Credit hours increase each semester. The highest number = the most recent = the final GPA.

=== STEP 1: IDENTIFY CREDIT HOURS (not quality points) ===
For each "Cumulative" row, you'll see THREE numbers. Identify credit hours:
- Credit Hours (HE): SMALL number, typically 15-120
- Quality Points (QP): LARGE number, typically 50-300
- GPA: Number between 0.00 and 4.00

CRITICAL: Numbers like 123.91, 131.91, 180.84, 232.11 are QUALITY POINTS (too big for credit hours!)
CRITICAL: Numbers like 32.00, 43.00, 56.00, 73.00, 88.00 are CREDIT HOURS (reasonable semester accumulation)

=== STEP 2: LIST ALL CUMULATIVE ENTRIES ===
List ONLY credit hours and GPA pairs. Format: "18 HE → 2.66, 32 HE → 2.90, 43 HE → 2.95, 56 HE → 2.99, 73 HE → 3.11, 88 HE → 3.17"

=== STEP 3: FIND MAXIMUM CREDIT HOURS ===
Compare the credit hour numbers: 18, 32, 43, 56, 73, 88
Maximum = 88
Answer = GPA paired with 88 = 3.17

THIS STEP IS FINAL. Do NOT let text position, "End of Transcript" location, or anything else override this.

=== WHY TEXT ORDER IS MISLEADING ===
Two-column transcripts read left-to-right, then top-to-bottom.
The LEFT column bottom (56 HE/2.99) may appear AFTER the RIGHT column bottom (88 HE/3.17) in extracted text.
This does NOT mean 2.99 is final. 88 > 56, so 3.17 is final.

=== RESPOND WITH ONLY JSON ===
{
  "gpa": 3.17,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "STEP 1-2: Found cumulative entries: 18 HE → 2.66, 32 HE → 2.90, 43 HE → 2.95, 56 HE → 2.99, 73 HE → 3.11, 88 HE → 3.17. STEP 3: Credit hours comparison: 18 < 32 < 43 < 56 < 73 < 88. Maximum = 88. GPA at 88 HE = 3.17. ANSWER: 3.17"
}

If no GPA found:
{
  "gpa": null,
  "scale": null,
  "confidence": "low",
  "reasoning": "Could not locate cumulative GPA in transcript."
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
 * This is the primary method for transcript verification
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

  // Check page count for PDFs to prevent abuse from large documents
  if (mimeType === 'application/pdf') {
    const pageCount = countPdfPages(fileBuffer)
    console.log(`[GPA Extractor] PDF page count: ${pageCount}`)

    if (pageCount > MAX_ALLOWED_PAGES) {
      return {
        gpa: null,
        scale: null,
        confidence: 'low',
        reasoning: `Document has ${pageCount} pages, which exceeds the maximum allowed (${MAX_ALLOWED_PAGES} pages). Please upload a shorter transcript or just the page containing your cumulative GPA.`,
      }
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
            text: `You are a GPA extraction assistant. Your ONLY job is to find the final cumulative GPA.

=== THE ONE RULE THAT MATTERS ===
The FINAL cumulative GPA is ALWAYS the one with the HIGHEST CREDIT HOURS.
Credit hours increase each semester. The highest number = the most recent = the final GPA.

=== STEP 1: IDENTIFY CREDIT HOURS (not quality points) ===
For each "Cumulative" row, you'll see THREE numbers. Identify credit hours:
- Credit Hours (HE): SMALL number, typically 15-120
- Quality Points (QP): LARGE number, typically 50-300
- GPA: Number between 0.00 and 4.00

CRITICAL: Numbers like 123.91, 131.91, 180.84, 232.11 are QUALITY POINTS (too big for credit hours!)
CRITICAL: Numbers like 32.00, 43.00, 56.00, 73.00, 88.00 are CREDIT HOURS (reasonable semester accumulation)

=== STEP 2: LIST ALL CUMULATIVE ENTRIES ===
List ONLY credit hours and GPA pairs. Format: "18 HE → 2.66, 32 HE → 2.90, 43 HE → 2.95, 56 HE → 2.99, 73 HE → 3.11, 88 HE → 3.17"

=== STEP 3: FIND MAXIMUM CREDIT HOURS ===
Compare the credit hour numbers: 18, 32, 43, 56, 73, 88
Maximum = 88
Answer = GPA paired with 88 = 3.17

THIS STEP IS FINAL. Do NOT let text position, "End of Transcript" location, or anything else override this.

=== TWO-COLUMN TRANSCRIPTS ===
Many transcripts have TWO columns. The RIGHT column continues AFTER the left column.
- LEFT column bottom may show 56 HE → 2.99
- RIGHT column bottom may show 88 HE → 3.17
88 > 56, so the answer is 3.17 (not 2.99!)

=== RESPOND WITH ONLY JSON ===
{
  "gpa": 3.17,
  "scale": "4.0",
  "confidence": "high",
  "reasoning": "STEP 1-2: Found cumulative entries: 18 HE → 2.66, 32 HE → 2.90, 43 HE → 2.95, 56 HE → 2.99 (left), 73 HE → 3.11, 88 HE → 3.17 (right). STEP 3: Credit hours comparison: 18 < 32 < 43 < 56 < 73 < 88. Maximum = 88. GPA at 88 HE = 3.17. ANSWER: 3.17"
}

If no GPA found:
{
  "gpa": null,
  "scale": null,
  "confidence": "low",
  "reasoning": "Could not locate cumulative GPA in transcript."
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
