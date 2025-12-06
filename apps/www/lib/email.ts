import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL, REPLY_TO } from '@/lib/resend'

// App URL for links in emails
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://coastalhavenpartners.com'

export type EmailNotificationType =
  | 'profile_view'
  | 'message'
  | 'job_match'
  | 'deadline_reminder'
  | 'new_candidate'
  | 'candidate_interest'
  | 'saved_search_match'
  | 'verification_request'
  | 'student_placement'
  | 'welcome'
  | 'verification_approved'
  | 'verification_rejected'

export interface SendEmailOptions {
  userId: string
  type: EmailNotificationType
  subject: string
  preheader?: string
  body: {
    heading: string
    message: string
    ctaText?: string
    ctaUrl?: string
  }
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Get user's email from their profile
 */
async function getUserEmail(userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  return data?.email || null
}

/**
 * Check if user has email notifications enabled for this type
 */
async function shouldSendEmail(
  userId: string,
  type: EmailNotificationType
): Promise<boolean> {
  const supabase = await createClient()

  const { data: prefs } = await (supabase as any)
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Default to sending if no preferences exist
  if (!prefs) return true

  // Check if email is globally enabled
  if (!prefs.email_enabled) return false

  // Check specific notification type preferences
  switch (type) {
    case 'profile_view':
      return prefs.notify_profile_views !== false
    case 'message':
      return prefs.notify_messages !== false
    case 'job_match':
      return prefs.notify_job_matches !== false
    case 'deadline_reminder':
      return prefs.notify_deadline_reminders !== false
    case 'new_candidate':
      return prefs.notify_new_candidates !== false
    case 'candidate_interest':
      return prefs.notify_candidate_interest !== false
    case 'saved_search_match':
      return prefs.notify_saved_search_matches !== false
    case 'verification_request':
      return prefs.notify_verification_requests !== false
    case 'student_placement':
      return prefs.notify_student_placements !== false
    // Transactional emails always send
    case 'welcome':
    case 'verification_approved':
    case 'verification_rejected':
      return true
    default:
      return true
  }
}

/**
 * Generate HTML email template
 */
function generateEmailHtml(options: {
  heading: string
  message: string
  ctaText?: string
  ctaUrl?: string
  preheader?: string
}): string {
  const { heading, message, ctaText, ctaUrl, preheader } = options

  const ctaButton = ctaText && ctaUrl
    ? `
      <tr>
        <td style="padding: 24px 0 16px;">
          <a href="${ctaUrl}"
             style="display: inline-block;
                    background-color: #0ea5e9;
                    color: #ffffff;
                    font-weight: 600;
                    padding: 12px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 14px;">
            ${ctaText}
          </a>
        </td>
      </tr>
    `
    : ''

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">

          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0ea5e9;">
                Coastal Haven Partners
              </h1>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 32px;">

                    <!-- Content -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
                            ${heading}
                          </h2>
                          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                            ${message}
                          </p>
                        </td>
                      </tr>
                      ${ctaButton}
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
                You received this email because you have an account with Coastal Haven Partners.
              </p>
              <p style="margin: 0; font-size: 14px; color: #71717a;">
                <a href="${APP_URL}/candidate/settings" style="color: #0ea5e9; text-decoration: none;">
                  Manage notification preferences
                </a>
                &nbsp;&bull;&nbsp;
                <a href="${APP_URL}" style="color: #0ea5e9; text-decoration: none;">
                  Visit website
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version of email
 */
function generateEmailText(options: {
  heading: string
  message: string
  ctaText?: string
  ctaUrl?: string
}): string {
  const { heading, message, ctaText, ctaUrl } = options

  let text = `${heading}\n\n${message}`

  if (ctaText && ctaUrl) {
    text += `\n\n${ctaText}: ${ctaUrl}`
  }

  text += `\n\n---\nCoastal Haven Partners\nManage preferences: ${APP_URL}/candidate/settings`

  return text
}

/**
 * Send an email notification to a user
 */
export async function sendEmailNotification(
  options: SendEmailOptions
): Promise<EmailResult> {
  const { userId, type, subject, preheader, body } = options

  // Check if we should send this email
  const shouldSend = await shouldSendEmail(userId, type)
  if (!shouldSend) {
    return { success: true } // Silent success - user opted out
  }

  // Get user's email
  const email = await getUserEmail(userId)
  if (!email) {
    return { success: false, error: 'User email not found' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject,
      html: generateEmailHtml({ ...body, preheader }),
      text: generateEmailText(body),
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error?.message || 'Unknown error' }
  }
}

// ============================================================================
// Convenience functions for specific notification types
// ============================================================================

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  userId: string,
  name: string,
  role: 'candidate' | 'recruiter' | 'school'
) {
  const roleMessages = {
    candidate: {
      heading: `Welcome to the Network, ${name}!`,
      message: 'Your journey to landing your dream finance role starts here. Complete your profile to get noticed by top recruiters from boutique firms.',
      ctaText: 'Complete Your Profile',
      ctaUrl: `${APP_URL}/candidate/edit-profile`,
    },
    recruiter: {
      heading: `Welcome to Coastal Haven Partners, ${name}!`,
      message: 'Access our curated pool of verified finance talent. Start discovering candidates who match your specific requirements.',
      ctaText: 'Browse Candidates',
      ctaUrl: `${APP_URL}/recruiter`,
    },
    school: {
      heading: `Welcome to Coastal Haven Partners, ${name}!`,
      message: 'Help your students connect with top boutique finance firms. Start verifying student profiles to boost their credibility.',
      ctaText: 'View Dashboard',
      ctaUrl: `${APP_URL}/school`,
    },
  }

  const content = roleMessages[role]

  return sendEmailNotification({
    userId,
    type: 'welcome',
    subject: `Welcome to Coastal Haven Partners!`,
    preheader: 'Your finance career journey starts now',
    body: content,
  })
}

/**
 * Notify candidate when recruiter views their profile
 */
export async function emailProfileView(
  candidateUserId: string,
  recruiterName: string,
  recruiterFirm?: string
) {
  const firmText = recruiterFirm ? ` from ${recruiterFirm}` : ''

  return sendEmailNotification({
    userId: candidateUserId,
    type: 'profile_view',
    subject: `${recruiterName}${firmText} viewed your profile`,
    preheader: 'A recruiter is interested in your profile',
    body: {
      heading: 'Your Profile Was Viewed',
      message: `${recruiterName}${firmText} just viewed your profile. Keep your profile updated to increase your chances of getting contacted!`,
      ctaText: 'View Your Profile',
      ctaUrl: `${APP_URL}/candidate`,
    },
  })
}

/**
 * Notify user of new message
 */
export async function emailNewMessage(
  recipientUserId: string,
  senderName: string,
  messagePreview?: string
) {
  const preview = messagePreview
    ? `"${messagePreview.slice(0, 100)}${messagePreview.length > 100 ? '...' : ''}"`
    : ''

  return sendEmailNotification({
    userId: recipientUserId,
    type: 'message',
    subject: `New message from ${senderName}`,
    preheader: preview || `${senderName} sent you a message`,
    body: {
      heading: 'You Have a New Message',
      message: `${senderName} sent you a message${preview ? `: ${preview}` : '.'}`,
      ctaText: 'View Message',
      ctaUrl: `${APP_URL}/messages`,
    },
  })
}

/**
 * Notify candidate of job match
 */
export async function emailJobMatch(
  candidateUserId: string,
  jobTitle: string,
  firmName: string
) {
  return sendEmailNotification({
    userId: candidateUserId,
    type: 'job_match',
    subject: `New opportunity: ${jobTitle} at ${firmName}`,
    preheader: 'A new role matches your profile',
    body: {
      heading: 'New Job Match',
      message: `A ${jobTitle} position at ${firmName} matches your profile. Check it out and express your interest!`,
      ctaText: 'View Opportunity',
      ctaUrl: `${APP_URL}/candidate/jobs`,
    },
  })
}

/**
 * Notify candidate of upcoming deadline
 */
export async function emailDeadlineReminder(
  candidateUserId: string,
  jobTitle: string,
  firmName: string,
  daysUntilDeadline: number
) {
  const timeText = daysUntilDeadline === 1 ? 'tomorrow' : `in ${daysUntilDeadline} days`

  return sendEmailNotification({
    userId: candidateUserId,
    type: 'deadline_reminder',
    subject: `Deadline reminder: ${jobTitle} closes ${timeText}`,
    preheader: `Don't miss this opportunity at ${firmName}`,
    body: {
      heading: 'Application Deadline Approaching',
      message: `The application for ${jobTitle} at ${firmName} closes ${timeText}. Make sure to submit your application before the deadline!`,
      ctaText: 'Apply Now',
      ctaUrl: `${APP_URL}/candidate/jobs`,
    },
  })
}

/**
 * Notify recruiter of new candidate matching saved search
 */
export async function emailNewCandidateMatch(
  recruiterUserId: string,
  candidateName: string,
  searchName?: string
) {
  return sendEmailNotification({
    userId: recruiterUserId,
    type: 'saved_search_match',
    subject: `New candidate match: ${candidateName}`,
    preheader: searchName ? `Matches your "${searchName}" search` : 'A new candidate matches your criteria',
    body: {
      heading: 'New Candidate Match',
      message: searchName
        ? `${candidateName} matches your "${searchName}" saved search criteria.`
        : `${candidateName} matches your saved search criteria. Review their profile to see if they're a good fit.`,
      ctaText: 'View Candidate',
      ctaUrl: `${APP_URL}/recruiter`,
    },
  })
}

/**
 * Notify recruiter of candidate interest
 */
export async function emailCandidateInterest(
  recruiterUserId: string,
  candidateName: string,
  jobTitle?: string
) {
  return sendEmailNotification({
    userId: recruiterUserId,
    type: 'candidate_interest',
    subject: `${candidateName} is interested in your firm`,
    preheader: jobTitle ? `Interested in the ${jobTitle} position` : 'A candidate wants to connect',
    body: {
      heading: 'Candidate Interest',
      message: jobTitle
        ? `${candidateName} has expressed interest in the ${jobTitle} position at your firm.`
        : `${candidateName} has expressed interest in opportunities at your firm. Review their profile to learn more.`,
      ctaText: 'View Candidate',
      ctaUrl: `${APP_URL}/recruiter`,
    },
  })
}

/**
 * Notify school of verification request
 */
export async function emailVerificationRequest(
  schoolUserId: string,
  studentName: string
) {
  return sendEmailNotification({
    userId: schoolUserId,
    type: 'verification_request',
    subject: `Verification request from ${studentName}`,
    preheader: 'A student needs their transcript verified',
    body: {
      heading: 'New Verification Request',
      message: `${studentName} has requested verification of their academic records. Please review and verify their information.`,
      ctaText: 'Review Request',
      ctaUrl: `${APP_URL}/school`,
    },
  })
}

/**
 * Notify school of student placement
 */
export async function emailStudentPlacement(
  schoolUserId: string,
  studentName: string,
  firmName: string,
  jobTitle: string
) {
  return sendEmailNotification({
    userId: schoolUserId,
    type: 'student_placement',
    subject: `${studentName} accepted an offer at ${firmName}`,
    preheader: 'Great news about your student!',
    body: {
      heading: 'Student Placement',
      message: `Congratulations! ${studentName} has accepted a ${jobTitle} position at ${firmName}. This is a great outcome for your program.`,
      ctaText: 'View Dashboard',
      ctaUrl: `${APP_URL}/school`,
    },
  })
}

/**
 * Notify user their verification was approved
 */
export async function emailVerificationApproved(
  userId: string,
  name: string,
  role: 'candidate' | 'recruiter'
) {
  const dashboardUrl = role === 'candidate' ? `${APP_URL}/candidate` : `${APP_URL}/recruiter`

  return sendEmailNotification({
    userId,
    type: 'verification_approved',
    subject: 'Your account has been verified!',
    preheader: 'You now have full access to Coastal Haven Partners',
    body: {
      heading: `Congratulations, ${name}!`,
      message: 'Your account has been verified. You now have full access to all features on Coastal Haven Partners.',
      ctaText: 'Go to Dashboard',
      ctaUrl: dashboardUrl,
    },
  })
}

/**
 * Notify user their verification was rejected
 */
export async function emailVerificationRejected(
  userId: string,
  name: string,
  reason?: string
) {
  return sendEmailNotification({
    userId,
    type: 'verification_rejected',
    subject: 'Verification update required',
    preheader: 'Please update your profile information',
    body: {
      heading: `Hi ${name}`,
      message: reason
        ? `Your verification was not approved for the following reason: ${reason}. Please update your information and resubmit.`
        : 'Your verification was not approved. Please review your profile information and make any necessary corrections.',
      ctaText: 'Update Profile',
      ctaUrl: `${APP_URL}/candidate/edit-profile`,
    },
  })
}
