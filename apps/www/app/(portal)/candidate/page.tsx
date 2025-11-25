import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CandidateDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Redirect recruiters to recruiter dashboard
  if (profile?.role === 'recruiter') {
    redirect('/recruiter')
  }

  // Fetch candidate profile
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select(`
      *,
      profiles!user_id (
        full_name,
        email
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
          <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Profile Setup Incomplete</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          Your candidate profile wasn't created during signup. This might be due to a temporary issue.
        </p>
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium">What to do next:</p>
          <ol className="text-sm text-left max-w-sm mx-auto space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Try logging out and logging back in</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>If the issue persists, contact support at support@coastalhavenpartners.com</span>
            </li>
          </ol>
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/login">Log Out</Link>
          </Button>
          <Button asChild>
            <a href="mailto:support@coastalhavenpartners.com">Contact Support</a>
          </Button>
        </div>
      </div>
    )
  }

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {candidateProfile.profiles?.full_name}</h1>
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
                {statusMessages[candidateProfile.status || 'pending_verification']}
              </p>
            </div>
            <span className={`rounded-full px-4 py-2 text-sm font-medium ${statusColors[candidateProfile.status || 'pending_verification']}`}>
              {(candidateProfile.status || 'pending_verification').replace(/_/g, ' ').toUpperCase()}
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

      {/* Profile Details */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Your Profile</h2>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Email</p>
            <p className="mt-1 font-medium">{candidateProfile.profiles?.email}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">School</p>
            <p className="mt-1 font-medium">{candidateProfile.school_name}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Major</p>
            <p className="mt-1 font-medium">{candidateProfile.major}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">GPA</p>
            <p className="mt-1 font-medium">{candidateProfile.gpa.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Graduation Year</p>
            <p className="mt-1 font-medium">{candidateProfile.graduation_year}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Education Level</p>
            <p className="mt-1 font-medium capitalize">
              {candidateProfile.education_level || 'Bachelors'}
            </p>
          </div>
        </div>

        {candidateProfile.target_roles && candidateProfile.target_roles.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Target Roles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {candidateProfile.target_roles.map((role) => (
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

        {candidateProfile.preferred_locations && candidateProfile.preferred_locations.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Preferred Locations</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {candidateProfile.preferred_locations.map((location) => (
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
      {candidateProfile.status === 'pending_verification' && (
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
                  Add target roles and preferred locations
                </p>
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Success message for verified candidates */}
      {candidateProfile.status === 'verified' && (
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
