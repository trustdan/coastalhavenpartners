import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@coastalhavenpartners.com',
    vapidPublicKey,
    vapidPrivateKey
  )
}

export type NotificationType =
  | 'profile_view'
  | 'message'
  | 'job_match'
  | 'deadline_reminder'
  | 'new_candidate'
  | 'candidate_interest'
  | 'saved_search_match'
  | 'verification_request'
  | 'student_placement'

export interface SendNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  body: string
  url?: string
  data?: Record<string, unknown>
}

export interface NotificationResult {
  success: boolean
  sent: number
  failed: number
  errors?: string[]
}

/**
 * Send a push notification to all of a user's subscribed devices
 */
export async function sendPushNotification(
  options: SendNotificationOptions
): Promise<NotificationResult> {
  const { userId, type, title, body, url, data } = options

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured, skipping push notification')
    return { success: false, sent: 0, failed: 0, errors: ['VAPID keys not configured'] }
  }

  const supabase = await createClient()

  // Check if user has push notifications enabled
  const { data: prefs } = await (supabase as any)
    .from('notification_preferences')
    .select('push_enabled, quiet_hours_start, quiet_hours_end, timezone')
    .eq('user_id', userId)
    .single()

  if (prefs && !prefs.push_enabled) {
    return { success: true, sent: 0, failed: 0 }
  }

  // Check quiet hours (basic implementation)
  if (prefs?.quiet_hours_start && prefs?.quiet_hours_end) {
    const now = new Date()
    const userTimezone = prefs.timezone || 'America/New_York'
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }))
    const currentHour = userTime.getHours()
    const currentMinute = userTime.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute

    const [startHour, startMinute] = prefs.quiet_hours_start.split(':').map(Number)
    const [endHour, endMinute] = prefs.quiet_hours_end.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    const inQuietHours = startMinutes > endMinutes
      ? currentTimeMinutes >= startMinutes || currentTimeMinutes < endMinutes
      : currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes

    if (inQuietHours) {
      return { success: true, sent: 0, failed: 0 }
    }
  }

  // Get all push subscriptions for user
  const { data: subscriptions, error: subError } = await (supabase as any)
    .from('push_subscriptions')
    .select('id, endpoint, p256dh_key, auth_key')
    .eq('user_id', userId)

  if (subError || !subscriptions?.length) {
    return { success: true, sent: 0, failed: 0 }
  }

  const payload = JSON.stringify({
    title,
    body,
    url: url || '/',
    type,
    ...data,
  })

  let sent = 0
  let failed = 0
  const errors: string[] = []

  // Send to all subscriptions
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        },
        payload
      )

      // Log successful notification
      await (supabase as any).from('notification_log').insert({
        user_id: userId,
        subscription_id: sub.id,
        title,
        body,
        url,
        notification_type: type,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })

      sent++
    } catch (error: any) {
      failed++
      const errorMessage = error?.message || 'Unknown error'
      errors.push(errorMessage)

      // Log failed notification
      await (supabase as any).from('notification_log').insert({
        user_id: userId,
        subscription_id: sub.id,
        title,
        body,
        url,
        notification_type: type,
        status: 'failed',
        error_message: errorMessage,
      })

      // If subscription is invalid (410 Gone), remove it
      if (error?.statusCode === 410) {
        await (supabase as any)
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id)
      }
    }
  }

  return {
    success: sent > 0 || failed === 0,
    sent,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Send notification when a recruiter views a candidate's profile
 */
export async function notifyProfileView(
  candidateUserId: string,
  recruiterName: string,
  recruiterFirm?: string
) {
  const firmText = recruiterFirm ? ` from ${recruiterFirm}` : ''
  return sendPushNotification({
    userId: candidateUserId,
    type: 'profile_view',
    title: 'Profile Viewed',
    body: `${recruiterName}${firmText} viewed your profile`,
    url: '/candidate',
  })
}

/**
 * Send notification when user receives a new message
 */
export async function notifyNewMessage(
  recipientUserId: string,
  senderName: string,
  messagePreview?: string
) {
  return sendPushNotification({
    userId: recipientUserId,
    type: 'message',
    title: 'New Message',
    body: messagePreview
      ? `${senderName}: ${messagePreview.slice(0, 100)}${messagePreview.length > 100 ? '...' : ''}`
      : `${senderName} sent you a message`,
    url: '/messages',
  })
}

/**
 * Send notification when a job matches candidate's profile
 */
export async function notifyJobMatch(
  candidateUserId: string,
  jobTitle: string,
  firmName: string
) {
  return sendPushNotification({
    userId: candidateUserId,
    type: 'job_match',
    title: 'New Job Match',
    body: `${jobTitle} at ${firmName} matches your profile`,
    url: '/candidate/jobs',
  })
}

/**
 * Send notification for application deadline reminder
 */
export async function notifyDeadlineReminder(
  candidateUserId: string,
  jobTitle: string,
  daysUntilDeadline: number
) {
  const timeText = daysUntilDeadline === 1 ? 'tomorrow' : `in ${daysUntilDeadline} days`
  return sendPushNotification({
    userId: candidateUserId,
    type: 'deadline_reminder',
    title: 'Deadline Reminder',
    body: `Application for ${jobTitle} closes ${timeText}`,
    url: '/candidate/jobs',
  })
}

/**
 * Send notification to recruiter about new candidate matching saved search
 */
export async function notifyNewCandidateMatch(
  recruiterUserId: string,
  candidateName: string,
  searchName?: string
) {
  return sendPushNotification({
    userId: recruiterUserId,
    type: 'saved_search_match',
    title: 'New Candidate Match',
    body: searchName
      ? `${candidateName} matches your "${searchName}" search`
      : `${candidateName} matches your saved search criteria`,
    url: '/recruiter',
  })
}

/**
 * Send notification to recruiter when candidate expresses interest
 */
export async function notifyCandidateInterest(
  recruiterUserId: string,
  candidateName: string,
  jobTitle?: string
) {
  return sendPushNotification({
    userId: recruiterUserId,
    type: 'candidate_interest',
    title: 'Candidate Interest',
    body: jobTitle
      ? `${candidateName} is interested in ${jobTitle}`
      : `${candidateName} expressed interest in your firm`,
    url: '/recruiter',
  })
}
