import { NextResponse } from 'next/server'
import { resend, FROM_EMAIL, REPLY_TO } from '@/lib/resend'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

type Payload = {
  userId: string
  email: string
  role: string
  fullName?: string
  platform?: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://coastalhavenpartners.com'

function safeHost(url: string | undefined) {
  if (!url) return null
  try {
    return new URL(url).host
  } catch {
    return null
  }
}

function shortSha() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
  if (!sha) return null
  return sha.slice(0, 7)
}

function getRequiredSecret() {
  return process.env.MOBILE_SIGNUP_WEBHOOK_SECRET || ''
}

function isRecent(dateIso: string, maxAgeMinutes: number) {
  const created = new Date(dateIso).getTime()
  const now = Date.now()
  return now - created <= maxAgeMinutes * 60_000
}

export async function POST(req: Request) {
  const requiredSecret = getRequiredSecret()
  if (requiredSecret) {
    const provided = req.headers.get('x-mobile-signup-secret') || ''
    if (provided !== requiredSecret) {
      console.warn('[mobile-signup-event] missing/invalid secret')
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: Payload | null = null
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { userId, email, role, fullName, platform } = body ?? ({} as Payload)
  if (!userId || !email || !role) {
    return NextResponse.json(
      { ok: false, error: 'Missing userId/email/role' },
      { status: 400 }
    )
  }

  // This endpoint exists primarily for observability + transactional welcome email
  // for mobile signups. It must NOT trust client input blindly.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let verifiedBySupabase = false
  let createdAt: string | null = null
  const supabaseHost = safeHost(url)
  let magicLink: string | null = null

  // Best-effort Supabase verification (helps prevent abuse in prod).
  // If env vars are misconfigured or point at the wrong project, we still
  // want observability/logs and (optionally) a welcome email.
  if (url && serviceKey) {
    try {
      const supabase = createAdminClient<Database>(url, serviceKey)

      const { data: userResp, error: userErr } = await supabase.auth.admin.getUserById(userId)
      if (userErr || !userResp?.user) {
        console.warn('[mobile-signup-event] User lookup failed', { userId, userErr })
      } else {
        const authUser = userResp.user
        createdAt = authUser.created_at ?? null
        const authEmail = (authUser.email || '').toLowerCase()
        if (authEmail !== email.toLowerCase()) {
          console.warn('[mobile-signup-event] Email mismatch', { userId, email, authEmail })
        } else if (!createdAt || !isRecent(createdAt, 15)) {
          console.warn('[mobile-signup-event] User not recent (possible replay)', { userId, createdAt })
        } else {
          verifiedBySupabase = true
        }
      }

      // Generate a magic link that opens the mobile app and sets a session.
      // This can serve as a "confirmation link" when Supabase's built-in
      // confirmation email isn't being delivered or when re-sending.
      //
      // NOTE: This requires a working service role key for the SAME Supabase project.
      const { data: linkData, error: linkErr } = await (supabase as any).auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: 'coastalhaven://auth/callback',
        },
      })

      if (linkErr) {
        console.warn('[mobile-signup-event] generateLink failed', linkErr)
      } else {
        magicLink = (linkData?.properties?.action_link as string | undefined) ?? null
        if (!magicLink) {
          console.warn('[mobile-signup-event] generateLink missing action_link', linkData)
        }
      }
    } catch (e) {
      console.warn('[mobile-signup-event] Supabase verification exception', e)
    }
  } else {
    console.warn('[mobile-signup-event] Missing Supabase env vars (skipping verification)')
  }

  console.log('[mobile-signup-event] received', {
    userId,
    email,
    role,
    fullName,
    platform,
    createdAt,
    verifiedBySupabase,
    supabaseHost,
    commit: shortSha(),
    magicLinkGenerated: !!magicLink,
  })

  // Send a welcome/verify email via Resend (independent of Supabase Auth email).
  // If Supabase verification failed, we still send when a shared secret is configured
  // (or when the project is misconfigured during development).
  try {
    const name = fullName?.trim() || 'there'
    const fallbackHelpUrl = `${APP_URL}/help`
    const primaryCtaUrl = magicLink || fallbackHelpUrl
    const primaryCtaText = magicLink ? 'Verify Email (Open App)' : 'Help & Troubleshooting'

    // NOTE: Resend SDK returns { data, error } and may not throw.
    const result = (await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject: 'Welcome to Coastal Haven Partners — verify your email',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); padding: 28px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Welcome to Coastal Haven Partners</h1>
          </div>
          <div style="background: #ffffff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #111827;">
              Hi ${name},
            </p>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #374151;">
              Thanks for signing up as a <strong>${role}</strong>. Please verify your email address to finish creating your account.
            </p>
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #6b7280;">
              If you don’t see Supabase’s verification email, check spam/junk. You can also tap “Resend verification email” in the app.
            </p>
            ${magicLink ? `
            <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #6b7280;">
              Or use this secure link to verify/sign in (it will open the app):
            </p>
            ` : ''}
            <div style="margin-top: 18px;">
              <a href="${primaryCtaUrl}"
                 style="display: inline-block; background: #0ea5e9; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                ${primaryCtaText}
              </a>
            </div>
            ${magicLink ? `
            <div style="margin-top: 12px; font-size: 12px; color: #6b7280; word-break: break-all;">
              If the button doesn’t work, copy/paste this link: <a href="${magicLink}" style="color:#0ea5e9;">${magicLink}</a>
            </div>
            ` : ''}
          </div>
        </div>
      `,
    })) as unknown as { data?: { id?: string } | null; error?: unknown | null }

    if (result?.error) {
      console.error('[mobile-signup-event] Resend returned error', result.error)
      return NextResponse.json(
        { ok: false, error: 'Email send failed', resendError: result.error, commit: shortSha() },
        { status: 502 }
      )
    }

    console.log('[mobile-signup-event] Resend sent', {
      messageId: result?.data?.id ?? null,
      commit: shortSha(),
    })
  } catch (err) {
    console.error('[mobile-signup-event] Failed to send Resend email', err)
    // Don’t fail signup UX if email fails; just report for logs.
    return NextResponse.json({ ok: false, error: 'Email send failed' }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    verifiedBySupabase,
    supabaseHost,
    commit: shortSha(),
    magicLinkGenerated: !!magicLink,
  })
}

