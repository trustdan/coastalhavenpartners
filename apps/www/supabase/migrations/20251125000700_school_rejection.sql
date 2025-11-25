-- Add rejection fields to school_profiles (same as recruiter_profiles)
ALTER TABLE public.school_profiles 
ADD COLUMN IF NOT EXISTS is_rejected BOOLEAN DEFAULT FALSE;

ALTER TABLE public.school_profiles 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

ALTER TABLE public.school_profiles 
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles(id);

