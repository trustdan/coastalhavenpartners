'use client'

import Link from 'next/link'
import { Building2, MapPin, Briefcase, ArrowRight } from 'lucide-react'

interface Firm {
  id: string
  name: string
  slug: string
  logo_url: string | null
  firm_type: string | null
  locations: string[] | null
  hiring_roles: string[] | null
  description: string | null
}

interface RecruitingFirmsProps {
  firms: Firm[]
}

const firmTypeColors: Record<string, string> = {
  'Private Equity': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
  'Venture Capital': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  'Investment Banking': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  'Hedge Fund': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200',
  'Consulting': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200',
  'Asset Management': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
}

export function RecruitingFirms({ firms }: RecruitingFirmsProps) {
  if (firms.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Recruiting Firms</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Firms actively recruiting from our network
            </p>
          </div>
        </div>
        <Link
          href="/firms"
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {firms.slice(0, 4).map((firm) => (
          <Link
            key={firm.id}
            href={`/firms/${firm.slug}`}
            className="group flex items-start gap-3 rounded-lg border p-4 transition-all hover:border-blue-200 hover:shadow-sm dark:border-neutral-700 dark:hover:border-blue-800"
          >
            {firm.logo_url ? (
              <img
                src={firm.logo_url}
                alt={`${firm.name} logo`}
                className="h-10 w-10 rounded-lg object-contain bg-neutral-100 dark:bg-neutral-800 p-1"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <span className="text-lg font-bold">
                  {firm.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {firm.name}
                </h3>
                {firm.firm_type && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${firmTypeColors[firm.firm_type] || 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'}`}>
                    {firm.firm_type}
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                {firm.locations && firm.locations.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {firm.locations[0]}
                    {firm.locations.length > 1 && ` +${firm.locations.length - 1}`}
                  </span>
                )}
                {firm.hiring_roles && firm.hiring_roles.length > 0 && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Briefcase className="h-3 w-3" />
                    Hiring
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {firms.length > 4 && (
        <div className="mt-4 text-center">
          <Link
            href="/firms"
            className="text-sm text-blue-600 hover:underline"
          >
            View all {firms.length} firms
          </Link>
        </div>
      )}
    </div>
  )
}
