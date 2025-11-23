-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('resumes', 'resumes', true),
  ('transcripts', 'transcripts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Resumes
DROP POLICY IF EXISTS "Candidates can upload their own resume" ON storage.objects;
CREATE POLICY "Candidates can upload their own resume"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Candidates can update their own resume" ON storage.objects;
CREATE POLICY "Candidates can update their own resume"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Candidates can read their own resume" ON storage.objects;
CREATE POLICY "Candidates can read their own resume"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Recruiters can view resumes" ON storage.objects;
CREATE POLICY "Recruiters can view resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND 
  EXISTS (
    SELECT 1 FROM public.recruiter_profiles
    WHERE user_id = auth.uid() AND is_approved = TRUE
  )
);

-- RLS Policies for Transcripts
DROP POLICY IF EXISTS "Candidates can upload their own transcript" ON storage.objects;
CREATE POLICY "Candidates can upload their own transcript"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'transcripts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Candidates can update their own transcript" ON storage.objects;
CREATE POLICY "Candidates can update their own transcript"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'transcripts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Candidates can read their own transcript" ON storage.objects;
CREATE POLICY "Candidates can read their own transcript"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transcripts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Recruiters can view transcripts" ON storage.objects;
CREATE POLICY "Recruiters can view transcripts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transcripts' AND 
  EXISTS (
    SELECT 1 FROM public.recruiter_profiles
    WHERE user_id = auth.uid() AND is_approved = TRUE
  )
);
