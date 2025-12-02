import { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString().split("T")[0]

  // Fetch published blog articles
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  const blogEntries: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: absoluteUrl(`/blog/${article.slug}`),
    lastModified: article.updated_at?.split("T")[0] || article.published_at?.split("T")[0] || currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [
    {
      url: absoluteUrl(""),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...blogEntries,
    {
      url: absoluteUrl("/signup/candidate"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/signup/recruiter"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/signup/school"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/login"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}

