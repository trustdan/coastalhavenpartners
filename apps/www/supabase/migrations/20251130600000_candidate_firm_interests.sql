-- Candidate Firm Interests for Mutual Interest Matching
-- Allows candidates to express interest in specific firms

CREATE TABLE IF NOT EXISTS candidate_firm_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  firm_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id, firm_name)
);

-- Index for fast lookup by candidate
CREATE INDEX IF NOT EXISTS idx_candidate_firm_interests_candidate
ON candidate_firm_interests(candidate_id);

-- Index for fast lookup by firm (case-insensitive for matching)
CREATE INDEX IF NOT EXISTS idx_candidate_firm_interests_firm
ON candidate_firm_interests(lower(firm_name));

-- RLS policies
ALTER TABLE candidate_firm_interests ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own interests
CREATE POLICY "Candidates can view own interests"
  ON candidate_firm_interests
  FOR SELECT
  USING (
    candidate_id IN (
      SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
    )
  );

-- Candidates can add interests (max 10 enforced by app)
CREATE POLICY "Candidates can add interests"
  ON candidate_firm_interests
  FOR INSERT
  WITH CHECK (
    candidate_id IN (
      SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
    )
  );

-- Candidates can remove their interests
CREATE POLICY "Candidates can delete own interests"
  ON candidate_firm_interests
  FOR DELETE
  USING (
    candidate_id IN (
      SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can view interests that match their firm
CREATE POLICY "Recruiters can view matching interests"
  ON candidate_firm_interests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recruiter_profiles
      WHERE user_id = auth.uid()
      AND is_approved = true
      AND lower(firm_name) = lower(candidate_firm_interests.firm_name)
    )
  );
