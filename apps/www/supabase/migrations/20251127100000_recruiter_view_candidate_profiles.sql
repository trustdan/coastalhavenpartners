-- Allow approved recruiters to view basic profile info of verified candidates
-- This fixes the issue where candidate names don't show in the recruiter dashboard

-- Policy: Approved recruiters can view profiles of verified candidates
CREATE POLICY "Recruiters can view verified candidate profiles"
  ON public.profiles FOR SELECT
  USING (
    -- The profile belongs to a verified candidate
    EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.user_id = profiles.id
      AND cp.status = 'verified'
    )
    -- And the viewer is an approved recruiter
    AND EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.user_id = auth.uid()
      AND rp.is_approved = TRUE
    )
  );

-- Policy: School admins can view profiles of candidates from their school
CREATE POLICY "School admins can view candidate profiles from their school"
  ON public.profiles FOR SELECT
  USING (
    -- The profile belongs to a candidate from the school admin's school
    EXISTS (
      SELECT 1
      FROM public.candidate_profiles cp
      JOIN public.school_profiles sp ON sp.user_id = auth.uid()
      WHERE cp.user_id = profiles.id
      AND cp.school_name = sp.school_name
      AND sp.is_approved = TRUE
    )
  );
