-- Fix infinite recursion in recruiter_profiles RLS policies
-- The existing policies query profiles/recruiter_profiles tables which triggers RLS recursively

-- Drop the problematic policies
DROP POLICY IF EXISTS "Candidates can view public recruiter profiles" ON public.recruiter_profiles;
DROP POLICY IF EXISTS "Recruiters can view other public recruiter profiles" ON public.recruiter_profiles;

-- Recreate policies using auth.users metadata directly (no circular dependency)
-- Candidates can view recruiters who have made their profiles visible to candidates
CREATE POLICY "Candidates can view public recruiter profiles"
  ON public.recruiter_profiles FOR SELECT
  TO authenticated
  USING (
    is_visible_to_candidates = TRUE
    AND is_approved = TRUE
    AND public.current_user_role() = 'candidate'
  );

-- Recruiters can view other recruiters who have made their profiles visible to recruiters
CREATE POLICY "Recruiters can view other public recruiter profiles"
  ON public.recruiter_profiles FOR SELECT
  TO authenticated
  USING (
    is_visible_to_recruiters = TRUE
    AND is_approved = TRUE
    AND auth.uid() != user_id
    AND public.current_user_role() = 'recruiter'
  );

-- Ensure recruiters can always update their own profile (may have been affected by other policies)
DROP POLICY IF EXISTS "Users can update own recruiter profile" ON public.recruiter_profiles;
CREATE POLICY "Users can update own recruiter profile"
  ON public.recruiter_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure recruiters can always view their own profile
DROP POLICY IF EXISTS "Users can view own recruiter profile" ON public.recruiter_profiles;
CREATE POLICY "Users can view own recruiter profile"
  ON public.recruiter_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
