-- Support messages table for storing user feedback and support requests
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Message type: 'technical_support' or 'feedback'
  message_type TEXT NOT NULL CHECK (message_type IN ('technical_support', 'feedback')),

  -- Sender information (optional - can be anonymous)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_name TEXT,
  sender_email TEXT,

  -- Message content
  subject TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Anti-spam: IP address for rate limiting (hashed for privacy)
  ip_hash TEXT,

  -- Admin handling
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
  handled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  handled_at TIMESTAMPTZ,
  admin_notes TEXT
);

-- Index for quick lookups
CREATE INDEX idx_support_messages_status ON support_messages(status);
CREATE INDEX idx_support_messages_type ON support_messages(message_type);
CREATE INDEX idx_support_messages_created ON support_messages(created_at DESC);
CREATE INDEX idx_support_messages_user ON support_messages(user_id);

-- RLS policies
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (for anonymous submissions)
CREATE POLICY "Anyone can submit support messages"
  ON support_messages
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Only admins can view support messages
CREATE POLICY "Admins can view all support messages"
  ON support_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update support messages
CREATE POLICY "Admins can update support messages"
  ON support_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Comment for documentation
COMMENT ON TABLE support_messages IS 'Stores support requests and feedback from users. Anonymous submissions allowed with rate limiting.';
