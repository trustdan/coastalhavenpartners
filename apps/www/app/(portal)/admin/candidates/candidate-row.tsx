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
import { Mail, Linkedin, FileText, GraduationCap, AlertTriangle, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react"
import { verifyCandidate, rejectCandidate, revokeCandidate, reinstateCandidate } from "../actions"

interface CandidateProfile {
  id: string
  full_name: string | null
  email: string
  linkedin_url: string | null
}

interface ResumeRecord {
  id: string
  resume_url: string
  label: string
  is_default: boolean | null
}

interface TranscriptRecord {
  id: string
  transcript_url: string
  education_level: string
}

interface Candidate {
  id: string
  school_name: string
  major: string
  gpa: number
  graduation_year: number
  status: string | null
  is_rejected: boolean | null
  rejected_at: string | null
  gpa_verification_status: string | null
  profiles: CandidateProfile | null
  resumes: ResumeRecord[]
  transcripts: TranscriptRecord[]
}

type RowVariant = "pending" | "verified" | "rejected"

interface CandidateRowProps {
  candidate: Candidate
  variant: RowVariant
}

export function CandidateRow({ candidate, variant }: CandidateRowProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleReject() {
    setIsLoading(true)
    await rejectCandidate(candidate.id)
    setIsLoading(false)
    setShowRejectDialog(false)
  }

  async function handleRevoke() {
    setIsLoading(true)
    await revokeCandidate(candidate.id)
    setIsLoading(false)
    setShowRevokeDialog(false)
  }

  async function handleVerify() {
    setIsLoading(true)
    await verifyCandidate(candidate.id)
    setIsLoading(false)
  }

  async function handleReinstate() {
    setIsLoading(true)
    await reinstateCandidate(candidate.id)
    setIsLoading(false)
  }

  return (
    <>
      <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
        <td className="px-6 py-4">
          <div>
            <p className="font-medium">{candidate.profiles?.full_name}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {candidate.profiles?.email}
            </p>
          </div>
        </td>
        <td className="px-6 py-4 text-sm">{candidate.school_name}</td>
        <td className="px-6 py-4 text-sm">{candidate.major}</td>
        <td className="px-6 py-4 text-sm">
          <div className="flex items-center gap-1.5">
            {candidate.gpa.toFixed(2)}
            {candidate.gpa_verification_status === 'verified' && (
              <span title="GPA Verified">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </span>
            )}
            {candidate.gpa_verification_status === 'flagged' && (
              <span title="GPA Flagged for Review">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </span>
            )}
            {candidate.gpa_verification_status === 'rejected' && (
              <span title="GPA Verification Rejected">
                <XCircle className="h-4 w-4 text-red-500" />
              </span>
            )}
            {(candidate.gpa_verification_status === 'pending' || candidate.gpa_verification_status === null) && (
              <span title="GPA Pending Verification">
                <Clock className="h-4 w-4 text-neutral-400" />
              </span>
            )}
          </div>
        </td>

        {/* Conditional column based on variant */}
        {variant === "verified" && (
          <td className="px-6 py-4">
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
              ${candidate.status === 'placed'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
                : candidate.status === 'active'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'}
            `}>
              {(candidate.status || 'verified').replace('_', ' ').toUpperCase()}
            </span>
          </td>
        )}
        {variant === "pending" && (
          <td className="px-6 py-4 text-sm">{candidate.graduation_year}</td>
        )}
        {variant === "rejected" && (
          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
            {candidate.rejected_at ? new Date(candidate.rejected_at).toLocaleDateString() : '-'}
          </td>
        )}

        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            {/* Document Links - Resumes */}
            {candidate.resumes.length > 0 && (
              candidate.resumes.length === 1 ? (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={candidate.resumes[0].resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`View Resume: ${candidate.resumes[0].label}`}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">Resume</span>
                  </a>
                </Button>
              ) : (
                // Multiple resumes - show dropdown or first one with count
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={candidate.resumes.find(r => r.is_default)?.resume_url || candidate.resumes[0].resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`View Resumes (${candidate.resumes.length})`}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">Resumes ({candidate.resumes.length})</span>
                  </a>
                </Button>
              )
            )}
            {/* Document Links - Transcripts */}
            {candidate.transcripts.length > 0 && (
              candidate.transcripts.length === 1 ? (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={candidate.transcripts[0].transcript_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Transcript"
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span className="sr-only">Transcript</span>
                  </a>
                </Button>
              ) : (
                // Multiple transcripts - show with count
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={candidate.transcripts[0].transcript_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`View Transcripts (${candidate.transcripts.length})`}
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span className="sr-only">Transcripts ({candidate.transcripts.length})</span>
                  </a>
                </Button>
              )
            )}

            {/* LinkedIn */}
            {candidate.profiles?.linkedin_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={candidate.profiles.linkedin_url} target="_blank" rel="noopener noreferrer" title="View LinkedIn">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
            )}

            {/* Email */}
            <Button variant="ghost" size="sm" asChild>
              <a href={`mailto:${candidate.profiles?.email}`} title="Contact Candidate">
                <Mail className="h-4 w-4" />
                <span className="sr-only">Contact</span>
              </a>
            </Button>

            {/* Action Buttons based on variant */}
            {variant === "pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleVerify}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              </>
            )}

            {variant === "verified" && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowRevokeDialog(true)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke"}
              </Button>
            )}

            {variant === "rejected" && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                onClick={handleReinstate}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reinstate"}
              </Button>
            )}
          </div>
        </td>
      </tr>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Reject Candidate
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject <strong>{candidate.profiles?.full_name}</strong>?
              This will remove them from the candidate pool. You can reinstate them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject Candidate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Revoke Access
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke <strong>{candidate.profiles?.full_name}</strong>&apos;s access?
              This will suspend their account and remove them from recruiter searches.
              You can reinstate them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={isLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
