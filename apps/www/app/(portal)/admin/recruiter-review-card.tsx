'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Mail,
  Linkedin,
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  User,
  Calendar,
  FileText,
  Loader2
} from 'lucide-react'
import { approveRecruiter, rejectRecruiter, updateVerificationNotes } from './actions'

type RecruiterWithProfile = {
  id: string
  firm_name: string
  firm_type: string | null
  job_title: string
  bio: string | null
  linkedin_url: string | null
  company_website: string | null
  email_domain: string | null
  email_domain_matches_company: boolean | null
  verification_notes: string | null
  created_at: string | null
  profiles: {
    full_name: string
    email: string
    linkedin_url: string | null
  } | null
}

export function RecruiterReviewCard({ recruiter }: { recruiter: RecruiterWithProfile }) {
  const [notes, setNotes] = useState(recruiter.verification_notes || '')
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const handleSaveNotes = async () => {
    setSaving(true)
    try {
      await updateVerificationNotes(recruiter.id, notes)
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      // Save notes first if they've changed
      if (notes !== recruiter.verification_notes) {
        await updateVerificationNotes(recruiter.id, notes)
      }
      await approveRecruiter(recruiter.id)
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    setRejecting(true)
    try {
      // Save notes first if they've changed
      if (notes !== recruiter.verification_notes) {
        await updateVerificationNotes(recruiter.id, notes)
      }
      await rejectRecruiter(recruiter.id)
    } finally {
      setRejecting(false)
    }
  }

  const domainMatch = recruiter.email_domain_matches_company
  const hasLinkedIn = recruiter.linkedin_url || recruiter.profiles?.linkedin_url
  const linkedInUrl = recruiter.linkedin_url || recruiter.profiles?.linkedin_url

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{recruiter.profiles?.full_name}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {recruiter.job_title} at {recruiter.firm_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Calendar className="h-4 w-4" />
          {recruiter.created_at ? new Date(recruiter.created_at).toLocaleDateString() : '-'}
        </div>
      </div>

      {/* Verification Checks */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Email Domain Check */}
        <div className={`rounded-lg border p-4 ${
          domainMatch === true
            ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20'
            : domainMatch === false
            ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20'
            : 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50'
        }`}>
          <div className="flex items-center gap-2">
            {domainMatch === true ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : domainMatch === false ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : (
              <XCircle className="h-5 w-5 text-neutral-400" />
            )}
            <span className="font-medium">Domain Verification</span>
          </div>
          <div className="mt-2 text-sm">
            <p className="text-neutral-600 dark:text-neutral-400">
              Email: <span className="font-mono">{recruiter.email_domain || 'N/A'}</span>
            </p>
            {recruiter.company_website && (
              <p className="text-neutral-600 dark:text-neutral-400">
                Website: <span className="font-mono">{recruiter.company_website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
              </p>
            )}
            <p className="mt-1 font-medium">
              {domainMatch === true ? 'Domains match' : domainMatch === false ? 'Domains do not match' : 'No website provided'}
            </p>
          </div>
        </div>

        {/* LinkedIn Check */}
        <div className={`rounded-lg border p-4 ${
          hasLinkedIn
            ? 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20'
            : 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50'
        }`}>
          <div className="flex items-center gap-2">
            {hasLinkedIn ? (
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            ) : (
              <XCircle className="h-5 w-5 text-neutral-400" />
            )}
            <span className="font-medium">LinkedIn Profile</span>
          </div>
          <div className="mt-2">
            {hasLinkedIn ? (
              <a
                href={linkedInUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Linkedin className="h-4 w-4" />
                View Profile
              </a>
            ) : (
              <p className="text-sm text-neutral-500">No LinkedIn provided</p>
            )}
          </div>
        </div>

        {/* Company Website */}
        <div className={`rounded-lg border p-4 ${
          recruiter.company_website
            ? 'border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-900/20'
            : 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50'
        }`}>
          <div className="flex items-center gap-2">
            {recruiter.company_website ? (
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            ) : (
              <XCircle className="h-5 w-5 text-neutral-400" />
            )}
            <span className="font-medium">Company Website</span>
          </div>
          <div className="mt-2">
            {recruiter.company_website ? (
              <a
                href={recruiter.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline"
              >
                <Globe className="h-4 w-4" />
                {recruiter.company_website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
              </a>
            ) : (
              <p className="text-sm text-neutral-500">No website provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Firm Info */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="flex items-center gap-2 font-medium">
            <Mail className="h-4 w-4" />
            Contact Information
          </h4>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              <span className="text-neutral-500">Email:</span>{' '}
              <a href={`mailto:${recruiter.profiles?.email}`} className="text-blue-600 hover:underline">
                {recruiter.profiles?.email}
              </a>
            </p>
          </div>
        </div>
        <div>
          <h4 className="flex items-center gap-2 font-medium">
            <Building2 className="h-4 w-4" />
            Firm Details
          </h4>
          <div className="mt-2 space-y-1 text-sm">
            <p><span className="text-neutral-500">Firm:</span> {recruiter.firm_name}</p>
            <p><span className="text-neutral-500">Type:</span> {recruiter.firm_type || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {recruiter.bio && (
        <div className="mt-6">
          <h4 className="flex items-center gap-2 font-medium">
            <FileText className="h-4 w-4" />
            Bio
          </h4>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {recruiter.bio}
          </p>
        </div>
      )}

      {/* Admin Notes */}
      <div className="mt-6">
        <Label htmlFor={`notes-${recruiter.id}`} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Verification Notes
        </Label>
        <Textarea
          id={`notes-${recruiter.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this recruiter's verification..."
          className="mt-2"
          rows={3}
        />
        {notes !== recruiter.verification_notes && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleSaveNotes}
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Notes
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-3 border-t pt-6">
        <Button
          variant="outline"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleReject}
          disabled={rejecting || approving}
        >
          {rejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reject
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleApprove}
          disabled={approving || rejecting}
        >
          {approving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Approve
        </Button>
      </div>
    </div>
  )
}
