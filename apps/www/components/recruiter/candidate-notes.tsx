'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { StickyNote, ChevronDown, ChevronUp, Loader2, Check } from 'lucide-react'
import { saveCandidateNotes } from '@/app/(portal)/recruiter/bookmark-actions'

interface CandidateNotesProps {
  candidateId: string
  initialContent: string | null
  initialUpdatedAt: string | null
}

export function CandidateNotes({
  candidateId,
  initialContent,
  initialUpdatedAt
}: CandidateNotesProps) {
  const [isExpanded, setIsExpanded] = useState(!!initialContent)
  const [content, setContent] = useState(initialContent || '')
  const [lastSaved, setLastSaved] = useState(initialUpdatedAt)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isPending, startTransition] = useTransition()

  // Debounced save
  const saveNotes = useCallback((newContent: string) => {
    setSaveStatus('saving')
    startTransition(async () => {
      try {
        await saveCandidateNotes(candidateId, newContent)
        setLastSaved(new Date().toISOString())
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        console.error('Failed to save notes:', error)
        setSaveStatus('idle')
      }
    })
  }, [candidateId])

  // Debounce effect
  useEffect(() => {
    if (content === (initialContent || '')) return

    const timer = setTimeout(() => {
      saveNotes(content)
    }, 1000) // Save after 1 second of no typing

    return () => clearTimeout(timer)
  }, [content, initialContent, saveNotes])

  // Save on blur
  const handleBlur = () => {
    if (content !== (initialContent || '')) {
      saveNotes(content)
    }
  }

  const formatLastSaved = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <StickyNote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold">Private Notes</h3>
            <p className="text-sm text-neutral-500">
              {content ? `${content.length} characters` : 'Add notes about this candidate'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              Saved
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-neutral-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Add private notes about this candidate... (e.g., interview impressions, follow-up items, fit assessment)"
            className="min-h-[150px] w-full resize-y rounded-lg border bg-neutral-50 p-3 text-sm placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:bg-neutral-800 dark:border-neutral-700"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Only you can see these notes</span>
            {lastSaved && (
              <span>Last saved: {formatLastSaved(lastSaved)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
