import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail, Linkedin, GraduationCap, TrendingUp } from 'lucide-react'

export default async function SchoolDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const status = typeof params.status === 'string' ? params.status : undefined
  const major = typeof params.major === 'string' ? params.major : undefined

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

  if (profile?.role !== 'school_admin') {
    redirect('/login')
  }

  // Check if school admin is approved
  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('is_approved, school_name, department_name')
    .eq('user_id', user.id)
    .single()

  if (!schoolProfile?.is_approved) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
          <GraduationCap className="h-8 w-8 text-yellow-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Pending Approval</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Your career services account is pending approval from our team.
        </p>
        <div className="mt-6 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
          <p className="text-sm font-medium">What happens next?</p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            We'll verify your school affiliation and activate your account within 24-48 hours.
          </p>
        </div>
      </div>
    )
  }

  // Fetch students from this school
  let query = supabase
    .from('candidate_profiles')
    .select(`
      id,
      school_name,
      major,
      gpa,
      graduation_year,
      target_roles,
      preferred_locations,
      status,
      education_level,
      profiles:user_id (
        full_name,
        email,
        linkedin_url
      )
    `)
    .eq('school_name', schoolProfile.school_name)

  if (status) {
    query = query.eq('status', status)
  }
  if (major) {
    query = query.ilike('major', `%${major}%`)
  }

  const { data: students } = await query.order('gpa', { ascending: false })

  // Get some statistics
  const { count: totalCount } = await supabase
    .from('candidate_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('school_name', schoolProfile.school_name)

  const { count: verifiedCount } = await supabase
    .from('candidate_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('school_name', schoolProfile.school_name)
    .eq('status', 'verified')

  const { count: placedCount } = await supabase
    .from('candidate_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('school_name', schoolProfile.school_name)
    .eq('status', 'placed')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {schoolProfile.school_name} - {schoolProfile.department_name}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Students</p>
              <p className="text-2xl font-bold">{totalCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Verified</p>
              <p className="text-2xl font-bold">{verifiedCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Placed</p>
              <p className="text-2xl font-bold">{placedCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <form className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="status" className="mb-2 block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(e) => {
                const form = e.currentTarget.form
                if (form) {
                  const formData = new FormData(form)
                  const params = new URLSearchParams()
                  formData.forEach((value, key) => {
                    if (value) params.set(key, value.toString())
                  })
                  window.location.href = `?${params.toString()}`
                }
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="active">Active</option>
              <option value="placed">Placed</option>
            </select>
          </div>

          <div>
            <label htmlFor="major" className="mb-2 block text-sm font-medium">
              Major
            </label>
            <input
              type="text"
              id="major"
              name="major"
              defaultValue={major}
              placeholder="e.g., Computer Science"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onBlur={(e) => {
                const form = e.currentTarget.form
                if (form) {
                  const formData = new FormData(form)
                  const params = new URLSearchParams()
                  formData.forEach((value, key) => {
                    if (value) params.set(key, value.toString())
                  })
                  window.location.href = `?${params.toString()}`
                }
              }}
            />
          </div>
        </form>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
                <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Grad Year</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Target Roles</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students && students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{student.profiles?.full_name}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {student.profiles?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{student.major}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {student.gpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{student.graduation_year}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                        ${student.status === 'verified'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                          : student.status === 'placed'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
                          : student.status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'}
                      `}>
                        {(student.status || 'pending_verification').replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.target_roles && student.target_roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {student.target_roles.slice(0, 2).map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                            >
                              {role}
                            </span>
                          ))}
                          {student.target_roles.length > 2 && (
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">
                              +{student.target_roles.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {student.profiles?.linkedin_url && (
                          <a
                            href={student.profiles.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            title="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        <a
                          href={`mailto:${student.profiles?.email}`}
                          className="text-blue-600 hover:underline"
                          title="Email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-600 dark:text-neutral-400">
                    No students found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
