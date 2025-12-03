import { createClient } from '@/lib/supabase/server'
import { constructMetadata } from '@/lib/utils'
import { InsightsClient } from './insights-client'

export const metadata = constructMetadata({
  title: 'Insights - Coastal Haven Partners',
  description: 'Career advice, industry trends, and recruiting insights for finance professionals and aspiring candidates.',
})

export const revalidate = 3600 // Revalidate every hour

export default async function InsightsPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, title, excerpt, category, cover_image_url, published_at, author_name')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  // Get unique categories for filter
  const categories = [...new Set(articles?.map(a => a.category).filter(Boolean))] as string[]

  return <InsightsClient articles={articles || []} categories={categories} />
}
