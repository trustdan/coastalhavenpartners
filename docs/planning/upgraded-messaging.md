# Upgraded Messaging System Plan

## Overview

Expand the current recruiter-candidate messaging system to support all three user types (candidates, recruiters, career services) with granular privacy controls allowing each user to block incoming messages by sender type.

---

## Current State

### Database Schema
```sql
-- conversations table (current)
conversations (
  id uuid PRIMARY KEY,
  recruiter_id uuid REFERENCES recruiter_profiles(id),
  candidate_id uuid REFERENCES candidate_profiles(id),
  created_at timestamptz,
  last_message_at timestamptz
)

-- messages table (current)
messages (
  id uuid PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id),
  sender_id uuid REFERENCES auth.users(id),
  content text,
  created_at timestamptz,
  read_at timestamptz
)
```

### Current Limitations
- Only recruiter ↔ candidate conversations supported
- No career services messaging capability
- No ability to block/disable messages from specific user types
- Conversation model assumes exactly 2 fixed participant types

---

## Phase 1: Database Schema Changes

### 1.1 New Messaging Preferences Table

```sql
CREATE TABLE messaging_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  allow_messages_from_recruiters boolean DEFAULT true,
  allow_messages_from_candidates boolean DEFAULT true,
  allow_messages_from_career_services boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE messaging_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own preferences
CREATE POLICY "Users can manage own preferences"
  ON messaging_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 1.2 Redesigned Conversations Table

Replace the fixed `recruiter_id`/`candidate_id` columns with a flexible participant model:

```sql
-- Option A: Polymorphic participants (recommended)
CREATE TABLE conversations_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations_v2(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  participant_type text CHECK (participant_type IN ('candidate', 'recruiter', 'school')),
  profile_id uuid NOT NULL, -- References the appropriate profile table
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Index for fast lookups
CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conv_participants_conv ON conversation_participants(conversation_id);
```

### 1.3 Migration Strategy

```sql
-- Migrate existing conversations to new schema
INSERT INTO conversations_v2 (id, created_at, last_message_at)
SELECT id, created_at, last_message_at FROM conversations;

-- Migrate recruiter participants
INSERT INTO conversation_participants (conversation_id, user_id, participant_type, profile_id)
SELECT
  c.id,
  rp.user_id,
  'recruiter',
  c.recruiter_id
FROM conversations c
JOIN recruiter_profiles rp ON rp.id = c.recruiter_id;

-- Migrate candidate participants
INSERT INTO conversation_participants (conversation_id, user_id, participant_type, profile_id)
SELECT
  c.id,
  cp.user_id,
  'candidate',
  c.candidate_id
FROM conversations c
JOIN candidate_profiles cp ON cp.id = c.candidate_id;

-- Update messages foreign key
ALTER TABLE messages
  DROP CONSTRAINT messages_conversation_id_fkey,
  ADD CONSTRAINT messages_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES conversations_v2(id);

-- Drop old table after verification
DROP TABLE conversations;
ALTER TABLE conversations_v2 RENAME TO conversations;
```

---

## Phase 2: Messaging Preferences UI

### 2.1 Settings Page Updates

Add messaging preferences section to each portal's settings page:

**Files to modify:**
- `apps/www/app/(portal)/candidate/settings/page.tsx`
- `apps/www/app/(portal)/recruiter/settings/page.tsx`
- `apps/www/app/(portal)/school/settings/page.tsx`

**UI Component:**
```tsx
// components/settings/messaging-preferences.tsx

interface MessagingPreferencesProps {
  userRole: 'candidate' | 'recruiter' | 'school'
  preferences: {
    allow_messages_from_recruiters: boolean
    allow_messages_from_candidates: boolean
    allow_messages_from_career_services: boolean
  }
}

// Show toggles relevant to each role:
// - Candidates see: recruiters, career services
// - Recruiters see: candidates, career services
// - Career services see: candidates, recruiters
```

### 2.2 Preference Options by Role

| User Role | Can Block Messages From |
|-----------|------------------------|
| Candidate | Recruiters, Career Services (their school) |
| Recruiter | Candidates, Career Services |
| Career Services | Candidates, Recruiters |

---

## Phase 3: Backend Actions

### 3.1 New/Updated Server Actions

**File:** `apps/www/app/(portal)/messages/actions.ts`

```typescript
// Updated startConversation - now polymorphic
export async function startConversation(
  targetUserId: string,
  targetType: 'candidate' | 'recruiter' | 'school'
) {
  // 1. Get current user's role and profile
  // 2. Check if target user allows messages from current user's role
  // 3. Check if conversation already exists between these users
  // 4. Create conversation + participants if allowed
}

// Check if user can message another user
export async function canMessageUser(targetUserId: string): Promise<{
  allowed: boolean
  reason?: string
}> {
  // 1. Get target user's messaging preferences
  // 2. Get current user's role
  // 3. Return whether messaging is allowed
}

// Get/update messaging preferences
export async function getMessagingPreferences() { ... }
export async function updateMessagingPreferences(
  preferences: Partial<MessagingPreferences>
) { ... }
```

### 3.2 Updated Message Sending Logic

```typescript
export async function sendMessage(conversationId: string, content: string) {
  // Existing validation...

  // NEW: Check recipient's messaging preferences
  // If they've since blocked this user type, prevent new messages
  // (existing conversations can continue, but no new messages)

  // OR: Allow existing conversations to continue regardless
  // (preference only blocks NEW conversations)
}
```

### 3.3 Verification Checks

All messaging actions must verify:
1. **Candidates**: `status = 'verified'` in `candidate_profiles`
2. **Recruiters**: `is_approved = true` in `recruiter_profiles`
3. **Career Services**: `is_verified = true` in `school_profiles`

```typescript
async function isUserVerified(userId: string, role: string): Promise<boolean> {
  switch (role) {
    case 'candidate':
      const { data: candidate } = await supabase
        .from('candidate_profiles')
        .select('status')
        .eq('user_id', userId)
        .single()
      return candidate?.status === 'verified'

    case 'recruiter':
      const { data: recruiter } = await supabase
        .from('recruiter_profiles')
        .select('is_approved')
        .eq('user_id', userId)
        .single()
      return recruiter?.is_approved === true

    case 'school':
      const { data: school } = await supabase
        .from('school_profiles')
        .select('is_verified')
        .eq('user_id', userId)
        .single()
      return school?.is_verified === true
  }
}
```

---

## Phase 4: UI Updates

### 4.1 Messages Layout

**File:** `apps/www/app/(portal)/messages/layout.tsx`

- Add `school` role handling for dashboard/settings paths
- Update navigation to work for all three user types

### 4.2 Messages List Page

**File:** `apps/www/app/(portal)/messages/page.tsx`

```typescript
// Update to handle all three roles
if (profile.role === 'recruiter') {
  // Get conversations where user is recruiter participant
} else if (profile.role === 'candidate') {
  // Get conversations where user is candidate participant
} else if (profile.role === 'school') {
  // Get conversations where user is school participant
}

// Update empty state messaging
const emptyStateText = {
  recruiter: 'Message candidates or career services partners.',
  candidate: 'Recruiters and your career services office can message you.',
  school: 'Message students and recruiting partners.'
}
```

### 4.3 Message Thread Page

**File:** `apps/www/app/(portal)/messages/[conversationId]/page.tsx`

- Update participant display to show role badges (Recruiter, Student, Career Services)
- Handle three-way participant lookups

### 4.4 "Message" Button Components

Add messaging capability from various profile views:

```typescript
// components/message-button.tsx
interface MessageButtonProps {
  targetUserId: string
  targetType: 'candidate' | 'recruiter' | 'school'
  targetName: string
}

export function MessageButton({ targetUserId, targetType, targetName }: MessageButtonProps) {
  const [canMessage, setCanMessage] = useState<boolean | null>(null)

  // Check if messaging is allowed
  // Show appropriate button state or "Messages disabled" indicator
}
```

**Add to:**
- Candidate profile cards (for recruiters and career services)
- Recruiter profile views (for candidates and career services)
- School/career services profile (for candidates and recruiters)

### 4.5 School Portal Messaging Access

**New file:** `apps/www/app/(portal)/school/messages/` (or shared `/messages` route)

Career services need access to:
- View their conversation list
- Message their school's students
- Message recruiters

---

## Phase 5: Row-Level Security (RLS) Policies

### 5.1 Conversations Table

```sql
-- Users can view conversations they're a participant in
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

-- Creating conversations handled by service role in server actions
```

### 5.2 Conversation Participants Table

```sql
-- Users can view participants of their conversations
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );
```

### 5.3 Messages Table

```sql
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages to own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );
```

---

## Phase 6: Edge Cases & Business Logic

### 6.1 Blocking Behavior Options

**Option A: Block new conversations only**
- Existing conversations continue to work
- New conversation initiation is blocked
- Recommended for better UX

**Option B: Block all messages**
- Existing conversations show "User has disabled messages"
- No new messages can be sent
- More restrictive

**Recommendation:** Option A - blocking only prevents new conversations

### 6.2 Career Services Scope

Should career services be able to message:
- **All candidates?** OR
- **Only students from their school?**

**Recommendation:** Only students from their school (via `school_id` match)

```typescript
// When career services tries to message a candidate
const canMessage = candidate.school_id === schoolProfile.school_id
```

### 6.3 Notification Preferences (Future)

Consider adding:
- Email notifications for new messages
- In-app notification preferences
- Digest vs. immediate notifications

---

## Implementation Order

### Sprint 1: Database & Preferences - COMPLETED
1. [x] Create `messaging_preferences` table + RLS
2. [x] Create `conversation_participants` table (kept original `conversations` table with nullable legacy columns)
3. [x] Write and test migration script
4. [x] Add preferences UI to all three settings pages

### Sprint 2: Backend Actions - COMPLETED
1. [x] Refactor `startConversation()` for polymorphic participants
2. [x] Add `canMessageUser()` check function
3. [x] Add preferences CRUD actions (`getMessagingPreferences`, `updateMessagingPreferences`)
4. [x] Update `sendMessage()` with participant-based validation
5. [x] Add verification checks for all user types

### Sprint 3: UI Updates - COMPLETED
1. [x] Update messages layout for three roles
2. [x] Update messages list page with role icons/badges
3. [x] Update message thread page with role badges
4. [ ] Add `MessageButton` component (can be added to profile views)
5. [x] Messaging works for school portal via shared `/messages` route

### Sprint 4: Testing & Polish
1. [ ] E2E tests for all messaging flows
2. [ ] Test preference blocking in all directions
3. [ ] Test verification requirements
4. [x] Add loading states and error handling (in preferences form)
5. [x] Update types in `database.types.ts`

---

## Files to Create/Modify

### New Files
- `apps/www/components/settings/messaging-preferences.tsx`
- `apps/www/components/message-button.tsx`
- `apps/www/app/(portal)/messages/actions/preferences.ts`
- `supabase/migrations/XXXXXX_messaging_upgrade.sql`

### Modified Files
- `apps/www/app/(portal)/messages/actions.ts`
- `apps/www/app/(portal)/messages/layout.tsx`
- `apps/www/app/(portal)/messages/page.tsx`
- `apps/www/app/(portal)/messages/[conversationId]/page.tsx`
- `apps/www/app/(portal)/candidate/settings/page.tsx`
- `apps/www/app/(portal)/recruiter/settings/page.tsx`
- `apps/www/app/(portal)/school/settings/page.tsx`
- `apps/www/app/(portal)/school/layout.tsx` (add messages nav)
- `apps/www/lib/types/database.types.ts`

---

## Open Questions

1. **Group messaging?** Should we support 3+ participants (e.g., recruiter + candidate + career services)?
   - Recommendation: No, keep it 1:1 for simplicity

2. **Message deletion?** Should users be able to delete messages?
   - Recommendation: Soft delete (hide from sender) for MVP

3. **Read receipts?** Show when messages are read?
   - Current: Yes (read_at timestamp exists)
   - Keep as-is

4. **Attachments?** Allow file attachments in messages?
   - Recommendation: Future enhancement, not MVP

5. **Career services scope:** School-only or platform-wide messaging for career services?
   - Recommendation: School-only for students, platform-wide for recruiters
