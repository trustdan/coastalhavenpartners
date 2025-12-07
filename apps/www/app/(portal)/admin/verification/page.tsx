import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { VerificationCard } from './verification-card'
import { AutoVerificationCard } from './auto-verification-card'
import { ResumeVerificationCard } from './resume-verification-card'
import { BulkVerifyButton, ReprocessFlaggedButton } from './bulk-verify-button'
import { ResumeBulkVerifyButton, ResumeReprocessFlaggedButton } from './resume-bulk-verify-button'
import type { Database } from '@/lib/types/database.types'

type EducationLevel = 'bachelors' | 'masters' | 'mba' | 'phd' | 'professional'

export interface TranscriptVerification {
  id: string
  status: string
  extracted_gpa: number | null
  extraction_confidence: string | null
  extraction_reasoning: string | null
  gpa_match: boolean | null
  gpa_difference: number | null
}

export interface TranscriptRecord {
  id: string
  transcript_url: string
  education_level: EducationLevel
  school_name: string | null
  degree_type: string | null
  gpa: number | null
  is_verified: boolean | null
  gpa_verified: boolean | null
  verification?: TranscriptVerification | null
}

export interface ResumeRecord {
  id: string
  resume_url: string
  label: string
  is_verified: boolean | null
  is_default: boolean | null
}

export default async function AdminVerificationPage() {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Use typed admin client for existing tables
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

  // Use untyped admin client for new transcript_verifications table
  // (types will be available after running `pnpm supabase gen types`)
  const supabaseAdminUntyped = createAdminClient(
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
      gpa_verified,
      user_id
    `)
    .eq('is_rejected', false)
    .order('created_at', { ascending: false })

  // Fetch all transcripts from the transcripts table
  const candidateIds = candidates?.map(c => c.id).filter(Boolean) || []
  const { data: allTranscripts } = candidateIds.length > 0
    ? await supabaseAdmin
        .from('candidate_transcripts')
        .select('*')
        .in('candidate_profile_id', candidateIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Fetch all resumes from the resumes table
  const { data: allResumes } = candidateIds.length > 0
    ? await supabaseAdmin
        .from('candidate_resumes')
        .select('*')
        .in('candidate_profile_id', candidateIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Fetch verification data for all transcripts
  const transcriptIds = allTranscripts?.map(t => t.id).filter(Boolean) || []
  const { data: transcriptVerifications } = transcriptIds.length > 0
    ? await supabaseAdminUntyped
        .from('transcript_verifications')
        .select('id, transcript_id, status, extracted_gpa, extraction_confidence, extraction_reasoning, gpa_match, gpa_difference')
        .in('transcript_id', transcriptIds)
    : { data: [] }

  // Create a map of transcript_id -> verification
  const verificationMap = new Map(
    transcriptVerifications?.map((v: any) => [v.transcript_id, v]) || []
  )

  // Fetch profiles for the candidates
  const userIds = (candidates?.map(c => c.user_id).filter((id): id is string => id !== null) || [])
  const { data: profiles } = userIds.length > 0
    ? await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)
    : { data: [] }

  // Combine candidates with their profiles, transcripts, and resumes
  const candidatesWithProfiles = candidates?.map(candidate => ({
    ...candidate,
    profiles: profiles?.find(p => p.id === candidate.user_id) || null,
    transcripts: (allTranscripts?.filter(t => t.candidate_profile_id === candidate.id) || []).map(t => ({
      ...t,
      verification: verificationMap.get(t.id) || null
    })) as TranscriptRecord[],
    resumes: (allResumes?.filter(r => r.candidate_profile_id === candidate.id) || []) as ResumeRecord[]
  })) || []

  // Filter: show candidates with pending resumes OR any pending transcripts
  const pendingVerification = candidatesWithProfiles.filter(c => {
    const hasUnverifiedResume = c.resumes.some(r => !r.is_verified)
    const hasUnverifiedTranscripts = c.transcripts.some(t => !t.is_verified)
    const hasUnverifiedGpa = c.transcripts.some(t => t.is_verified && t.gpa && !t.gpa_verified)
    return hasUnverifiedResume || hasUnverifiedTranscripts || hasUnverifiedGpa
  })

  const fullyVerified = candidatesWithProfiles.filter(c => {
    const resumesOk = c.resumes.length === 0 || c.resumes.every(r => r.is_verified)
    const transcriptsOk = c.transcripts.length === 0 || c.transcripts.every(t => t.is_verified)
    const gpasOk = c.transcripts.every(t => !t.gpa || t.gpa_verified)
    return resumesOk && transcriptsOk && gpasOk && (c.transcripts.length > 0 || c.resumes.length > 0)
  })

  // Stats
  const pendingResumeCount = allResumes?.filter(r => !r.is_verified).length || 0
  const pendingTranscriptCount = allTranscripts?.filter(t => !t.is_verified).length || 0
  const pendingGpaCount = allTranscripts?.filter(t => t.is_verified && t.gpa && !t.gpa_verified).length || 0

  // Fetch auto-verification queue (flagged/error items that need review)
  // Using untyped client since transcript_verifications table isn't in types yet
  const { data: autoVerificationQueue } = await supabaseAdminUntyped
    .from('transcript_verifications')
    .select(`
      *,
      candidate_profiles(
        id,
        gpa,
        school_name,
        user_id
      )
    `)
    .in('status', ['flagged', 'error'])
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch user profiles for the auto-verification queue
  const autoVerificationUserIds = autoVerificationQueue
    ?.map(v => v.candidate_profiles?.user_id)
    .filter((id): id is string => id !== null) || []

  const { data: autoVerificationProfiles } = autoVerificationUserIds.length > 0
    ? await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', autoVerificationUserIds)
    : { data: [] }

  const autoProfileMap = new Map(autoVerificationProfiles?.map(p => [p.id, p]) || [])

  const autoVerificationsWithProfiles = autoVerificationQueue?.map(v => ({
    ...v,
    profile: v.candidate_profiles?.user_id
      ? autoProfileMap.get(v.candidate_profiles.user_id)
      : null,
  })) || []

  // Fetch transcript URLs for the auto-verification queue
  const autoTranscriptIds = autoVerificationQueue
    ?.map(v => v.transcript_id)
    .filter((id): id is string => id !== null) || []

  const { data: autoTranscripts } = autoTranscriptIds.length > 0
    ? await supabaseAdmin
        .from('candidate_transcripts')
        .select('id, transcript_url')
        .in('id', autoTranscriptIds)
    : { data: [] }

  const transcriptUrlMap = new Map(autoTranscripts?.map(t => [t.id, t.transcript_url]) || [])

  // Fetch auto-verification stats
  const { data: allAutoVerifications } = await supabaseAdminUntyped
    .from('transcript_verifications')
    .select('status')

  const autoStats = {
    total: allAutoVerifications?.length || 0,
    autoVerified: allAutoVerifications?.filter(v => v.status === 'auto_verified').length || 0,
    flagged: allAutoVerifications?.filter(v => v.status === 'flagged').length || 0,
    manuallyVerified: allAutoVerifications?.filter(v => v.status === 'manually_verified').length || 0,
    error: allAutoVerifications?.filter(v => v.status === 'error').length || 0,
  }

  // =============================================
  // RESUME AUTO-VERIFICATION DATA
  // =============================================

  // Fetch resume auto-verification queue (flagged/error items that need review)
  const { data: resumeVerificationQueue } = await supabaseAdminUntyped
    .from('resume_verifications')
    .select(`
      *,
      candidate_profiles(
        id,
        school_name,
        user_id
      )
    `)
    .in('status', ['flagged', 'error'])
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch user profiles for the resume verification queue
  const resumeVerificationUserIds = resumeVerificationQueue
    ?.map((v: any) => v.candidate_profiles?.user_id)
    .filter((id: any): id is string => id !== null) || []

  const { data: resumeVerificationProfiles } = resumeVerificationUserIds.length > 0
    ? await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', resumeVerificationUserIds)
    : { data: [] }

  const resumeProfileMap = new Map(resumeVerificationProfiles?.map(p => [p.id, p]) || [])

  const resumeVerificationsWithProfiles = resumeVerificationQueue?.map((v: any) => ({
    ...v,
    profile: v.candidate_profiles?.user_id
      ? resumeProfileMap.get(v.candidate_profiles.user_id)
      : null,
  })) || []

  // Fetch resume URLs for the resume verification queue
  const resumeVerificationResumeIds = resumeVerificationQueue
    ?.map((v: any) => v.resume_id)
    .filter((id: any): id is string => id !== null) || []

  const { data: verificationResumes } = resumeVerificationResumeIds.length > 0
    ? await supabaseAdmin
        .from('candidate_resumes')
        .select('id, resume_url')
        .in('id', resumeVerificationResumeIds)
    : { data: [] }

  const resumeUrlMap = new Map(verificationResumes?.map(r => [r.id, r.resume_url]) || [])

  // Fetch resume auto-verification stats
  const { data: allResumeVerifications } = await supabaseAdminUntyped
    .from('resume_verifications')
    .select('status')

  const resumeAutoStats = {
    total: allResumeVerifications?.length || 0,
    autoVerified: allResumeVerifications?.filter((v: any) => v.status === 'auto_verified').length || 0,
    flagged: allResumeVerifications?.filter((v: any) => v.status === 'flagged').length || 0,
    manuallyVerified: allResumeVerifications?.filter((v: any) => v.status === 'manually_verified').length || 0,
    error: allResumeVerifications?.filter((v: any) => v.status === 'error').length || 0,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Verification</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Review and verify candidate documents
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Transcript buttons */}
          <ReprocessFlaggedButton />
          <BulkVerifyButton />
          {/* Resume buttons */}
          <ResumeReprocessFlaggedButton />
          <ResumeBulkVerifyButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
          <p className="text-2xl font-bold">{pendingVerification.length}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Manual Review</p>
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

      {/* AI Verification Stats Grid */}
      {(autoStats.total > 0 || resumeAutoStats.total > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Transcript Auto-Verification Stats */}
          {autoStats.total > 0 && (
            <div className="rounded-xl border bg-linear-to-r from-purple-50 to-blue-50 p-4 dark:from-purple-900/20 dark:to-blue-900/20">
              <h3 className="flex items-center gap-2 font-semibold text-purple-900 dark:text-purple-100">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                Transcript GPA Verification
              </h3>
              <div className="mt-3 grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{autoStats.autoVerified}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Auto-Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{autoStats.flagged}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Flagged</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{autoStats.manuallyVerified}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Manually Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{autoStats.error}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Errors</p>
                </div>
              </div>
            </div>
          )}

          {/* Resume Auto-Verification Stats */}
          {resumeAutoStats.total > 0 && (
            <div className="rounded-xl border bg-linear-to-r from-emerald-50 to-teal-50 p-4 dark:from-emerald-900/20 dark:to-teal-900/20">
              <h3 className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-100">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                  <path d="M16 13H8"/>
                  <path d="M16 17H8"/>
                  <path d="M10 9H8"/>
                </svg>
                Resume Authenticity Verification
              </h3>
              <div className="mt-3 grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{resumeAutoStats.autoVerified}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Auto-Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{resumeAutoStats.flagged}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Flagged</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{resumeAutoStats.manuallyVerified}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Manually Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{resumeAutoStats.error}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Errors</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transcript Auto-Verification Queue (Flagged/Errors) */}
      {autoVerificationsWithProfiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-amber-700 dark:text-amber-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            Transcript GPA Flagged for Review ({autoVerificationsWithProfiles.length})
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            These transcripts were processed by AI but need manual review due to mismatches or low confidence.
          </p>
          <div className="space-y-4">
            {autoVerificationsWithProfiles.map((verification) => (
              <AutoVerificationCard
                key={verification.id}
                verification={verification as any}
                transcriptUrl={verification.transcript_id ? transcriptUrlMap.get(verification.transcript_id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resume Auto-Verification Queue (Flagged/Errors) */}
      {resumeVerificationsWithProfiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-emerald-700 dark:text-emerald-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M12 18v-6"/>
              <path d="M9 15l3 3 3-3"/>
            </svg>
            Resumes Flagged for Review ({resumeVerificationsWithProfiles.length})
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            These resumes were flagged as potentially fake or invalid. Review for placeholder names, fake phone numbers, or non-resume documents.
          </p>
          <div className="space-y-4">
            {resumeVerificationsWithProfiles.map((verification: any) => (
              <ResumeVerificationCard
                key={verification.id}
                verification={verification}
                resumeUrl={verification.resume_id ? resumeUrlMap.get(verification.resume_id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

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
