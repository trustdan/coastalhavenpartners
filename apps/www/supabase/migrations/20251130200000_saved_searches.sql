-- Saved searches for recruiters
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  notify_new_matches boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookup by recruiter
CREATE INDEX IF NOT EXISTS idx_saved_searches_recruiter ON saved_searches(recruiter_id);

-- RLS policies
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Recruiters can only see their own saved searches
CREATE POLICY "Recruiters can view own saved searches"
  ON saved_searches
  FOR SELECT
  USING (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can create saved searches
CREATE POLICY "Recruiters can create saved searches"
  ON saved_searches
  FOR INSERT
  WITH CHECK (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can update their own saved searches
CREATE POLICY "Recruiters can update own saved searches"
  ON saved_searches
  FOR UPDATE
  USING (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can delete their own saved searches
CREATE POLICY "Recruiters can delete own saved searches"
  ON saved_searches
  FOR DELETE
  USING (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );
