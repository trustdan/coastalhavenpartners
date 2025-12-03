'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Article {
  slug: string
  title: string
  excerpt: string | null
  category: string | null
  cover_image_url: string | null
  published_at: string | null
  author_name: string | null
}

interface InsightsClientProps {
  articles: Article[]
  categories: string[]
}

const ARTICLES_PER_PAGE = 9

export function InsightsClient({ articles, categories }: InsightsClientProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE)

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = search === '' ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = !selectedCategory || article.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [articles, search, selectedCategory])

  // Paginate
  const visibleArticles = filteredArticles.slice(0, visibleCount)
  const hasMore = visibleCount < filteredArticles.length

  const featuredArticle = visibleArticles[0]
  const gridArticles = visibleArticles.slice(1)

  function handleLoadMore() {
    setVisibleCount(prev => prev + ARTICLES_PER_PAGE)
  }

  function clearFilters() {
    setSearch('')
    setSelectedCategory(null)
    setVisibleCount(ARTICLES_PER_PAGE)
  }

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

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setVisibleCount(ARTICLES_PER_PAGE) // Reset pagination on search
            }}
            className="pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null)
                setVisibleCount(ARTICLES_PER_PAGE)
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setVisibleCount(ARTICLES_PER_PAGE)
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                {formatCategory(category)}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        {(search || selectedCategory) && (
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <span>
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            </span>
            <button
              onClick={clearFilters}
              className="text-purple-600 hover:underline dark:text-purple-400"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">
            {search || selectedCategory
              ? 'No articles match your search. Try different keywords or clear the filters.'
              : 'No articles published yet. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured Article */}
          {featuredArticle && (
            <Link
              href={`/insights/${featuredArticle.slug}`}
              className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-neutral-900"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={featuredArticle.cover_image_url || `/insights/${featuredArticle.slug}/thumbnail`}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
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
          {gridArticles.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {gridArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/insights/${article.slug}`}
                  className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-neutral-900"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={article.cover_image_url || `/insights/${article.slug}/thumbnail`}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
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

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                className="rounded-lg bg-purple-600 px-8 py-3 font-medium text-white transition-colors hover:bg-purple-700"
              >
                Load More Articles
              </button>
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
