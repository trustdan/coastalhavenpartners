"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  FileText,
  GraduationCap,
  ExternalLink,
  Loader2,
  AlertTriangle,
  BadgeCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  reflagTranscriptForReview,
  reflagResumeForReview,
} from "../actions"
import type { TranscriptRecord, ResumeRecord } from "./page"

type EducationLevel = 'bachelors' | 'masters' | 'mba' | 'phd' | 'professional'

const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  bachelors: 'Undergraduate',
  masters: "Master's",
  mba: 'MBA',
  phd: 'PhD',
  professional: 'Professional',
}

interface CandidateProfile {
  id: string
  full_name: string | null
  email: string
}

interface Candidate {
  id: string
  school_name: string
  major: string
  gpa: number
  graduation_year: number
  gpa_verified: boolean | null
  profiles: CandidateProfile | null
  transcripts: TranscriptRecord[]
  resumes: ResumeRecord[]
}

interface VerifiedCandidateCardProps {
  candidate: Candidate
  defaultExpanded?: boolean
}

export function VerifiedCandidateCard({ candidate, defaultExpanded = false }: VerifiedCandidateCardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showReflagDialog, setShowReflagDialog] = useState<{ type: "resume" | "transcript", id: string } | null>(null)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  async function handleReflagTranscript(transcriptId: string) {
    setIsLoading(`reflagTranscript-${transcriptId}`)
    await reflagTranscriptForReview(transcriptId)
    setIsLoading(null)
    setShowReflagDialog(null)
  }

  async function handleReflagResume(resumeId: string) {
    setIsLoading(`reflagResume-${resumeId}`)
    await reflagResumeForReview(resumeId)
    setIsLoading(null)
    setShowReflagDialog(null)
  }

  const verifiedResumes = candidate.resumes.filter(r => r.is_verified)
  const verifiedTranscripts = candidate.transcripts.filter(t => t.is_verified && t.gpa_verified)

  return (
    <>
      <div className="rounded-xl border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
        {/* Collapsed Header */}
        <button
          className="flex w-full items-center justify-between p-4 text-left"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">{candidate.profiles?.full_name}</p>
              <p className="text-sm text-neutral-500">
                {candidate.school_name} · {candidate.major} · {candidate.gpa.toFixed(2)} GPA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-green-600">
              {verifiedResumes.length} resume{verifiedResumes.length !== 1 ? 's' : ''}, {verifiedTranscripts.length} transcript{verifiedTranscripts.length !== 1 ? 's' : ''}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-neutral-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-400" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-green-200 p-4 dark:border-green-900/50">
            <div className="space-y-4">
              {/* Verified Resumes */}
              {verifiedResumes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Verified Resumes
                  </h4>
                  {verifiedResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-white p-3 dark:border-green-900/30 dark:bg-neutral-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {resume.label}
                            {resume.is_default && <span className="ml-2 text-xs text-neutral-500">(Default)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={resume.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-1.5 h-3 w-3" />
                            View
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 hover:bg-amber-50"
                          onClick={() => setShowReflagDialog({ type: "resume", id: resume.id })}
                          disabled={isLoading !== null}
                        >
                          {isLoading === `reflagResume-${resume.id}` ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="mr-1.5 h-3 w-3" />
                          )}
                          Re-review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Verified Transcripts */}
              {verifiedTranscripts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Verified Transcripts
                  </h4>
                  {verifiedTranscripts.map((transcript) => (
                    <div
                      key={transcript.id}
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-white p-3 dark:border-green-900/30 dark:bg-neutral-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                          <GraduationCap className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {EDUCATION_LEVEL_LABELS[transcript.education_level]}
                            {transcript.degree_type && ` - ${transcript.degree_type}`}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {transcript.school_name || candidate.school_name}
                            {transcript.gpa && ` · ${transcript.gpa.toFixed(2)} GPA`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={transcript.transcript_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-1.5 h-3 w-3" />
                            View
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 hover:bg-amber-50"
                          onClick={() => setShowReflagDialog({ type: "transcript", id: transcript.id })}
                          disabled={isLoading !== null}
                        >
                          {isLoading === `reflagTranscript-${transcript.id}` ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="mr-1.5 h-3 w-3" />
                          )}
                          Re-review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Re-review Dialogs */}
      <AlertDialog open={showReflagDialog?.type === "resume"} onOpenChange={(open) => !open && setShowReflagDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Re-review Resume
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will move the resume back to the verification queue for re-review.
              Use this if the resume was approved in error.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showReflagDialog?.id && handleReflagResume(showReflagDialog.id)}
              disabled={isLoading !== null}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {isLoading?.startsWith("reflagResume") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Re-review Resume
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReflagDialog?.type === "transcript"} onOpenChange={(open) => !open && setShowReflagDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Re-review Transcript
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will move the transcript back to the verification queue for re-review.
              Both the transcript and GPA verification will be reset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showReflagDialog?.id && handleReflagTranscript(showReflagDialog.id)}
              disabled={isLoading !== null}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {isLoading?.startsWith("reflagTranscript") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Re-review Transcript
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
