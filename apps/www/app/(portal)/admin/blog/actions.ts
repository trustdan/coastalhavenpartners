'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/types/database.types'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Verify admin role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Not authorized')
  }

  return { supabaseAdmin, user, authorName: profile.full_name }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createArticle(formData: FormData) {
  const { supabaseAdmin, user, authorName } = await getAdminClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const category = formData.get('category') as string
  const tagsRaw = formData.get('tags') as string
  const coverImageUrl = formData.get('cover_image_url') as string
  const metaTitle = formData.get('meta_title') as string
  const metaDescription = formData.get('meta_description') as string
  const status = formData.get('status') as string

  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const slug = generateSlug(title)

  const { error } = await supabaseAdmin
    .from('articles')
    .insert({
      slug,
      title,
      content,
      excerpt: excerpt || null,
      category: category || null,
      tags: tags.length > 0 ? tags : null,
      cover_image_url: coverImageUrl || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      status: status || 'draft',
      author_id: user.id,
      author_name: authorName,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  redirect('/admin/blog')
}

export async function updateArticle(id: string, formData: FormData) {
  const { supabaseAdmin } = await getAdminClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const category = formData.get('category') as string
  const tagsRaw = formData.get('tags') as string
  const coverImageUrl = formData.get('cover_image_url') as string
  const metaTitle = formData.get('meta_title') as string
  const metaDescription = formData.get('meta_description') as string
  const status = formData.get('status') as string
  const slug = formData.get('slug') as string

  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

  // Get current article to check status change
  const { data: currentArticle } = await supabaseAdmin
    .from('articles')
    .select('status, published_at')
    .eq('id', id)
    .single()

  const shouldSetPublishedAt = status === 'published' && currentArticle?.status !== 'published' && !currentArticle?.published_at

  const { error } = await supabaseAdmin
    .from('articles')
    .update({
      slug,
      title,
      content,
      excerpt: excerpt || null,
      category: category || null,
      tags: tags.length > 0 ? tags : null,
      cover_image_url: coverImageUrl || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      status,
      ...(shouldSetPublishedAt ? { published_at: new Date().toISOString() } : {}),
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  redirect('/admin/blog')
}

export async function deleteArticle(id: string) {
  const { supabaseAdmin } = await getAdminClient()

  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
}
