import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function notifyBotToRemoveRole(discordId: string) {
  const botApiUrl = process.env.DISCORD_BOT_API_URL

  if (!botApiUrl) {
    console.warn('DISCORD_BOT_API_URL not configured - skipping role removal')
    return
  }

  try {
    const response = await fetch(`${botApiUrl}/remove-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DISCORD_BOT_API_SECRET}`,
      },
      body: JSON.stringify({ discord_id: discordId }),
    })

    if (!response.ok) {
      console.error('Bot API returned error:', await response.text())
    }
  } catch (error) {
    console.error('Failed to notify bot:', error)
  }
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get current Discord ID before unlinking
  const { data: profile } = await supabase
    .from('profiles')
    .select('discord_id')
    .eq('id', user.id)
    .single()

  if (!profile?.discord_id) {
    return NextResponse.json({ error: 'No Discord account linked' }, { status: 400 })
  }

  // Remove Discord link from profile
  const { error } = await supabase
    .from('profiles')
    .update({
      discord_id: null,
      discord_username: null,
      discord_verified_at: null,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to unlink Discord:', error)
    return NextResponse.json({ error: 'Failed to unlink' }, { status: 500 })
  }

  // Notify bot to remove role
  await notifyBotToRemoveRole(profile.discord_id)

  return NextResponse.json({ success: true })
}
