-- Bookmarked candidates for recruiters
CREATE TABLE IF NOT EXISTS bookmarked_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, candidate_id)
);

-- Index for fast lookup by recruiter
CREATE INDEX IF NOT EXISTS idx_bookmarked_candidates_recruiter ON bookmarked_candidates(recruiter_id);

-- Index for fast lookup by candidate
CREATE INDEX IF NOT EXISTS idx_bookmarked_candidates_candidate ON bookmarked_candidates(candidate_id);

-- RLS policies
ALTER TABLE bookmarked_candidates ENABLE ROW LEVEL SECURITY;

-- Recruiters can only see their own bookmarks
CREATE POLICY "Recruiters can view own bookmarks"
  ON bookmarked_candidates
  FOR SELECT
  USING (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can create bookmarks
CREATE POLICY "Recruiters can create bookmarks"
  ON bookmarked_candidates
  FOR INSERT
  WITH CHECK (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can update their own bookmarks (for notes)
CREATE POLICY "Recruiters can update own bookmarks"
  ON bookmarked_candidates
  FOR UPDATE
  USING (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can delete their own bookmarks
CREATE POLICY "Recruiters can delete own bookmarks"
  ON bookmarked_candidates
  FOR DELETE
  USING (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );
