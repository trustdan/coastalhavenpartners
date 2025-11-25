'use client'

interface SchoolRecruiterFiltersProps {
  firmType?: string
  location?: string
  specialty?: string
}

export function SchoolRecruiterFilters({ firmType, location, specialty }: SchoolRecruiterFiltersProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <form className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="firmType" className="mb-2 block text-sm font-medium">
            Firm Type
          </label>
          <select
            id="firmType"
            name="firmType"
            defaultValue={firmType}
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
            <option value="">All Types</option>
            <option value="Investment Bank">Investment Bank</option>
            <option value="Private Equity">Private Equity</option>
            <option value="Venture Capital">Venture Capital</option>
            <option value="Consulting">Consulting</option>
            <option value="Hedge Fund">Hedge Fund</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="mb-2 block text-sm font-medium">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            defaultValue={location}
            placeholder="e.g., New York"
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

        <div>
          <label htmlFor="specialty" className="mb-2 block text-sm font-medium">
            Specialty
          </label>
          <input
            type="text"
            id="specialty"
            name="specialty"
            defaultValue={specialty}
            placeholder="e.g., Investment Banking"
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
