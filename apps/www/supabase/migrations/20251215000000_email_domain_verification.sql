-- Email Domain Verification
-- Allows non-.edu email registrations but flags them for admin review
-- Similar to transcript/resume flagging system

-- =============================================
-- ADD EMAIL DOMAIN STATUS TO CANDIDATE PROFILES
-- =============================================

-- Add email domain verification status column
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS email_domain_status TEXT
  CHECK (email_domain_status IN (
    'edu_verified',      -- .edu email, auto-verified
    'flagged_for_review', -- Non-.edu email, needs admin review
    'manually_approved', -- Admin approved non-.edu email
    'rejected'           -- Admin rejected the account
  ))
  DEFAULT 'edu_verified';

-- Add optional notes for admin review
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS email_review_notes TEXT;

-- Add timestamp for when email was reviewed
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS email_reviewed_at TIMESTAMPTZ;

-- Add who reviewed the email
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS email_reviewed_by UUID REFERENCES public.profiles(id);

-- Create index for filtering by email domain status
CREATE INDEX IF NOT EXISTS idx_candidate_email_domain_status
  ON public.candidate_profiles(email_domain_status);

-- =============================================
-- HELPER FUNCTION TO CHECK IF EMAIL IS EDU
-- =============================================

CREATE OR REPLACE FUNCTION public.is_edu_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if email ends with .edu (case insensitive)
  RETURN LOWER(email) LIKE '%.edu';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- UPDATE EXISTING RECORDS
-- =============================================

-- Set existing profiles based on their email domain
-- First, get the email from the associated profile
UPDATE public.candidate_profiles cp
SET email_domain_status = CASE
  WHEN public.is_edu_email(p.email) THEN 'edu_verified'
  ELSE 'flagged_for_review'
END
FROM public.profiles p
WHERE cp.user_id = p.id
  AND cp.email_domain_status IS NULL;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON COLUMN public.candidate_profiles.email_domain_status IS
  'Verification status for email domain: edu_verified (auto), flagged_for_review (non-.edu needs review), manually_approved, rejected';

COMMENT ON COLUMN public.candidate_profiles.email_review_notes IS
  'Admin notes about why this email was approved/rejected';

COMMENT ON COLUMN public.candidate_profiles.email_reviewed_at IS
  'When the email domain was manually reviewed';

COMMENT ON COLUMN public.candidate_profiles.email_reviewed_by IS
  'Admin who reviewed the email domain';

COMMENT ON FUNCTION public.is_edu_email IS
  'Returns true if the email ends with .edu (case insensitive)';
