/**
 * Profanity Filter Utility
 *
 * Checks user input for inappropriate language using word boundary detection
 * to avoid false positives (e.g., "class" won't match "ass").
 */

// Blocked words list - add more as needed
const BLOCKED_WORDS = [
  // Common profanity
  'shit', 'fuck', 'damn', 'bitch', 'crap', 'ass', 'asshole', 'bullshit',
  'dick', 'cock', 'pussy', 'whore', 'slut', 'bastard', 'cunt', 'piss',
  // Slurs and derogatory terms
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded',
  'dyke', 'spic', 'chink', 'kike', 'wetback', 'beaner',
  // Variations and common misspellings
  'f*ck', 'f**k', 'sh*t', 'b*tch', 'a$$', '@ss',
  'fck', 'fuk', 'fuq', 'sht', 'btch',
]

// Create regex patterns with word boundaries for each blocked word
const BLOCKED_PATTERNS = BLOCKED_WORDS.map(word => {
  // Escape special regex characters
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Create pattern with word boundaries
  return new RegExp(`\\b${escaped}\\b`, 'i')
})

/**
 * Check if text contains any profanity
 * Uses word boundary detection to avoid false positives
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false

  const normalized = text.toLowerCase()
  return BLOCKED_PATTERNS.some(pattern => pattern.test(normalized))
}

/**
 * Get list of profanity matches found in text
 * Returns empty array if no matches
 */
export function getProfanityMatches(text: string): string[] {
  if (!text) return []

  const normalized = text.toLowerCase()
  const matches: string[] = []

  BLOCKED_WORDS.forEach((word, index) => {
    if (BLOCKED_PATTERNS[index].test(normalized)) {
      matches.push(word)
    }
  })

  return matches
}

/**
 * Validate multiple fields for profanity
 * Returns object with field names and their profanity status
 */
export function validateFieldsForProfanity(fields: Record<string, string | string[]>): {
  isValid: boolean
  invalidFields: string[]
  message: string
} {
  const invalidFields: string[] = []

  for (const [fieldName, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      // Check each item in array (for tags, roles, locations)
      for (const item of value) {
        if (containsProfanity(item)) {
          invalidFields.push(fieldName)
          break
        }
      }
    } else if (typeof value === 'string') {
      if (containsProfanity(value)) {
        invalidFields.push(fieldName)
      }
    }
  }

  return {
    isValid: invalidFields.length === 0,
    invalidFields,
    message: invalidFields.length > 0
      ? 'Please remove inappropriate language from your profile'
      : ''
  }
}

/**
 * User-friendly field name mapping for error messages
 */
export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  bio: 'About Me',
  tags: 'Skills & Interests',
  target_roles: 'Target Roles',
  preferred_locations: 'Preferred Locations',
}
