'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/types/database.types'

export type ReferralStats = {
  total_referrals: number
  pending: number
  signed_up: number
  verified: number
}

export type Referral = {
  id: string
  referrer_id: string
  referred_email: string
  referred_user_id: string | null
  status: 'pending' | 'signed_up' | 'verified'
  signed_up_at: string | null
  verified_at: string | null
  created_at: string | null
  referred_user?: {
    full_name: string
  } | null
}

export async function getReferralCode(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  return profile?.referral_code ?? null
}

export async function getReferralStats(): Promise<ReferralStats | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Use admin client to access the function
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data, error } = await supabaseAdmin.rpc('get_referral_stats', {
    user_id: user.id
  })

  if (error) {
    console.error('Error getting referral stats:', error)
    return null
  }

  return data as ReferralStats
}

export async function getReferrals(): Promise<Referral[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Use admin client to get referral details with referred user info
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data, error } = await supabaseAdmin
    .from('referrals')
    .select(`
      id,
      referrer_id,
      referred_email,
      referred_user_id,
      status,
      signed_up_at,
      verified_at,
      created_at
    `)
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting referrals:', error)
    return []
  }

  // Get full names for referred users
  const referredUserIds = data
    .filter(r => r.referred_user_id)
    .map(r => r.referred_user_id) as string[]

  let userNames: Record<string, string> = {}
  if (referredUserIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', referredUserIds)

    if (profiles) {
      userNames = Object.fromEntries(
        profiles.map(p => [p.id, p.full_name])
      )
    }
  }

  return data.map(r => ({
    ...r,
    status: r.status as 'pending' | 'signed_up' | 'verified',
    referred_user: r.referred_user_id && userNames[r.referred_user_id]
      ? { full_name: userNames[r.referred_user_id] }
      : null
  }))
}

export async function createReferral(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address' }
  }

  // Check if email is already in the system
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingProfile) {
    return { success: false, error: 'This person is already a member' }
  }

  // Check if this email has already been referred by this user
  const { data: existingReferral } = await supabaseAdmin
    .from('referrals')
    .select('id')
    .eq('referrer_id', user.id)
    .eq('referred_email', email)
    .single()

  if (existingReferral) {
    return { success: false, error: 'You have already invited this person' }
  }

  // Create the referral
  const { error } = await supabaseAdmin
    .from('referrals')
    .insert({
      referrer_id: user.id,
      referred_email: email
    })

  if (error) {
    console.error('Error creating referral:', error)
    return { success: false, error: 'Failed to create referral' }
  }

  revalidatePath('/candidate')
  return { success: true }
}

export async function deleteReferral(referralId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Verify ownership and delete
  const { error } = await supabaseAdmin
    .from('referrals')
    .delete()
    .eq('id', referralId)
    .eq('referrer_id', user.id)

  if (error) {
    console.error('Error deleting referral:', error)
    return { success: false, error: 'Failed to delete referral' }
  }

  revalidatePath('/candidate')
  return { success: true }
}

// Get referrer info by code (for signup page)
export async function getReferrerByCode(code: string): Promise<{ name: string } | null> {
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('referral_code', code.toUpperCase())
    .single()

  if (!profile) return null

  return { name: profile.full_name }
}
