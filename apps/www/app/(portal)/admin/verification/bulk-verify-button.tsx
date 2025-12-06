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
import { Bot, Loader2, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react"
import { bulkAutoVerifyTranscripts, reprocessFlaggedTranscripts } from "../actions"
import { toast } from "sonner"

interface VerificationResults {
  processed: number
  autoVerified: number
  flagged: number
  errors: number
}

export function BulkVerifyButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<VerificationResults | null>(null)

  async function handleBulkVerify() {
    setIsLoading(true)
    setResults(null)

    try {
      const result = await bulkAutoVerifyTranscripts(50)

      const summary = {
        processed: result.processed,
        autoVerified: result.results.filter(r => r.result.status === 'auto_verified').length,
        flagged: result.results.filter(r => r.result.status === 'flagged').length,
        errors: result.results.filter(r => r.result.status === 'error').length,
      }

      setResults(summary)

      if (summary.processed === 0) {
        toast.info('No new transcripts to process')
      } else if (summary.autoVerified > 0) {
        toast.success(`Auto-verified ${summary.autoVerified} transcripts`)
      }
      if (summary.flagged > 0) {
        toast.info(`${summary.flagged} transcripts flagged for review`)
      }
      if (summary.errors > 0) {
        toast.error(`${summary.errors} transcripts failed to process`)
      }
    } catch (error) {
      toast.error('Failed to process transcripts')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Bot className="mr-2 h-4 w-4" />
          Auto-Verify Pending
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            Bulk Auto-Verification
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will use AI to automatically verify GPAs for all <strong>new pending</strong> transcripts.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Transcripts with matching GPAs will be auto-verified</li>
                <li>Mismatches or low confidence results will be flagged for review</li>
                <li>Processing up to 50 transcripts at a time</li>
                <li className="text-neutral-500">Already-flagged transcripts are NOT reprocessed</li>
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
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
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

export function ReprocessFlaggedButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<VerificationResults | null>(null)

  async function handleReprocess() {
    setIsLoading(true)
    setResults(null)

    try {
      const result = await reprocessFlaggedTranscripts(50)

      const summary = {
        processed: result.processed,
        autoVerified: result.results.filter(r => r.result.status === 'auto_verified').length,
        flagged: result.results.filter(r => r.result.status === 'flagged').length,
        errors: result.results.filter(r => r.result.status === 'error').length,
      }

      setResults(summary)

      if (summary.processed === 0) {
        toast.info('No flagged transcripts to reprocess')
      } else if (summary.autoVerified > 0) {
        toast.success(`Reprocessed: ${summary.autoVerified} now auto-verified!`)
      }
      if (summary.flagged > 0) {
        toast.info(`${summary.flagged} transcripts still flagged`)
      }
      if (summary.errors > 0) {
        toast.error(`${summary.errors} transcripts failed to process`)
      }
    } catch (error) {
      toast.error('Failed to reprocess transcripts')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reprocess Flagged
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-500" />
            Reprocess Flagged Transcripts
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will <strong>re-run verification</strong> on transcripts that were previously flagged.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Use this after fixing code/configuration issues</li>
                <li>Flagged transcripts will be reprocessed through the full verification flow</li>
                <li>Successfully verified transcripts will be updated</li>
                <li className="text-amber-600">This may incur additional API costs</li>
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
              className="bg-amber-600 text-white hover:bg-amber-700"
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
