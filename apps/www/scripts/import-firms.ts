/**
 * Imports firms from research/PNW-firms-database.csv into Supabase
 * Run with: npx tsx scripts/import-firms.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local for local development
config({ path: '.env.local' })

// Simple CSV parser that handles quoted fields with commas
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n')
  const headers = parseCSVLine(lines[0])
  const results: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = parseCSVLine(line)
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })

    results.push(row)
  }

  return results
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

// Generate URL-safe slug from firm name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Parse priority value
function parsePriority(value: string): number | null {
  const num = parseInt(value, 10)
  if (isNaN(num) || num < 1 || num > 3) return null
  return num
}

// Parse founded year
function parseFounded(value: string): number | null {
  const num = parseInt(value, 10)
  if (isNaN(num) || num < 1800 || num > 2025) return null
  return num
}

// Map CSV category to firm_type
function mapCategory(category: string): string {
  const mapping: Record<string, string> = {
    'Investment Banking': 'Investment Banking',
    'Private Equity': 'Private Equity',
    'Venture Capital': 'Venture Capital',
    'Hedge Fund': 'Hedge Fund',
    'Asset Manager': 'Asset Management',
    'Family Office': 'Family Office',
    'Trust Company': 'Trust Company',
    'Corporate Venture': 'Corporate Venture',
  }
  return mapping[category] || category
}

async function importFirms() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Find CSV file (works from apps/www or root)
  let csvPath = path.join(process.cwd(), 'research', 'PNW-firms-database.csv')
  if (!fs.existsSync(csvPath)) {
    csvPath = path.join(process.cwd(), '..', '..', 'research', 'PNW-firms-database.csv')
  }
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at:', csvPath)
    process.exit(1)
  }

  console.log(`Reading CSV from: ${csvPath}`)
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(csvContent)
  console.log(`Parsed ${rows.length} firms from CSV`)

  // Get existing firms to check for duplicates
  const { data: existingFirms } = await supabase
    .from('firms')
    .select('name, slug')

  const existingSlugs = new Set((existingFirms || []).map(f => f.slug))
  const existingNames = new Set((existingFirms || []).map(f => f.name?.toLowerCase()))

  let imported = 0
  let skipped = 0
  let updated = 0
  let errors = 0

  for (const row of rows) {
    const firmName = row['Firm Name']?.trim()
    if (!firmName) {
      console.log('Skipping row with no firm name')
      skipped++
      continue
    }

    try {
      let slug = generateSlug(firmName)

      // Make slug unique if needed
      let slugCounter = 0
      let originalSlug = slug
      while (existingSlugs.has(slug) && !existingNames.has(firmName.toLowerCase())) {
        slugCounter++
        slug = `${originalSlug}-${slugCounter}`
      }

      const firm = {
        name: firmName,
        slug,
        firm_type: mapCategory(row['Category'] || ''),
        city: row['City'] || null,
        state: row['State'] || null,
        region: row['Region'] || null,
        website: row['Website'] || null,
        focus_sector: row['Focus/Sector'] || null,
        aum_fund_size: row['AUM/Fund Size'] || null,
        deal_size_criteria: row['Deal Size/Criteria'] || null,
        priority: parsePriority(row['Priority']),
        founded_year: parseFounded(row['Founded']),
        employee_count: row['Team Size'] || null,
        description: row['Description'] || null,
        contact_email: row['Contact Email'] || null,
        uw_foster_relevance: row['UW Foster Relevance'] || null,
        notes: row['Notes'] || null,
        is_visible: true,
      }

      // Check if firm already exists by name
      if (existingNames.has(firmName.toLowerCase())) {
        // Update existing firm
        const { error } = await supabase
          .from('firms')
          .update(firm)
          .ilike('name', firmName)

        if (error) {
          console.error(`Error updating ${firmName}:`, error.message)
          errors++
        } else {
          console.log(`Updated: ${firmName}`)
          updated++
        }
      } else {
        // Insert new firm
        const { error } = await supabase
          .from('firms')
          .insert(firm)

        if (error) {
          console.error(`Error inserting ${firmName}:`, error.message)
          errors++
        } else {
          console.log(`Imported: ${firmName}`)
          existingSlugs.add(slug)
          existingNames.add(firmName.toLowerCase())
          imported++
        }
      }
    } catch (err) {
      console.error(`Error processing ${firmName}:`, err)
      errors++
    }
  }

  console.log('\n--- Import Summary ---')
  console.log(`Imported: ${imported}`)
  console.log(`Updated:  ${updated}`)
  console.log(`Skipped:  ${skipped}`)
  console.log(`Errors:   ${errors}`)
  console.log(`Total:    ${rows.length}`)
}

importFirms().catch(console.error)
