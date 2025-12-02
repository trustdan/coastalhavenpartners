import { createClient } from '@/lib/supabase/server'
import { createClient as createBuildClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, meta_title, meta_description, cover_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  const title = article.meta_title || article.title
  const description = article.meta_description || article.excerpt || ''

  return {
    title: `${title} | Coastal Haven Partners`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(article.cover_image_url && { images: [article.cover_image_url] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(article.cover_image_url && { images: [article.cover_image_url] }),
    },
  }
}

export async function generateStaticParams() {
  // Use direct client for build-time generation (no cookies needed)
  const supabase = createBuildClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: articles } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')

  return articles?.map((article) => ({
    slug: article.slug,
  })) || []
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .single()

  if (!article) {
    notFound()
  }

  // Get related articles (only if article has a category)
  type RelatedArticle = {
    slug: string
    title: string
    excerpt: string | null
    category: string | null
    published_at: string | null
  }
  let relatedArticles: RelatedArticle[] | null = null
  if (article.category) {
    const { data } = await supabase
      .from('articles')
      .select('slug, title, excerpt, category, published_at')
      .eq('status', 'published')
      .eq('category', article.category)
      .neq('slug', slug)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(3)
    relatedArticles = data
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
      {/* Back Link */}
      <Link
        href="/insights"
        className="mb-8 inline-flex items-center text-sm text-neutral-600 hover:text-purple-600 dark:text-neutral-400"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Insights
      </Link>

      {/* Header */}
      <header className="mb-12">
        {article.category && (
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            {formatCategory(article.category)}
          </span>
        )}
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-xl text-neutral-600 dark:text-neutral-400">
            {article.excerpt}
          </p>
        )}
        <div className="mt-6 flex items-center gap-4 text-sm text-neutral-500">
          {article.author_name && (
            <span>By {article.author_name}</span>
          )}
          {article.published_at && (
            <>
              <span>•</span>
              <time dateTime={article.published_at}>
                {formatDate(article.published_at)}
              </time>
            </>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {article.cover_image_url && (
        <div className="relative mb-12 aspect-[2/1] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-img:rounded-xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2">
          {article.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/insights/${related.slug}`}
                className="group block rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-lg dark:bg-neutral-900"
              >
                {related.category && (
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    {formatCategory(related.category)}
                  </span>
                )}
                <h3 className="mt-2 font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-2">
                  {related.title}
                </h3>
                {related.excerpt && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {related.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
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
