'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Upload, Plus, Trash2, FileText, CheckCircle2, Clock, ExternalLink, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

type EducationLevel = 'bachelors' | 'masters' | 'mba' | 'phd' | 'professional'

interface Transcript {
  id: string
  transcript_url: string
  education_level: EducationLevel
  school_name: string | null
  degree_type: string | null
  gpa: number | null
  is_verified: boolean | null
  gpa_verified: boolean | null
  created_at: string | null
}

const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  bachelors: 'Undergraduate',
  masters: "Master's",
  mba: 'MBA',
  phd: 'PhD',
  professional: 'Professional (JD, MD)',
}

export function TranscriptManager() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [candidateProfileId, setCandidateProfileId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state for new transcript
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('bachelors')
  const [schoolName, setSchoolName] = useState('')
  const [degreeType, setDegreeType] = useState('')
  const [gpa, setGpa] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadTranscripts()
  }, [])

  async function loadTranscripts() {
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

        // Load transcripts
        const { data: transcriptsData, error } = await supabase
          .from('candidate_transcripts')
          .select('*')
          .eq('candidate_profile_id', profile.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setTranscripts(transcriptsData || [])
      }
    } catch (error) {
      console.error('Error loading transcripts:', error)
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
    if (!selectedFile || !userId || !candidateProfileId) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)

    try {
      // Upload file to storage
      const filePath = `${userId}/${Date.now()}-${selectedFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('transcripts')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('transcripts')
        .getPublicUrl(filePath)

      // Create transcript record
      const { data: newTranscript, error: dbError } = await supabase
        .from('candidate_transcripts')
        .insert({
          candidate_profile_id: candidateProfileId,
          user_id: userId,
          transcript_url: publicUrl,
          education_level: educationLevel,
          school_name: schoolName || null,
          degree_type: degreeType || null,
          gpa: gpa ? parseFloat(gpa) : null,
        })
        .select()
        .single()

      if (dbError) throw dbError

      setTranscripts([newTranscript, ...transcripts])
      toast.success('Transcript uploaded successfully')

      // Reset form
      setDialogOpen(false)
      setSelectedFile(null)
      setEducationLevel('bachelors')
      setSchoolName('')
      setDegreeType('')
      setGpa('')
    } catch (error: any) {
      toast.error(error.message || 'Error uploading transcript')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(transcriptId: string) {
    if (!confirm('Are you sure you want to delete this transcript?')) return

    try {
      const { error } = await supabase
        .from('candidate_transcripts')
        .delete()
        .eq('id', transcriptId)

      if (error) throw error

      setTranscripts(transcripts.filter(t => t.id !== transcriptId))
      toast.success('Transcript deleted')
    } catch (error: any) {
      toast.error(error.message || 'Error deleting transcript')
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
          <h3 className="font-medium">Transcripts</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Upload transcripts for each degree program
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Transcript
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Transcript</DialogTitle>
              <DialogDescription>
                Add a transcript for your undergraduate or graduate degree.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="education-level">Education Level *</Label>
                <Select
                  value={educationLevel}
                  onValueChange={(value) => setEducationLevel(value as EducationLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelors">Undergraduate (Bachelor's)</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="mba">MBA</SelectItem>
                    <SelectItem value="phd">PhD / Doctorate</SelectItem>
                    <SelectItem value="professional">Professional (JD, MD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school-name">School Name (optional)</Label>
                <Input
                  id="school-name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g., Stanford Graduate School of Business"
                />
                <p className="text-xs text-neutral-500">
                  Only needed if different from your primary school
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="degree-type">Degree Type (optional)</Label>
                  <Input
                    id="degree-type"
                    value={degreeType}
                    onChange={(e) => setDegreeType(e.target.value)}
                    placeholder="e.g., MBA, MS Finance"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA (optional)</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder="3.85"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Transcript File *</Label>
                <div className="rounded-lg border border-dashed border-neutral-300 p-4 dark:border-neutral-700">
                  <input
                    type="file"
                    id="transcript-file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="transcript-file"
                    className="flex cursor-pointer flex-col items-center gap-2 text-sm"
                  >
                    {selectedFile ? (
                      <>
                        <FileText className="h-8 w-8 text-green-500" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-neutral-500">Click to change file</span>
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {transcripts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <GraduationCap className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" />
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            No transcripts uploaded yet
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Click "Add Transcript" to upload your first transcript
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transcripts.map((transcript) => (
            <div
              key={transcript.id}
              className="flex items-center justify-between rounded-lg border bg-neutral-50 p-4 dark:bg-neutral-800/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {EDUCATION_LEVEL_LABELS[transcript.education_level]}
                    </span>
                    {transcript.degree_type && (
                      <span className="text-sm text-neutral-500">
                        ({transcript.degree_type})
                      </span>
                    )}
                    {transcript.is_verified ? (
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
                  <div className="flex items-center gap-3 text-sm text-neutral-500">
                    {transcript.school_name && (
                      <span>{transcript.school_name}</span>
                    )}
                    {transcript.gpa && (
                      <span>
                        GPA: {transcript.gpa.toFixed(2)}
                        {transcript.gpa_verified && (
                          <CheckCircle2 className="ml-1 inline h-3 w-3 text-green-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={transcript.transcript_url}
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
                  onClick={() => handleDelete(transcript.id)}
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
