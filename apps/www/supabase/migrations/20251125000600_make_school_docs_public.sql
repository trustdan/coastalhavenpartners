-- Update the school-documents bucket to be public for viewing
-- This is necessary so admins can view uploaded verification documents
UPDATE storage.buckets 
SET public = true 
WHERE id = 'school-documents';

