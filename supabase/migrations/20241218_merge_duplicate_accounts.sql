-- Migration: Merge Duplicate Auth Accounts
-- Run this in Supabase SQL Editor to merge accounts with same email
-- This script merges a social auth account into an existing email/password account

-- ============================================================================
-- STEP 1: Find both accounts (run this first to get the IDs)
-- ============================================================================
-- SELECT
--   id,
--   email,
--   raw_app_meta_data->>'provider' as provider,
--   created_at,
--   last_sign_in_at
-- FROM auth.users
-- WHERE email = 'danieltuckerrust@gmail.com'
-- ORDER BY created_at;

-- ============================================================================
-- STEP 2: After identifying the accounts, set these variables
-- Replace with actual UUIDs from Step 1
-- ============================================================================
DO $$
DECLARE
  -- Your original admin account (email/password) - KEEP THIS ONE
  primary_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- Replace with actual ID

  -- The new social login account - DELETE THIS ONE
  duplicate_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- Replace with actual ID

  target_email TEXT := 'danieltuckerrust@gmail.com';

  primary_exists BOOLEAN;
  duplicate_exists BOOLEAN;
  duplicate_has_profile BOOLEAN;
BEGIN
  -- Verify both accounts exist
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = primary_user_id) INTO primary_exists;
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = duplicate_user_id) INTO duplicate_exists;

  IF NOT primary_exists THEN
    RAISE EXCEPTION 'Primary account not found: %', primary_user_id;
  END IF;

  IF NOT duplicate_exists THEN
    RAISE EXCEPTION 'Duplicate account not found: %', duplicate_user_id;
  END IF;

  -- Check if duplicate has a profile (if so, we need to be more careful)
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = duplicate_user_id) INTO duplicate_has_profile;

  IF duplicate_has_profile THEN
    RAISE NOTICE 'Warning: Duplicate account has a profile. Checking for data...';

    -- Check for candidate_profile
    IF EXISTS(SELECT 1 FROM public.candidate_profiles WHERE user_id = duplicate_user_id) THEN
      RAISE EXCEPTION 'Duplicate account has candidate_profiles data. Manual merge required.';
    END IF;

    -- Check for recruiter_profile
    IF EXISTS(SELECT 1 FROM public.recruiter_profiles WHERE user_id = duplicate_user_id) THEN
      RAISE EXCEPTION 'Duplicate account has recruiter_profiles data. Manual merge required.';
    END IF;

    -- Safe to delete empty profile
    DELETE FROM public.profiles WHERE id = duplicate_user_id;
    RAISE NOTICE 'Deleted empty profile for duplicate account';
  END IF;

  -- Delete user_settings if any
  DELETE FROM public.user_settings WHERE user_id = duplicate_user_id;

  -- Delete any moderation actions referencing this user
  DELETE FROM public.moderation_actions WHERE target_user_id = duplicate_user_id;

  -- Delete the duplicate auth user
  DELETE FROM auth.users WHERE id = duplicate_user_id;

  RAISE NOTICE 'Successfully deleted duplicate account: %', duplicate_user_id;
  RAISE NOTICE 'Primary account preserved: %', primary_user_id;
END $$;

-- ============================================================================
-- STEP 3: Link Google identity to primary account (Optional - for future logins)
-- This allows you to use Google OAuth with your primary account
-- ============================================================================
-- Note: This requires using Supabase Admin API, not SQL
-- See the admin/link-identity API route for programmatic linking

-- ============================================================================
-- VERIFICATION: Run this after to confirm
-- ============================================================================
-- SELECT
--   id,
--   email,
--   raw_app_meta_data->>'provider' as provider,
--   created_at
-- FROM auth.users
-- WHERE email = 'danieltuckerrust@gmail.com';
