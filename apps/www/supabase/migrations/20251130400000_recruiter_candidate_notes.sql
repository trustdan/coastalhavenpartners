-- Private notes for recruiters on candidates
CREATE TABLE IF NOT EXISTS recruiter_candidate_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, candidate_id)
);

-- Index for fast lookup by recruiter
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_recruiter ON recruiter_candidate_notes(recruiter_id);

-- Index for fast lookup by candidate
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_candidate ON recruiter_candidate_notes(candidate_id);

-- RLS policies
ALTER TABLE recruiter_candidate_notes ENABLE ROW LEVEL SECURITY;

-- Recruiters can only see their own notes
CREATE POLICY "Recruiters can view own notes"
  ON recruiter_candidate_notes
  FOR SELECT
  USING (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can create notes
CREATE POLICY "Recruiters can create notes"
  ON recruiter_candidate_notes
  FOR INSERT
  WITH CHECK (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can update their own notes
CREATE POLICY "Recruiters can update own notes"
  ON recruiter_candidate_notes
  FOR UPDATE
  USING (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can delete their own notes
CREATE POLICY "Recruiters can delete own notes"
  ON recruiter_candidate_notes
  FOR DELETE
  USING (
    recruiter_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );
