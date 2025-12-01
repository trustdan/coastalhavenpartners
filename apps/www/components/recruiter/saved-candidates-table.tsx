'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import {
  CandidateStatusBadge,
  BOOKMARK_STATUS_CONFIG,
  type BookmarkStatus,
} from './candidate-status-badge'
import { CandidateStatusSelect } from './candidate-status-select'

interface Bookmark {
  id: string
  notes: string | null
  status: BookmarkStatus
  created_at: string | null
  candidate_id: string
  candidate_profiles: {
    id: string
    school_name: string
    major: string
    gpa: number
    graduation_year: number
    target_roles: string[] | null
    gpa_verified: boolean | null
    profiles: {
      full_name: string
      email: string
    } | null
  } | null
}

interface SavedCandidatesTableProps {
  bookmarks: Bookmark[]
}

const STATUS_ORDER: BookmarkStatus[] = [
  'new',
  'contacted',
  'interviewing',
  'offer_extended',
  'hired',
  'passed',
  'not_a_fit',
]

export function SavedCandidatesTable({ bookmarks: initialBookmarks }: SavedCandidatesTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<BookmarkStatus | 'all'>('all')
  const [bookmarks, setBookmarks] = useState(initialBookmarks)

  const filteredBookmarks = selectedStatus === 'all'
    ? bookmarks
    : bookmarks.filter((b) => b.status === selectedStatus)

  // Count by status
  const statusCounts = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = bookmarks.filter((b) => b.status === status).length
      return acc
    },
    {} as Record<BookmarkStatus, number>
  )

  const handleStatusChange = (candidateId: string, newStatus: BookmarkStatus) => {
    setBookmarks((prev) =>
      prev.map((b) =>
        b.candidate_id === candidateId ? { ...b, status: newStatus } : b
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedStatus === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
          }`}
        >
          All ({bookmarks.length})
        </button>
        {STATUS_ORDER.map((status) => {
          const config = BOOKMARK_STATUS_CONFIG[status]
          const count = statusCounts[status]
          if (count === 0) return null
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : `${config.bgColor} ${config.color} hover:opacity-80`
              }`}
            >
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">School</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
                <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Grad Year</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Saved On</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBookmarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-neutral-600 dark:text-neutral-400">
                    No candidates with this status
                  </td>
                </tr>
              ) : (
                filteredBookmarks.map((bookmark) => {
                  const candidate = bookmark.candidate_profiles
                  if (!candidate) return null

                  return (
                    <tr key={bookmark.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
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
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                          {candidate.gpa?.toFixed(2)}
                          {candidate.gpa_verified && (
                            <BadgeCheck className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{candidate.graduation_year}</td>
                      <td className="px-6 py-4">
                        <CandidateStatusSelect
                          candidateId={bookmark.candidate_id}
                          currentStatus={bookmark.status}
                          onStatusChange={(newStatus) =>
                            handleStatusChange(bookmark.candidate_id, newStatus)
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {bookmark.created_at
                          ? new Date(bookmark.created_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/recruiter/candidates/${candidate.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
