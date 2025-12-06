import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  sendWelcomeEmail,
  emailVerificationApproved,
  emailVerificationRejected,
  emailNewMessage,
  emailProfileView,
} from '@/lib/email'

// Internal API for sending email notifications
// Protected by authentication
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

    const body = await request.json()
    const { type, ...params } = body

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'welcome':
        // Admin can send welcome emails or user can trigger their own
        result = await sendWelcomeEmail(
          params.userId || user.id,
          params.name,
          params.role
        )
        break

      case 'verification_approved':
        // Only admin can send verification emails
        const { data: adminCheck } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (adminCheck?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }

        result = await emailVerificationApproved(
          params.userId,
          params.name,
          params.role
        )
        break

      case 'verification_rejected':
        const { data: adminCheck2 } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (adminCheck2?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }

        result = await emailVerificationRejected(
          params.userId,
          params.name,
          params.reason
        )
        break

      case 'message':
        // Messages are sent automatically via the notification system
        // This is just for testing
        result = await emailNewMessage(
          params.userId || user.id,
          params.senderName,
          params.messagePreview
        )
        break

      case 'profile_view':
        // Profile views are sent automatically via the notification system
        // This is just for testing
        result = await emailProfileView(
          params.userId || user.id,
          params.recruiterName,
          params.recruiterFirm
        )
        break

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
