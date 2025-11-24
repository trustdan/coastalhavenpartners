import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Award,
} from 'lucide-react'

export default async function RecruiterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

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

  if (profile?.role !== 'candidate') {
    redirect('/recruiter')
  }

  // Fetch recruiter profile
  const { data: recruiter, error } = await supabase
    .from('recruiter_profiles')
    .select(`
      *,
      profiles!recruiter_profiles_user_id_fkey (
        full_name,
        email,
        phone,
        linkedin_url
      )
    `)
    .eq('id', id)
    .eq('is_visible_to_candidates', true)
    .eq('is_approved', true)
    .single()

  if (error || !recruiter) {
    notFound()
  }

  // Helper function to check if a field is visible
  const isFieldVisible = (field: string) => {
    const visibleFields = recruiter.visible_fields_to_candidates as Record<string, boolean> | null
    return visibleFields?.[field] === true
  }

  // Track profile view
  await supabase.from('analytics_events').insert({
    event_type: 'profile_view',
    user_id: user.id,
    target_id: recruiter.user_id,
    metadata: {
      viewer_role: 'candidate',
      recruiter_profile_id: recruiter.id,
    },
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/candidate/recruiters">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Recruiter Profile</h1>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-xl border bg-white p-8 shadow-sm dark:bg-neutral-900">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Photo Placeholder */}
          {isFieldVisible('profile_photo_url') && (
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {isFieldVisible('full_name') && recruiter.profiles?.full_name
                  ? recruiter.profiles.full_name.charAt(0).toUpperCase()
                  : 'R'}
              </div>
            </div>
          )}

          {/* Profile Info */}
          <div className="flex-1">
            {isFieldVisible('full_name') && (
              <h2 className="text-2xl font-bold">{recruiter.profiles?.full_name}</h2>
            )}

            {isFieldVisible('job_title') && (
              <p className="mt-1 text-lg text-neutral-600 dark:text-neutral-400">
                {recruiter.job_title}
              </p>
            )}

            <div className="mt-4 space-y-2">
              {isFieldVisible('firm_name') && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-neutral-400" />
                  <span className="font-medium">{recruiter.firm_name}</span>
                  {isFieldVisible('firm_type') && recruiter.firm_type && (
                    <span className="text-neutral-600 dark:text-neutral-400">
                      • {recruiter.firm_type}
                    </span>
                  )}
                </div>
              )}

              {isFieldVisible('locations') &&
                recruiter.locations &&
                recruiter.locations.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <span>{recruiter.locations.join(', ')}</span>
                  </div>
                )}

              {isFieldVisible('years_experience') && recruiter.years_experience && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-neutral-400" />
                  <span>{recruiter.years_experience} years of experience</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {isFieldVisible('bio') && recruiter.bio && (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h3 className="text-lg font-semibold mb-3">About</h3>
          <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
            {recruiter.bio}
          </p>
        </div>
      )}

      {/* Specialties */}
      {isFieldVisible('specialties') &&
        recruiter.specialties &&
        recruiter.specialties.length > 0 && (
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h3 className="text-lg font-semibold mb-3">Recruiting For</h3>
            <div className="flex flex-wrap gap-2">
              {recruiter.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* Contact Information */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="space-y-3">
          {isFieldVisible('email') && recruiter.profiles?.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-neutral-400" />
              <a
                href={`mailto:${recruiter.profiles.email}`}
                className="text-blue-600 hover:underline"
              >
                {recruiter.profiles.email}
              </a>
            </div>
          )}

          {isFieldVisible('phone') && recruiter.profiles?.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-neutral-400" />
              <a
                href={`tel:${recruiter.profiles.phone}`}
                className="text-blue-600 hover:underline"
              >
                {recruiter.profiles.phone}
              </a>
            </div>
          )}

          {isFieldVisible('linkedin_url') && recruiter.linkedin_url && (
            <div className="flex items-center gap-3">
              <Linkedin className="h-5 w-5 text-neutral-400" />
              <a
                href={recruiter.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LinkedIn Profile
              </a>
            </div>
          )}

          {isFieldVisible('company_website') && recruiter.company_website && (
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-neutral-400" />
              <a
                href={recruiter.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Company Website
              </a>
            </div>
          )}

          {!isFieldVisible('email') &&
            !isFieldVisible('phone') &&
            !isFieldVisible('linkedin_url') &&
            !isFieldVisible('company_website') && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                This recruiter has not made contact information public. They may reach out
                to you directly if interested.
              </p>
            )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button asChild className="flex-1">
          <Link href="/candidate/recruiters">Back to Directory</Link>
        </Button>
        {isFieldVisible('email') && recruiter.profiles?.email && (
          <Button asChild variant="outline" className="flex-1">
            <a href={`mailto:${recruiter.profiles.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Contact Recruiter
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
