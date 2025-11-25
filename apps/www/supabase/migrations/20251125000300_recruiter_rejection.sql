-- Add is_rejected field to track rejected/revoked recruiters
ALTER TABLE public.recruiter_profiles 
ADD COLUMN IF NOT EXISTS is_rejected BOOLEAN DEFAULT FALSE;

-- Add rejected_at timestamp to track when they were rejected
ALTER TABLE public.recruiter_profiles 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Add rejected_by to track who rejected them
ALTER TABLE public.recruiter_profiles 
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles(id);

