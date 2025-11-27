-- =============================================
-- DISCORD MODERATION INTEGRATION
-- =============================================

-- =============================================
-- MODERATION ACTIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target user
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_discord_id TEXT, -- Store even if not linked (for Discord-only actions)

  -- Moderator
  moderator_id UUID REFERENCES public.profiles(id),
  moderator_discord_id TEXT,

  -- Action details
  action_type TEXT NOT NULL, -- 'warn', 'mute', 'kick', 'ban', 'unban', 'note'
  reason TEXT,
  evidence_urls TEXT[], -- Screenshots, message links

  -- Scope
  platform TEXT NOT NULL DEFAULT 'both', -- 'discord', 'website', 'both'

  -- Duration (for temporary actions)
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  discord_message_id TEXT, -- Reference to original reported message
  discord_channel_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_mod_actions_target ON moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_mod_actions_discord ON moderation_actions(target_discord_id);
CREATE INDEX IF NOT EXISTS idx_mod_actions_type ON moderation_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_mod_actions_active ON moderation_actions(is_active) WHERE is_active = TRUE;

-- =============================================
-- DISCORD REPORTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.discord_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reporter
  reporter_discord_id TEXT NOT NULL,
  reporter_user_id UUID REFERENCES public.profiles(id), -- If linked

  -- Reported user
  reported_discord_id TEXT NOT NULL,
  reported_user_id UUID REFERENCES public.profiles(id), -- If linked

  -- Report details
  reason TEXT NOT NULL,
  message_content TEXT,
  message_link TEXT,
  channel_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned', 'dismissed'
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Link to action taken (if any)
  action_id UUID REFERENCES public.moderation_actions(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for pending reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON discord_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON discord_reports(reported_discord_id);

-- =============================================
-- ADD BAN FIELDS TO PROFILES
-- =============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMPTZ;

-- Index for banned users
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON public.profiles(is_banned) WHERE is_banned = TRUE;

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage moderation actions
DROP POLICY IF EXISTS "Admins can manage moderation actions" ON public.moderation_actions;
CREATE POLICY "Admins can manage moderation actions"
  ON public.moderation_actions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can view/manage reports
DROP POLICY IF EXISTS "Admins can manage discord reports" ON public.discord_reports;
CREATE POLICY "Admins can manage discord reports"
  ON public.discord_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can insert reports (for webhook)
DROP POLICY IF EXISTS "Service role can insert reports" ON public.discord_reports;
CREATE POLICY "Service role can insert reports"
  ON public.discord_reports FOR INSERT
  WITH CHECK (true);

-- Service role can insert moderation actions (for webhook)
DROP POLICY IF EXISTS "Service role can insert moderation actions" ON public.moderation_actions;
CREATE POLICY "Service role can insert moderation actions"
  ON public.moderation_actions FOR INSERT
  WITH CHECK (true);
