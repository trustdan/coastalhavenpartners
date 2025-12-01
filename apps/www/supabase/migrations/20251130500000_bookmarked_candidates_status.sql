-- Add pipeline status to bookmarked candidates
-- Allows recruiters to track candidates through their hiring pipeline

-- Create enum type for bookmark status
CREATE TYPE bookmark_status AS ENUM (
  'new',
  'contacted',
  'interviewing',
  'offer_extended',
  'hired',
  'passed',
  'not_a_fit'
);

-- Add status column to bookmarked_candidates
ALTER TABLE bookmarked_candidates
ADD COLUMN status bookmark_status NOT NULL DEFAULT 'new';

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_bookmarked_candidates_status
ON bookmarked_candidates(recruiter_id, status);
