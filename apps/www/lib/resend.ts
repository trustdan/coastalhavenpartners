import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/client' // Use client for typing, but we need admin client for fetching
import { createClient as createServerClient } from '@supabase/supabase-js'

// Initialize Resend with API Key
// Note: We check for the key to prevent build errors if it's missing
// In production, it must be present for emails to work.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_123')

// TODO: Update this after verifying your domain in Resend dashboard
// Example: 'Coastal Haven <notifications@coastalhavenpartners.com>'
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
