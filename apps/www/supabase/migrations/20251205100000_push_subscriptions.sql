-- Push Notification Subscriptions
-- Stores web push subscriptions for sending notifications to users

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,

  -- Push subscription data from browser
  endpoint text NOT NULL,
  p256dh_key text NOT NULL,  -- Public key for encryption
  auth_key text NOT NULL,     -- Auth secret for encryption

  -- Metadata
  user_agent text,            -- Browser/device info
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now(),

  -- Ensure unique subscription per endpoint (user can have multiple devices)
  UNIQUE(endpoint)
);

-- Index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Index for finding subscriptions by endpoint (for updates)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Notification preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- Notification types (candidates)
  notify_profile_views boolean DEFAULT true,
  notify_messages boolean DEFAULT true,
  notify_job_matches boolean DEFAULT true,
  notify_deadline_reminders boolean DEFAULT true,

  -- Notification types (recruiters)
  notify_new_candidates boolean DEFAULT true,
  notify_candidate_interest boolean DEFAULT true,
  notify_saved_search_matches boolean DEFAULT true,

  -- Notification types (schools)
  notify_verification_requests boolean DEFAULT true,
  notify_student_placements boolean DEFAULT true,

  -- Delivery preferences
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,  -- For when email is set up

  -- Quiet hours (optional)
  quiet_hours_start time,  -- e.g., '22:00'
  quiet_hours_end time,    -- e.g., '08:00'
  timezone text DEFAULT 'America/New_York',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notification log for tracking sent notifications
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES push_subscriptions(id) ON DELETE SET NULL,

  -- Notification content
  title text NOT NULL,
  body text NOT NULL,
  url text,
  notification_type text NOT NULL, -- 'profile_view', 'message', 'job_match', etc.

  -- Status tracking
  status text DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'clicked'
  error_message text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  clicked_at timestamptz
);

-- Index for notification history queries
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_created_at ON notification_log(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(notification_type);

-- RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Users can manage their own preferences
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own notification history
CREATE POLICY "Users can view own notifications"
  ON notification_log FOR SELECT
  USING (auth.uid() = user_id);

-- Function to update last_used_at when subscription is used
CREATE OR REPLACE FUNCTION update_subscription_last_used()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE push_subscriptions
  SET last_used_at = now()
  WHERE id = NEW.subscription_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_used_at
CREATE TRIGGER trigger_update_subscription_last_used
  AFTER INSERT ON notification_log
  FOR EACH ROW
  WHEN (NEW.subscription_id IS NOT NULL)
  EXECUTE FUNCTION update_subscription_last_used();

-- Add comments for documentation
COMMENT ON TABLE push_subscriptions IS 'Web Push API subscriptions for sending browser notifications';
COMMENT ON TABLE notification_preferences IS 'User preferences for which notifications to receive';
COMMENT ON TABLE notification_log IS 'Log of all notifications sent to users';
