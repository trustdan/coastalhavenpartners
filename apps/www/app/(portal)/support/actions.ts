'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { createHash } from 'crypto'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5 // Max 5 submissions per minute for authenticated users

interface SubmitSupportMessageInput {
  messageType: 'technical_support' | 'feedback'
  subject: string
  message: string
}

interface SubmitSupportMessageResult {
  success: boolean
  error?: string
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex').slice(0, 32)
}

function sanitizeInput(input: string, maxLength: number = 5000): string {
  return input
    .trim()
    .slice(0, maxLength)
    // Remove potentially dangerous characters while keeping basic text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

function checkRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    // New window or expired
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const remainingTime = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, remainingTime }
  }

  record.count++
  return { allowed: true }
}

export async function submitSupportMessage(
  input: SubmitSupportMessageInput
): Promise<SubmitSupportMessageResult> {
  try {
    // 1. Require authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in to submit a message.' }
    }

    // 2. Get user profile to verify they have a valid role
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', user.id)
      .single()

    const validRoles = ['candidate', 'recruiter', 'school_admin', 'admin']
    if (!profile?.role || !validRoles.includes(profile.role)) {
      return { success: false, error: 'Please complete your profile before submitting a message.' }
    }

    // 3. Basic input validation
    if (!input.messageType || !['technical_support', 'feedback'].includes(input.messageType)) {
      return { success: false, error: 'Invalid message type' }
    }

    if (!input.subject || input.subject.trim().length < 3) {
      return { success: false, error: 'Please provide a subject (at least 3 characters)' }
    }

    if (!input.message || input.message.trim().length < 10) {
      return { success: false, error: 'Please provide a message (at least 10 characters)' }
    }

    if (input.message.length > 5000) {
      return { success: false, error: 'Message is too long (maximum 5000 characters)' }
    }

    // 4. Rate limit by user ID (more reliable than IP for authenticated users)
    const rateCheck = checkRateLimit(user.id)
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Too many submissions. Please wait ${rateCheck.remainingTime} seconds before trying again.`
      }
    }

    // 5. Get IP for logging (optional)
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIP = headersList.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0] || realIP || 'unknown'
    const ipHash = hashIP(ip)

    // 6. Sanitize inputs
    const sanitizedSubject = sanitizeInput(input.subject, 200)
    const sanitizedMessage = sanitizeInput(input.message, 5000)

    // 7. Use admin client to insert
    // Note: support_messages table types will be available after running migrations
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 8. Insert the support message with user info from session
    const { error: insertError } = await supabaseAdmin
      .from('support_messages')
      .insert({
        message_type: input.messageType,
        user_id: user.id,
        sender_name: profile.full_name || 'Unknown',
        sender_email: profile.email || user.email || 'Unknown',
        subject: sanitizedSubject,
        message: sanitizedMessage,
        ip_hash: ipHash,
        status: 'new'
      })

    if (insertError) {
      console.error('Failed to insert support message:', insertError)
      return { success: false, error: 'Failed to submit message. Please try again later.' }
    }

    return { success: true }

  } catch (error) {
    console.error('Error in submitSupportMessage:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
