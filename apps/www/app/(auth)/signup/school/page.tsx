'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createSchoolProfile } from './actions'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        fill="#0A66C2"
      />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

const DOCUMENT_TYPES = [
  { value: 'employment_letter', label: 'Employment Verification Letter (on university letterhead)' },
  { value: 'staff_id', label: 'University Staff ID / Employee Badge' },
  { value: 'accreditation_cert', label: 'School Accreditation Certificate' },
  { value: 'authorization_letter', label: 'Department Authorization Letter' },
]

export default function SchoolSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [linkedInLoading, setLinkedInLoading] = useState(false)
  const [discordLoading, setDiscordLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  async function handleGoogleSignup() {
    const supabase = createClient()
    setGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  async function handleLinkedInSignup() {
    const supabase = createClient()
    setLinkedInLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLinkedInLoading(false)
    }
  }

  async function handleDiscordSignup() {
    const supabase = createClient()
    setDiscordLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setDiscordLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const supabase = createClient()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const schoolName = formData.get('schoolName') as string
    const schoolDomain = formData.get('schoolDomain') as string
    const departmentName = formData.get('departmentName') as string
    const contactEmail = formData.get('contactEmail') as string

    // Validate document upload
    if (!documentFile || !documentType) {
      setError('Please upload a verification document and select the document type')
      setLoading(false)
      return
    }

    try {
      // Step 1: Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'school_admin',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create account')
      }

      // Step 2: Convert file to base64 for server action upload
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(documentFile)
      })

      const fileExt = documentFile.name.split('.').pop() || 'pdf'
      const fileMimeType = documentFile.type

      // Step 3: Create school profile using server action (handles upload with service role)
      await createSchoolProfile({
        userId: authData.user.id,
        email,
        fullName,
        schoolName,
        schoolDomain,
        departmentName,
        contactEmail,
        verificationDocumentType: documentType,
        verificationDocumentBase64: fileBase64,
        verificationDocumentExt: fileExt,
        verificationDocumentMimeType: fileMimeType,
      })

      // Redirect to email verification page
      router.push('/verify-email')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 py-8">
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
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Career Services Sign Up</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Connect your students with top employers
          </p>
        </div>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading || linkedInLoading || discordLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            {googleLoading ? 'Connecting...' : 'Sign up with Google'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleLinkedInSignup}
            disabled={loading || googleLoading || linkedInLoading || discordLoading}
          >
            {linkedInLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LinkedInIcon className="mr-2 h-4 w-4" />
            )}
            {linkedInLoading ? 'Connecting...' : 'Sign up with LinkedIn'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDiscordSignup}
            disabled={loading || googleLoading || linkedInLoading || discordLoading}
          >
            {discordLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DiscordIcon className="mr-2 h-4 w-4 text-[#5865F2]" />
            )}
            {discordLoading ? 'Connecting...' : 'Sign up with Discord'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-300 dark:border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="fullName">Your Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="jane@university.edu"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-4">School Information</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  required
                  placeholder="Harvard University"
                />
              </div>

              <div>
                <Label htmlFor="schoolDomain">School Email Domain</Label>
                <Input
                  id="schoolDomain"
                  name="schoolDomain"
                  type="text"
                  required
                  placeholder="harvard.edu"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Used to verify student email addresses
                </p>
              </div>

              <div>
                <Label htmlFor="departmentName">Department Name</Label>
                <Input
                  id="departmentName"
                  name="departmentName"
                  type="text"
                  required
                  placeholder="Career Services Center"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Department Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  placeholder="careers@university.edu"
                />
              </div>
            </div>
          </div>

          {/* Verification Document Section */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Verification Document</p>
            <p className="text-xs text-neutral-500 mb-4">
              To protect student data, we require verification of your employment with the university.
              Please upload one of the following documents:
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <select
                  id="documentType"
                  name="documentType"
                  required
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select document type...</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="verificationDocument">Upload Document</Label>
                <Input
                  id="verificationDocument"
                  name="verificationDocument"
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Accepted formats: PDF, JPG, PNG (max 10MB)
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> Your account will be reviewed by our team before you can access student data. 
                This typically takes 1-2 business days.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create School Account'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center text-sm">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you a student?{' '}
            <Link href="/signup/candidate" className="font-medium text-blue-600 hover:underline">
              Sign up as a candidate
            </Link>
          </p>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Are you a recruiter?{' '}
            <Link href="/signup/recruiter" className="font-medium text-blue-600 hover:underline">
              Sign up as a recruiter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
