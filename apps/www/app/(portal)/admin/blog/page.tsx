import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteArticle } from './actions'
import Link from 'next/link'
import { Pencil, Trash2, Eye, Plus } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

export default async function AdminBlogPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
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
  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    redirect('/login')
  }

  // Fetch all articles
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  const draftArticles = articles?.filter(a => a.status === 'draft') || []
  const publishedArticles = articles?.filter(a => a.status === 'published') || []
  const archivedArticles = articles?.filter(a => a.status === 'archived') || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Articles</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage your blog content for SEO growth
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Drafts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-600 dark:text-amber-400">
          Drafts ({draftArticles.length})
        </h2>
        <ArticleTable articles={draftArticles} />
      </section>

      {/* Published */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
          Published ({publishedArticles.length})
        </h2>
        <ArticleTable articles={publishedArticles} showPublishedDate />
      </section>

      {/* Archived */}
      {archivedArticles.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-500">
            Archived ({archivedArticles.length})
          </h2>
          <ArticleTable articles={archivedArticles} />
        </section>
      )}
    </div>
  )
}

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  category: string | null
  status: string
  published_at: string | null
  created_at: string | null
  author_name: string | null
}

function ArticleTable({ articles, showPublishedDate = false }: { articles: Article[], showPublishedDate?: boolean }) {
  if (articles.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
        No articles in this section
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
      <table className="w-full">
        <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Category</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Author</th>
            <th className="px-6 py-3 text-left text-sm font-medium">
              {showPublishedDate ? 'Published' : 'Created'}
            </th>
            <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium">{article.title}</p>
                  {article.excerpt && (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                {article.category ? (
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {article.category}
                  </span>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                {article.author_name || 'Unknown'}
              </td>
              <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                {showPublishedDate && article.published_at
                  ? new Date(article.published_at).toLocaleDateString()
                  : article.created_at ? new Date(article.created_at).toLocaleDateString() : '—'}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  {article.status === 'published' && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer" title="View Article">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/blog/${article.id}`} title="Edit Article">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <form action={deleteArticle.bind(null, article.id)}>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" title="Delete Article">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
