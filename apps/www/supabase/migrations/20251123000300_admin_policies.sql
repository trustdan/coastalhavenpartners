-- Admin RLS Policies

-- Allow admins to view/edit ALL profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Allow admins to view/edit ALL candidate profiles
DROP POLICY IF EXISTS "Admins can view all candidate profiles" ON public.candidate_profiles;
CREATE POLICY "Admins can view all candidate profiles"
  ON public.candidate_profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all candidate profiles" ON public.candidate_profiles;
CREATE POLICY "Admins can update all candidate profiles"
  ON public.candidate_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Allow admins to view/edit ALL recruiter profiles
DROP POLICY IF EXISTS "Admins can view all recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "Admins can view all recruiter profiles"
  ON public.recruiter_profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "Admins can update all recruiter profiles"
  ON public.recruiter_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );
