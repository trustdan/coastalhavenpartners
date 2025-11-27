-- Add Discord integration fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS discord_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS discord_username TEXT,
ADD COLUMN IF NOT EXISTS discord_verified_at TIMESTAMPTZ;

-- Create index for Discord ID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON public.profiles(discord_id);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.discord_id IS 'Discord user ID for community integration';
COMMENT ON COLUMN public.profiles.discord_username IS 'Discord username at time of linking';
COMMENT ON COLUMN public.profiles.discord_verified_at IS 'Timestamp when Discord was linked';
