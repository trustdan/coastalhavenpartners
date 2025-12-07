import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/client' // Use client for typing, but we need admin client for fetching
import { createClient as createServerClient } from '@supabase/supabase-js'

// Initialize Resend with API Key
// Note: We check for the key to prevent build errors if it's missing
// In production, it must be present for emails to work.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_123')

// Domain verified in Resend - using send subdomain for SPF/DKIM compliance
export const FROM_EMAIL = 'Coastal Haven Partners <notifications@send.coastalhavenpartners.com>'
export const REPLY_TO = 'support@coastalhavenpartners.com'

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

// Send notification for new Capital application
interface CapitalApplicationData {
  applicantName: string
  applicantEmail: string
  school: string
  major: string
  graduationYear: number
  gpa: number
  applicationId: string
}

export async function sendCapitalApplicationNotification(data: CapitalApplicationData) {
  const adminEmails = await getAdminEmails()

  if (adminEmails.length === 0) {
    console.warn('No admin emails found for Capital application notification')
    return { success: false, error: 'No admins to notify' }
  }

  const adminUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coastalhavenpartners.com'

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `New Capital Application: ${data.applicantName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Capital Application</h1>
          </div>

          <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
              A new candidate has applied to Coastal Haven Capital.
            </p>

            <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #111827;">${data.applicantName}</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
                    <a href="mailto:${data.applicantEmail}" style="color: #3b82f6;">${data.applicantEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">School</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.school}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Major</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.major}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Graduation</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.graduationYear}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">GPA</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.gpa.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="${adminUrl}/admin/capital"
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Review Application
              </a>
            </div>

            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
              This notification was sent because someone applied to Coastal Haven Capital.
            </p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send Capital application notification:', error)
    return { success: false, error: String(error) }
  }
}

// Send notification for new support/feedback message
interface SupportMessageData {
  messageId: string
  messageType: 'technical_support' | 'feedback'
  senderName: string
  senderEmail: string
  subject: string
  message: string
  userRole: string
}

export async function sendSupportMessageNotification(data: SupportMessageData) {
  const adminEmails = await getAdminEmails()

  if (adminEmails.length === 0) {
    console.warn('No admin emails found for support message notification')
    return { success: false, error: 'No admins to notify' }
  }

  const adminUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coastalhavenpartners.com'
  const isSupport = data.messageType === 'technical_support'
  const typeLabel = isSupport ? 'Technical Support' : 'Feedback'
  const typeColor = isSupport ? '#ef4444' : '#8b5cf6' // red for support, purple for feedback

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      replyTo: data.senderEmail,
      subject: `[${typeLabel}] ${data.subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${typeColor}; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">${typeLabel} Message</h1>
          </div>

          <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">From</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                    <strong>${data.senderName}</strong> (${data.userRole})
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                    <a href="mailto:${data.senderEmail}" style="color: #3b82f6;">${data.senderEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subject</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${data.subject}</td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 12px; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Message</h3>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${data.message}</p>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="${adminUrl}/admin/support"
                 style="display: inline-block; background: ${typeColor}; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View in Admin Portal
              </a>
            </div>

            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
              Reply directly to this email to respond to ${data.senderName}.
            </p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send support message notification:', error)
    return { success: false, error: String(error) }
  }
}

// Send confirmation to user that their support message was received
export async function sendSupportConfirmation(
  userEmail: string,
  userName: string,
  messageType: 'technical_support' | 'feedback',
  subject: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coastalhavenpartners.com'
  const isSupport = messageType === 'technical_support'
  const typeLabel = isSupport ? 'support request' : 'feedback'

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      replyTo: REPLY_TO,
      subject: `We received your ${typeLabel}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); padding: 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Message Received</h1>
          </div>

          <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
              Hi ${userName},
            </p>

            <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for reaching out! We've received your ${typeLabel} regarding "<strong>${subject}</strong>" and our team will review it shortly.
            </p>

            ${isSupport ? `
            <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
              If your issue is urgent, you can also email us directly at <a href="mailto:support@coastalhavenpartners.com" style="color: #14b8a6;">support@coastalhavenpartners.com</a>.
            </p>
            ` : `
            <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
              We appreciate you taking the time to share your thoughts with us. Your feedback helps us improve the platform for everyone.
            </p>
            `}

            <div style="margin-top: 24px; text-align: center;">
              <a href="${appUrl}"
                 style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Return to Dashboard
              </a>
            </div>

            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
              This is an automated confirmation. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send support confirmation:', error)
    return { success: false, error: String(error) }
  }
}
