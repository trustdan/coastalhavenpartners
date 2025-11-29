import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CompleteProfileForm } from './complete-profile-form'
import { AccessRevoked } from '@/components/access-revoked'
import type { Database } from '@/lib/types/database.types'
import { Building2, Clock, CheckCircle2, XCircle, MessageSquare, UserCheck } from 'lucide-react'

export default async function CandidateDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Use admin client to bypass RLS for profile checks
  // This fixes issues where RLS policies prevent users from seeing their own profiles
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

  // Check user role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  // Redirect recruiters to recruiter dashboard
  if (profile?.role === 'recruiter') {
    redirect('/recruiter')
  }

  // Fetch candidate profile (using admin client to bypass RLS issues)
  const { data: candidateProfile } = await supabaseAdmin
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) {
    // Show profile completion form instead of error
    return <CompleteProfileForm />
  }

  // Check if user is rejected/revoked
  if (candidateProfile.is_rejected) {
    return <AccessRevoked userType="candidate" email={profile?.email} />
  }

  // Combine profile data with candidate profile for display
  const fullProfile = {
    ...candidateProfile,
    profiles: profile
  }

  // Fetch Capital application status
  const { data: capitalApplication } = await supabaseAdmin
    .from('applications')
    .select('id, status, applied_at, updated_at')
    .eq('candidate_profile_id', candidateProfile.id)
    .eq('target_type', 'capital')
    .single()

  // Fetch analytics stats
  const { count: profileViewCount } = await supabase
    .from('analytics_events')
    .select('id', { count: 'exact', head: true })
    .eq('target_id', user.id)
    .eq('event_type', 'profile_view')

  const statusColors = {
    pending_verification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    verified: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
    placed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
  }

  const statusMessages = {
    pending_verification: 'We are reviewing your application',
    verified: 'Your profile is verified and visible to recruiters',
    active: 'Recruiters are viewing your profile',
    placed: 'Congratulations on your placement!',
    rejected: 'Please contact support for more information',
  }

  // Capital application status configuration
  const capitalStatusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      icon: Clock,
      message: 'Your application is in queue for review',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    reviewing: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      icon: MessageSquare,
      message: 'Our team is actively reviewing your application',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    interviewed: {
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      icon: UserCheck,
      message: 'Great progress! Interview completed, decision pending',
      bgColor: 'bg-purple-50 dark:bg-purple-900/10',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    accepted: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      icon: CheckCircle2,
      message: 'Congratulations! Welcome to Coastal Haven Capital',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    rejected: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      icon: XCircle,
      message: 'Unfortunately, we cannot move forward at this time',
      bgColor: 'bg-red-50 dark:bg-red-900/10',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    withdrawn: {
      color: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-200',
      icon: XCircle,
      message: 'You have withdrawn your application',
      bgColor: 'bg-neutral-50 dark:bg-neutral-900/10',
      borderColor: 'border-neutral-200 dark:border-neutral-800',
    },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {fullProfile.profiles?.full_name}</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Your candidate dashboard
        </p>
      </div>

      {/* Status and Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Application Status</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {statusMessages[fullProfile.status || 'pending_verification']}
              </p>
            </div>
            <span className={`rounded-full px-4 py-2 text-sm font-medium ${statusColors[fullProfile.status || 'pending_verification']}`}>
              {(fullProfile.status || 'pending_verification').replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          {!user.email_confirmed_at && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Please verify your email to complete your profile
              </p>
            </div>
          )}
        </div>

        {/* Analytics Card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">Profile Activity</h2>
          <div className="mt-4 flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold">{profileViewCount || 0}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Views</p>
            </div>
            <div className="mb-1 text-xs text-neutral-500">
              by approved recruiters
            </div>
          </div>
        </div>
      </div>

      {/* Coastal Haven Capital Application Status */}
      <div className={`rounded-xl border p-6 shadow-sm ${
        capitalApplication
          ? `${capitalStatusConfig[capitalApplication.status].bgColor} ${capitalStatusConfig[capitalApplication.status].borderColor}`
          : 'bg-white dark:bg-neutral-900'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              capitalApplication
                ? capitalStatusConfig[capitalApplication.status].color
                : 'bg-linear-to-br from-blue-500 to-purple-600'
            }`}>
              {capitalApplication ? (
                (() => {
                  const StatusIcon = capitalStatusConfig[capitalApplication.status].icon
                  return <StatusIcon className="h-6 w-6" />
                })()
              ) : (
                <Building2 className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Coastal Haven Capital</h2>
              {capitalApplication ? (
                <>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {capitalStatusConfig[capitalApplication.status].message}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    Applied on {new Date(capitalApplication.applied_at!).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    {capitalApplication.updated_at && capitalApplication.updated_at !== capitalApplication.applied_at && (
                      <> · Last updated {new Date(capitalApplication.updated_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</>
                    )}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Join our team and source real deals in private equity
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {capitalApplication ? (
              <span className={`rounded-full px-4 py-2 text-sm font-medium ${capitalStatusConfig[capitalApplication.status].color}`}>
                {capitalApplication.status.charAt(0).toUpperCase() + capitalApplication.status.slice(1)}
              </span>
            ) : (
              <Button asChild>
                <Link href="/apply/capital">Apply Now</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Your Profile</h2>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Email</p>
            <p className="mt-1 font-medium">{fullProfile.profiles?.email}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">School</p>
            <p className="mt-1 font-medium">{fullProfile.school_name}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Major</p>
            <p className="mt-1 font-medium">{fullProfile.major}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">GPA</p>
            <p className="mt-1 font-medium">{fullProfile.gpa.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Graduation Year</p>
            <p className="mt-1 font-medium">{fullProfile.graduation_year}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Education Level</p>
            <p className="mt-1 font-medium capitalize">
              {fullProfile.education_level || 'Bachelors'}
            </p>
          </div>
        </div>

        {fullProfile.target_roles && fullProfile.target_roles.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Target Roles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fullProfile.target_roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {fullProfile.preferred_locations && fullProfile.preferred_locations.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Preferred Locations</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fullProfile.preferred_locations.map((location) => (
                <span
                  key={location}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/candidate/edit-profile">Edit Profile</Link>
          </Button>
        </div>
      </div>

      {/* Next Steps (only show for pending verification) */}
      {fullProfile.status === 'pending_verification' && (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">Next Steps</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start">
              <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium dark:bg-neutral-700">
                1
              </span>
              <div>
                <p className="font-medium">Upload your resume</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Help recruiters understand your experience
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium dark:bg-neutral-700">
                2
              </span>
              <div>
                <p className="font-medium">Upload your transcript</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Verify your GPA and academic performance
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium dark:bg-neutral-700">
                3
              </span>
              <div>
                <p className="font-medium">Complete your profile</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Add graduate education, target roles, preferred locations, calendar scheduling link, and more
                </p>
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Success message for verified candidates */}
      {fullProfile.status === 'verified' && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-900/20">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Your Profile is Live!
          </h2>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            Elite recruiters from top firms can now view your profile. You'll be notified when recruiters express interest.
          </p>
        </div>
      )}
    </div>
  )
}
