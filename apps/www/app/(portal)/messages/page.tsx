import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import Link from 'next/link'
import { MessageSquare, User, Building2, GraduationCap, Briefcase } from 'lucide-react'
import { startConversation, getConversations } from './actions'

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

function getRoleIcon(role: string) {
  switch (role) {
    case 'recruiter':
      return <Briefcase className="h-5 w-5" />
    case 'candidate':
      return <GraduationCap className="h-5 w-5" />
    case 'school':
    case 'school_admin':
      return <Building2 className="h-5 w-5" />
    default:
      return <User className="h-5 w-5" />
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'recruiter':
      return 'Recruiter'
    case 'candidate':
      return 'Candidate'
    case 'school':
    case 'school_admin':
      return 'Career Services'
    default:
      return ''
  }
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>
}) {
  const { start: userIdToMessage } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Handle starting a new conversation
  if (userIdToMessage) {
    try {
      const { conversationId } = await startConversation(userIdToMessage)
      redirect(`/messages/${conversationId}`)
    } catch (error) {
      // Re-throw redirect errors (they're not real errors)
      if (isRedirectError(error)) {
        throw error
      }
      // For other errors, just show the inbox
      console.error('Failed to start conversation:', error)
    }
  }

  // Get user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/login')
  }

  // Get conversations using the new polymorphic query
  const conversations = await getConversations()

  // Build description based on role
  const getDescription = () => {
    switch (profile.role) {
      case 'recruiter':
        return 'Your conversations with candidates and career services'
      case 'candidate':
        return 'Your conversations with recruiters and career services'
      case 'school_admin':
        return 'Your conversations with students and recruiters'
      default:
        return 'Your conversations'
    }
  }

  const getEmptyStateMessage = () => {
    switch (profile.role) {
      case 'recruiter':
        return 'Start a conversation by messaging a candidate from their profile, or connect with career services partners.'
      case 'candidate':
        return 'Recruiters and your career services office can message you here.'
      case 'school_admin':
        return 'Message your students or connect with recruiting partners from their profiles.'
      default:
        return 'No conversations yet.'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {getDescription()}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
          <MessageSquare className="mx-auto h-12 w-12 text-neutral-400" />
          <h2 className="mt-4 text-lg font-semibold">No conversations yet</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {getEmptyStateMessage()}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          <div className="divide-y">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={`flex items-center gap-4 p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                  conv.unreadCount > 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {getRoleIcon(conv.otherParticipant.role)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium truncate ${conv.unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {conv.otherParticipant.name}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        {getRoleLabel(conv.otherParticipant.role)}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
                      {conv.lastMessageAt && formatRelativeTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 truncate">
                    {conv.otherParticipant.subtitle}
                  </p>
                  {conv.lastMessage && (
                    <p className={`mt-1 text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}`}>
                      {conv.lastMessage.isFromMe && <span className="text-neutral-400">You: </span>}
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                    {conv.unreadCount}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
