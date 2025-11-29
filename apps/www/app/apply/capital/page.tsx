import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Database } from "@/lib/types/database.types"
import { ApplyToCapitalForm } from "./apply-form"

export const metadata = {
  title: "Apply to Coastal Haven Capital | Coastal Haven Partners",
  description:
    "Apply to join Coastal Haven Capital's internship program. Source real deals and build real skills in private equity.",
}

export default async function ApplyToCapitalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in - redirect to signup with redirect back here
  if (!user) {
    redirect("/signup/candidate?redirect=/apply/capital")
  }

  // Use admin client to bypass RLS for profile checks
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

  // Check user role
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, full_name, email, phone, linkedin_url")
    .eq("id", user.id)
    .single()

  // Only candidates can apply
  if (profile?.role !== "candidate") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm dark:bg-neutral-900">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Candidates Only</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Only candidates can apply to Coastal Haven Capital. If you're a
              recruiter or school admin, this application is not available to
              you.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-blue-600 hover:underline"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch candidate profile
  const { data: candidateProfile } = await supabaseAdmin
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // No candidate profile - redirect to complete profile
  if (!candidateProfile) {
    redirect("/candidate?redirect=/apply/capital")
  }

  // Profile not verified - show message to complete profile
  if (
    candidateProfile.status !== "verified" &&
    candidateProfile.status !== "active"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm dark:bg-neutral-900">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Profile Pending</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Your profile is still pending verification. Please complete your
              profile with all required documents (resume, transcript) and wait
              for verification before applying to Coastal Haven Capital.
            </p>
            <Link
              href="/candidate"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if already applied
  const { data: existingApplication } = await supabaseAdmin
    .from("applications")
    .select("id, status, applied_at")
    .eq("candidate_profile_id", candidateProfile.id)
    .eq("target_type", "capital")
    .single()

  if (existingApplication) {
    const statusColors: Record<string, string> = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200",
      reviewing:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
      interviewed:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200",
      accepted:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200",
      rejected:
        "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200",
      withdrawn:
        "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-200",
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm dark:bg-neutral-900">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Already Applied</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              You've already submitted an application to Coastal Haven Capital.
            </p>
            <div className="mt-4">
              <span
                className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${statusColors[existingApplication.status] || statusColors.pending}`}
              >
                Status: {existingApplication.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-4 text-sm text-neutral-500">
              Applied on{" "}
              {new Date(existingApplication.applied_at!).toLocaleDateString()}
            </p>
            <Link
              href="/candidate"
              className="mt-6 inline-block text-blue-600 hover:underline"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show application form
  return (
    <div className="min-h-screen bg-neutral-50 py-12 dark:bg-neutral-950">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="rounded-xl border bg-white p-8 shadow-sm dark:bg-neutral-900">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Apply to Coastal Haven Capital</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Join our team and source real deals in private equity. We're
              looking for ambitious, resourceful candidates who can think
              creatively about business development.
            </p>
          </div>

          {/* Profile Summary */}
          <div className="mb-8 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <h3 className="mb-3 text-sm font-medium text-neutral-500 uppercase tracking-wider">
              Your Profile (Auto-filled)
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Name:</span>{" "}
                <span className="font-medium">{profile?.full_name}</span>
              </div>
              <div>
                <span className="text-neutral-500">Email:</span>{" "}
                <span className="font-medium">{profile?.email}</span>
              </div>
              <div>
                <span className="text-neutral-500">School:</span>{" "}
                <span className="font-medium">{candidateProfile.school_name}</span>
              </div>
              <div>
                <span className="text-neutral-500">Major:</span>{" "}
                <span className="font-medium">{candidateProfile.major}</span>
              </div>
              <div>
                <span className="text-neutral-500">GPA:</span>{" "}
                <span className="font-medium">
                  {candidateProfile.gpa.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Graduation:</span>{" "}
                <span className="font-medium">
                  {candidateProfile.graduation_year}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              Your profile data will be submitted with your application.{" "}
              <Link
                href="/candidate/edit-profile"
                className="text-blue-600 hover:underline"
              >
                Edit profile
              </Link>
            </p>
          </div>

          {/* Application Form */}
          <ApplyToCapitalForm candidateProfileId={candidateProfile.id} />
        </div>
      </div>
    </div>
  )
}
