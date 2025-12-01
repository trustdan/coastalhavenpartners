-- Messaging system for recruiter-candidate communication

-- Conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, candidate_id)
);

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_conversations_recruiter ON conversations(recruiter_id);
CREATE INDEX idx_conversations_candidate ON conversations(candidate_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations: Recruiters can see their own conversations
CREATE POLICY "Recruiters can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.id = conversations.recruiter_id
      AND rp.user_id = auth.uid()
    )
  );

-- Conversations: Candidates can see their own conversations
CREATE POLICY "Candidates can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM candidate_profiles cp
      WHERE cp.id = conversations.candidate_id
      AND cp.user_id = auth.uid()
    )
  );

-- Conversations: Recruiters can create conversations (start a chat)
CREATE POLICY "Recruiters can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.id = recruiter_id
      AND rp.user_id = auth.uid()
      AND rp.is_approved = true
    )
  );

-- Messages: Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      LEFT JOIN recruiter_profiles rp ON rp.id = c.recruiter_id
      LEFT JOIN candidate_profiles cp ON cp.id = c.candidate_id
      WHERE c.id = messages.conversation_id
      AND (rp.user_id = auth.uid() OR cp.user_id = auth.uid())
    )
  );

-- Messages: Users can send messages in their conversations
CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      LEFT JOIN recruiter_profiles rp ON rp.id = c.recruiter_id
      LEFT JOIN candidate_profiles cp ON cp.id = c.candidate_id
      WHERE c.id = conversation_id
      AND (rp.user_id = auth.uid() OR cp.user_id = auth.uid())
    )
  );

-- Messages: Users can mark their received messages as read
CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      LEFT JOIN recruiter_profiles rp ON rp.id = c.recruiter_id
      LEFT JOIN candidate_profiles cp ON cp.id = c.candidate_id
      WHERE c.id = messages.conversation_id
      AND (rp.user_id = auth.uid() OR cp.user_id = auth.uid())
    )
  )
  WITH CHECK (
    read_at IS NOT NULL
  );

-- Function to update last_message_at on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();
