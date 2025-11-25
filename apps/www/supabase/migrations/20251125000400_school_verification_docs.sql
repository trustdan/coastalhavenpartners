-- Add verification document fields to school_profiles
ALTER TABLE public.school_profiles 
ADD COLUMN IF NOT EXISTS verification_document_url TEXT;

ALTER TABLE public.school_profiles 
ADD COLUMN IF NOT EXISTS verification_document_type TEXT;

ALTER TABLE public.school_profiles 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add verification status enum for more granular tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'school_verification_status') THEN
    CREATE TYPE school_verification_status AS ENUM (
      'pending_documents',
      'documents_submitted', 
      'under_review',
      'approved',
      'rejected'
    );
  END IF;
END $$;

-- Add verification status column (default to pending_documents for new signups)
ALTER TABLE public.school_profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending_documents';

COMMENT ON COLUMN public.school_profiles.verification_document_url IS 'URL to uploaded verification document (employment letter, accreditation cert, etc.)';
COMMENT ON COLUMN public.school_profiles.verification_document_type IS 'Type of document: employment_letter, staff_id, accreditation_cert, authorization_letter';
COMMENT ON COLUMN public.school_profiles.verification_notes IS 'Admin notes about the verification review';
COMMENT ON COLUMN public.school_profiles.verification_status IS 'Current status: pending_documents, documents_submitted, under_review, approved, rejected';

