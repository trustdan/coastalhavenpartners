export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 text-center shadow-lg dark:bg-neutral-950">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Check Your Email</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          We've sent a verification link to your email address. Click the link to verify your account and get started.
        </p>

        <div className="rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-900">
          <p className="font-medium">Didn't receive the email?</p>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
