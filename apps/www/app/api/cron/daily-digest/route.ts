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

    // 1. Check for pending recruiters created in the last 24 hours
    // Note: For a robust system, you'd track 'notification_sent' status. 
    // For this MVP, we'll just check 'is_approved = false' and 'created_at > 24h ago' to avoid spamming old ones?
    // Actually, "Daily Digest" usually implies "Since last digest".
    // Let's fetch *all* pending recruiters. If the list is non-empty, remind the admin.
    // This serves as a "You still have work to do" reminder.
    
    const { data: pendingRecruiters } = await supabase
      .from('recruiter_profiles')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('is_approved', false)

    if (!pendingRecruiters || pendingRecruiters.length === 0) {
      return NextResponse.json({ message: 'No pending recruiters' })
    }

    // 2. Get Admin Emails
    const adminEmails = await getAdminEmails()

    if (adminEmails.length === 0) {
      return NextResponse.json({ message: 'No admins found' })
    }

    // 3. Construct Email Content
    const listHtml = pendingRecruiters.map(r => `
      <li>
        <strong>${r.profiles?.full_name}</strong> (${r.firm_name}) - 
        <a href="mailto:${r.profiles?.email}">${r.profiles?.email}</a>
      </li>
    `).join('')

    const html = `
      <h1>Daily Admin Digest</h1>
      <p>You have <strong>${pendingRecruiters.length}</strong> pending recruiter applications requiring your review.</p>
      <ul>
        ${listHtml}
      </ul>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Go to Admin Dashboard
        </a>
      </p>
    `

    // 4. Send Email to All Admins
    // Resend supports sending to multiple recipients in 'to' array (up to 50)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmails, // Array of emails
      subject: `Daily Digest: ${pendingRecruiters.length} Pending Applications`,
      html: html
    })

    return NextResponse.json({ success: true, count: pendingRecruiters.length, recipients: adminEmails })

  } catch (error: any) {
    console.error('Digest error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
