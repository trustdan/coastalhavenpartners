-- Create storage bucket for school verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-documents',
  'school-documents',
  false, -- Private bucket - only accessible via signed URLs or service role
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for school-documents bucket

-- Allow authenticated users to upload their own verification documents
CREATE POLICY "Users can upload their own school documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own documents
CREATE POLICY "Users can read their own school documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'school-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to read all school documents (for verification review)
CREATE POLICY "Admins can read all school documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'school-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

