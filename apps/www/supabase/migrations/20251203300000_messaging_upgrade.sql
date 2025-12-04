-- Upgraded messaging system: polymorphic participants + messaging preferences
-- Supports: candidates, recruiters, and career services (schools)

--------------------------------------------------------------------------------
-- PART 1: Messaging Preferences Table
--------------------------------------------------------------------------------

CREATE TABLE messaging_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  allow_messages_from_recruiters boolean DEFAULT true NOT NULL,
  allow_messages_from_candidates boolean DEFAULT true NOT NULL,
  allow_messages_from_schools boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_messaging_preferences_user ON messaging_preferences(user_id);

-- RLS for messaging_preferences
ALTER TABLE messaging_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own messaging preferences"
  ON messaging_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can create own messaging preferences"
  ON messaging_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own messaging preferences"
  ON messaging_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_messaging_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messaging_preferences_updated_at
  BEFORE UPDATE ON messaging_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_messaging_preferences_updated_at();

-- Function to create default preferences on user creation
CREATE OR REPLACE FUNCTION create_default_messaging_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO messaging_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when a profile is created
CREATE TRIGGER on_profile_created_messaging_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_messaging_preferences();

-- Backfill messaging preferences for existing users
INSERT INTO messaging_preferences (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;

--------------------------------------------------------------------------------
-- PART 2: Conversation Participants Table (polymorphic model)
--------------------------------------------------------------------------------

-- Create participant type enum
CREATE TYPE conversation_participant_type AS ENUM ('candidate', 'recruiter', 'school');

-- Create conversation participants table
CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_type conversation_participant_type NOT NULL,
  -- profile_id references the appropriate profile table based on participant_type
  -- We store this for convenience/denormalization
  profile_id uuid NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conv_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX idx_conv_participants_type ON conversation_participants(participant_type);

-- RLS for conversation_participants
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Users can view participants of conversations they're in
CREATE POLICY "Users can view participants of their conversations"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

--------------------------------------------------------------------------------
-- PART 3: Migrate Existing Conversations
--------------------------------------------------------------------------------

-- Populate conversation_participants from existing conversations
-- Add recruiter participants
INSERT INTO conversation_participants (conversation_id, user_id, participant_type, profile_id)
SELECT
  c.id,
  rp.user_id,
  'recruiter'::conversation_participant_type,
  c.recruiter_id
FROM conversations c
JOIN recruiter_profiles rp ON rp.id = c.recruiter_id
WHERE rp.user_id IS NOT NULL;

-- Add candidate participants
INSERT INTO conversation_participants (conversation_id, user_id, participant_type, profile_id)
SELECT
  c.id,
  cp.user_id,
  'candidate'::conversation_participant_type,
  c.candidate_id
FROM conversations c
JOIN candidate_profiles cp ON cp.id = c.candidate_id
WHERE cp.user_id IS NOT NULL;

--------------------------------------------------------------------------------
-- PART 4: Update RLS Policies to Use Participants Table
--------------------------------------------------------------------------------

-- Drop old conversation policies
DROP POLICY IF EXISTS "Recruiters can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Candidates can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Recruiters can create conversations" ON conversations;

-- New policy: Users can view conversations they're a participant of
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
  );

-- New policy: Verified users can create conversations
-- (actual permission checking done in server action)
CREATE POLICY "Verified users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);  -- Server action handles all validation

-- Policy for inserting participants (used by server action)
CREATE POLICY "System can insert participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (true);  -- Server action handles validation

-- Update message policies to use participants table
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    read_at IS NOT NULL
  );

--------------------------------------------------------------------------------
-- PART 5: Helper Functions
--------------------------------------------------------------------------------

-- Function to check if a user can message another user
CREATE OR REPLACE FUNCTION can_user_message(
  sender_user_id uuid,
  recipient_user_id uuid
) RETURNS boolean AS $$
DECLARE
  sender_role text;
  recipient_prefs messaging_preferences%ROWTYPE;
BEGIN
  -- Get sender's role
  SELECT role INTO sender_role
  FROM profiles
  WHERE id = sender_user_id;

  IF sender_role IS NULL THEN
    RETURN false;
  END IF;

  -- Get recipient's messaging preferences
  SELECT * INTO recipient_prefs
  FROM messaging_preferences
  WHERE user_id = recipient_user_id;

  -- If no preferences exist, default to allowing all messages
  IF recipient_prefs IS NULL THEN
    RETURN true;
  END IF;

  -- Check based on sender's role
  CASE sender_role
    WHEN 'recruiter' THEN
      RETURN recipient_prefs.allow_messages_from_recruiters;
    WHEN 'candidate' THEN
      RETURN recipient_prefs.allow_messages_from_candidates;
    WHEN 'school' THEN
      RETURN recipient_prefs.allow_messages_from_schools;
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is verified for messaging
CREATE OR REPLACE FUNCTION is_user_verified_for_messaging(
  check_user_id uuid
) RETURNS boolean AS $$
DECLARE
  user_role text;
  is_verified boolean;
BEGIN
  -- Get user's role
  SELECT role INTO user_role
  FROM profiles
  WHERE id = check_user_id;

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  CASE user_role
    WHEN 'candidate' THEN
      SELECT status = 'verified' INTO is_verified
      FROM candidate_profiles
      WHERE user_id = check_user_id;
    WHEN 'recruiter' THEN
      SELECT is_approved INTO is_verified
      FROM recruiter_profiles
      WHERE user_id = check_user_id;
    WHEN 'school' THEN
      SELECT is_approved INTO is_verified
      FROM school_profiles
      WHERE user_id = check_user_id;
    ELSE
      RETURN false;
  END CASE;

  RETURN COALESCE(is_verified, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find existing conversation between two users
CREATE OR REPLACE FUNCTION find_conversation_between_users(
  user_a uuid,
  user_b uuid
) RETURNS uuid AS $$
DECLARE
  conv_id uuid;
BEGIN
  SELECT cp1.conversation_id INTO conv_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = user_a
  AND cp2.user_id = user_b
  LIMIT 1;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- PART 6: Keep Legacy Columns for Now (optional cleanup later)
--------------------------------------------------------------------------------

-- Note: We keep recruiter_id and candidate_id columns for backward compatibility
-- They can be removed in a future migration after all code is updated
-- The conversation_participants table is now the source of truth

-- Add a comment to indicate deprecation
COMMENT ON COLUMN conversations.recruiter_id IS 'DEPRECATED: Use conversation_participants table instead';
COMMENT ON COLUMN conversations.candidate_id IS 'DEPRECATED: Use conversation_participants table instead';

-- Make legacy columns nullable for new conversations
ALTER TABLE conversations ALTER COLUMN recruiter_id DROP NOT NULL;
ALTER TABLE conversations ALTER COLUMN candidate_id DROP NOT NULL;
