'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, FileText, X } from 'lucide-react'
import { toast } from 'sonner'

interface FileUploadProps {
  bucket: 'resumes' | 'transcripts'
  currentUrl?: string | null
  onUploadComplete: (url: string) => void
  label: string
}

export function FileUpload({ bucket, currentUrl, onUploadComplete, label }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      
      if (!file) return

      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create a unique file path: userId/timestamp-filename
      const filePath = `${user.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      // Update candidate profile
      const updateField = bucket === 'resumes' ? 'resume_url' : 'transcript_url'
      const { error: dbError } = await supabase
        .from('candidate_profiles')
        .update({ [updateField]: publicUrl })
        .eq('user_id', user.id)

      if (dbError) throw dbError

      onUploadComplete(publicUrl)
      toast.success('File uploaded successfully')
      
    } catch (error: any) {
      toast.error(error.message || 'Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-neutral-300 p-6 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{label}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            PDF only, max 5MB
          </p>
        </div>
        {currentUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={currentUrl} target="_blank" rel="noopener noreferrer">
              View Current
            </a>
          </Button>
        )}
      </div>

      <div className="mt-4">
        <input
          type="file"
          id={`upload-${bucket}`}
          accept="application/pdf"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        <label
          htmlFor={`upload-${bucket}`}
          className={`flex cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-8 text-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 ${
            uploading ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-neutral-400" />
              <span className="text-neutral-600 dark:text-neutral-400">
                Click to upload new file
              </span>
            </div>
          )}
        </label>
      </div>
    </div>
  )
}

