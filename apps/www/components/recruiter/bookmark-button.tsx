'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { toggleBookmark } from '@/app/(portal)/recruiter/bookmark-actions'

interface BookmarkButtonProps {
  candidateId: string
  initialBookmarked: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function BookmarkButton({
  candidateId,
  initialBookmarked,
  variant = 'outline',
  size = 'default',
  showLabel = true
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleBookmark(candidateId)
      setIsBookmarked(result.isBookmarked)
    })
  }

  return (
    <Button
      variant={isBookmarked ? 'default' : variant}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className={isBookmarked ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">
          {isBookmarked ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  )
}
