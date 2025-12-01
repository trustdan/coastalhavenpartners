import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { VerificationCard } from './verification-card'
import type { Database } from '@/lib/types/database.types'

type EducationLevel = 'bachelors' | 'masters' | 'mba' | 'phd'

export interface TranscriptRecord {
  id: string
  transcript_url: string
  education_level: EducationLevel
  school_name: string | null
  degree_type: string | null
  gpa: number | null
  is_verified: boolean | null
  gpa_verified: boolean | null
}

export default async function AdminVerificationPage() {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Use admin client to bypass RLS for admin operations
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Verify user has admin role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/login')
  }

  // Fetch candidates with documents that need verification
  const { data: candidates } = await supabaseAdmin
    .from('candidate_profiles')
    .select(`
      id,
      school_name,
      major,
      gpa,
      graduation_year,
      resume_url,
      resume_verified,
      gpa_verified,
      user_id
    `)
    .eq('is_rejected', false)
    .order('created_at', { ascending: false })

  // Fetch all transcripts from the new table
  const candidateIds = candidates?.map(c => c.id).filter(Boolean) || []
  const { data: allTranscripts } = candidateIds.length > 0
    ? await supabaseAdmin
        .from('candidate_transcripts')
        .select('*')
        .in('candidate_profile_id', candidateIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Fetch profiles for the candidates
  const userIds = (candidates?.map(c => c.user_id).filter((id): id is string => id !== null) || [])
  const { data: profiles } = userIds.length > 0
    ? await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)
    : { data: [] }

  // Combine candidates with their profiles and transcripts
  const candidatesWithProfiles = candidates?.map(candidate => ({
    ...candidate,
    profiles: profiles?.find(p => p.id === candidate.user_id) || null,
    transcripts: (allTranscripts?.filter(t => t.candidate_profile_id === candidate.id) || []) as TranscriptRecord[]
  })) || []

  // Filter: show candidates with pending resume OR any pending transcripts
  const pendingVerification = candidatesWithProfiles.filter(c => {
    const hasUnverifiedResume = c.resume_url && !c.resume_verified
    const hasUnverifiedTranscripts = c.transcripts.some(t => !t.is_verified)
    const hasUnverifiedGpa = c.transcripts.some(t => t.is_verified && t.gpa && !t.gpa_verified)
    return hasUnverifiedResume || hasUnverifiedTranscripts || hasUnverifiedGpa
  })

  const fullyVerified = candidatesWithProfiles.filter(c => {
    const resumeOk = !c.resume_url || c.resume_verified
    const transcriptsOk = c.transcripts.length === 0 || c.transcripts.every(t => t.is_verified)
    const gpasOk = c.transcripts.every(t => !t.gpa || t.gpa_verified)
    return resumeOk && transcriptsOk && gpasOk && c.transcripts.length > 0
  })

  // Stats
  const pendingResumeCount = candidatesWithProfiles.filter(c => c.resume_url && !c.resume_verified).length
  const pendingTranscriptCount = allTranscripts?.filter(t => !t.is_verified).length || 0
  const pendingGpaCount = allTranscripts?.filter(t => t.is_verified && t.gpa && !t.gpa_verified).length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Document Verification</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Review and verify candidate documents
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
          <p className="text-2xl font-bold">{pendingVerification.length}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Pending Review</p>
        </div>
        <div className="rounded-xl border bg-yellow-50 p-4 shadow-sm dark:bg-yellow-900/20">
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pendingResumeCount}</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Resumes</p>
        </div>
        <div className="rounded-xl border bg-blue-50 p-4 shadow-sm dark:bg-blue-900/20">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{pendingTranscriptCount}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Transcripts</p>
        </div>
        <div className="rounded-xl border bg-purple-50 p-4 shadow-sm dark:bg-purple-900/20">
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{pendingGpaCount}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">GPA Confirmations</p>
        </div>
      </div>

      {/* Pending Verification Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Verification</h2>
        {pendingVerification.length === 0 ? (
          <div className="rounded-xl border bg-green-50 p-8 text-center dark:bg-green-900/20">
            <p className="text-green-700 dark:text-green-300">
              All documents have been verified! Great work.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingVerification.map((candidate) => (
              <VerificationCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
      </div>

      {/* Recently Verified */}
      {fullyVerified.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-300">
            Fully Verified ({fullyVerified.length})
          </h2>
          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 dark:border-green-900/50 dark:bg-green-900/10">
            <div className="divide-y">
              {fullyVerified.slice(0, 5).map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{candidate.profiles?.full_name}</p>
                    <p className="text-sm text-neutral-500">
                      {candidate.school_name} · {candidate.major} · {candidate.gpa.toFixed(2)} GPA
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <span>All verified</span>
                  </div>
                </div>
              ))}
              {fullyVerified.length > 5 && (
                <p className="pt-3 text-sm text-neutral-500">
                  And {fullyVerified.length - 5} more fully verified candidates
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
