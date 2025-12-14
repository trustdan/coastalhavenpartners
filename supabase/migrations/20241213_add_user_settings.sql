-- Create user_settings table for notification and privacy preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    job_alerts BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,

    -- Privacy preferences
    profile_visible BOOLEAN DEFAULT true,
    show_online_status BOOLEAN DEFAULT true,
    allow_messages_from_recruiters BOOLEAN DEFAULT true,
    allow_messages_from_candidates BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Ensure one settings record per user
    CONSTRAINT user_settings_user_id_unique UNIQUE (user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Users can only read their own settings
CREATE POLICY "Users can read own settings"
    ON public.user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
    ON public.user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
    ON public.user_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Function to auto-create settings when a user signs up
CREATE OR REPLACE FUNCTION public.create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create settings on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_settings();

-- Create settings for existing users who don't have them
INSERT INTO public.user_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- Grant permissions
GRANT ALL ON public.user_settings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
