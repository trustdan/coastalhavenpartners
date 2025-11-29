"use client"

import { useState } from "react"
import {
  FileText,
  GraduationCap,
  Calendar,
  Linkedin,
  Mail,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateApplicationStatus, addInternalNotes } from "./actions"
import type { Database } from "@/lib/types/database.types"

type ApplicationStatus =
  Database["public"]["Enums"]["application_status"]

interface ApplicationSnapshot {
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

interface ApplicantCardProps {
  application: {
    id: string
    status: ApplicationStatus
    applied_at: string | null
    cover_letter: string
    outreach_approach: string
    internal_notes: string | null
    snapshot: ApplicationSnapshot
  }
}

const statusColors: Record<ApplicationStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200",
  reviewing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
  interviewed:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200",
  accepted:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200",
  withdrawn:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

export function ApplicantCard({ application }: ApplicantCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(application.internal_notes || "")
  const [savingNotes, setSavingNotes] = useState(false)
  const { snapshot } = application

  // Generate signed URLs for documents (simplified - using direct paths)
  // In production, you'd generate signed URLs server-side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleStatusChange(newStatus: ApplicationStatus) {
    setUpdating(true)
    await updateApplicationStatus(application.id, newStatus)
    setUpdating(false)
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    const result = await addInternalNotes(application.id, notes)
    setSavingNotes(false)
    if (!result.error) {
      setEditingNotes(false)
    }
  }

  function handleCancelNotes() {
    setNotes(application.internal_notes || "")
    setEditingNotes(false)
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{snapshot.full_name}</h3>
          <p className="text-sm text-neutral-500">{snapshot.email}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {snapshot.school_name} '{snapshot.graduation_year % 100}
          </p>
          <p className="text-sm text-neutral-500">
            {snapshot.major} · {snapshot.gpa.toFixed(2)} GPA
          </p>
        </div>
      </div>

      {/* Status + Applied Date */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[application.status]}`}
        >
          {application.status.toUpperCase()}
        </span>
        <span className="text-xs text-neutral-400">
          Applied {application.applied_at ? formatRelativeTime(application.applied_at) : "—"}
        </span>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {snapshot.resume_url && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={`${supabaseUrl}/storage/v1/object/public/resumes/${snapshot.resume_url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Resume
            </a>
          </Button>
        )}
        {snapshot.transcript_url && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={`${supabaseUrl}/storage/v1/object/public/transcripts/${snapshot.transcript_url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
              Transcript
            </a>
          </Button>
        )}
        {snapshot.scheduling_url && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={snapshot.scheduling_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Schedule
            </a>
          </Button>
        )}
        {snapshot.linkedin_url && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={snapshot.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="mr-1.5 h-3.5 w-3.5" />
              LinkedIn
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <a href={`mailto:${snapshot.email}`}>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Email
          </a>
        </Button>
      </div>

      {/* Status Change Dropdown */}
      <div className="mt-4">
        <Select
          value={application.status}
          onValueChange={handleStatusChange}
          disabled={updating}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="interviewed">Interviewed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expand/Collapse for Details */}
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 w-full text-neutral-500"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <>
            <ChevronUp className="mr-1.5 h-4 w-4" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="mr-1.5 h-4 w-4" />
            View Application Details
          </>
        )}
      </Button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {/* Bio */}
          {snapshot.bio && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
                Bio
              </h4>
              <p className="text-sm">{snapshot.bio}</p>
            </div>
          )}

          {/* Cover Letter */}
          <div>
            <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Why Coastal Haven Capital?
            </h4>
            <p className="whitespace-pre-wrap text-sm">{application.cover_letter}</p>
          </div>

          {/* Outreach Approach */}
          <div>
            <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Outreach Strategy
            </h4>
            <p className="whitespace-pre-wrap text-sm">
              {application.outreach_approach}
            </p>
          </div>

          {/* Target Roles & Locations */}
          <div className="flex flex-wrap gap-6">
            {snapshot.target_roles && snapshot.target_roles.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Target Roles
                </h4>
                <div className="flex flex-wrap gap-1">
                  {snapshot.target_roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {snapshot.preferred_locations &&
              snapshot.preferred_locations.length > 0 && (
                <div>
                  <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Preferred Locations
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {snapshot.preferred_locations.map((loc) => (
                      <span
                        key={loc}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Contact Info */}
          <div className="flex gap-6 text-sm">
            {snapshot.phone && (
              <div>
                <span className="text-neutral-500">Phone:</span>{" "}
                <a href={`tel:${snapshot.phone}`} className="hover:underline">
                  {snapshot.phone}
                </a>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-medium uppercase tracking-wider text-yellow-700 dark:text-yellow-300">
                Internal Notes
              </h4>
              {!editingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 dark:text-yellow-300 dark:hover:bg-yellow-900/40"
                  onClick={() => setEditingNotes(true)}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  {application.internal_notes ? "Edit" : "Add"}
                </Button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this applicant..."
                  className="min-h-[80px] border-yellow-200 bg-white text-sm dark:border-yellow-800 dark:bg-neutral-900"
                  disabled={savingNotes}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelNotes}
                    disabled={savingNotes}
                    className="h-7 text-neutral-600"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="h-7 bg-yellow-600 text-white hover:bg-yellow-700"
                  >
                    {savingNotes ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ) : application.internal_notes ? (
              <p className="whitespace-pre-wrap text-sm text-yellow-800 dark:text-yellow-200">
                {application.internal_notes}
              </p>
            ) : (
              <p className="text-sm italic text-yellow-600 dark:text-yellow-400">
                No notes yet. Click "Add" to add internal notes.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
