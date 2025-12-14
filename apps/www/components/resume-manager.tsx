'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Upload, Plus, Trash2, FileText, CheckCircle2, Clock, ExternalLink, Star, StarOff, RefreshCw, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { triggerResumeVerification } from '@/app/(portal)/candidate/actions'

interface Resume {
  id: string
  resume_url: string
  label: string
  description: string | null
  is_default: boolean
  is_verified: boolean | null
  created_at: string | null
}

const SUGGESTED_LABELS = [
  'General',
  'Investment Banking',
  'Private Equity',
  'Venture Capital',
  'Consulting',
  'Asset Management',
  'Hedge Fund',
  'Corporate Finance',
]

export function ResumeManager() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [candidateProfileId, setCandidateProfileId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state for new/edit resume
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Edit mode state
  const [editingResume, setEditingResume] = useState<Resume | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadResumes()
  }, [])

  async function loadResumes() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // Get candidate profile ID
      const { data: profile } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setCandidateProfileId(profile.id)

        // Load resumes
        const { data: resumesData, error } = await supabase
          .from('candidate_resumes')
          .select('*')
          .eq('candidate_profile_id', profile.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) throw error
        // Map to ensure is_default is always boolean (not null)
        setResumes((resumesData || []).map(r => ({ ...r, is_default: r.is_default ?? false })))
      }
    } catch (error) {
      console.error('Error loading resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    if (!userId || !candidateProfileId) {
      toast.error('Session error - please refresh the page and try again')
      console.error('Upload failed: userId or candidateProfileId is null', { userId, candidateProfileId })
      return
    }

    if (!label.trim()) {
      toast.error('Please enter a label for this resume')
      return
    }

    setUploading(true)

    try {
      // Upload file to storage
      const filePath = `${userId}/${Date.now()}-${selectedFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)

      // If this is set as default, unset other defaults first
      if (isDefault && resumes.length > 0) {
        await supabase
          .from('candidate_resumes')
          .update({ is_default: false })
          .eq('candidate_profile_id', candidateProfileId)
      }

      // Create resume record
      const { data: newResume, error: dbError } = await supabase
        .from('candidate_resumes')
        .insert({
          candidate_profile_id: candidateProfileId,
          user_id: userId,
          resume_url: publicUrl,
          label: label.trim(),
          description: description.trim() || null,
          is_default: isDefault || resumes.length === 0, // First resume is always default
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Update local state with mapped resume to ensure is_default is boolean
      const mappedResume: Resume = { ...newResume, is_default: newResume.is_default ?? false }
      if (isDefault || resumes.length === 0) {
        setResumes([mappedResume, ...resumes.map(r => ({ ...r, is_default: false }))])
      } else {
        setResumes([mappedResume, ...resumes])
      }

      toast.success('Resume uploaded successfully')

      // Trigger auto-verification in the background
      triggerResumeVerification(newResume.id)
        .then((result) => {
          if (result.success) {
            toast.info('Resume verification started', {
              description: "We'll verify your resume automatically",
              icon: <Bot className="h-4 w-4" />,
            })
          }
        })
        .catch(() => {
          // Silent fail - verification will happen on admin review
        })

      // Reset form
      setDialogOpen(false)
      setSelectedFile(null)
      setLabel('')
      setDescription('')
      setIsDefault(false)
    } catch (error: any) {
      toast.error(error.message || 'Error uploading resume')
    } finally {
      setUploading(false)
    }
  }

  async function handleSetDefault(resumeId: string) {
    if (!candidateProfileId) return

    try {
      // Unset all defaults
      await supabase
        .from('candidate_resumes')
        .update({ is_default: false })
        .eq('candidate_profile_id', candidateProfileId)

      // Set the new default
      await supabase
        .from('candidate_resumes')
        .update({ is_default: true })
        .eq('id', resumeId)

      // Update local state
      setResumes(resumes.map(r => ({
        ...r,
        is_default: r.id === resumeId
      })))

      toast.success('Default resume updated')
    } catch (error: any) {
      toast.error(error.message || 'Error updating default resume')
    }
  }

  async function handleDelete(resumeId: string) {
    const resume = resumes.find(r => r.id === resumeId)
    if (resume?.is_default && resumes.length > 1) {
      toast.error('Cannot delete default resume. Set another resume as default first.')
      return
    }

    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const { error } = await supabase
        .from('candidate_resumes')
        .delete()
        .eq('id', resumeId)

      if (error) throw error

      setResumes(resumes.filter(r => r.id !== resumeId))
      toast.success('Resume deleted')
    } catch (error: any) {
      toast.error(error.message || 'Error deleting resume')
    }
  }

  function openEditDialog(resume: Resume) {
    setEditingResume(resume)
    setLabel(resume.label)
    setDescription(resume.description || '')
    setIsDefault(resume.is_default)
    setSelectedFile(null)
    setDialogOpen(true)
  }

  function resetForm() {
    setEditingResume(null)
    setSelectedFile(null)
    setLabel('')
    setDescription('')
    setIsDefault(false)
  }

  async function handleUpdate() {
    if (!editingResume || !userId || !candidateProfileId) return

    if (!label.trim()) {
      toast.error('Please enter a label for this resume')
      return
    }

    setUploading(true)

    try {
      let publicUrl = editingResume.resume_url

      // If a new file was selected, upload it
      if (selectedFile) {
        const filePath = `${userId}/${Date.now()}-${selectedFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl: newUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath)

        publicUrl = newUrl
      }

      // If setting this as default, unset other defaults first
      if (isDefault && !editingResume.is_default) {
        await supabase
          .from('candidate_resumes')
          .update({ is_default: false })
          .eq('candidate_profile_id', candidateProfileId)
      }

      // Update resume record
      const { data: updatedResume, error: dbError } = await supabase
        .from('candidate_resumes')
        .update({
          resume_url: publicUrl,
          label: label.trim(),
          description: description.trim() || null,
          is_default: isDefault,
          // Reset verification status if file changed
          ...(selectedFile ? { is_verified: false } : {}),
        })
        .eq('id', editingResume.id)
        .select()
        .single()

      if (dbError) throw dbError

      // Update local state
      const mappedResume: Resume = { ...updatedResume, is_default: updatedResume.is_default ?? false }
      if (isDefault && !editingResume.is_default) {
        setResumes(resumes.map(r => r.id === editingResume.id ? mappedResume : { ...r, is_default: false }))
      } else {
        setResumes(resumes.map(r => r.id === editingResume.id ? mappedResume : r))
      }

      toast.success('Resume updated successfully')

      // Trigger re-verification if a new file was uploaded
      if (selectedFile) {
        triggerResumeVerification(updatedResume.id)
          .then((result) => {
            if (result.success) {
              toast.info('Resume verification started', {
                description: "We'll verify your resume automatically",
                icon: <Bot className="h-4 w-4" />,
              })
            }
          })
          .catch(() => {
            // Silent fail - verification will happen on admin review
          })
      }

      setDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Error updating resume')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Resumes</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Upload role-specific resumes for different opportunities
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingResume ? 'Update Resume' : 'Upload Resume'}</DialogTitle>
              <DialogDescription>
                {editingResume
                  ? 'Update the resume details or upload a new file.'
                  : 'Add a resume tailored for specific roles or industries.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resume-label">Label *</Label>
                <Input
                  id="resume-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Investment Banking, Private Equity"
                  list="label-suggestions"
                />
                <datalist id="label-suggestions">
                  {SUGGESTED_LABELS.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
                <p className="text-xs text-neutral-500">
                  A short label to identify this resume (e.g., &quot;Investment Banking&quot;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume-description">Description (optional)</Label>
                <Textarea
                  id="resume-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this resume different? What roles is it tailored for?"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-default"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <Label htmlFor="is-default" className="text-sm font-normal">
                  Set as default resume
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Resume File {editingResume ? '(optional - leave empty to keep current)' : '*'}</Label>
                <div className="rounded-lg border border-dashed border-neutral-300 p-4 dark:border-neutral-700">
                  <input
                    type="file"
                    id="resume-file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="resume-file"
                    className="flex cursor-pointer flex-col items-center gap-2 text-sm"
                  >
                    {selectedFile ? (
                      <>
                        <FileText className="h-8 w-8 text-green-500" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-neutral-500">Click to change file</span>
                      </>
                    ) : editingResume ? (
                      <>
                        <RefreshCw className="h-8 w-8 text-neutral-400" />
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Click to upload a new file
                        </span>
                        <span className="text-xs text-neutral-500">Leave empty to keep current file</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-neutral-400" />
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Click to select PDF file
                        </span>
                        <span className="text-xs text-neutral-500">Max 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setDialogOpen(false)
                resetForm()
              }}>
                Cancel
              </Button>
              {editingResume ? (
                <Button onClick={handleUpdate} disabled={!label.trim() || uploading}>
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              ) : (
                <Button onClick={handleUpload} disabled={!selectedFile || !label.trim() || uploading}>
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {resumes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <FileText className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" />
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            No resumes uploaded yet
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Click &quot;Add Resume&quot; to upload your first resume
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className={`flex items-center justify-between rounded-lg border p-4 ${
                resume.is_default
                  ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10'
                  : 'bg-neutral-50 dark:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  resume.is_default
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                }`}>
                  <FileText className={`h-5 w-5 ${
                    resume.is_default
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{resume.label}</span>
                    {resume.is_default && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Star className="h-3 w-3" />
                        Default
                      </span>
                    )}
                    {resume.is_verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>
                  {resume.description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {resume.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!resume.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(resume.id)}
                    title="Set as default"
                  >
                    <StarOff className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={resume.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-4 w-4" />
                    View
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(resume)}
                  title="Edit resume"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(resume.id)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
