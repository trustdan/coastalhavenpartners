import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/types/database.types"
import { ApplicantCard } from "./applicant-card"
import { ApplicationFilters } from "./application-filters"

type ApplicationWithSnapshot = Database["public"]["Tables"]["applications"]["Row"] & {
  snapshot: {
    full_name: string
    email: string
    phone: string | null
    linkedin_url: string | null
    school_name: string
    major: string
    graduation_year: number
    gpa: number
    resume_url: string | null
    transcript_url: string | null
    scheduling_url: string | null
    bio: string | null
    target_roles: string[] | null
    preferred_locations: string[] | null
  }
}

interface PageProps {
  searchParams: Promise<{
    university?: string
    gradYear?: string
    minGpa?: string
    maxGpa?: string
    sort?: string
  }>
}

export default async function CapitalApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // Verify admin role
  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (adminProfile?.role !== "admin") {
    redirect("/login")
  }

  // Fetch all Capital applications
  const { data: applications } = await supabaseAdmin
    .from("applications")
    .select("*")
    .eq("target_type", "capital")
    .order("applied_at", { ascending: false })

  const typedApplications = (applications || []) as ApplicationWithSnapshot[]

  // Extract unique filter options from all applications
  const universities = [...new Set(typedApplications.map((a) => a.snapshot.school_name))].sort()
  const graduationYears = [...new Set(typedApplications.map((a) => a.snapshot.graduation_year))].sort((a, b) => a - b)

  // Apply filters
  const filteredApplications = typedApplications.filter((app) => {
    // University filter
    if (params.university && app.snapshot.school_name !== params.university) {
      return false
    }

    // Graduation year filter
    if (params.gradYear && app.snapshot.graduation_year !== parseInt(params.gradYear)) {
      return false
    }

    // Min GPA filter
    if (params.minGpa && app.snapshot.gpa < parseFloat(params.minGpa)) {
      return false
    }

    // Max GPA filter
    if (params.maxGpa && app.snapshot.gpa > parseFloat(params.maxGpa)) {
      return false
    }

    return true
  })

  // Apply sorting
  const sortOption = params.sort || "date_desc"
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortOption) {
      case "date_asc":
        return new Date(a.applied_at || 0).getTime() - new Date(b.applied_at || 0).getTime()
      case "name_asc":
        return a.snapshot.full_name.localeCompare(b.snapshot.full_name)
      case "name_desc":
        return b.snapshot.full_name.localeCompare(a.snapshot.full_name)
      case "gpa_desc":
        return b.snapshot.gpa - a.snapshot.gpa
      case "gpa_asc":
        return a.snapshot.gpa - b.snapshot.gpa
      case "university_asc":
        return a.snapshot.school_name.localeCompare(b.snapshot.school_name)
      case "date_desc":
      default:
        return new Date(b.applied_at || 0).getTime() - new Date(a.applied_at || 0).getTime()
    }
  })

  const hasActiveFilters = params.university || params.gradYear || params.minGpa || params.maxGpa

  // Group by status (using sorted and filtered applications)
  const pending = sortedApplications.filter((a) => a.status === "pending")
  const reviewing = sortedApplications.filter((a) => a.status === "reviewing")
  const interviewed = sortedApplications.filter((a) => a.status === "interviewed")
  const accepted = sortedApplications.filter((a) => a.status === "accepted")
  const rejected = sortedApplications.filter((a) => a.status === "rejected")
  const withdrawn = sortedApplications.filter((a) => a.status === "withdrawn")

  return (
    <div className="space-y-8">
      {/* Filters */}
      <ApplicationFilters
        universities={universities}
        graduationYears={graduationYears}
      />

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          Showing {filteredApplications.length} of {typedApplications.length} applications
          {params.university && <span className="ml-1">from {params.university}</span>}
          {params.gradYear && <span className="ml-1">graduating in {params.gradYear}</span>}
          {params.minGpa && <span className="ml-1">with GPA {">="} {params.minGpa}</span>}
          {params.maxGpa && <span className="ml-1">with GPA {"<="} {params.maxGpa}</span>}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-3xl font-bold text-yellow-600">{pending.length}</p>
          <p className="text-sm text-neutral-500">Pending</p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-3xl font-bold text-blue-600">{reviewing.length}</p>
          <p className="text-sm text-neutral-500">Reviewing</p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-3xl font-bold text-purple-600">
            {interviewed.length}
          </p>
          <p className="text-sm text-neutral-500">Interviewed</p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-3xl font-bold text-green-600">{accepted.length}</p>
          <p className="text-sm text-neutral-500">Accepted</p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-3xl font-bold text-red-600">{rejected.length}</p>
          <p className="text-sm text-neutral-500">Rejected</p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-3xl font-bold text-neutral-400">{withdrawn.length}</p>
          <p className="text-sm text-neutral-500">Withdrawn</p>
        </div>
      </div>

      {/* Pending Applications */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Pending Review</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {pending.length} applications waiting for initial review
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {pending.map((application) => (
            <ApplicantCard key={application.id} application={application} />
          ))}
        </div>
        {pending.length === 0 && (
          <p className="py-8 text-center text-neutral-500">
            No pending applications
          </p>
        )}
      </section>

      {/* Reviewing Applications */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-blue-600">Under Review</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {reviewing.length} applications being reviewed
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {reviewing.map((application) => (
            <ApplicantCard key={application.id} application={application} />
          ))}
        </div>
        {reviewing.length === 0 && (
          <p className="py-8 text-center text-neutral-500">
            No applications under review
          </p>
        )}
      </section>

      {/* Interviewed Applications */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-purple-600">Interviewed</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {interviewed.length} candidates interviewed
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {interviewed.map((application) => (
            <ApplicantCard key={application.id} application={application} />
          ))}
        </div>
        {interviewed.length === 0 && (
          <p className="py-8 text-center text-neutral-500">
            No interviewed candidates
          </p>
        )}
      </section>

      {/* Accepted */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-green-600">Accepted</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {accepted.length} offers extended
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {accepted.map((application) => (
            <ApplicantCard key={application.id} application={application} />
          ))}
        </div>
        {accepted.length === 0 && (
          <p className="py-8 text-center text-neutral-500">
            No accepted candidates yet
          </p>
        )}
      </section>

      {/* Rejected */}
      {rejected.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-red-600">Rejected</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              {rejected.length} applications declined
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {rejected.map((application) => (
              <ApplicantCard key={application.id} application={application} />
            ))}
          </div>
        </section>
      )}

      {/* Withdrawn */}
      {withdrawn.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-neutral-400">Withdrawn</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              {withdrawn.length} applications withdrawn by candidate
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {withdrawn.map((application) => (
              <ApplicantCard key={application.id} application={application} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
