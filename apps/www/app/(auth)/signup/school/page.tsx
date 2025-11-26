'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { createSchoolProfile } from './actions'

const DOCUMENT_TYPES = [
  { value: 'employment_letter', label: 'Employment Verification Letter (on university letterhead)' },
  { value: 'staff_id', label: 'University Staff ID / Employee Badge' },
  { value: 'accreditation_cert', label: 'School Accreditation Certificate' },
  { value: 'authorization_letter', label: 'Department Authorization Letter' },
]

export default function SchoolSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)

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
