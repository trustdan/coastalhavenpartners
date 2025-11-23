import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/client' // Use client for typing, but we need admin client for fetching
import { createClient as createServerClient } from '@supabase/supabase-js'

// Initialize Resend with API Key
// Note: We check for the key to prevent build errors if it's missing
// In production, it must be present for emails to work.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_123')

export const FROM_EMAIL = 'Coastal Haven <onboarding@resend.dev>'

// Helper to get all admin emails
export async function getAdminEmails() {
  // Use service role key to bypass RLS and ensure we can read all profiles
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: admins } = await supabase
    .from('profiles')
    .select('email')
    .eq('role', 'admin')

  if (!admins) return []
  return admins.map(a => a.email).filter(Boolean) as string[]
}
