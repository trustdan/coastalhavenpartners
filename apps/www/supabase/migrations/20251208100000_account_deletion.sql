-- Account deletion function
-- Allows users to delete their own account and all associated data

-- Create the RPC function for account deletion
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  deleted_files_count int := 0;
  storage_file record;
BEGIN
  -- Get the authenticated user's ID
  user_id := auth.uid();

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Step 1: Delete user's storage files from all buckets
  -- Files are stored in folders named after the user ID

  -- Delete from resumes bucket
  FOR storage_file IN
    SELECT name FROM storage.objects
    WHERE bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = user_id::text
  LOOP
    DELETE FROM storage.objects
    WHERE bucket_id = 'resumes' AND name = storage_file.name;
    deleted_files_count := deleted_files_count + 1;
  END LOOP;

  -- Delete from transcripts bucket
  FOR storage_file IN
    SELECT name FROM storage.objects
    WHERE bucket_id = 'transcripts'
    AND (storage.foldername(name))[1] = user_id::text
  LOOP
    DELETE FROM storage.objects
    WHERE bucket_id = 'transcripts' AND name = storage_file.name;
    deleted_files_count := deleted_files_count + 1;
  END LOOP;

  -- Delete from school-documents bucket (if applicable)
  FOR storage_file IN
    SELECT name FROM storage.objects
    WHERE bucket_id = 'school-documents'
    AND (storage.foldername(name))[1] = user_id::text
  LOOP
    DELETE FROM storage.objects
    WHERE bucket_id = 'school-documents' AND name = storage_file.name;
    deleted_files_count := deleted_files_count + 1;
  END LOOP;

  -- Step 2: Delete the user from auth.users
  -- This will cascade to:
  --   - profiles (ON DELETE CASCADE)
  --   - candidate_profiles (via profiles cascade)
  --   - recruiter_profiles (via profiles cascade)
  --   - school_profiles (via profiles cascade)
  --   - conversations, messages (via profile cascades)
  --   - All other related data
  DELETE FROM auth.users WHERE id = user_id;

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Account deleted successfully',
    'files_deleted', deleted_files_count
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Add a comment for documentation
COMMENT ON FUNCTION delete_user_account() IS
'Allows authenticated users to delete their own account and all associated data including storage files.
This action is irreversible.';
