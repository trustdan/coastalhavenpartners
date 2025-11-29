"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitCapitalApplication } from "./actions"

interface ApplyToCapitalFormProps {
  candidateProfileId: string
}

export function ApplyToCapitalForm({
  candidateProfileId,
}: ApplyToCapitalFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [outreachApproach, setOutreachApproach] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate
    if (coverLetter.trim().length < 100) {
      setError("Please write at least 100 characters for your cover letter.")
      setLoading(false)
      return
    }

    if (outreachApproach.trim().length < 100) {
      setError(
        "Please write at least 100 characters for your outreach approach."
      )
      setLoading(false)
      return
    }

    try {
      const result = await submitCapitalApplication({
        candidateProfileId,
        coverLetter: coverLetter.trim(),
        outreachApproach: outreachApproach.trim(),
      })

      if (result.error) {
        setError(result.error)
        return
      }

      // Redirect to success
      router.push("/apply/capital/success")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20">
          {error}
        </div>
      )}

      {/* Cover Letter */}
      <div>
        <Label htmlFor="coverLetter" className="text-base font-medium">
          Why are you interested in Coastal Haven Capital?
        </Label>
        <p className="mb-2 text-sm text-neutral-500">
          Tell us what excites you about private equity and why you want to join
          our team. (Minimum 100 characters)
        </p>
        <Textarea
          id="coverLetter"
          name="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="I'm interested in Coastal Haven Capital because..."
          rows={6}
          required
          className="resize-none"
        />
        <p className="mt-1 text-right text-xs text-neutral-400">
          {coverLetter.length} characters
        </p>
      </div>

      {/* Outreach Approach */}
      <div>
        <Label htmlFor="outreachApproach" className="text-base font-medium">
          How would you approach business development?
        </Label>
        <p className="mb-2 text-sm text-neutral-500">
          If selected, how would you reach out to business owners to ask if
          they're interested in selling some or all of their company to PE?
          Describe your strategy. (Minimum 100 characters)
        </p>
        <Textarea
          id="outreachApproach"
          name="outreachApproach"
          value={outreachApproach}
          onChange={(e) => setOutreachApproach(e.target.value)}
          placeholder="My approach to reaching business owners would be..."
          rows={6}
          required
          className="resize-none"
        />
        <p className="mt-1 text-right text-xs text-neutral-400">
          {outreachApproach.length} characters
        </p>
      </div>

      {/* Submit */}
      <div className="border-t pt-6">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          disabled={loading}
        >
          {loading ? "Submitting Application..." : "Submit Application"}
        </Button>
        <p className="mt-3 text-center text-xs text-neutral-400">
          By submitting, you confirm that all information is accurate. Your
          profile data (resume, transcript, etc.) will be shared with the
          Coastal Haven Capital team.
        </p>
      </div>
    </form>
  )
}
