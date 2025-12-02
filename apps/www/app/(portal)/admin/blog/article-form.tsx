'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ArticleData {
  id?: string | null
  slug?: string | null
  title?: string | null
  content?: string | null
  excerpt?: string | null
  category?: string | null
  tags?: string[] | null
  cover_image_url?: string | null
  meta_title?: string | null
  meta_description?: string | null
  status?: string | null
}

interface ArticleFormProps {
  article?: ArticleData
  action: (formData: FormData) => Promise<void>
  isEdit?: boolean
}

const CATEGORIES = [
  { value: 'career-advice', label: 'Career Advice' },
  { value: 'industry-insights', label: 'Industry Insights' },
  { value: 'interview-prep', label: 'Interview Prep' },
  { value: 'recruiting-tips', label: 'Recruiting Tips' },
  { value: 'market-trends', label: 'Market Trends' },
  { value: 'success-stories', label: 'Success Stories' },
]

export function ArticleForm({ article, action, isEdit = false }: ArticleFormProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [content, setContent] = useState(article?.content || '')
  const [status, setStatus] = useState(article?.status || 'draft')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit Article' : 'New Article'}
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="mr-2 h-4 w-4" />
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {showPreview ? (
        <div className="rounded-xl border bg-white p-8 dark:bg-neutral-900">
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '*No content yet*'}
            </ReactMarkdown>
          </article>
        </div>
      ) : (
        <form action={action} className="space-y-8">
          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-xl border bg-white p-6 dark:bg-neutral-900">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={article?.title ?? ''}
                      placeholder="Your article title"
                      required
                      className="mt-1"
                    />
                  </div>

                  {isEdit && (
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        defaultValue={article?.slug ?? ''}
                        placeholder="url-friendly-slug"
                        required
                        className="mt-1"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        URL: /blog/{article?.slug}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      defaultValue={article?.excerpt || ''}
                      placeholder="Brief summary for previews and meta descriptions"
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content (Markdown)</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article in Markdown..."
                      rows={20}
                      required
                      className="mt-1 font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Supports GitHub-flavored Markdown: headings, lists, code blocks, tables, etc.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing */}
              <div className="rounded-xl border bg-white p-6 dark:bg-neutral-900">
                <h3 className="mb-4 font-semibold">Publishing</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" value={status} onValueChange={setStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? 'Save Changes' : 'Create Article'}
                  </Button>
                </div>
              </div>

              {/* Organization */}
              <div className="rounded-xl border bg-white p-6 dark:bg-neutral-900">
                <h3 className="mb-4 font-semibold">Organization</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={article?.category || ''}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      name="tags"
                      defaultValue={article?.tags?.join(', ') || ''}
                      placeholder="private-equity, recruiting, tips"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Comma-separated
                    </p>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="rounded-xl border bg-white p-6 dark:bg-neutral-900">
                <h3 className="mb-4 font-semibold">Media</h3>
                <div>
                  <Label htmlFor="cover_image_url">Cover Image URL</Label>
                  <Input
                    id="cover_image_url"
                    name="cover_image_url"
                    defaultValue={article?.cover_image_url || ''}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="rounded-xl border bg-white p-6 dark:bg-neutral-900">
                <h3 className="mb-4 font-semibold">SEO</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      name="meta_title"
                      defaultValue={article?.meta_title || ''}
                      placeholder="Override page title"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      name="meta_description"
                      defaultValue={article?.meta_description || ''}
                      placeholder="Override meta description"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
