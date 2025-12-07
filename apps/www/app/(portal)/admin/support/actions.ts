'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

type SupportStatus = 'new' | 'in_progress' | 'resolved' | 'spam'

interface UpdateStatusResult {
  success: boolean
  error?: string
}

async function verifyAdmin(): Promise<{ isAdmin: boolean; userId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { isAdmin: false }
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { isAdmin: profile?.role === 'admin', userId: user.id }
}

export async function updateSupportMessageStatus(
  messageId: string,
  status: SupportStatus,
  adminNotes?: string
): Promise<UpdateStatusResult> {
  const { isAdmin, userId } = await verifyAdmin()

  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const updateData: Record<string, unknown> = {
    status,
    handled_by: userId,
    handled_at: new Date().toISOString(),
  }

  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes
  }

  const { error } = await supabaseAdmin
    .from('support_messages')
    .update(updateData)
    .eq('id', messageId)

  if (error) {
    console.error('Failed to update support message:', error)
    return { success: false, error: 'Failed to update message' }
  }

  revalidatePath('/admin/support')
  return { success: true }
}

export async function addAdminNotes(
  messageId: string,
  notes: string
): Promise<UpdateStatusResult> {
  const { isAdmin, userId } = await verifyAdmin()

  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await supabaseAdmin
    .from('support_messages')
    .update({
      admin_notes: notes,
      handled_by: userId,
      handled_at: new Date().toISOString(),
    })
    .eq('id', messageId)

  if (error) {
    console.error('Failed to add admin notes:', error)
    return { success: false, error: 'Failed to add notes' }
  }

  revalidatePath('/admin/support')
  return { success: true }
}

export async function deleteSupportMessage(
  messageId: string
): Promise<UpdateStatusResult> {
  const { isAdmin } = await verifyAdmin()

  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await supabaseAdmin
    .from('support_messages')
    .delete()
    .eq('id', messageId)

  if (error) {
    console.error('Failed to delete support message:', error)
    return { success: false, error: 'Failed to delete message' }
  }

  revalidatePath('/admin/support')
  return { success: true }
}
