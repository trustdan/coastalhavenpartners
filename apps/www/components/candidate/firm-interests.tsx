'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, X, Loader2, Building2, Plus, Search } from 'lucide-react'
import {
  addFirmInterest,
  removeFirmInterest,
  getKnownFirms,
} from '@/app/(portal)/candidate/firm-interests-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FirmInterest {
  id: string
  firm_name: string
  created_at: string | null
}

interface FirmInterestsProps {
  initialInterests: FirmInterest[]
  maxInterests?: number
}

export function FirmInterests({ initialInterests, maxInterests = 10 }: FirmInterestsProps) {
  const [interests, setInterests] = useState<FirmInterest[]>(initialInterests)
  const [newFirm, setNewFirm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const remainingSlots = maxInterests - interests.length

  // Debounced search for firm suggestions
  useEffect(() => {
    if (newFirm.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      const firms = await getKnownFirms(newFirm)
      setSuggestions(firms)
    }, 300)

    return () => clearTimeout(timer)
  }, [newFirm])

  const handleAddFirm = (firmName: string) => {
    if (!firmName.trim()) return
    if (interests.length >= maxInterests) {
      toast.error(`You can only express interest in up to ${maxInterests} firms`)
      return
    }

    // Check if already exists
    if (interests.some(i => i.firm_name.toLowerCase() === firmName.toLowerCase())) {
      toast.error('You have already added this firm')
      return
    }

    startTransition(async () => {
      try {
        await addFirmInterest(firmName)
        setInterests(prev => [
          { id: crypto.randomUUID(), firm_name: firmName, created_at: new Date().toISOString() },
          ...prev
        ])
        setNewFirm('')
        setSuggestions([])
        setShowSuggestions(false)
        toast.success(`Added ${firmName} to your interested firms`)
      } catch (error: any) {
        toast.error(error.message || 'Failed to add firm')
      }
    })
  }

  const handleRemoveFirm = (interest: FirmInterest) => {
    setRemovingId(interest.id)
    startTransition(async () => {
      try {
        await removeFirmInterest(interest.id)
        setInterests(prev => prev.filter(i => i.id !== interest.id))
        toast.success(`Removed ${interest.firm_name} from your interests`)
      } catch (error: any) {
        toast.error(error.message || 'Failed to remove firm')
      } finally {
        setRemovingId(null)
      }
    })
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/20">
          <Heart className="h-5 w-5 text-pink-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Interested Firms</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Let recruiters know you're interested in their firm
          </p>
        </div>
      </div>

      {/* Current Interests */}
      {interests.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className={cn(
                'group flex items-center gap-2 rounded-full border px-3 py-1.5',
                'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
                removingId === interest.id && 'opacity-50'
              )}
            >
              <Building2 className="h-3.5 w-3.5 text-pink-600" />
              <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                {interest.firm_name}
              </span>
              <button
                onClick={() => handleRemoveFirm(interest)}
                disabled={isPending}
                className="ml-1 rounded-full p-0.5 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
                aria-label={`Remove ${interest.firm_name}`}
              >
                {removingId === interest.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-600" />
                ) : (
                  <X className="h-3.5 w-3.5 text-pink-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Firm */}
      {remainingSlots > 0 ? (
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={newFirm}
                onChange={(e) => {
                  setNewFirm(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Delay to allow clicking on suggestions
                  setTimeout(() => setShowSuggestions(false), 200)
                }}
                placeholder="Search for a firm..."
                className="pl-10"
                disabled={isPending}
              />
            </div>
            <Button
              onClick={() => handleAddFirm(newFirm)}
              disabled={isPending || !newFirm.trim()}
              size="icon"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg dark:bg-neutral-900">
              {suggestions.map((firm) => (
                <button
                  key={firm}
                  onClick={() => handleAddFirm(firm)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 first:rounded-t-lg last:rounded-b-lg"
                >
                  <Building2 className="h-4 w-4 text-neutral-400" />
                  {firm}
                </button>
              ))}
            </div>
          )}

          <p className="mt-2 text-xs text-neutral-500">
            {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          You've reached the maximum of {maxInterests} firms. Remove one to add another.
        </p>
      )}

      {/* Info Box */}
      <div className="mt-4 rounded-lg bg-pink-50 p-3 dark:bg-pink-900/10">
        <p className="text-xs text-pink-800 dark:text-pink-200">
          <strong>How it works:</strong> When you express interest in a firm, recruiters from that firm
          will see a special badge on your profile. This creates a warm signal and can increase your
          chances of getting contacted.
        </p>
      </div>
    </div>
  )
}
