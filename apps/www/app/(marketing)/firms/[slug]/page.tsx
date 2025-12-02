import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Users, Globe, Calendar, Linkedin, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getFirmBySlug, getAllFirmSlugs } from '../actions'

interface FirmPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllFirmSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: FirmPageProps): Promise<Metadata> {
  const { slug } = await params
  const firm = await getFirmBySlug(slug)

  if (!firm) {
    return {
      title: 'Firm Not Found',
    }
  }

  return {
    title: `${firm.name} | Coastal Haven Partners`,
    description: firm.description || `Learn about ${firm.name} and their recruiting opportunities.`,
  }
}

const firmTypeColors: Record<string, string> = {
  'Private Equity': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
  'Venture Capital': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  'Investment Banking': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  'Hedge Fund': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200',
  'Consulting': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200',
  'Asset Management': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
}

export default async function FirmPage({ params }: FirmPageProps) {
  const { slug } = await params
  const firm = await getFirmBySlug(slug)

  if (!firm) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/firms"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        All Firms
      </Link>

      <div className="rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
        {/* Header */}
        <div className="border-b p-8">
          <div className="flex items-start gap-6">
            {firm.logo_url ? (
              <img
                src={firm.logo_url}
                alt={`${firm.name} logo`}
                className="h-20 w-20 rounded-xl object-contain bg-neutral-100 dark:bg-neutral-800 p-3"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <span className="text-3xl font-bold">
                  {firm.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{firm.name}</h1>
                {firm.firm_type && (
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${firmTypeColors[firm.firm_type] || 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'}`}>
                    {firm.firm_type}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                {firm.locations && firm.locations.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{firm.locations.join(', ')}</span>
                  </div>
                )}
                {firm.employee_count && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{firm.employee_count} employees</span>
                  </div>
                )}
                {firm.founded_year && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {firm.founded_year}</span>
                  </div>
                )}
              </div>

              {firm.website && (
                <a
                  href={firm.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {firm.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        {(firm.description || firm.culture) && (
          <div className="border-b p-8">
            {firm.description && (
              <div>
                <h2 className="text-lg font-semibold">About</h2>
                <p className="mt-3 text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                  {firm.description}
                </p>
              </div>
            )}
            {firm.culture && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Culture & Values</h2>
                <p className="mt-3 text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                  {firm.culture}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hiring Roles */}
        {firm.hiring_roles && firm.hiring_roles.length > 0 && (
          <div className="border-b p-8">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Currently Hiring
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {firm.hiring_roles.map((role) => (
                <span
                  key={role}
                  className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {firm.recruiters && firm.recruiters.length > 0 && (
          <div className="p-8">
            <h2 className="text-lg font-semibold">Recruiting Team</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {firm.recruiters.map((recruiter) => (
                <div
                  key={recruiter.id}
                  className="flex items-center gap-4 rounded-lg border p-4 dark:border-neutral-700"
                >
                  {recruiter.profile_photo_url ? (
                    <img
                      src={recruiter.profile_photo_url}
                      alt={recruiter.profiles?.full_name || 'Recruiter'}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <span className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
                        {(recruiter.profiles?.full_name || 'R').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {recruiter.profiles?.full_name || 'Team Member'}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                      {recruiter.job_title}
                    </p>
                  </div>
                  {recruiter.linkedin_url && (
                    <a
                      href={recruiter.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA for candidates */}
      <div className="mt-8 rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center dark:from-blue-950/20 dark:to-purple-950/20 dark:border-neutral-800">
        <h3 className="text-xl font-semibold">Interested in {firm.name}?</h3>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Join Coastal Haven Partners to express interest and connect with recruiters.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/candidate/signup">Create Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
