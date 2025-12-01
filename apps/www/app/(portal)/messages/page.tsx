import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, User } from 'lucide-react'
import { startConversation } from './actions'

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>
}) {
  const { start: candidateIdToMessage } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Handle starting a new conversation
  if (candidateIdToMessage) {
    try {
      const { conversationId } = await startConversation(candidateIdToMessage)
      redirect(`/messages/${conversationId}`)
    } catch (error) {
      // If conversation start fails, just show inbox
      console.error('Failed to start conversation:', error)
    }
  }

  // Get user's role and profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get conversations based on role
  let conversations: any[] = []

  if (profile.role === 'recruiter') {
    const { data: recruiterProfile } = await supabase
      .from('recruiter_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (recruiterProfile) {
      const { data } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message_at,
          candidate:candidate_profiles!candidate_id(
            id,
            school_name,
            user_id
          )
        `)
        .eq('recruiter_id', recruiterProfile.id)
        .order('last_message_at', { ascending: false })

      // Get candidate names
      if (data) {
        const candidateUserIds = data.map(c => c.candidate?.user_id).filter((id): id is string => !!id)
        const { data: candidateProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', candidateUserIds)

        conversations = data.map(conv => ({
          ...conv,
          otherParty: {
            name: candidateProfiles?.find(p => p.id === conv.candidate?.user_id)?.full_name || 'Unknown',
            subtitle: conv.candidate?.school_name || ''
          }
        }))
      }
    }
  } else if (profile.role === 'candidate') {
    const { data: candidateProfile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (candidateProfile) {
      const { data } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message_at,
          recruiter:recruiter_profiles!recruiter_id(
            id,
            firm_name,
            user_id
          )
        `)
        .eq('candidate_id', candidateProfile.id)
        .order('last_message_at', { ascending: false })

      // Get recruiter names
      if (data) {
        const recruiterUserIds = data.map(c => c.recruiter?.user_id).filter((id): id is string => !!id)
        const { data: recruiterProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', recruiterUserIds)

        conversations = data.map(conv => ({
          ...conv,
          otherParty: {
            name: recruiterProfiles?.find(p => p.id === conv.recruiter?.user_id)?.full_name || 'Unknown',
            subtitle: conv.recruiter?.firm_name || ''
          }
        }))
      }
    }
  }

  // Get unread counts for each conversation
  const conversationIds = conversations.map(c => c.id)
  let unreadCounts: Record<string, number> = {}

  if (conversationIds.length > 0) {
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .neq('sender_id', user.id)
      .is('read_at', null)

    if (unreadMessages) {
      unreadCounts = unreadMessages.reduce((acc, msg) => {
        acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  // Get last message for each conversation
  const { data: lastMessages } = await supabase
    .from('messages')
    .select('conversation_id, content, created_at, sender_id')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false })

  const lastMessageByConv: Record<string, any> = {}
  lastMessages?.forEach(msg => {
    if (!lastMessageByConv[msg.conversation_id]) {
      lastMessageByConv[msg.conversation_id] = msg
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Your conversations with {profile.role === 'recruiter' ? 'candidates' : 'recruiters'}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
          <MessageSquare className="mx-auto h-12 w-12 text-neutral-400" />
          <h2 className="mt-4 text-lg font-semibold">No conversations yet</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {profile.role === 'recruiter'
              ? 'Start a conversation by messaging a candidate from their profile.'
              : 'Recruiters can message you once they view your profile.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          <div className="divide-y">
            {conversations.map((conv) => {
              const unread = unreadCounts[conv.id] || 0
              const lastMsg = lastMessageByConv[conv.id]
              const isFromMe = lastMsg?.sender_id === user.id

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                    unread > 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <User className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium truncate ${unread > 0 ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {conv.otherParty.name}
                      </p>
                      <span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
                        {conv.last_message_at && formatRelativeTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 truncate">
                      {conv.otherParty.subtitle}
                    </p>
                    {lastMsg && (
                      <p className={`mt-1 text-sm truncate ${unread > 0 ? 'font-medium text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {isFromMe && <span className="text-neutral-400">You: </span>}
                        {lastMsg.content}
                      </p>
                    )}
                  </div>
                  {unread > 0 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                      {unread}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
