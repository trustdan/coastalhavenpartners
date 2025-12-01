import { createClient } from '@/lib/supabase/server'
import { Building2, Eye, TrendingUp } from 'lucide-react'

interface FirmView {
  firmName: string
  viewCount: number
  lastViewed: string
}

interface ProfileViewersProps {
  userId: string
}

export async function ProfileViewers({ userId }: ProfileViewersProps) {
  const supabase = await createClient()

  // Get all profile views for this candidate
  const { data: viewEvents } = await supabase
    .from('analytics_events')
    .select('metadata, created_at')
    .eq('target_id', userId)
    .eq('event_type', 'profile_view')
    .order('created_at', { ascending: false })

  if (!viewEvents || viewEvents.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Who's Viewing Your Profile</h2>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Eye className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            No profile views yet. Complete your profile to attract recruiters!
          </p>
        </div>
      </div>
    )
  }

  // Group views by firm name
  const firmViews = new Map<string, { count: number; lastViewed: string }>()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  let weeklyViews = 0
  let monthlyViews = 0

  for (const event of viewEvents) {
    const firmName = (event.metadata as any)?.recruiter_firm || 'Unknown Firm'
    const createdAt = event.created_at || new Date().toISOString()
    const viewDate = new Date(createdAt)

    if (viewDate >= weekAgo) weeklyViews++
    if (viewDate >= monthAgo) monthlyViews++

    const existing = firmViews.get(firmName)
    if (existing) {
      existing.count++
    } else {
      firmViews.set(firmName, {
        count: 1,
        lastViewed: createdAt
      })
    }
  }

  // Convert to sorted array (most views first)
  const sortedFirms: FirmView[] = Array.from(firmViews.entries())
    .map(([firmName, data]) => ({
      firmName,
      viewCount: data.count,
      lastViewed: data.lastViewed
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10) // Show top 10

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Who's Viewing Your Profile</h2>
        <div className="flex items-center gap-1 text-sm text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span>{weeklyViews} this week</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid grid-cols-3 gap-4 border-b pb-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{viewEvents.length}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Views</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{monthlyViews}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">This Month</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{firmViews.size}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Unique Firms</p>
        </div>
      </div>

      {/* Firm List */}
      <div className="mt-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          Firms interested in you
        </p>
        {sortedFirms.map((firm) => (
          <div
            key={firm.firmName}
            className="flex items-center justify-between rounded-lg border bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">{firm.firmName}</p>
                <p className="text-xs text-neutral-500">
                  {formatTimeAgo(firm.lastViewed)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{firm.viewCount}</p>
              <p className="text-xs text-neutral-500">
                {firm.viewCount === 1 ? 'view' : 'views'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {sortedFirms.length < firmViews.size && (
        <p className="mt-4 text-center text-xs text-neutral-500">
          + {firmViews.size - sortedFirms.length} more firms
        </p>
      )}
    </div>
  )
}
