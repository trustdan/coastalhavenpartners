'use client'

type CandidateStatus = 'pending_verification' | 'verified' | 'active' | 'placed' | 'rejected'

interface StudentFiltersProps {
  status?: CandidateStatus
  major?: string
}

export function StudentFilters({ status, major }: StudentFiltersProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <form className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="status" className="mb-2 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            onChange={(e) => {
              const form = e.currentTarget.form
              if (form) {
                const formData = new FormData(form)
                const params = new URLSearchParams()
                formData.forEach((value, key) => {
                  if (value) params.set(key, value.toString())
                })
                window.location.href = `?${params.toString()}`
              }
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="active">Active</option>
            <option value="placed">Placed</option>
          </select>
        </div>

        <div>
          <label htmlFor="major" className="mb-2 block text-sm font-medium">
            Major
          </label>
          <input
            type="text"
            id="major"
            name="major"
            defaultValue={major}
            placeholder="e.g., Computer Science"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            onBlur={(e) => {
              const form = e.currentTarget.form
              if (form) {
                const formData = new FormData(form)
                const params = new URLSearchParams()
                formData.forEach((value, key) => {
                  if (value) params.set(key, value.toString())
                })
                window.location.href = `?${params.toString()}`
              }
            }}
          />
        </div>
      </form>
    </div>
  )
}
