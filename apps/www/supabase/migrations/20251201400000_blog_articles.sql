-- =============================================
-- BLOG ARTICLES TABLE
-- =============================================
-- Stores blog articles with markdown content for SEO-driven growth

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT, -- Short description for previews/meta
  content TEXT NOT NULL, -- Markdown content
  cover_image_url TEXT, -- Featured image

  -- SEO
  meta_title TEXT, -- Override title for SEO
  meta_description TEXT, -- Override description for SEO

  -- Categorization
  category TEXT, -- e.g., 'career-advice', 'industry-insights', 'interview-prep'
  tags TEXT[], -- e.g., ['private-equity', 'recruiting', 'tips']

  -- Publishing
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Authorship
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT, -- Denormalized for display even if author deleted

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_category ON public.articles(category);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Anyone can read published articles"
  ON public.articles FOR SELECT
  USING (status = 'published' AND published_at <= NOW());

-- Admins have full access (via service role key, bypasses RLS)
-- No additional policies needed since admin uses service role

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_article_published_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION set_published_at();
