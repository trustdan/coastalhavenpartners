'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { BadgeCheck, Heart, Square, CheckSquare, Lock } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { BulkActionsBar } from './bulk-actions-bar'

type CandidateProfile = {
  full_name: string | null
  email: string | null
}

type Candidate = {
  id: string
  school_name: string | null
  major: string | null
  gpa: number
  graduation_year: number | null
  target_roles: string[] | null
  preferred_locations: string[] | null
  status: string | null
  undergrad_degree_type: string | null
  grad_degree_type: string | null
  gpa_verified: boolean | null
  resume_verified: boolean | null
  transcript_verified: boolean | null
  profiles: CandidateProfile | null
}

interface CandidateTableProps {
  candidates: Candidate[]
  interestedCandidateIds: string[]
  isRecruiterVerified?: boolean
}

export function CandidateTable({ candidates, interestedCandidateIds, isRecruiterVerified = true }: CandidateTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allSelected = candidates.length > 0 && selectedIds.size === candidates.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < candidates.length

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(candidates.map(c => c.id)))
    }
  }, [allSelected, candidates])

  const toggleCandidate = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                {isRecruiterVerified && (
                  <th className="w-12 px-4 py-3">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      aria-label={allSelected ? 'Deselect all' : 'Select all'}
                    >
                      {allSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : someSelected ? (
                        <div className="relative">
                          <Square className="h-5 w-5" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-2 w-2 bg-blue-600 rounded-sm" />
                          </div>
                        </div>
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                )}
                {isRecruiterVerified ? (
                  <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                ) : (
                  <th className="px-6 py-3 text-left text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <Lock className="h-3.5 w-3.5" />
                      Name Hidden
                    </span>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-sm font-medium">School</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
                <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Grad Year</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Target Roles</th>
                {isRecruiterVerified && (
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {candidates && candidates.length > 0 ? (
                candidates.map((candidate) => {
                  const isSelected = selectedIds.has(candidate.id)
                  return (
                    <tr
                      key={candidate.id}
                      className={`transition-colors ${
                        isSelected && isRecruiterVerified
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {isRecruiterVerified && (
                        <td className="w-12 px-4 py-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleCandidate(candidate.id)}
                            aria-label={`Select ${candidate.profiles?.full_name || 'candidate'}`}
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        {isRecruiterVerified ? (
                          <div>
                            <p className="font-medium flex items-center gap-1.5">
                              {candidate.profiles?.full_name}
                              {interestedCandidateIds.includes(candidate.id) && (
                                <span title="Interested in your firm">
                                  <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {candidate.profiles?.email}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                              <Lock className="h-4 w-4 text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-sm text-neutral-400 italic">Verification required</p>
                              {interestedCandidateIds.includes(candidate.id) && (
                                <span className="inline-flex items-center gap-1 text-xs text-pink-500">
                                  <Heart className="h-3 w-3 fill-pink-500" />
                                  Interested in your firm
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{candidate.school_name}</td>
                      <td className="px-6 py-4 text-sm">{candidate.major}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                          {candidate.gpa.toFixed(2)}
                          {candidate.gpa_verified && (
                            <BadgeCheck className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{candidate.graduation_year}</td>
                      <td className="px-6 py-4">
                        {candidate.target_roles && candidate.target_roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {candidate.target_roles.slice(0, 2).map((role) => (
                              <span
                                key={role}
                                className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                              >
                                {role}
                              </span>
                            ))}
                            {candidate.target_roles.length > 2 && (
                              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                +{candidate.target_roles.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">Not specified</span>
                        )}
                      </td>
                      {isRecruiterVerified && (
                        <td className="px-6 py-4">
                          <Link
                            href={`/recruiter/candidates/${candidate.id}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Profile
                          </Link>
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={isRecruiterVerified ? 8 : 6} className="px-6 py-8 text-center text-neutral-600 dark:text-neutral-400">
                    No verified candidates found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isRecruiterVerified && (
        <BulkActionsBar
          selectedIds={Array.from(selectedIds)}
          onClear={clearSelection}
          candidates={candidates.filter(c => selectedIds.has(c.id))}
        />
      )}
    </>
  )
}
