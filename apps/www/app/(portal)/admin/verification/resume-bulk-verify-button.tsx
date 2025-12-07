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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FileText, Loader2, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react"
import { bulkAutoVerifyResumes, reprocessFlaggedResumes } from "../actions"
import { toast } from "sonner"

interface VerificationResults {
  processed: number
  autoVerified: number
  flagged: number
  errors: number
}

export function ResumeBulkVerifyButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<VerificationResults | null>(null)

  async function handleBulkVerify() {
    setIsLoading(true)
    setResults(null)

    try {
      const result = await bulkAutoVerifyResumes(50)

      const summary = {
        processed: result.processed,
        autoVerified: result.results.filter(r => r.result.status === 'auto_verified').length,
        flagged: result.results.filter(r => r.result.status === 'flagged').length,
        errors: result.results.filter(r => r.result.status === 'error').length,
      }

      setResults(summary)

      if (summary.processed === 0) {
        toast.info('No new resumes to process')
      } else if (summary.autoVerified > 0) {
        toast.success(`Auto-verified ${summary.autoVerified} resumes`)
      }
      if (summary.flagged > 0) {
        toast.info(`${summary.flagged} resumes flagged for review`)
      }
      if (summary.errors > 0) {
        toast.error(`${summary.errors} resumes failed to process`)
      }
    } catch (error) {
      toast.error('Failed to process resumes')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <FileText className="mr-2 h-4 w-4" />
          Auto-Verify Resumes
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            Bulk Resume Verification
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will use AI to automatically verify <strong>new pending</strong> resumes.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Checks if documents are actual resumes (not transcripts, essays, etc.)</li>
                <li>Detects fake/placeholder content (Jane Doe, 555-555-5555, lorem ipsum)</li>
                <li>Auto-verifies authentic resumes with high confidence</li>
                <li>Flags suspicious resumes for manual review</li>
                <li className="text-neutral-500">Processing up to 50 resumes at a time</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {results && (
          <div className="grid grid-cols-3 gap-3 py-4">
            <div className="rounded-lg border bg-green-50 p-3 text-center dark:bg-green-900/20">
              <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{results.autoVerified}</p>
              <p className="text-xs text-green-600">Auto-Verified</p>
            </div>
            <div className="rounded-lg border bg-amber-50 p-3 text-center dark:bg-amber-900/20">
              <AlertTriangle className="mx-auto h-5 w-5 text-amber-600" />
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{results.flagged}</p>
              <p className="text-xs text-amber-600">Flagged</p>
            </div>
            <div className="rounded-lg border bg-red-50 p-3 text-center dark:bg-red-900/20">
              <XCircle className="mx-auto h-5 w-5 text-red-600" />
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{results.errors}</p>
              <p className="text-xs text-red-600">Errors</p>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {results ? 'Close' : 'Cancel'}
          </AlertDialogCancel>
          {!results && (
            <AlertDialogAction
              onClick={handleBulkVerify}
              disabled={isLoading}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Start Processing
                </>
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ResumeReprocessFlaggedButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<VerificationResults | null>(null)

  async function handleReprocess() {
    setIsLoading(true)
    setResults(null)

    try {
      const result = await reprocessFlaggedResumes(50)

      const summary = {
        processed: result.processed,
        autoVerified: result.results.filter(r => r.result.status === 'auto_verified').length,
        flagged: result.results.filter(r => r.result.status === 'flagged').length,
        errors: result.results.filter(r => r.result.status === 'error').length,
      }

      setResults(summary)

      if (summary.processed === 0) {
        toast.info('No flagged resumes to reprocess')
      } else if (summary.autoVerified > 0) {
        toast.success(`Reprocessed: ${summary.autoVerified} now auto-verified!`)
      }
      if (summary.flagged > 0) {
        toast.info(`${summary.flagged} resumes still flagged`)
      }
      if (summary.errors > 0) {
        toast.error(`${summary.errors} resumes failed to process`)
      }
    } catch (error) {
      toast.error('Failed to reprocess resumes')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reprocess Flagged Resumes
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-emerald-500" />
            Reprocess Flagged Resumes
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will <strong>re-run verification</strong> on resumes that were previously flagged.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Use this after fixing code/configuration issues</li>
                <li>Flagged resumes will be reprocessed through the full verification flow</li>
                <li>Successfully verified resumes will be updated</li>
                <li className="text-emerald-600">This may incur additional API costs</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {results && (
          <div className="grid grid-cols-3 gap-3 py-4">
            <div className="rounded-lg border bg-green-50 p-3 text-center dark:bg-green-900/20">
              <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{results.autoVerified}</p>
              <p className="text-xs text-green-600">Now Verified</p>
            </div>
            <div className="rounded-lg border bg-amber-50 p-3 text-center dark:bg-amber-900/20">
              <AlertTriangle className="mx-auto h-5 w-5 text-amber-600" />
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{results.flagged}</p>
              <p className="text-xs text-amber-600">Still Flagged</p>
            </div>
            <div className="rounded-lg border bg-red-50 p-3 text-center dark:bg-red-900/20">
              <XCircle className="mx-auto h-5 w-5 text-red-600" />
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{results.errors}</p>
              <p className="text-xs text-red-600">Errors</p>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {results ? 'Close' : 'Cancel'}
          </AlertDialogCancel>
          {!results && (
            <AlertDialogAction
              onClick={handleReprocess}
              disabled={isLoading}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reprocessing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reprocess Flagged
                </>
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
