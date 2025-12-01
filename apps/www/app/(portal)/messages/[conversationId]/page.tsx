import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageThread } from './message-thread'
import { markMessagesAsRead } from '../actions'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get conversation with participants
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select(`
      id,
      recruiter:recruiter_profiles!recruiter_id(
        id,
        firm_name,
        user_id
      ),
      candidate:candidate_profiles!candidate_id(
        id,
        school_name,
        user_id
      )
    `)
    .eq('id', conversationId)
    .single()

  if (error || !conversation) {
    redirect('/messages')
  }

  // Verify user is part of this conversation
  const isRecruiter = conversation.recruiter?.user_id === user.id
  const isCandidate = conversation.candidate?.user_id === user.id

  if (!isRecruiter && !isCandidate) {
    redirect('/messages')
  }

  // Get other party's name
  const otherUserId = isRecruiter
    ? conversation.candidate?.user_id
    : conversation.recruiter?.user_id

  let otherPartyName = 'Unknown'
  let otherPartySubtitle = ''

  if (otherUserId) {
    const { data: otherProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', otherUserId)
      .single()

    otherPartyName = otherProfile?.full_name || 'Unknown'
    otherPartySubtitle = isRecruiter
      ? conversation.candidate?.school_name || ''
      : conversation.recruiter?.firm_name || ''
  }

  // Get messages
  const { data: messagesData } = await supabase
    .from('messages')
    .select('id, content, sender_id, created_at, read_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  // Transform messages to ensure created_at is never null
  const messages = (messagesData || []).map(msg => ({
    ...msg,
    created_at: msg.created_at || new Date().toISOString()
  }))

  // Mark messages as read
  await markMessagesAsRead(conversationId)

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <User className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <h1 className="font-semibold">{otherPartyName}</h1>
            {otherPartySubtitle && (
              <p className="text-sm text-neutral-500">{otherPartySubtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Thread (Client Component) */}
      <MessageThread
        conversationId={conversationId}
        messages={messages || []}
        currentUserId={user.id}
      />
    </div>
  )
}
