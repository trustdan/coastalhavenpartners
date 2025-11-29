import Link from "next/link"

export const metadata = {
  title: "Application Submitted | Coastal Haven Capital",
  description: "Your application to Coastal Haven Capital has been submitted.",
}

export default function ApplicationSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm dark:bg-neutral-900">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold">Application Submitted!</h1>

          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Thank you for applying to Coastal Haven Capital. We've received your
            application and will review it carefully.
          </p>

          {/* Timeline */}
          <div className="mt-8 rounded-lg bg-neutral-50 p-4 text-left dark:bg-neutral-800/50">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">
              What's Next
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/20">
                  1
                </span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  Our team will review your application and profile
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/20">
                  2
                </span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  If selected, we'll reach out via email to schedule a call
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/20">
                  3
                </span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  Applications are reviewed on a rolling basis
                </span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Link
              href="/candidate"
              className="block w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Return to Dashboard
            </Link>
            <Link
              href="https://coastalhavencapital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg border border-neutral-200 px-6 py-3 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Learn More About Capital
            </Link>
          </div>

          <p className="mt-6 text-xs text-neutral-400">
            Questions? Contact us at{" "}
            <a
              href="mailto:capital@coastalhavenpartners.com"
              className="text-blue-600 hover:underline"
            >
              capital@coastalhavenpartners.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
