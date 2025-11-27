-- Add comprehensive education fields for candidates
-- Supports both undergrad and graduate programs with degree types

-- Rename existing fields to undergrad prefix for clarity
-- (keeping old columns for backwards compatibility, will use new ones)

-- Add undergrad-specific fields
ALTER TABLE candidate_profiles
ADD COLUMN IF NOT EXISTS undergrad_degree_type TEXT,
ADD COLUMN IF NOT EXISTS undergrad_specialty TEXT;

-- Add graduate program fields (all nullable since not everyone has a grad degree)
ALTER TABLE candidate_profiles
ADD COLUMN IF NOT EXISTS grad_school TEXT,
ADD COLUMN IF NOT EXISTS grad_degree_type TEXT,
ADD COLUMN IF NOT EXISTS grad_major TEXT,
ADD COLUMN IF NOT EXISTS grad_gpa NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS grad_graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS grad_specialty TEXT;

-- Add constraints for grad_gpa
ALTER TABLE candidate_profiles
ADD CONSTRAINT grad_gpa_range CHECK (grad_gpa IS NULL OR (grad_gpa >= 0 AND grad_gpa <= 4.0));

-- Add constraint for grad_graduation_year
ALTER TABLE candidate_profiles
ADD CONSTRAINT grad_graduation_year_range CHECK (grad_graduation_year IS NULL OR (grad_graduation_year >= 1950 AND grad_graduation_year <= 2050));

-- Comment on new columns
COMMENT ON COLUMN candidate_profiles.undergrad_degree_type IS 'Type of undergraduate degree (BA, BS, etc.)';
COMMENT ON COLUMN candidate_profiles.undergrad_specialty IS 'Specialization or concentration for undergrad';
COMMENT ON COLUMN candidate_profiles.grad_school IS 'Graduate school name';
COMMENT ON COLUMN candidate_profiles.grad_degree_type IS 'Type of graduate degree (MA, MBA, JD, PhD, etc.)';
COMMENT ON COLUMN candidate_profiles.grad_major IS 'Graduate major or field of study';
COMMENT ON COLUMN candidate_profiles.grad_gpa IS 'Graduate program GPA';
COMMENT ON COLUMN candidate_profiles.grad_graduation_year IS 'Graduate program graduation year';
COMMENT ON COLUMN candidate_profiles.grad_specialty IS 'Specialization or concentration for graduate program';
