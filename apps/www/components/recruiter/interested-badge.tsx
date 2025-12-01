import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InterestedBadgeProps {
  className?: string
  size?: 'sm' | 'default'
}

export function InterestedBadge({ className, size = 'default' }: InterestedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        'bg-pink-50 border-pink-200 text-pink-700',
        'dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-300',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
      title="This candidate has expressed interest in your firm"
    >
      <Heart className={cn('fill-current', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      Interested
    </span>
  )
}
