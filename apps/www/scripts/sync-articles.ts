/**
 * Syncs markdown articles from content/articles/ to Supabase
 * Run at build time to keep database in sync with markdown files
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local for local development
config({ path: '.env.local' })

// Simple frontmatter parser (avoids extra dependency)
function parseFrontmatter(content: string): { data: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content }
  }

  const frontmatterStr = match[1]
  const markdownContent = match[2]

  // Parse YAML-like frontmatter
  const data: Record<string, any> = {}
  const lines = frontmatterStr.split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    let value: any = line.slice(colonIndex + 1).trim()

    // Handle arrays like tags: [tag1, tag2]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v: string) => v.trim().replace(/^["']|["']$/g, ''))
    }
    // Handle booleans
    else if (value === 'true') value = true
    else if (value === 'false') value = false
    // Handle quoted strings
    else if ((value.startsWith('"') && value.endsWith('"')) ||
             (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    data[key] = value
  }

  return { data, content: markdownContent }
}

function extractTitleFromContent(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

function extractExcerptFromContent(content: string): string | null {
  // Get first paragraph after the title
  const lines = content.split('\n')
  let foundTitle = false
  let excerpt = ''

  for (const line of lines) {
    if (line.startsWith('# ')) {
      foundTitle = true
      continue
    }
    if (foundTitle && line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
      excerpt = line.trim()
      break
    }
  }

  return excerpt || null
}

function slugFromFilename(filename: string): string {
  // Remove number prefix and extension: 001-article-name.md -> article-name
  return filename
    .replace(/\.md$/, '')
    .replace(/^\d+-/, '')
}

async function syncArticles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('⚠️  Missing Supabase credentials, skipping article sync')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Find content directory (works from apps/www or root)
  let contentDir = path.join(process.cwd(), 'content', 'articles')
  if (!fs.existsSync(contentDir)) {
    contentDir = path.join(process.cwd(), '..', '..', 'content', 'articles')
  }
  if (!fs.existsSync(contentDir)) {
    console.log('⚠️  No content/articles directory found, skipping sync')
    return
  }

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'))
  console.log(`📝 Found ${files.length} markdown articles`)

  let synced = 0
  let errors = 0

  for (const filename of files) {
    try {
      const filepath = path.join(contentDir, filename)
      const raw = fs.readFileSync(filepath, 'utf-8')
      const { data: frontmatter, content } = parseFrontmatter(raw)

      const slug = frontmatter.slug || slugFromFilename(filename)
      const title = frontmatter.title || extractTitleFromContent(content)
      const excerpt = frontmatter.excerpt || extractExcerptFromContent(content)

      if (!title) {
        console.log(`⚠️  Skipping ${filename}: no title found`)
        continue
      }

      const article = {
        slug,
        title,
        excerpt,
        content: content.trim(),
        category: frontmatter.category || null,
        tags: frontmatter.tags || null,
        cover_image_url: frontmatter.cover_image || null,
        meta_title: frontmatter.meta_title || null,
        meta_description: frontmatter.meta_description || null,
        status: frontmatter.status || 'draft',
        published_at: frontmatter.published_at || null,
        author_name: frontmatter.author || 'Coastal Haven Partners',
      }

      // Upsert by slug
      const { error } = await supabase
        .from('articles')
        .upsert(article, { onConflict: 'slug' })

      if (error) {
        console.error(`❌ Error syncing ${filename}:`, error.message)
        errors++
      } else {
        console.log(`✅ Synced: ${slug}`)
        synced++
      }
    } catch (err) {
      console.error(`❌ Error processing ${filename}:`, err)
      errors++
    }
  }

  console.log(`\n📊 Sync complete: ${synced} synced, ${errors} errors`)
}

syncArticles().catch(console.error)
