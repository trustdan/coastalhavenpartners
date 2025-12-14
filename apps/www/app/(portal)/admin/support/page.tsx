import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SupportInbox } from './support-inbox'

export const dynamic = 'force-dynamic'

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || 'all'
  const typeFilter = params.type || 'all'

  // Use untyped client since support_messages table types aren't generated yet
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Build query with filters
  let query = supabaseAdmin
    .from('support_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  if (typeFilter !== 'all') {
    // Handle special 'appeals' filter that groups multiple appeal types
    if (typeFilter === 'appeals') {
      query = query.in('message_type', ['verification_appeal', 'document_issue', 'account_access', 'other'])
    } else {
      query = query.eq('message_type', typeFilter)
    }
  }

  const { data: messages, error } = await query

  if (error) {
    console.error('Failed to fetch support messages:', error)
  }

  // Get counts for badges
  const { count: newCount } = await supabaseAdmin
    .from('support_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const { count: inProgressCount } = await supabaseAdmin
    .from('support_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress')

  const { count: supportCount } = await supabaseAdmin
    .from('support_messages')
    .select('*', { count: 'exact', head: true })
    .eq('message_type', 'technical_support')
    .eq('status', 'new')

  const { count: feedbackCount } = await supabaseAdmin
    .from('support_messages')
    .select('*', { count: 'exact', head: true })
    .eq('message_type', 'feedback')
    .eq('status', 'new')

  // Count appeals (includes verification_appeal, document_issue, account_access, other)
  const { count: appealsCount } = await supabaseAdmin
    .from('support_messages')
    .select('*', { count: 'exact', head: true })
    .in('message_type', ['verification_appeal', 'document_issue', 'account_access', 'other'])
    .eq('status', 'new')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Inbox</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage technical support requests and user feedback
        </p>
      </div>

      <SupportInbox
        messages={messages || []}
        currentStatusFilter={statusFilter}
        currentTypeFilter={typeFilter}
        counts={{
          new: newCount || 0,
          inProgress: inProgressCount || 0,
          support: supportCount || 0,
          feedback: feedbackCount || 0,
          appeals: appealsCount || 0,
        }}
      />
    </div>
  )
}
