import { Metadata } from 'next'
import Link from 'next/link'
import { Building2, MapPin, Users, ExternalLink } from 'lucide-react'
import { getVisibleFirms } from './actions'

export const metadata: Metadata = {
  title: 'Recruiting Firms | Coastal Haven Partners',
  description: 'Explore firms actively recruiting from the Coastal Haven Partners network. Connect with top PE, VC, IB, and hedge fund recruiters.',
}

const firmTypeColors: Record<string, string> = {
  'Private Equity': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
  'Venture Capital': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  'Investment Banking': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  'Hedge Fund': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200',
  'Consulting': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200',
  'Asset Management': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
}

export default async function FirmsPage() {
  const firms = await getVisibleFirms()

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Recruiting Firms</h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Explore firms actively recruiting from our network
        </p>
      </div>

      {firms.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
          <Building2 className="mx-auto h-12 w-12 text-neutral-400" />
          <h2 className="mt-4 text-xl font-semibold">No firms yet</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Check back soon as more firms join our network.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {firms.map((firm) => (
            <Link
              key={firm.id}
              href={`/firms/${firm.slug}`}
              className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:bg-neutral-900 dark:hover:border-blue-800"
            >
              <div className="flex items-start gap-4">
                {firm.logo_url ? (
                  <img
                    src={firm.logo_url}
                    alt={`${firm.name} logo`}
                    className="h-14 w-14 rounded-lg object-contain bg-neutral-100 dark:bg-neutral-800 p-2"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <span className="text-xl font-bold">
                      {firm.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {firm.name}
                  </h3>
                  {firm.firm_type && (
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${firmTypeColors[firm.firm_type] || 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'}`}>
                      {firm.firm_type}
                    </span>
                  )}
                </div>
              </div>

              {firm.description && (
                <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {firm.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                {firm.locations && firm.locations.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{firm.locations.slice(0, 2).join(', ')}</span>
                    {firm.locations.length > 2 && (
                      <span className="text-neutral-400">+{firm.locations.length - 2}</span>
                    )}
                  </div>
                )}
                {firm.employee_count && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{firm.employee_count}</span>
                  </div>
                )}
              </div>

              {firm.hiring_roles && firm.hiring_roles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {firm.hiring_roles.slice(0, 3).map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300"
                    >
                      Hiring: {role}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
