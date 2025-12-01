-- Add document verification fields to candidate_profiles
ALTER TABLE candidate_profiles
ADD COLUMN IF NOT EXISTS resume_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS transcript_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS documents_verified_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS documents_verified_at timestamptz;

-- Create index for verification queue queries
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_verification
ON candidate_profiles (resume_verified, transcript_verified)
WHERE resume_url IS NOT NULL OR transcript_url IS NOT NULL;
