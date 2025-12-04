'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Send } from 'lucide-react'
import { applyToJob } from '../actions'

interface Resume {
  id: string
  label: string
  is_default: boolean
}

interface ApplyButtonProps {
  jobId: string
  resumes: Resume[]
}

export function ApplyButton({ jobId, resumes }: ApplyButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    resumes.find((r) => r.is_default)?.id || resumes[0]?.id || ''
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!coverLetter.trim()) {
      setError('Please write a cover letter')
      return
    }

    if (coverLetter.trim().length < 50) {
      setError('Cover letter should be at least 50 characters')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await applyToJob(
        jobId,
        coverLetter.trim(),
        selectedResumeId || undefined
      )

      if (result.success) {
        setOpen(false)
        setCoverLetter('')
        router.refresh()
      } else {
        setError(result.error || 'Failed to submit application')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Send className="mr-2 h-4 w-4" />
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for this Position</DialogTitle>
          <DialogDescription>
            Submit your application. Make sure your profile is up to date before applying.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          {resumes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="resume">Resume</Label>
              <Select
                value={selectedResumeId}
                onValueChange={setSelectedResumeId}
              >
                <SelectTrigger id="resume">
                  <SelectValue placeholder="Select a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.label}
                      {resume.is_default && ' (Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                This resume will be included with your application
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="coverLetter">
              Cover Letter <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you're interested in this role and what makes you a great fit..."
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-neutral-500">
              {coverLetter.length} characters (minimum 50)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
