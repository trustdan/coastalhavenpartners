import Link from 'next/link'
import { Sparkles } from 'lucide-react'

interface RecommendedCandidate {
  id: string
  school_name: string
  major: string
  gpa: number
  graduation_year: number
  target_roles: string[] | null
  profiles: {
    full_name: string | null
    email: string
  } | null
  matchReason: string
}

interface RecommendedCandidatesProps {
  candidates: RecommendedCandidate[]
}

export function RecommendedCandidates({ candidates }: RecommendedCandidatesProps) {
  if (candidates.length === 0) return null

  return (
    <div className="rounded-xl border bg-gradient-to-r from-purple-50 to-blue-50 p-6 shadow-sm dark:from-purple-900/10 dark:to-blue-900/10 dark:border-purple-900/30">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold">Recommended for You</h2>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Based on candidates you've viewed recently
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {candidates.map((candidate) => (
          <Link
            key={candidate.id}
            href={`/recruiter/candidates/${candidate.id}`}
            className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-neutral-900"
          >
            <p className="font-medium truncate">{candidate.profiles?.full_name || 'Unknown'}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
              {candidate.school_name}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                {candidate.gpa.toFixed(2)} GPA
              </span>
              <span className="text-xs text-neutral-500">{candidate.graduation_year}</span>
            </div>
            <p className="mt-2 text-xs text-purple-600 dark:text-purple-400 truncate">
              {candidate.matchReason}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
