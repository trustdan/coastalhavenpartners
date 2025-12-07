import { NextResponse } from 'next/server'
import { resend, getAdminEmails, FROM_EMAIL } from '@/lib/resend'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Initialize Supabase Admin inside the handler to avoid build-time errors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const adminUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coastalhavenpartners.com'
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Fetch all pending items in parallel
    const [
      { data: pendingRecruiters },
      { data: pendingCandidates },
      { data: recentSupportMessages }
    ] = await Promise.all([
      // 1. Pending recruiter applications
      supabase
        .from('recruiter_profiles')
        .select(`
          *,
          profiles!user_id (
            full_name,
            email
          )
        `)
        .eq('is_approved', false),

      // 2. Candidates pending verification
      supabase
        .from('candidate_profiles')
        .select(`
          *,
          profiles!user_id (
            full_name,
            email
          )
        `)
        .eq('status', 'pending_verification'),

      // 3. Support/feedback messages from last 24 hours (new ones only)
      supabase
        .from('support_messages')
        .select('*')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
    ])

    const recruiterCount = pendingRecruiters?.length || 0
    const candidateCount = pendingCandidates?.length || 0
    const supportCount = recentSupportMessages?.length || 0
    const totalItems = recruiterCount + candidateCount + supportCount

    // Skip email if nothing to report
    if (totalItems === 0) {
      return NextResponse.json({ message: 'No pending items to report' })
    }

    // Get Admin Emails
    const adminEmails = await getAdminEmails()

    if (adminEmails.length === 0) {
      return NextResponse.json({ message: 'No admins found' })
    }

    // Build email sections
    const sections: string[] = []

    // Pending Recruiters Section
    if (recruiterCount > 0) {
      const recruiterList = pendingRecruiters!.map(r => `
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
          <strong>${r.profiles?.full_name || 'Unknown'}</strong> — ${r.firm_name || 'No firm'}<br/>
          <span style="color: #6b7280; font-size: 13px;">${r.profiles?.email || ''}</span>
        </li>
      `).join('')

      sections.push(`
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
              ${recruiterCount} Pending Recruiter${recruiterCount !== 1 ? 's' : ''}
            </div>
          </div>
          <ul style="list-style: none; margin: 0; padding: 0;">
            ${recruiterList}
          </ul>
          <div style="margin-top: 16px;">
            <a href="${adminUrl}/admin/recruiters" style="color: #3b82f6; font-size: 14px; text-decoration: none;">
              Review in Admin Portal →
            </a>
          </div>
        </div>
      `)
    }

    // Pending Candidates Section
    if (candidateCount > 0) {
      const candidateList = pendingCandidates!.map(c => `
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
          <strong>${c.profiles?.full_name || 'Unknown'}</strong> — ${c.school_name || 'No school'}<br/>
          <span style="color: #6b7280; font-size: 13px;">${c.profiles?.email || ''} · ${c.major || ''} · ${c.graduation_year || ''}</span>
        </li>
      `).join('')

      sections.push(`
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="background: #8b5cf6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
              ${candidateCount} Candidate${candidateCount !== 1 ? 's' : ''} Awaiting Verification
            </div>
          </div>
          <ul style="list-style: none; margin: 0; padding: 0;">
            ${candidateList}
          </ul>
          <div style="margin-top: 16px;">
            <a href="${adminUrl}/admin/candidates" style="color: #8b5cf6; font-size: 14px; text-decoration: none;">
              Review in Admin Portal →
            </a>
          </div>
        </div>
      `)
    }

    // Support/Feedback Messages Section
    if (supportCount > 0) {
      const supportMessages = recentSupportMessages!.filter(m => m.message_type === 'technical_support')
      const feedbackMessages = recentSupportMessages!.filter(m => m.message_type === 'feedback')

      const messageList = recentSupportMessages!.map(m => {
        const isSupport = m.message_type === 'technical_support'
        const typeLabel = isSupport ? '🔧 Support' : '💬 Feedback'
        const typeColor = isSupport ? '#ef4444' : '#8b5cf6'
        return `
          <li style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="background: ${typeColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${typeLabel}</span>
            <strong style="margin-left: 8px;">${m.subject}</strong><br/>
            <span style="color: #6b7280; font-size: 13px;">From: ${m.sender_name} (${m.sender_email})</span>
          </li>
        `
      }).join('')

      sections.push(`
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
              ${supportCount} New Message${supportCount !== 1 ? 's' : ''} (${supportMessages.length} support, ${feedbackMessages.length} feedback)
            </div>
          </div>
          <ul style="list-style: none; margin: 0; padding: 0;">
            ${messageList}
          </ul>
          <div style="margin-top: 16px;">
            <a href="${adminUrl}/admin/support" style="color: #f59e0b; font-size: 14px; text-decoration: none;">
              View All Messages →
            </a>
          </div>
        </div>
      `)
    }

    // Construct final email
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Daily Admin Digest</h1>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
            You have <strong>${totalItems} item${totalItems !== 1 ? 's' : ''}</strong> requiring your attention:
          </p>

          ${sections.join('')}

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <a href="${adminUrl}/admin"
               style="display: inline-block; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Go to Admin Dashboard
            </a>
          </div>

          <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
            This digest is sent once daily. Configure notifications in Admin Settings.
          </p>
        </div>
      </div>
    `

    // Build subject line with counts
    const subjectParts: string[] = []
    if (recruiterCount > 0) subjectParts.push(`${recruiterCount} recruiter${recruiterCount !== 1 ? 's' : ''}`)
    if (candidateCount > 0) subjectParts.push(`${candidateCount} candidate${candidateCount !== 1 ? 's' : ''}`)
    if (supportCount > 0) subjectParts.push(`${supportCount} message${supportCount !== 1 ? 's' : ''}`)

    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `Daily Digest: ${subjectParts.join(', ')}`,
      html: html
    })

    return NextResponse.json({
      success: true,
      counts: {
        recruiters: recruiterCount,
        candidates: candidateCount,
        supportMessages: supportCount,
        total: totalItems
      },
      recipients: adminEmails
    })

  } catch (error: unknown) {
    console.error('Digest error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
