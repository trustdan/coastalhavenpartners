-- Add rejection fields to candidate_profiles (same as recruiter_profiles and school_profiles)
ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS is_rejected BOOLEAN DEFAULT FALSE;

ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles(id);

