-- Recruiter Campaigns for bulk outreach
-- Allows recruiters to send templated messages to multiple candidates

-- Campaigns table
CREATE TABLE recruiter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id uuid REFERENCES recruiter_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  message_template text NOT NULL,
  filters jsonb DEFAULT '{}', -- saved search criteria used to select recipients
  saved_search_id uuid REFERENCES saved_searches(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaign recipients table
CREATE TABLE campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES recruiter_campaigns(id) ON DELETE CASCADE NOT NULL,
  candidate_profile_id uuid REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'opened', 'replied')),
  message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  sent_at timestamptz,
  opened_at timestamptz,
  replied_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, candidate_profile_id)
);

-- Indexes for performance
CREATE INDEX idx_campaigns_recruiter ON recruiter_campaigns(recruiter_profile_id);
CREATE INDEX idx_campaigns_status ON recruiter_campaigns(status);
CREATE INDEX idx_campaigns_created ON recruiter_campaigns(created_at DESC);
CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_candidate ON campaign_recipients(candidate_profile_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);

-- RLS Policies
ALTER TABLE recruiter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Recruiters can only see their own campaigns
CREATE POLICY "Recruiters can view own campaigns"
  ON recruiter_campaigns
  FOR SELECT
  USING (
    recruiter_profile_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can create campaigns
CREATE POLICY "Recruiters can create campaigns"
  ON recruiter_campaigns
  FOR INSERT
  WITH CHECK (
    recruiter_profile_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid() AND is_approved = true
    )
  );

-- Recruiters can update their own campaigns
CREATE POLICY "Recruiters can update own campaigns"
  ON recruiter_campaigns
  FOR UPDATE
  USING (
    recruiter_profile_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Recruiters can delete their own campaigns (only drafts)
CREATE POLICY "Recruiters can delete own draft campaigns"
  ON recruiter_campaigns
  FOR DELETE
  USING (
    status = 'draft'
    AND recruiter_profile_id IN (
      SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
    )
  );

-- Campaign recipients policies
CREATE POLICY "Recruiters can view recipients for own campaigns"
  ON campaign_recipients
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM recruiter_campaigns
      WHERE recruiter_profile_id IN (
        SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Recruiters can insert recipients for own campaigns"
  ON campaign_recipients
  FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM recruiter_campaigns
      WHERE recruiter_profile_id IN (
        SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Recruiters can update recipients for own campaigns"
  ON campaign_recipients
  FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM recruiter_campaigns
      WHERE recruiter_profile_id IN (
        SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Recruiters can delete recipients for own draft campaigns"
  ON campaign_recipients
  FOR DELETE
  USING (
    campaign_id IN (
      SELECT id FROM recruiter_campaigns
      WHERE status = 'draft'
      AND recruiter_profile_id IN (
        SELECT id FROM recruiter_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update campaign updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaign_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_campaign_update
  BEFORE UPDATE ON recruiter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_timestamp();

-- Function to mark recipient as replied when they send a message in the conversation
CREATE OR REPLACE FUNCTION mark_campaign_recipient_replied()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this message is from a candidate in a campaign conversation
  UPDATE campaign_recipients
  SET
    replied_at = NEW.created_at,
    status = 'replied'
  WHERE
    conversation_id = NEW.conversation_id
    AND status != 'replied'
    AND EXISTS (
      SELECT 1 FROM candidate_profiles cp
      WHERE cp.id = campaign_recipients.candidate_profile_id
      AND cp.user_id = NEW.sender_id
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_check_campaign_reply
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION mark_campaign_recipient_replied();

-- View for campaign statistics
CREATE OR REPLACE VIEW campaign_stats AS
SELECT
  c.id as campaign_id,
  c.name,
  c.status,
  c.sent_at,
  COUNT(cr.id) as total_recipients,
  COUNT(cr.id) FILTER (WHERE cr.status = 'sent' OR cr.status = 'opened' OR cr.status = 'replied') as sent_count,
  COUNT(cr.id) FILTER (WHERE cr.status = 'opened' OR cr.status = 'replied') as opened_count,
  COUNT(cr.id) FILTER (WHERE cr.status = 'replied') as replied_count,
  COUNT(cr.id) FILTER (WHERE cr.status = 'failed') as failed_count
FROM recruiter_campaigns c
LEFT JOIN campaign_recipients cr ON cr.campaign_id = c.id
GROUP BY c.id, c.name, c.status, c.sent_at;
