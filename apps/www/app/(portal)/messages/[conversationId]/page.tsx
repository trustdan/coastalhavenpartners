import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Building2, GraduationCap, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageThread } from './message-thread'
import { markMessagesAsRead } from '../actions'

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

  // Verify user is a participant in this conversation
  const { data: myParticipation } = await supabase
    .from('conversation_participants')
    .select('id, participant_type')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!myParticipation) {
    redirect('/messages')
  }

  // Get the other participant(s)
  const { data: otherParticipants } = await supabase
    .from('conversation_participants')
    .select('user_id, participant_type, profile_id')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)

  if (!otherParticipants || otherParticipants.length === 0) {
    redirect('/messages')
  }

  // Get the other party's info (assuming 1:1 conversation)
  const otherParticipant = otherParticipants[0]

  // Get the other party's name
  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', otherParticipant.user_id)
    .maybeSingle()

  let otherPartyName = otherProfile?.full_name || 'Unknown'
  let otherPartySubtitle = ''

  // Get role-specific subtitle
  switch (otherParticipant.participant_type) {
    case 'candidate': {
      const { data } = await supabase
        .from('candidate_profiles')
        .select('school_name')
        .eq('id', otherParticipant.profile_id)
        .maybeSingle()
      otherPartySubtitle = data?.school_name || ''
      break
    }
    case 'recruiter': {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('firm_name')
        .eq('id', otherParticipant.profile_id)
        .maybeSingle()
      otherPartySubtitle = data?.firm_name || ''
      break
    }
    case 'school': {
      const { data } = await supabase
        .from('school_profiles')
        .select('school_name, department_name')
        .eq('id', otherParticipant.profile_id)
        .maybeSingle()
      otherPartySubtitle = data?.department_name
        ? `${data.school_name} - ${data.department_name}`
        : data?.school_name || ''
      break
    }
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

  // Mark messages as read (don't let this crash the page)
  try {
    await markMessagesAsRead(conversationId)
  } catch (e) {
    console.error('Failed to mark messages as read:', e)
  }

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
            <span className="text-neutral-600 dark:text-neutral-400">
              {getRoleIcon(otherParticipant.participant_type)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">{otherPartyName}</h1>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                {getRoleLabel(otherParticipant.participant_type)}
              </span>
            </div>
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
