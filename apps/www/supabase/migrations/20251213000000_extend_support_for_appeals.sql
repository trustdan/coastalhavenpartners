-- Extend support_messages table to handle verification appeals
-- This allows the mobile app and website to share the same support system

-- First, drop the existing check constraint on message_type
ALTER TABLE support_messages DROP CONSTRAINT IF EXISTS support_messages_message_type_check;

-- Add new message types for appeals
ALTER TABLE support_messages
  ADD CONSTRAINT support_messages_message_type_check
  CHECK (message_type IN (
    'technical_support',
    'feedback',
    'verification_appeal',
    'document_issue',
    'account_access',
    'other'
  ));

-- Add appeal-specific columns
ALTER TABLE support_messages
  ADD COLUMN IF NOT EXISTS user_role TEXT,
  ADD COLUMN IF NOT EXISTS appeal_type TEXT,
  ADD COLUMN IF NOT EXISTS additional_info TEXT,
  ADD COLUMN IF NOT EXISTS has_attachments BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS attachment_urls TEXT[], -- Array of storage URLs
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'api'));

-- Add index for appeal types
CREATE INDEX IF NOT EXISTS idx_support_messages_appeal_type ON support_messages(appeal_type) WHERE appeal_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_messages_source ON support_messages(source);

-- Create storage bucket for appeal attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'appeal-attachments',
  'appeal-attachments',
  false, -- Private bucket - only accessible via signed URLs
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS for appeal attachments bucket
CREATE POLICY "Users can upload appeal attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'appeal-attachments');

CREATE POLICY "Users can view their own appeal attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'appeal-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all appeal attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'appeal-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Comment for documentation
COMMENT ON COLUMN support_messages.user_role IS 'The role of the user submitting the appeal (candidate, recruiter, school)';
COMMENT ON COLUMN support_messages.appeal_type IS 'Specific appeal reason: verification_rejected, document_issue, account_access, other';
COMMENT ON COLUMN support_messages.additional_info IS 'Additional context provided by the user';
COMMENT ON COLUMN support_messages.has_attachments IS 'Whether the appeal includes supporting documents';
COMMENT ON COLUMN support_messages.attachment_urls IS 'Array of storage URLs for attached documents';
COMMENT ON COLUMN support_messages.source IS 'Where the message was submitted from: web, mobile, or api';
