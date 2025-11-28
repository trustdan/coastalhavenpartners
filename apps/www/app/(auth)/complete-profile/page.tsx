'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2, GraduationCap, Briefcase, Building2 } from 'lucide-react'

type UserRole = 'candidate' | 'recruiter' | 'school_admin'

interface RoleOption {
  id: UserRole
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

const roleOptions: RoleOption[] = [
  {
    id: 'candidate',
    title: "I'm a Student",
    description: 'Looking for finance internships and full-time roles',
    icon: <GraduationCap className="h-8 w-8" />,
    href: '/complete-profile/candidate',
  },
  {
    id: 'recruiter',
    title: "I'm a Recruiter",
    description: 'Hiring for finance positions at my firm',
    icon: <Briefcase className="h-8 w-8" />,
    href: '/complete-profile/recruiter',
  },
  {
    id: 'school_admin',
    title: "I'm Career Services",
    description: 'Supporting students at my university',
    icon: <Building2 className="h-8 w-8" />,
    href: '/complete-profile/school',
  },
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check if user already has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role) {
        // User already has a profile, redirect to dashboard
        if (profile.role === 'candidate') router.push('/candidate')
        else if (profile.role === 'recruiter') router.push('/recruiter')
        else if (profile.role === 'school_admin') router.push('/school')
        else if (profile.role === 'admin') router.push('/admin')
        return
      }

      setUser({
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
      })
      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4 dark:from-neutral-950 dark:to-neutral-900">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Back to Home
      </Link>

      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Welcome{user?.name ? `, ${user.name}` : ''}! Tell us who you are to get started.
          </p>
          {user?.email && (
            <p className="mt-1 text-sm text-neutral-500">
              Signed in as {user.email}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {roleOptions.map((role) => (
            <Link key={role.id} href={role.href}>
              <div className="group relative flex h-full cursor-pointer flex-col items-center rounded-xl border bg-white p-6 text-center shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:bg-neutral-950 dark:hover:border-blue-400">
                <div className="mb-4 rounded-full bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:group-hover:bg-blue-900">
                  {role.icon}
                </div>
                <h3 className="font-semibold">{role.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {role.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
