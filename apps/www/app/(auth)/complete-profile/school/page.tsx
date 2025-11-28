'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Loader2, Upload, X } from 'lucide-react'
import { completeOAuthSchoolProfile } from './actions'

export default function CompleteSchoolProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [user, setUser] = useState<{
    id: string
    email: string
    fullName: string
  } | null>(null)

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
        if (profile.role === 'school_admin') router.push('/school')
        else router.push('/complete-profile')
        return
      }

      setUser({
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
      })
      setPageLoading(false)
    }

    checkUser()
  }, [router])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or image file')
        return
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  function removeFile() {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const schoolName = formData.get('schoolName') as string
    const schoolDomain = formData.get('schoolDomain') as string
    const departmentName = formData.get('departmentName') as string
    const contactEmail = formData.get('contactEmail') as string

    try {
      // Convert file to base64 if provided
      let fileData: {
        verificationDocumentType?: string
        verificationDocumentBase64?: string
        verificationDocumentExt?: string
        verificationDocumentMimeType?: string
      } = {}

      if (selectedFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1]) // Remove data:... prefix
          }
          reader.readAsDataURL(selectedFile)
        })

        const ext = selectedFile.name.split('.').pop() || 'pdf'

        fileData = {
          verificationDocumentType: selectedFile.type.includes('pdf') ? 'official_letter' : 'staff_id',
          verificationDocumentBase64: base64,
          verificationDocumentExt: ext,
          verificationDocumentMimeType: selectedFile.type,
        }
      }

      await completeOAuthSchoolProfile({
        userId: user.id,
        email: user.email,
        fullName,
        schoolName,
        schoolDomain,
        departmentName,
        contactEmail,
        ...fileData,
      })

      router.push('/school')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 py-8 dark:from-neutral-950 dark:to-neutral-900">
      <Link
        href="/complete-profile"
        className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Change Role
      </Link>
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Support your students&apos; finance careers
          </p>
          {user?.email && (
            <p className="mt-1 text-xs text-neutral-500">
              {user.email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={user?.fullName}
              placeholder="Dr. Jane Smith"
            />
          </div>

          <div>
            <Label htmlFor="schoolName">School Name</Label>
            <Input
              id="schoolName"
              name="schoolName"
              type="text"
              required
              placeholder="University of Pennsylvania"
            />
          </div>

          <div>
            <Label htmlFor="schoolDomain">School Email Domain</Label>
            <Input
              id="schoolDomain"
              name="schoolDomain"
              type="text"
              required
              placeholder="upenn.edu"
            />
          </div>

          <div>
            <Label htmlFor="departmentName">Department</Label>
            <Input
              id="departmentName"
              name="departmentName"
              type="text"
              required
              placeholder="Career Services"
            />
          </div>

          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              defaultValue={user?.email}
              placeholder="careers@wharton.upenn.edu"
            />
          </div>

          <div>
            <Label>Verification Document (Optional)</Label>
            <p className="text-xs text-neutral-500 mb-2">
              Upload a letter on school letterhead or staff ID to speed up verification
            </p>
            {selectedFile ? (
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-600"
              >
                <Upload className="h-4 w-4" />
                Click to upload PDF or image
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  )
}
