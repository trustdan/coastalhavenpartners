"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Brain,
  User,
  ShieldAlert,
} from "lucide-react"
import { manuallyVerifyResumeVerification, autoVerifyResume } from "../actions"

interface ResumeVerification {
  id: string
  candidate_profile_id: string
  resume_id: string | null
  is_valid_resume: boolean | null
  appears_authentic: boolean | null
  fake_indicators: string[] | null
  confidence: number | null
  reasoning: string | null
  status: string
  error_message: string | null
  created_at: string
  candidate_profiles: {
    id: string
    school_name: string
    user_id: string | null
  } | null
  profile: {
    id: string
    full_name: string
    email: string
  } | null
}

interface ResumeVerificationCardProps {
  verification: ResumeVerification
  resumeUrl?: string
}

export function ResumeVerificationCard({ verification, resumeUrl }: ResumeVerificationCardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')

  async function handleRetry() {
    if (!verification.resume_id) return
    setIsLoading('retry')
    try {
      await autoVerifyResume(verification.candidate_profile_id, verification.resume_id)
    } finally {
      setIsLoading(null)
    }
  }

  async function handleApprove() {
    setIsLoading('approve')
    try {
      await manuallyVerifyResumeVerification(verification.id, 'verified', notes)
    } finally {
      setIsLoading(null)
      setShowDialog(null)
      setNotes('')
    }
  }

  async function handleReject() {
    setIsLoading('reject')
    try {
      await manuallyVerifyResumeVerification(verification.id, 'rejected', notes)
    } finally {
      setIsLoading(null)
      setShowDialog(null)
      setNotes('')
    }
  }

  const statusColors = {
    flagged: 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20',
    error: 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20',
  }

  const statusIcons = {
    flagged: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
  }

  // Parse fake_indicators from JSON if needed
  const fakeIndicators: string[] = Array.isArray(verification.fake_indicators)
    ? verification.fake_indicators
    : []

  const confidencePercent = verification.confidence !== null
    ? Math.round(verification.confidence * 100)
    : null

  const confidenceColor =
    confidencePercent === null ? 'text-neutral-500'
    : confidencePercent >= 80 ? 'text-green-600'
    : confidencePercent >= 50 ? 'text-amber-600'
    : 'text-red-600'

  return (
    <>
      <div className={`rounded-xl border p-6 shadow-sm ${statusColors[verification.status as keyof typeof statusColors] || 'bg-white dark:bg-neutral-900'}`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold">{verification.profile?.full_name || 'Unknown'}</h3>
              <p className="text-sm text-neutral-500">{verification.profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusIcons[verification.status as keyof typeof statusIcons]}
            <span className="text-sm font-medium capitalize">
              {verification.status === 'flagged' ? 'Needs Review' : verification.status}
            </span>
          </div>
        </div>

        {/* School Info */}
        <div className="mt-4 rounded-lg bg-white/50 p-3 dark:bg-neutral-800/50">
          <p className="text-sm">
            <span className="font-medium">{verification.candidate_profiles?.school_name}</span>
          </p>
        </div>

        {/* Verification Results */}
        {verification.status !== 'error' && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-white p-3 dark:bg-neutral-800">
              <p className="text-xs text-neutral-500">Is a Resume?</p>
              <p className={`text-lg font-bold ${verification.is_valid_resume ? 'text-green-600' : 'text-red-600'}`}>
                {verification.is_valid_resume === null ? 'N/A' : verification.is_valid_resume ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-3 dark:bg-neutral-800">
              <p className="text-xs text-neutral-500">Appears Authentic?</p>
              <p className={`text-lg font-bold ${verification.appears_authentic ? 'text-green-600' : 'text-red-600'}`}>
                {verification.appears_authentic === null ? 'N/A' : verification.appears_authentic ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-3 dark:bg-neutral-800">
              <p className="text-xs text-neutral-500">Confidence</p>
              <p className={`text-lg font-bold ${confidenceColor}`}>
                {confidencePercent !== null ? `${confidencePercent}%` : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Fake Indicators */}
        {fakeIndicators.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">Suspicious Indicators Detected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fakeIndicators.map((indicator, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300"
                >
                  {indicator}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning */}
        {verification.reasoning && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">AI Analysis</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-white/50 dark:bg-neutral-800/50 rounded-lg p-3">
              {verification.reasoning}
            </p>
          </div>
        )}

        {/* Error Message */}
        {verification.status === 'error' && verification.error_message && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-300">
              <span className="font-medium">Error:</span> {verification.error_message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {resumeUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-1.5 h-4 w-4" />
                  View Resume
                </a>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {verification.status === 'error' && verification.resume_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isLoading !== null}
              >
                {isLoading === 'retry' ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : null}
                Retry
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => setShowDialog('reject')}
              disabled={isLoading !== null}
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowDialog('approve')}
              disabled={isLoading !== null}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={showDialog === 'approve'} onOpenChange={(open) => !open && setShowDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Approve Resume Verification
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the resume as verified for this candidate.
              {!verification.appears_authentic && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Note: The AI detected potential fake indicators. Please verify carefully.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Optional: Add review notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isLoading !== null}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isLoading === 'approve' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showDialog === 'reject'} onOpenChange={(open) => !open && setShowDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Reject Resume
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the resume as rejected. The candidate may need to upload a different resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Required: Reason for rejection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isLoading !== null || !notes.trim()}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading === 'reject' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
