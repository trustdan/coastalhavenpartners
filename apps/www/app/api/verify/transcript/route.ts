import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

/**
 * API endpoint for triggering transcript/GPA verification from mobile app
 * POST /api/verify/transcript
 * Body: { transcriptId: string }
 *
 * Requires authenticated user via Bearer token or Supabase session
 */
export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create Supabase client with the user's token
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { transcriptId } = body

    if (!transcriptId) {
      return NextResponse.json(
        { success: false, error: 'Missing transcriptId in request body' },
        { status: 400 }
      )
    }

    // Use admin client to verify ownership
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the transcript belongs to this user
    const { data: transcript, error: transcriptError } = await supabaseAdmin
      .from('candidate_transcripts')
      .select('id, candidate_profile_id, user_id, gpa')
      .eq('id', transcriptId)
      .single()

    if (transcriptError || !transcript) {
      return NextResponse.json(
        { success: false, error: 'Transcript not found' },
        { status: 404 }
      )
    }

    if (transcript.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Only verify if transcript has a GPA entered
    if (transcript.gpa === null) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'No GPA entered - verification will happen when GPA is provided',
      })
    }

    // Trigger verification in the background
    try {
      const { verifyTranscript } = await import('@/lib/transcript-verification')

      // Run verification asynchronously - don't await
      verifyTranscript(transcript.candidate_profile_id, transcriptId)
        .then((result) => {
          console.log('[API/verify/transcript] Completed for transcript', transcriptId, result.status)
        })
        .catch((error) => {
          console.error('[API/verify/transcript] Failed for transcript', transcriptId, error)
        })

      return NextResponse.json({
        success: true,
        message: 'Verification started',
      })
    } catch (error) {
      console.error('[API/verify/transcript] Error starting verification:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to start verification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[API/verify/transcript] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
