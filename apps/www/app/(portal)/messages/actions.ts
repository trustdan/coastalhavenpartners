'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startConversation(candidateId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get recruiter profile
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.is_approved) {
    throw new Error('Only approved recruiters can start conversations')
  }

  // Check if conversation already exists
  const { data: existingConversation, error: existingError } = await supabase
    .from('conversations')
    .select('id')
    .eq('recruiter_id', recruiterProfile.id)
    .eq('candidate_id', candidateId)
    .maybeSingle()

  if (existingConversation) {
    return { conversationId: existingConversation.id }
  }

  // Verify candidate exists and is verified
  const { data: candidateExists } = await supabase
    .from('candidate_profiles')
    .select('id, status')
    .eq('id', candidateId)
    .single()

  if (!candidateExists) {
    throw new Error('Candidate not found')
  }

  // Create new conversation
  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      recruiter_id: recruiterProfile.id,
      candidate_id: candidateId
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/messages')
  return { conversationId: conversation.id }
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify user is part of this conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      id,
      recruiter:recruiter_profiles!recruiter_id(user_id),
      candidate:candidate_profiles!candidate_id(user_id)
    `)
    .eq('id', conversationId)
    .single()

  if (!conversation) throw new Error('Conversation not found')

  const isRecruiter = conversation.recruiter?.user_id === user.id
  const isCandidate = conversation.candidate?.user_id === user.id

  if (!isRecruiter && !isCandidate) {
    throw new Error('Unauthorized')
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

  // Get user's role and profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return 0

  let conversationIds: string[] = []

  if (profile.role === 'recruiter') {
    const { data: recruiterProfile } = await supabase
      .from('recruiter_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (recruiterProfile) {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('recruiter_id', recruiterProfile.id)

      conversationIds = conversations?.map(c => c.id) || []
    }
  } else if (profile.role === 'candidate') {
    const { data: candidateProfile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (candidateProfile) {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('candidate_id', candidateProfile.id)

      conversationIds = conversations?.map(c => c.id) || []
    }
  }

  if (conversationIds.length === 0) return 0

  // Count unread messages
  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .neq('sender_id', user.id)
    .is('read_at', null)

  return count || 0
}
