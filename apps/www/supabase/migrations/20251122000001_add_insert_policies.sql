-- Add INSERT policies for candidate and recruiter profiles
-- This allows users to create their own profiles during signup

-- Candidates can insert their own profile
DROP POLICY IF EXISTS "Candidates can create their own profile" ON public.candidate_profiles;
CREATE POLICY "Candidates can create their own profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Recruiters can insert their own profile
DROP POLICY IF EXISTS "Recruiters can create their own profile" ON public.recruiter_profiles;
CREATE POLICY "Recruiters can create their own profile"
  ON public.recruiter_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
