'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type UserRole = 'candidate' | 'recruiter' | 'school_admin'
type ParticipantType = 'candidate' | 'recruiter' | 'school'

// Map user role to conversation participant type
function roleToParticipantType(role: UserRole): ParticipantType {
  if (role === 'school_admin') return 'school'
  return role as ParticipantType
}

interface UserProfile {
  userId: string
  role: UserRole
  profileId: string
  isVerified: boolean
}

// Get current user's profile info including role and verification status
async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role) return null

  const role = profile.role as UserRole
  let profileId: string | null = null
  let isVerified = false

  switch (role) {
    case 'candidate': {
      const { data } = await supabase
        .from('candidate_profiles')
        .select('id, status')
        .eq('user_id', user.id)
        .single()
      profileId = data?.id || null
      isVerified = data?.status === 'verified'
      break
    }
    case 'recruiter': {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('id, is_approved')
        .eq('user_id', user.id)
        .single()
      profileId = data?.id || null
      isVerified = data?.is_approved === true
      break
    }
    case 'school_admin': {
      const { data } = await supabase
        .from('school_profiles')
        .select('id, is_approved')
        .eq('user_id', user.id)
        .single()
      profileId = data?.id || null
      isVerified = data?.is_approved === true
      break
    }
  }

  if (!profileId) return null

  return {
    userId: user.id,
    role,
    profileId,
    isVerified
  }
}

// Get target user's info
async function getTargetUserProfile(targetUserId: string): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', targetUserId)
    .single()

  if (!profile?.role) return null

  const role = profile.role as UserRole
  let profileId: string | null = null
  let isVerified = false

  switch (role) {
    case 'candidate': {
      const { data } = await supabase
        .from('candidate_profiles')
        .select('id, status')
        .eq('user_id', targetUserId)
        .single()
      profileId = data?.id || null
      isVerified = data?.status === 'verified'
      break
    }
    case 'recruiter': {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('id, is_approved')
        .eq('user_id', targetUserId)
        .single()
      profileId = data?.id || null
      isVerified = data?.is_approved === true
      break
    }
    case 'school_admin': {
      const { data } = await supabase
        .from('school_profiles')
        .select('id, is_approved')
        .eq('user_id', targetUserId)
        .single()
      profileId = data?.id || null
      isVerified = data?.is_approved === true
      break
    }
  }

  if (!profileId) return null

  return {
    userId: targetUserId,
    role,
    profileId,
    isVerified
  }
}

// Check if current user can message the target user based on preferences
export async function canMessageUser(targetUserId: string): Promise<{
  allowed: boolean
  reason?: string
}> {
  const supabase = await createClient()

  const currentUser = await getCurrentUserProfile()
  if (!currentUser) {
    return { allowed: false, reason: 'You must be logged in' }
  }

  if (!currentUser.isVerified) {
    return { allowed: false, reason: 'Your account must be verified to send messages' }
  }

  const targetUser = await getTargetUserProfile(targetUserId)
  if (!targetUser) {
    return { allowed: false, reason: 'User not found' }
  }

  if (!targetUser.isVerified) {
    return { allowed: false, reason: 'This user is not yet verified' }
  }

  // Get target user's messaging preferences
  const { data: prefs } = await supabase
    .from('messaging_preferences')
    .select('*')
    .eq('user_id', targetUserId)
    .single()

  // Default to allowing if no preferences set
  if (!prefs) {
    return { allowed: true }
  }

  // Check based on current user's role
  switch (currentUser.role) {
    case 'recruiter':
      if (!prefs.allow_messages_from_recruiters) {
        return { allowed: false, reason: 'This user has disabled messages from recruiters' }
      }
      break
    case 'candidate':
      if (!prefs.allow_messages_from_candidates) {
        return { allowed: false, reason: 'This user has disabled messages from candidates' }
      }
      break
    case 'school_admin':
      if (!prefs.allow_messages_from_schools) {
        return { allowed: false, reason: 'This user has disabled messages from career services' }
      }
      break
  }

  return { allowed: true }
}

// Start a new conversation with any verified user
export async function startConversation(targetUserId: string) {
  const supabase = await createClient()

  const currentUser = await getCurrentUserProfile()
  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  if (!currentUser.isVerified) {
    throw new Error('Your account must be verified to start conversations')
  }

  // Check if messaging is allowed
  const canMessage = await canMessageUser(targetUserId)
  if (!canMessage.allowed) {
    throw new Error(canMessage.reason || 'Cannot message this user')
  }

  const targetUser = await getTargetUserProfile(targetUserId)
  if (!targetUser) {
    throw new Error('User not found')
  }

  // Check if conversation already exists between these users
  const { data: existingParticipation } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUser.userId)

  if (existingParticipation && existingParticipation.length > 0) {
    const conversationIds = existingParticipation.map(p => p.conversation_id)

    const { data: targetParticipation } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', targetUserId)
      .in('conversation_id', conversationIds)
      .limit(1)
      .single()

    if (targetParticipation) {
      return { conversationId: targetParticipation.conversation_id }
    }
  }

  // Create new conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({})
    .select('id')
    .single()

  if (convError) throw new Error(convError.message)

  // Add both participants
  const { error: participantError } = await supabase
    .from('conversation_participants')
    .insert([
      {
        conversation_id: conversation.id,
        user_id: currentUser.userId,
        participant_type: roleToParticipantType(currentUser.role),
        profile_id: currentUser.profileId
      },
      {
        conversation_id: conversation.id,
        user_id: targetUser.userId,
        participant_type: roleToParticipantType(targetUser.role),
        profile_id: targetUser.profileId
      }
    ])

  if (participantError) throw new Error(participantError.message)

  revalidatePath('/messages')
  return { conversationId: conversation.id }
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify user is a participant in this conversation
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!participation) {
    throw new Error('You are not a participant in this conversation')
  }

  // Send message
  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim()
    })

  if (error) throw new Error(error.message)

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath('/messages')
}

export async function markMessagesAsRead(conversationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Mark all unread messages from the other party as read
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  revalidatePath('/messages')
}

export async function getUnreadCount() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  // Get all conversation IDs where user is a participant
  const { data: participations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (!participations || participations.length === 0) return 0

  const conversationIds = participations.map(p => p.conversation_id)

  // Count unread messages
  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .neq('sender_id', user.id)
    .is('read_at', null)

  return count || 0
}

// ============================================================================
// Messaging Preferences
// ============================================================================

export interface MessagingPreferences {
  allow_messages_from_recruiters: boolean
  allow_messages_from_candidates: boolean
  allow_messages_from_schools: boolean
}

export async function getMessagingPreferences(): Promise<MessagingPreferences | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('messaging_preferences')
    .select('allow_messages_from_recruiters, allow_messages_from_candidates, allow_messages_from_schools')
    .eq('user_id', user.id)
    .single()

  if (!data) {
    // Return defaults if no preferences exist
    return {
      allow_messages_from_recruiters: true,
      allow_messages_from_candidates: true,
      allow_messages_from_schools: true
    }
  }

  return data
}

export async function updateMessagingPreferences(
  preferences: Partial<MessagingPreferences>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('messaging_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/candidate/settings')
  revalidatePath('/recruiter/settings')
  revalidatePath('/school/settings')

  return { success: true }
}

// ============================================================================
// Conversation Queries (for UI)
// ============================================================================

export interface ConversationListItem {
  id: string
  lastMessageAt: string | null
  otherParticipant: {
    userId: string
    name: string
    subtitle: string
    role: UserRole
  }
  unreadCount: number
  lastMessage?: {
    content: string
    isFromMe: boolean
    createdAt: string
  }
}

export async function getConversations(): Promise<ConversationListItem[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get all conversations where user is a participant
  const { data: myParticipations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (!myParticipations || myParticipations.length === 0) return []

  const conversationIds = myParticipations.map(p => p.conversation_id)

  // Get conversation details
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, last_message_at')
    .in('id', conversationIds)
    .order('last_message_at', { ascending: false })

  if (!conversations) return []

  // Get other participants for each conversation
  const { data: allParticipants } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id, participant_type, profile_id')
    .in('conversation_id', conversationIds)
    .neq('user_id', user.id)

  // Get profile names
  const otherUserIds = allParticipants?.map(p => p.user_id) || []
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', otherUserIds)

  // Get role-specific subtitles
  const candidateIds = allParticipants?.filter(p => p.participant_type === 'candidate').map(p => p.profile_id) || []
  const recruiterIds = allParticipants?.filter(p => p.participant_type === 'recruiter').map(p => p.profile_id) || []
  const schoolIds = allParticipants?.filter(p => p.participant_type === 'school').map(p => p.profile_id) || []

  const [candidateProfiles, recruiterProfiles, schoolProfiles] = await Promise.all([
    candidateIds.length > 0
      ? supabase.from('candidate_profiles').select('id, school_name').in('id', candidateIds)
      : { data: [] },
    recruiterIds.length > 0
      ? supabase.from('recruiter_profiles').select('id, firm_name').in('id', recruiterIds)
      : { data: [] },
    schoolIds.length > 0
      ? supabase.from('school_profiles').select('id, school_name, department_name').in('id', schoolIds)
      : { data: [] }
  ])

  // Get last messages
  const { data: lastMessages } = await supabase
    .from('messages')
    .select('conversation_id, content, created_at, sender_id')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false })

  const lastMessageByConv: Record<string, { content: string; createdAt: string; senderId: string }> = {}
  lastMessages?.forEach(msg => {
    if (!lastMessageByConv[msg.conversation_id]) {
      lastMessageByConv[msg.conversation_id] = {
        content: msg.content,
        createdAt: msg.created_at || new Date().toISOString(),
        senderId: msg.sender_id
      }
    }
  })

  // Get unread counts
  const { data: unreadMessages } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversationIds)
    .neq('sender_id', user.id)
    .is('read_at', null)

  const unreadCounts: Record<string, number> = {}
  unreadMessages?.forEach(msg => {
    unreadCounts[msg.conversation_id] = (unreadCounts[msg.conversation_id] || 0) + 1
  })

  // Build result
  return conversations.map(conv => {
    const otherParticipant = allParticipants?.find(p => p.conversation_id === conv.id)
    const profile = profiles?.find(p => p.id === otherParticipant?.user_id)

    let subtitle = ''
    if (otherParticipant?.participant_type === 'candidate') {
      const cp = candidateProfiles.data?.find(c => c.id === otherParticipant.profile_id)
      subtitle = cp?.school_name || ''
    } else if (otherParticipant?.participant_type === 'recruiter') {
      const rp = recruiterProfiles.data?.find(r => r.id === otherParticipant.profile_id)
      subtitle = rp?.firm_name || ''
    } else if (otherParticipant?.participant_type === 'school') {
      const sp = schoolProfiles.data?.find(s => s.id === otherParticipant.profile_id)
      subtitle = sp?.department_name ? `${sp.school_name} - ${sp.department_name}` : sp?.school_name || ''
    }

    const lastMsg = lastMessageByConv[conv.id]

    // Map participant type back to role for display
    const participantTypeToRole = (type: string): UserRole => {
      if (type === 'school') return 'school_admin'
      return type as UserRole
    }

    return {
      id: conv.id,
      lastMessageAt: conv.last_message_at,
      otherParticipant: {
        userId: otherParticipant?.user_id || '',
        name: profile?.full_name || 'Unknown',
        subtitle,
        role: participantTypeToRole(otherParticipant?.participant_type || 'candidate')
      },
      unreadCount: unreadCounts[conv.id] || 0,
      lastMessage: lastMsg ? {
        content: lastMsg.content,
        isFromMe: lastMsg.senderId === user.id,
        createdAt: lastMsg.createdAt
      } : undefined
    }
  })
}
