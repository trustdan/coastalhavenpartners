import { DocumentProcessorServiceClient } from '@google-cloud/documentai'

let client: DocumentProcessorServiceClient | null = null

function getClient() {
  if (client) return client

  // Handle credentials from env - support both file path and base64 encoded
  const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64
  const credentials = credentialsBase64
    ? JSON.parse(Buffer.from(credentialsBase64, 'base64').toString())
    : undefined

  client = new DocumentProcessorServiceClient({ credentials })
  return client
}

export interface DocumentExtractionResult {
  text: string
  confidence: number
  pageCount: number
}

export interface FormParserGPAResult {
  gpa: number | null
  scale: string | null
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
  rawText: string // Full document text for fallback
}

// GPA-related field names to look for in Form Parser output
const GPA_FIELD_PATTERNS = [
  /cumulative\s*gpa/i,
  /overall\s*gpa/i,
  /cum\.?\s*gpa/i,
  /cgpa/i,
  /career\s*gpa/i,
  /total\s*gpa/i,
  /^gpa$/i,
  /grade\s*point\s*average/i,
]

// Patterns to identify this is likely a semester/term GPA (not cumulative)
const NON_CUMULATIVE_PATTERNS = [
  /semester\s*gpa/i,
  /term\s*gpa/i,
  /quarter\s*gpa/i,
  /session\s*gpa/i,
]

/**
 * Extract text from document using Document OCR processor
 */
export async function extractTextFromDocument(
  fileBuffer: Buffer,
  mimeType: string
): Promise<DocumentExtractionResult> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
  const location = process.env.GOOGLE_DOCUMENT_AI_LOCATION || 'us'
  const processorId = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID

  // OCR processor is optional - return empty result if not configured
  // The calling code should fall back to Claude for text analysis
  if (!projectId || !processorId || processorId === 'your-processor-id') {
    return {
      text: '',
      confidence: 0,
      pageCount: 0,
    }
  }

  const documentClient = getClient()

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`

  const request = {
    name,
    rawDocument: {
      content: fileBuffer.toString('base64'),
      mimeType,
    },
  }

  const [result] = await documentClient.processDocument(request)
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
  const pageCount = document?.pages?.length || 0

  return {
    text,
    confidence: avgConfidence,
    pageCount,
  }
}

/**
 * Extract GPA using Form Parser processor
 * Returns structured GPA data if found, or null fields if not confident
 */
export async function extractGPAWithFormParser(
  fileBuffer: Buffer,
  mimeType: string
): Promise<FormParserGPAResult> {
  const documentClient = getClient()

  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
  const location = process.env.GOOGLE_DOCUMENT_AI_LOCATION || 'us'
  const formParserProcessorId = process.env.GOOGLE_DOCUMENT_AI_FORM_PARSER_ID

  // If no Form Parser processor configured, return null to trigger fallback
  if (!projectId || !formParserProcessorId) {
    return {
      gpa: null,
      scale: null,
      confidence: 'low',
      reasoning: 'Form Parser processor not configured',
      rawText: '',
    }
  }

  const name = `projects/${projectId}/locations/${location}/processors/${formParserProcessorId}`

  const request = {
    name,
    rawDocument: {
      content: fileBuffer.toString('base64'),
      mimeType,
    },
  }

  try {
    const [result] = await documentClient.processDocument(request)
    const { document } = result

    const rawText = document?.text || ''

    // Look for GPA in entities (Form Parser extracts key-value pairs as entities)
    const entities = document?.entities || []

    let bestGpaMatch: {
      value: number
      fieldName: string
      confidence: number
      isCumulative: boolean
    } | null = null

    for (const entity of entities) {
      const fieldName = entity.type || ''
      const mentionText = entity.mentionText || ''
      const entityConfidence = entity.confidence || 0

      // Check if this looks like a GPA field
      const isGpaField = GPA_FIELD_PATTERNS.some(pattern => pattern.test(fieldName))
      const isNonCumulative = NON_CUMULATIVE_PATTERNS.some(pattern => pattern.test(fieldName))

      if (isGpaField || mentionText.toLowerCase().includes('gpa')) {
        // Try to extract numeric GPA value
        const gpaMatch = mentionText.match(/(\d+\.?\d*)\s*(?:\/\s*(\d+\.?\d*))?/)

        if (gpaMatch) {
          const gpaValue = parseFloat(gpaMatch[1])
          const scale = gpaMatch[2] || (gpaValue <= 4.0 ? '4.0' : gpaValue <= 5.0 ? '5.0' : '100')

          // Validate GPA is in reasonable range
          if (gpaValue >= 0 && gpaValue <= 5.0) {
            const isCumulative = !isNonCumulative && (
              /cumulative|overall|cum\.|cgpa|career|total/i.test(fieldName) ||
              /cumulative|overall/i.test(mentionText)
            )

            // Prefer cumulative GPA, or higher confidence matches
            if (!bestGpaMatch ||
                (isCumulative && !bestGpaMatch.isCumulative) ||
                (isCumulative === bestGpaMatch.isCumulative && entityConfidence > bestGpaMatch.confidence)) {
              bestGpaMatch = {
                value: gpaValue,
                fieldName,
                confidence: entityConfidence,
                isCumulative,
              }
            }
          }
        }
      }
    }

    // Also check form fields (key-value pairs)
    const pages = document?.pages || []
    for (const page of pages) {
      const formFields = page.formFields || []

      for (const field of formFields) {
        const fieldName = field.fieldName?.textAnchor?.content || ''
        const fieldValue = field.fieldValue?.textAnchor?.content || ''
        const fieldConfidence = field.fieldValue?.confidence || 0

        const isGpaField = GPA_FIELD_PATTERNS.some(pattern => pattern.test(fieldName))
        const isNonCumulative = NON_CUMULATIVE_PATTERNS.some(pattern => pattern.test(fieldName))

        if (isGpaField) {
          const gpaMatch = fieldValue.match(/(\d+\.?\d*)\s*(?:\/\s*(\d+\.?\d*))?/)

          if (gpaMatch) {
            const gpaValue = parseFloat(gpaMatch[1])

            if (gpaValue >= 0 && gpaValue <= 5.0) {
              const isCumulative = !isNonCumulative && (
                /cumulative|overall|cum\.|cgpa|career|total/i.test(fieldName)
              )

              if (!bestGpaMatch ||
                  (isCumulative && !bestGpaMatch.isCumulative) ||
                  (isCumulative === bestGpaMatch.isCumulative && fieldConfidence > bestGpaMatch.confidence)) {
                bestGpaMatch = {
                  value: gpaValue,
                  fieldName: fieldName.trim(),
                  confidence: fieldConfidence,
                  isCumulative,
                }
              }
            }
          }
        }
      }
    }

    if (bestGpaMatch) {
      // Determine confidence level
      let confidence: 'high' | 'medium' | 'low' = 'low'
      if (bestGpaMatch.isCumulative && bestGpaMatch.confidence > 0.8) {
        confidence = 'high'
      } else if (bestGpaMatch.isCumulative || bestGpaMatch.confidence > 0.6) {
        confidence = 'medium'
      }

      // Determine scale
      let scale = '4.0'
      if (bestGpaMatch.value > 4.0 && bestGpaMatch.value <= 5.0) {
        scale = '5.0'
      } else if (bestGpaMatch.value > 5.0) {
        scale = '100'
      }

      return {
        gpa: bestGpaMatch.value,
        scale,
        confidence,
        reasoning: `Form Parser found "${bestGpaMatch.fieldName}" with value ${bestGpaMatch.value} (${bestGpaMatch.isCumulative ? 'cumulative' : 'possibly non-cumulative'})`,
        rawText,
      }
    }

    // No GPA found via Form Parser
    return {
      gpa: null,
      scale: null,
      confidence: 'low',
      reasoning: 'Form Parser did not find a clear GPA field',
      rawText,
    }

  } catch (error) {
    // Form Parser failed, return null to trigger fallback
    return {
      gpa: null,
      scale: null,
      confidence: 'low',
      reasoning: `Form Parser error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      rawText: '',
    }
  }
}
