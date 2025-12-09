-- Migration: MFA Recovery Codes
-- Allows users to recover their account if they lose access to their authenticator app

-- ============================================================
-- Table: recovery_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_recovery_codes_user_id ON public.recovery_codes(user_id);
CREATE INDEX idx_recovery_codes_unused ON public.recovery_codes(user_id) WHERE used_at IS NULL;

-- Enable RLS
ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own recovery codes (but not the hashes in practice)
CREATE POLICY "Users can view own recovery codes"
  ON public.recovery_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own recovery codes (for regeneration)
CREATE POLICY "Users can delete own recovery codes"
  ON public.recovery_codes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Only the RPC function can insert (via security definer)
-- No direct insert policy for users

-- ============================================================
-- Function: store_recovery_codes
-- Stores hashed recovery codes for a user (replaces any existing)
-- ============================================================
CREATE OR REPLACE FUNCTION public.store_recovery_codes(code_hashes TEXT[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_hash TEXT;
  v_count INT := 0;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  -- Delete existing recovery codes for this user
  DELETE FROM public.recovery_codes WHERE user_id = v_user_id;

  -- Insert new codes
  FOREACH v_hash IN ARRAY code_hashes
  LOOP
    INSERT INTO public.recovery_codes (user_id, code_hash)
    VALUES (v_user_id, v_hash);
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'message', format('%s recovery codes stored', v_count),
    'count', v_count
  );
END;
$$;

-- ============================================================
-- Function: verify_recovery_code
-- Verifies a recovery code and marks it as used
-- Returns success if valid, marks code as used (one-time use)
-- ============================================================
CREATE OR REPLACE FUNCTION public.verify_recovery_code(input_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_code_id UUID;
  v_input_hash TEXT;
  v_remaining INT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  -- Normalize input: uppercase, remove dashes/spaces
  input_code := upper(regexp_replace(input_code, '[^A-Z0-9]', '', 'g'));

  -- Hash the input code (SHA-256)
  v_input_hash := encode(sha256(input_code::bytea), 'hex');

  -- Find matching unused code
  SELECT id INTO v_code_id
  FROM public.recovery_codes
  WHERE user_id = v_user_id
    AND code_hash = v_input_hash
    AND used_at IS NULL
  LIMIT 1;

  IF v_code_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid or already used recovery code'
    );
  END IF;

  -- Mark code as used
  UPDATE public.recovery_codes
  SET used_at = now()
  WHERE id = v_code_id;

  -- Count remaining codes
  SELECT COUNT(*) INTO v_remaining
  FROM public.recovery_codes
  WHERE user_id = v_user_id
    AND used_at IS NULL;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Recovery code verified',
    'remaining_codes', v_remaining
  );
END;
$$;

-- ============================================================
-- Function: get_recovery_codes_count
-- Returns how many unused recovery codes the user has
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_recovery_codes_count()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_total INT;
  v_unused INT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE used_at IS NULL)
  INTO v_total, v_unused
  FROM public.recovery_codes
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'total', v_total,
    'unused', v_unused,
    'used', v_total - v_unused
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.store_recovery_codes(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_recovery_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recovery_codes_count() TO authenticated;
