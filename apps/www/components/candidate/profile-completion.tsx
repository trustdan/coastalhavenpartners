import Link from "next/link"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProfileData {
  // From profiles table
  full_name: string | null
  email: string
  linkedin_url: string | null
  // From candidate_profiles table
  school_name: string
  major: string
  gpa: number
  graduation_year: number
  resume_url: string | null
  transcript_url: string | null
  target_roles: string[] | null
  preferred_locations: string[] | null
  bio: string | null
  scheduling_url: string | null
}

interface CompletionItem {
  key: string
  label: string
  weight: number
  complete: boolean
  href: string
}

function calculateCompletion(profile: ProfileData): {
  percentage: number
  items: CompletionItem[]
} {
  const items: CompletionItem[] = [
    {
      key: "basic",
      label: "Basic info (name, email)",
      weight: 10,
      complete: Boolean(profile.full_name && profile.email),
      href: "/candidate/edit-profile",
    },
    {
      key: "education",
      label: "Education (school, major, GPA, grad year)",
      weight: 25,
      complete: Boolean(
        profile.school_name &&
          profile.major &&
          profile.gpa > 0 &&
          profile.graduation_year
      ),
      href: "/candidate/edit-profile",
    },
    {
      key: "resume",
      label: "Resume uploaded",
      weight: 20,
      complete: Boolean(profile.resume_url),
      href: "/candidate/edit-profile",
    },
    {
      key: "transcript",
      label: "Transcript uploaded",
      weight: 15,
      complete: Boolean(profile.transcript_url),
      href: "/candidate/edit-profile",
    },
    {
      key: "roles",
      label: "Target roles selected",
      weight: 10,
      complete: Boolean(profile.target_roles && profile.target_roles.length > 0),
      href: "/candidate/edit-profile",
    },
    {
      key: "locations",
      label: "Preferred locations selected",
      weight: 10,
      complete: Boolean(
        profile.preferred_locations && profile.preferred_locations.length > 0
      ),
      href: "/candidate/edit-profile",
    },
    {
      key: "bio",
      label: "Bio written",
      weight: 10,
      complete: Boolean(profile.bio && profile.bio.trim().length > 0),
      href: "/candidate/edit-profile",
    },
  ]

  const percentage = items.reduce(
    (acc, item) => acc + (item.complete ? item.weight : 0),
    0
  )

  return { percentage, items }
}

interface ProfileCompletionProps {
  profile: ProfileData
}

export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const { percentage, items } = calculateCompletion(profile)
  const incompleteItems = items.filter((item) => !item.complete)
  const isComplete = percentage === 100

  if (isComplete) {
    return null // Don't show anything if profile is complete
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {percentage < 50 ? (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            )}
            <h2 className="text-lg font-semibold">Profile Completion</h2>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {percentage < 100
              ? "Complete your profile to appear in recruiter searches"
              : "Your profile is complete and visible to recruiters"}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{percentage}%</span>
          <p className="text-xs text-neutral-500">complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <Progress value={percentage} className="h-2" />
      </div>

      {/* Missing Items Checklist */}
      {incompleteItems.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Missing items
          </p>
          <ul className="space-y-1.5">
            {incompleteItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  <Circle className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-xs text-neutral-400">
                    +{item.weight}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completed Items (collapsed) */}
      {items.filter((i) => i.complete).length > 0 && (
        <div className="mt-3 border-t pt-3">
          <p className="text-xs text-neutral-500">
            {items.filter((i) => i.complete).length} of {items.length} items
            completed
          </p>
        </div>
      )}
    </div>
  )
}
