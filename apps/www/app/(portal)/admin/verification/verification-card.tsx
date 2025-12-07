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
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  BadgeCheck,
  Bot,
  Brain,
} from "lucide-react"
import {
  verifyIndividualResume,
  rejectIndividualResume,
  verifyIndividualTranscript,
  rejectIndividualTranscript,
  verifyIndividualTranscriptGpa,
  rejectIndividualTranscriptGpa,
} from "../actions"
import type { TranscriptRecord, TranscriptVerification, ResumeRecord } from "./page"

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

interface VerificationCardProps {
  candidate: Candidate
}

export function VerificationCard({ candidate }: VerificationCardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState<{ type: "resume" | "transcript" | "gpa", resumeId?: string, transcriptId?: string } | null>(null)

  async function handleVerifyResume(resumeId: string) {
    setIsLoading(`verifyResume-${resumeId}`)
    await verifyIndividualResume(resumeId)
    setIsLoading(null)
  }

  async function handleRejectResume(resumeId: string) {
    setIsLoading(`rejectResume-${resumeId}`)
    await rejectIndividualResume(resumeId)
    setIsLoading(null)
    setShowRejectDialog(null)
  }

  async function handleVerifyTranscript(transcriptId: string) {
    setIsLoading(`verifyTranscript-${transcriptId}`)
    await verifyIndividualTranscript(transcriptId)
    setIsLoading(null)
  }

  async function handleRejectTranscript(transcriptId: string) {
    setIsLoading(`rejectTranscript-${transcriptId}`)
    await rejectIndividualTranscript(transcriptId)
    setIsLoading(null)
    setShowRejectDialog(null)
  }

  async function handleVerifyTranscriptGpa(transcriptId: string) {
    setIsLoading(`verifyGpa-${transcriptId}`)
    await verifyIndividualTranscriptGpa(transcriptId)
    setIsLoading(null)
  }

  async function handleRejectTranscriptGpa(transcriptId: string) {
    setIsLoading(`rejectGpa-${transcriptId}`)
    await rejectIndividualTranscriptGpa(transcriptId)
    setIsLoading(null)
    setShowRejectDialog(null)
  }

  const hasUnverifiedDocs =
    candidate.resumes.some(r => !r.is_verified) ||
    candidate.transcripts.some(t => !t.is_verified) ||
    candidate.transcripts.some(t => t.is_verified && t.gpa && !t.gpa_verified)

  if (!hasUnverifiedDocs) return null

  return (
    <>
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{candidate.profiles?.full_name}</h3>
            <p className="text-sm text-neutral-500">{candidate.profiles?.email}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {candidate.school_name} &apos;{candidate.graduation_year % 100}
            </p>
            <p className="text-sm text-neutral-500">
              {candidate.major} · {candidate.gpa.toFixed(2)} GPA
            </p>
          </div>
        </div>

        {/* Verification Items */}
        <div className="mt-6 space-y-4">
          {/* Resumes Section */}
          {candidate.resumes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Resumes ({candidate.resumes.length})
              </h4>
              {candidate.resumes.map((resume) => (
                <div key={resume.id} className={`flex items-center justify-between rounded-lg border p-4 ${
                  resume.is_verified
                    ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20"
                    : "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      resume.is_verified
                        ? "bg-green-100 dark:bg-green-900/40"
                        : "bg-yellow-100 dark:bg-yellow-900/40"
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        resume.is_verified ? "text-green-600" : "text-yellow-600"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {resume.label}
                        {resume.is_default && <span className="ml-2 text-xs text-neutral-500">(Default)</span>}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {resume.is_verified ? "Verified" : "Pending verification"}
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
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        View
                      </a>
                    </Button>
                    {!resume.is_verified && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setShowRejectDialog({ type: "resume", resumeId: resume.id })}
                          disabled={isLoading !== null}
                        >
                          <XCircle className="mr-1.5 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerifyResume(resume.id)}
                          disabled={isLoading !== null}
                        >
                          {isLoading === `verifyResume-${resume.id}` ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          )}
                          Verify
                        </Button>
                      </>
                    )}
                    {resume.is_verified && (
                      <BadgeCheck className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transcripts Section */}
          {candidate.transcripts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Transcripts ({candidate.transcripts.length})
              </h4>
              {candidate.transcripts.map((transcript) => {
                const isFlagged = transcript.verification?.status === 'flagged'
                const isError = transcript.verification?.status === 'error'
                const hasAiResult = isFlagged || isError

                // Determine card styling based on state
                const getCardStyle = () => {
                  if (transcript.is_verified) {
                    return "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20"
                  }
                  if (isFlagged) {
                    return "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20"
                  }
                  if (isError) {
                    return "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20"
                  }
                  return "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20"
                }

                const getIconStyle = () => {
                  if (transcript.is_verified) return "bg-green-100 dark:bg-green-900/40"
                  if (isFlagged) return "bg-amber-100 dark:bg-amber-900/40"
                  if (isError) return "bg-red-100 dark:bg-red-900/40"
                  return "bg-yellow-100 dark:bg-yellow-900/40"
                }

                const getIconColor = () => {
                  if (transcript.is_verified) return "text-green-600"
                  if (isFlagged) return "text-amber-600"
                  if (isError) return "text-red-600"
                  return "text-yellow-600"
                }

                const getStatusText = () => {
                  if (transcript.is_verified) return " · Verified"
                  if (isFlagged) return " · AI Flagged"
                  if (isError) return " · AI Error"
                  return " · Pending"
                }

                return (
                <div key={transcript.id} className="space-y-2">
                  {/* Transcript Verification */}
                  <div className={`rounded-lg border p-4 ${getCardStyle()}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getIconStyle()}`}>
                          {hasAiResult ? (
                            <Bot className={`h-5 w-5 ${getIconColor()}`} />
                          ) : (
                            <GraduationCap className={`h-5 w-5 ${getIconColor()}`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {EDUCATION_LEVEL_LABELS[transcript.education_level]}
                            {transcript.degree_type && ` - ${transcript.degree_type}`}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {transcript.school_name || candidate.school_name}
                            {transcript.gpa && ` · ${transcript.gpa.toFixed(2)} GPA`}
                            {getStatusText()}
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
                            <ExternalLink className="mr-1.5 h-4 w-4" />
                            View
                          </a>
                        </Button>
                        {!transcript.is_verified && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setShowRejectDialog({ type: "transcript", transcriptId: transcript.id })}
                              disabled={isLoading !== null}
                            >
                              <XCircle className="mr-1.5 h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleVerifyTranscript(transcript.id)}
                              disabled={isLoading !== null}
                            >
                              {isLoading === `verifyTranscript-${transcript.id}` ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              )}
                              Verify
                            </Button>
                          </>
                        )}
                        {transcript.is_verified && (
                          <BadgeCheck className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>

                    {/* AI Analysis Results (shown inline when flagged) */}
                    {isFlagged && transcript.verification && transcript.gpa && (
                      <div className="mt-4 space-y-3 border-t border-amber-200 pt-4 dark:border-amber-800">
                        {/* GPA Comparison */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-lg bg-white/70 p-2 text-center dark:bg-neutral-800/50">
                            <p className="text-xs text-neutral-500">Entered GPA</p>
                            <p className="text-lg font-bold">{transcript.gpa.toFixed(2)}</p>
                          </div>
                          <div className="rounded-lg bg-white/70 p-2 text-center dark:bg-neutral-800/50">
                            <p className="text-xs text-neutral-500">AI Extracted</p>
                            <p className="text-lg font-bold">
                              {transcript.verification.extracted_gpa?.toFixed(2) || 'N/A'}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/70 p-2 text-center dark:bg-neutral-800/50">
                            <p className="text-xs text-neutral-500">Difference</p>
                            <p className={`text-lg font-bold ${transcript.verification.gpa_match ? 'text-green-600' : 'text-red-600'}`}>
                              {transcript.verification.gpa_difference !== null
                                ? `±${transcript.verification.gpa_difference.toFixed(2)}`
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        {transcript.verification.extraction_reasoning && (
                          <div className="flex items-start gap-2">
                            <Brain className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              {transcript.verification.extraction_reasoning}
                            </p>
                          </div>
                        )}

                        {/* Confidence Badge */}
                        {transcript.verification.extraction_confidence && (
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              transcript.verification.extraction_confidence === 'high'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : transcript.verification.extraction_confidence === 'medium'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {transcript.verification.extraction_confidence} confidence
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* GPA Verification for this transcript (only if transcript is verified and has GPA) */}
                  {transcript.is_verified && transcript.gpa && !transcript.gpa_verified && (
                    <div className="ml-12 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                          <BadgeCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">GPA Verification</p>
                          <p className="text-sm text-neutral-500">
                            Does this transcript show {transcript.gpa.toFixed(2)} GPA?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setShowRejectDialog({ type: "gpa", transcriptId: transcript.id })}
                          disabled={isLoading !== null}
                        >
                          <XCircle className="mr-1.5 h-4 w-4" />
                          Mismatch
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerifyTranscriptGpa(transcript.id)}
                          disabled={isLoading !== null}
                        >
                          {isLoading === `verifyGpa-${transcript.id}` ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          )}
                          Confirm
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* GPA Verified Badge */}
                  {transcript.is_verified && transcript.gpa && transcript.gpa_verified && (
                    <div className="ml-12 flex items-center gap-2 text-sm text-green-600">
                      <BadgeCheck className="h-4 w-4" />
                      <span>GPA verified for {EDUCATION_LEVEL_LABELS[transcript.education_level]}</span>
                    </div>
                  )}
                </div>
              )})}
            </div>
          )}

          {/* No transcripts message */}
          {candidate.transcripts.length === 0 && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50">
              No transcripts uploaded yet
            </div>
          )}
        </div>
      </div>

      {/* Rejection Dialogs */}
      <AlertDialog open={showRejectDialog?.type === "resume"} onOpenChange={(open) => !open && setShowRejectDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Reject Resume
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this resume? The file will be deleted and the candidate
              will need to upload a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showRejectDialog?.resumeId && handleRejectResume(showRejectDialog.resumeId)}
              disabled={isLoading !== null}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading?.startsWith("rejectResume") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Resume
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog?.type === "transcript"} onOpenChange={(open) => !open && setShowRejectDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Reject Transcript
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this transcript? The file will be deleted and the candidate
              will need to upload a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showRejectDialog?.transcriptId && handleRejectTranscript(showRejectDialog.transcriptId)}
              disabled={isLoading !== null}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading?.startsWith("rejectTranscript") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Transcript
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog?.type === "gpa"} onOpenChange={(open) => !open && setShowRejectDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              GPA Mismatch
            </AlertDialogTitle>
            <AlertDialogDescription>
              Marking the GPA as mismatched will flag this transcript for review.
              Are you sure the transcript shows a different value?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showRejectDialog?.transcriptId && handleRejectTranscriptGpa(showRejectDialog.transcriptId)}
              disabled={isLoading !== null}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading?.startsWith("rejectGpa") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Flag GPA Mismatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
