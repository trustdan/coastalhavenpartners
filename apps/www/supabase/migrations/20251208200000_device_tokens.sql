-- Mobile Device Tokens (FCM)
-- Stores Firebase Cloud Messaging tokens for mobile push notifications
-- Note: Table may already exist, so we use IF NOT EXISTS and ALTER TABLE for columns

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'device_tokens' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE device_tokens ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  -- Add device_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'device_tokens' AND column_name = 'device_name'
  ) THEN
    ALTER TABLE device_tokens ADD COLUMN device_name text;
  END IF;

  -- Add app_version column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'device_tokens' AND column_name = 'app_version'
  ) THEN
    ALTER TABLE device_tokens ADD COLUMN app_version text;
  END IF;

  -- Add last_used_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'device_tokens' AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE device_tokens ADD COLUMN last_used_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add platform check constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'device_tokens_platform_check'
  ) THEN
    ALTER TABLE device_tokens ADD CONSTRAINT device_tokens_platform_check
      CHECK (platform IN ('android', 'ios'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add unique constraint on token if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'device_tokens_token_key'
  ) THEN
    ALTER TABLE device_tokens ADD CONSTRAINT device_tokens_token_key UNIQUE (token);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes (IF NOT EXISTS handles duplicates)
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_platform ON device_tokens(platform);

-- Create partial index for active tokens (drop and recreate to ensure correct definition)
DROP INDEX IF EXISTS idx_device_tokens_active;
CREATE INDEX idx_device_tokens_active ON device_tokens(user_id) WHERE is_active = true;

-- RLS Policies (drop and recreate to avoid conflicts)
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own device tokens" ON device_tokens;
CREATE POLICY "Users can view own device tokens"
  ON device_tokens FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own device tokens" ON device_tokens;
CREATE POLICY "Users can insert own device tokens"
  ON device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own device tokens" ON device_tokens;
CREATE POLICY "Users can update own device tokens"
  ON device_tokens FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own device tokens" ON device_tokens;
CREATE POLICY "Users can delete own device tokens"
  ON device_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_device_token_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp (drop and recreate)
DROP TRIGGER IF EXISTS trigger_update_device_token_timestamp ON device_tokens;
CREATE TRIGGER trigger_update_device_token_timestamp
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_device_token_timestamp();

-- Function to upsert device token (insert or update if exists)
CREATE OR REPLACE FUNCTION upsert_device_token(
  p_user_id uuid,
  p_token text,
  p_platform text,
  p_device_name text DEFAULT NULL,
  p_app_version text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_token_id uuid;
BEGIN
  -- Try to update existing token for this user/platform combination
  UPDATE device_tokens
  SET
    token = p_token,
    device_name = COALESCE(p_device_name, device_name),
    app_version = COALESCE(p_app_version, app_version),
    is_active = true,
    updated_at = now(),
    last_used_at = now()
  WHERE user_id = p_user_id AND platform = p_platform
  RETURNING id INTO v_token_id;

  -- If no existing token found, insert new one
  IF v_token_id IS NULL THEN
    INSERT INTO device_tokens (user_id, token, platform, device_name, app_version)
    VALUES (p_user_id, p_token, p_platform, p_device_name, p_app_version)
    RETURNING id INTO v_token_id;
  END IF;

  RETURN v_token_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION upsert_device_token TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE device_tokens IS 'FCM tokens for mobile push notifications (Android/iOS)';
COMMENT ON FUNCTION upsert_device_token IS 'Safely insert or update a device token for a user';
