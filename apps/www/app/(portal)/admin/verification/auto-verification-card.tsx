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
  Bot,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Brain,
  FileText,
} from "lucide-react"
import { manuallyVerifyAutoVerification, autoVerifyTranscript } from "../actions"

interface AutoVerification {
  id: string
  candidate_profile_id: string
  transcript_id: string | null
  extracted_text: string | null
  extracted_gpa: number | null
  extracted_gpa_scale: string | null
  extraction_confidence: string | null
  extraction_reasoning: string | null
  entered_gpa: number | null
  gpa_match: boolean | null
  gpa_difference: number | null
  status: string
  error_message: string | null
  created_at: string
  candidate_profiles: {
    id: string
    gpa: number
    school_name: string
    user_id: string | null
  } | null
  profile: {
    id: string
    full_name: string
    email: string
  } | null
}

interface AutoVerificationCardProps {
  verification: AutoVerification
  transcriptUrl?: string
}

export function AutoVerificationCard({ verification, transcriptUrl }: AutoVerificationCardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')

  async function handleRetry() {
    if (!verification.transcript_id) return
    setIsLoading('retry')
    try {
      await autoVerifyTranscript(verification.candidate_profile_id, verification.transcript_id)
    } finally {
      setIsLoading(null)
    }
  }

  async function handleApprove() {
    setIsLoading('approve')
    try {
      await manuallyVerifyAutoVerification(verification.id, 'verified', notes)
    } finally {
      setIsLoading(null)
      setShowDialog(null)
      setNotes('')
    }
  }

  async function handleReject() {
    setIsLoading('reject')
    try {
      await manuallyVerifyAutoVerification(verification.id, 'rejected', notes)
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

  const confidenceColors = {
    high: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    medium: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    low: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  }

  return (
    <>
      <div className={`rounded-xl border p-6 shadow-sm ${statusColors[verification.status as keyof typeof statusColors] || 'bg-white dark:bg-neutral-900'}`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
              <Bot className="h-5 w-5 text-purple-600" />
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

        {/* GPA Comparison */}
        {verification.status !== 'error' && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-white p-3 dark:bg-neutral-800">
              <p className="text-xs text-neutral-500">Entered GPA</p>
              <p className="text-xl font-bold">{verification.entered_gpa?.toFixed(2) || 'N/A'}</p>
            </div>
            <div className="rounded-lg border bg-white p-3 dark:bg-neutral-800">
              <p className="text-xs text-neutral-500">Extracted GPA</p>
              <p className="text-xl font-bold">
                {verification.extracted_gpa?.toFixed(2) || 'N/A'}
                {verification.extracted_gpa_scale && verification.extracted_gpa_scale !== '4.0' && (
                  <span className="ml-1 text-sm font-normal text-neutral-500">
                    / {verification.extracted_gpa_scale}
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-3 dark:bg-neutral-800">
              <p className="text-xs text-neutral-500">Difference</p>
              <p className={`text-xl font-bold ${verification.gpa_match ? 'text-green-600' : 'text-red-600'}`}>
                {verification.gpa_difference !== null
                  ? (verification.gpa_match ? '✓ Match' : `±${verification.gpa_difference.toFixed(2)}`)
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        )}

        {/* Confidence & Reasoning */}
        {verification.extraction_confidence && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">AI Analysis</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColors[verification.extraction_confidence as keyof typeof confidenceColors]}`}>
                {verification.extraction_confidence} confidence
              </span>
            </div>
            {verification.extraction_reasoning && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-white/50 dark:bg-neutral-800/50 rounded-lg p-3">
                {verification.extraction_reasoning}
              </p>
            )}
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
            {transcriptUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={transcriptUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-1.5 h-4 w-4" />
                  View Transcript
                </a>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {verification.status === 'error' && verification.transcript_id && (
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
              Approve GPA Verification
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the GPA as verified for this candidate.
              {verification.gpa_match === false && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Note: The AI detected a GPA mismatch. Please verify carefully.
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
              Reject GPA Verification
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the GPA verification as rejected. The candidate may need to update their GPA or upload a clearer transcript.
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
