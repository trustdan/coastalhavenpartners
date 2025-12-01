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
} from "lucide-react"
import {
  verifyResume,
  rejectResume,
  verifyIndividualTranscript,
  rejectIndividualTranscript,
  verifyIndividualTranscriptGpa,
  rejectIndividualTranscriptGpa,
} from "../actions"
import type { TranscriptRecord } from "./page"

type EducationLevel = 'bachelors' | 'masters' | 'mba' | 'phd'

const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  bachelors: 'Undergraduate',
  masters: "Master's",
  mba: 'MBA',
  phd: 'PhD',
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
  resume_url: string | null
  resume_verified: boolean | null
  gpa_verified: boolean | null
  profiles: CandidateProfile | null
  transcripts: TranscriptRecord[]
}

interface VerificationCardProps {
  candidate: Candidate
}

export function VerificationCard({ candidate }: VerificationCardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState<{ type: "resume" | "transcript" | "gpa", transcriptId?: string } | null>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleVerifyResume() {
    setIsLoading("verifyResume")
    await verifyResume(candidate.id)
    setIsLoading(null)
  }

  async function handleRejectResume() {
    setIsLoading("rejectResume")
    await rejectResume(candidate.id)
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
    (candidate.resume_url && !candidate.resume_verified) ||
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
          {/* Resume Verification */}
          {candidate.resume_url && (
            <div className={`flex items-center justify-between rounded-lg border p-4 ${
              candidate.resume_verified
                ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20"
                : "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  candidate.resume_verified
                    ? "bg-green-100 dark:bg-green-900/40"
                    : "bg-yellow-100 dark:bg-yellow-900/40"
                }`}>
                  <FileText className={`h-5 w-5 ${
                    candidate.resume_verified ? "text-green-600" : "text-yellow-600"
                  }`} />
                </div>
                <div>
                  <p className="font-medium">Resume</p>
                  <p className="text-sm text-neutral-500">
                    {candidate.resume_verified ? "Verified" : "Pending verification"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-4 w-4" />
                    View
                  </a>
                </Button>
                {!candidate.resume_verified && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setShowRejectDialog({ type: "resume" })}
                      disabled={isLoading !== null}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleVerifyResume}
                      disabled={isLoading !== null}
                    >
                      {isLoading === "verifyResume" ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      )}
                      Verify
                    </Button>
                  </>
                )}
                {candidate.resume_verified && (
                  <BadgeCheck className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          )}

          {/* Transcripts Section */}
          {candidate.transcripts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Transcripts ({candidate.transcripts.length})
              </h4>
              {candidate.transcripts.map((transcript) => (
                <div key={transcript.id} className="space-y-2">
                  {/* Transcript Verification */}
                  <div className={`flex items-center justify-between rounded-lg border p-4 ${
                    transcript.is_verified
                      ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20"
                      : "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        transcript.is_verified
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-yellow-100 dark:bg-yellow-900/40"
                      }`}>
                        <GraduationCap className={`h-5 w-5 ${
                          transcript.is_verified ? "text-green-600" : "text-yellow-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {EDUCATION_LEVEL_LABELS[transcript.education_level]}
                          {transcript.degree_type && ` - ${transcript.degree_type}`}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {transcript.school_name || candidate.school_name}
                          {transcript.gpa && ` · ${transcript.gpa.toFixed(2)} GPA`}
                          {transcript.is_verified ? " · Verified" : " · Pending"}
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
              ))}
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
              onClick={handleRejectResume}
              disabled={isLoading !== null}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading === "rejectResume" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
