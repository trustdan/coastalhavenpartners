import { createClient } from '@/lib/supabase/server'
import { constructMetadata } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = constructMetadata({
  title: 'Blog - Coastal Haven Partners',
  description: 'Insights, career advice, and industry trends for finance professionals and aspiring candidates.',
})

export const revalidate = 3600 // Revalidate every hour

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, title, excerpt, category, cover_image_url, published_at, author_name')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  const featuredArticle = articles?.[0]
  const remainingArticles = articles?.slice(1) || []

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Insights & Resources
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Career advice, industry trends, and recruiting insights for finance professionals
        </p>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">
            No articles published yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured Article */}
          {featuredArticle && (
            <Link
              href={`/blog/${featuredArticle.slug}`}
              className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-neutral-900"
            >
              <div className="grid gap-6 md:grid-cols-2">
                {featuredArticle.cover_image_url ? (
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={featuredArticle.cover_image_url}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
                    <span className="text-6xl font-bold text-white/20">CHP</span>
                  </div>
                )}
                <div className="flex flex-col justify-center p-6 md:p-8">
                  {featuredArticle.category && (
                    <span className="mb-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                      {formatCategory(featuredArticle.category)}
                    </span>
                  )}
                  <h2 className="text-2xl font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 md:text-3xl">
                    {featuredArticle.title}
                  </h2>
                  {featuredArticle.excerpt && (
                    <p className="mt-3 text-neutral-600 dark:text-neutral-400 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
                    {featuredArticle.author_name && (
                      <span>{featuredArticle.author_name}</span>
                    )}
                    {featuredArticle.published_at && (
                      <span>{formatDate(featuredArticle.published_at)}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Article Grid */}
          {remainingArticles.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {remainingArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-neutral-900"
                >
                  {article.cover_image_url ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <Image
                        src={article.cover_image_url}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
                      <span className="text-4xl font-bold text-white/20">CHP</span>
                    </div>
                  )}
                  <div className="p-5">
                    {article.category && (
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {formatCategory(article.category)}
                      </span>
                    )}
                    <h3 className="mt-2 font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-3 text-xs text-neutral-500">
                      {article.published_at && formatDate(article.published_at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
