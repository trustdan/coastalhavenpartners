import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushNotification, NotificationType } from '@/lib/push-notifications'

// Internal API for sending notifications
// Protected by service role or admin check
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin (optional - you might want different auth for server-to-server)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // For now, allow any authenticated user to trigger notifications to themselves
    // In production, you'd want stricter access control

    const body = await request.json()
    const { userId, type, title, message, url } = body

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      )
    }

    // Users can only send notifications to themselves unless admin
    if (userId !== user.id && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Can only send notifications to yourself' },
        { status: 403 }
      )
    }

    const result = await sendPushNotification({
      userId,
      type: type as NotificationType,
      title,
      body: message,
      url,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
