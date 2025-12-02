import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 })
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('referral_code', code.toUpperCase())
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
  }

  // Return first name only for privacy
  const firstName = profile.full_name.split(' ')[0]

  return NextResponse.json({ name: firstName })
}
