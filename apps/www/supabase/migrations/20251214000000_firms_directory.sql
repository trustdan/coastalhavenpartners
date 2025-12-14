-- Extend firms table with directory-specific fields for the firms index
ALTER TABLE firms ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS focus_sector TEXT;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS aum_fund_size TEXT;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS deal_size_criteria TEXT;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS priority INTEGER CHECK (priority BETWEEN 1 AND 3);
ALTER TABLE firms ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS uw_foster_relevance TEXT;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rename firm_type to category for consistency with CSV data
-- (firm_type already exists, we'll use it as-is since it maps to category)

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_firms_firm_type ON firms(firm_type);
CREATE INDEX IF NOT EXISTS idx_firms_region ON firms(region);
CREATE INDEX IF NOT EXISTS idx_firms_priority ON firms(priority);
CREATE INDEX IF NOT EXISTS idx_firms_state ON firms(state);

-- Full-text search index for name, description, and focus_sector
CREATE INDEX IF NOT EXISTS idx_firms_search ON firms
  USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(focus_sector, '')));

-- Create saved_firms table for users to bookmark firms
CREATE TABLE IF NOT EXISTS saved_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, firm_id)
);

-- Create indexes for saved_firms
CREATE INDEX IF NOT EXISTS idx_saved_firms_user ON saved_firms(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_firms_firm ON saved_firms(firm_id);

-- Enable RLS on saved_firms
ALTER TABLE saved_firms ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved firms
CREATE POLICY "Users can view their saved firms"
  ON saved_firms FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can save firms
CREATE POLICY "Users can save firms"
  ON saved_firms FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave firms
CREATE POLICY "Users can unsave their firms"
  ON saved_firms FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Add policy for authenticated users to view all firms (for directory)
-- Note: existing policy only shows visible firms to anyone, we want all authenticated users to see visible firms
-- This is already covered by "Anyone can view visible firms" policy
