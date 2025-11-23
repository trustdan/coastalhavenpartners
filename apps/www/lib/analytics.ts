import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

type EventType = 'profile_view' | 'login' | 'search' | 'filter_usage'

export async function trackEventServer(
  eventType: EventType,
  metadata: any = {},
  targetId?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return // Don't track anon for now (or track with null user_id)

    await supabase.from('analytics_events').insert({
      event_type: eventType,
      user_id: user.id,
      target_id: targetId,
      metadata
    })
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

