"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  Brain,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react"

interface TranscriptVerificationRecord {
  id: string
  transcript_id: string | null
  candidate_profile_id: string
  status: string
  extracted_gpa: number | null
  entered_gpa: number | null
  gpa_match: boolean | null
  gpa_difference: number | null
  extraction_confidence: string | null
  extraction_reasoning: string | null
  reviewer_notes: string | null
  updated_at: string | null
  profile: {
    full_name: string
    email: string
  } | null
  school_name: string | null
}

interface ResumeVerificationRecord {
  id: string
  resume_id: string | null
  candidate_profile_id: string
  status: string
  is_valid_resume: boolean | null
  appears_authentic: boolean | null
  fake_indicators: string[] | null
  confidence: number | null
  reasoning: string | null
  reviewer_notes: string | null
  updated_at: string | null
  profile: {
    full_name: string
    email: string
  } | null
  school_name: string | null
  resume_label: string | null
}

interface VerificationAuditLogProps {
  transcriptVerifications: TranscriptVerificationRecord[]
  resumeVerifications: ResumeVerificationRecord[]
}

export function VerificationAuditLog({
  transcriptVerifications,
  resumeVerifications,
}: VerificationAuditLogProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'transcripts' | 'resumes'>('transcripts')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'auto_verified':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'manually_verified':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-neutral-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'auto_verified':
        return 'Auto-Verified'
      case 'manually_verified':
        return 'Manually Verified'
      case 'flagged':
        return 'Flagged'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalCount = transcriptVerifications.length + resumeVerifications.length

  if (totalCount === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-xl border bg-neutral-50 p-4 text-left hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-purple-500" />
          <div>
            <h2 className="font-semibold">Verification Audit Log</h2>
            <p className="text-sm text-neutral-500">
              {totalCount} verification records with AI reasoning
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-neutral-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-neutral-400" />
        )}
      </button>

      {isExpanded && (
        <div className="rounded-xl border bg-white p-4 dark:bg-neutral-900">
          {/* Tabs */}
          <div className="mb-4 flex gap-2 border-b pb-3">
            <Button
              variant={activeTab === 'transcripts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('transcripts')}
              className="gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Transcripts ({transcriptVerifications.length})
            </Button>
            <Button
              variant={activeTab === 'resumes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('resumes')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Resumes ({resumeVerifications.length})
            </Button>
          </div>

          {/* Transcript Verifications */}
          {activeTab === 'transcripts' && (
            <div className="space-y-2">
              {transcriptVerifications.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">
                  No transcript verifications yet
                </p>
              ) : (
                transcriptVerifications.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-lg border bg-neutral-50 dark:bg-neutral-800/50"
                  >
                    <button
                      onClick={() => toggleItem(v.id)}
                      className="flex w-full items-center justify-between p-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(v.status)}
                        <div>
                          <p className="font-medium">
                            {v.profile?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {v.school_name} · {getStatusLabel(v.status)} · {formatDate(v.updated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {v.extracted_gpa !== null && (
                          <span className="text-sm">
                            GPA: {v.entered_gpa?.toFixed(2)} → {v.extracted_gpa?.toFixed(2)}
                            {v.gpa_match && (
                              <CheckCircle2 className="ml-1 inline h-3 w-3 text-green-500" />
                            )}
                          </span>
                        )}
                        {expandedItems.has(v.id) ? (
                          <ChevronDown className="h-4 w-4 text-neutral-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-neutral-400" />
                        )}
                      </div>
                    </button>
                    {expandedItems.has(v.id) && (
                      <div className="border-t bg-white p-3 dark:bg-neutral-900">
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-neutral-500">Entered GPA</p>
                              <p className="font-medium">{v.entered_gpa?.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500">Extracted GPA</p>
                              <p className="font-medium">{v.extracted_gpa?.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500">Confidence</p>
                              <p className="font-medium capitalize">{v.extraction_confidence || 'N/A'}</p>
                            </div>
                          </div>
                          {v.extraction_reasoning && (
                            <div>
                              <p className="mb-1 flex items-center gap-1 text-xs text-neutral-500">
                                <Brain className="h-3 w-3" />
                                AI Reasoning
                              </p>
                              <p className="rounded-lg bg-neutral-100 p-2 text-sm dark:bg-neutral-800">
                                {v.extraction_reasoning}
                              </p>
                            </div>
                          )}
                          {v.reviewer_notes && (
                            <div>
                              <p className="mb-1 text-xs text-neutral-500">Reviewer Notes</p>
                              <p className="rounded-lg bg-blue-50 p-2 text-sm dark:bg-blue-900/20">
                                {v.reviewer_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Resume Verifications */}
          {activeTab === 'resumes' && (
            <div className="space-y-2">
              {resumeVerifications.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">
                  No resume verifications yet
                </p>
              ) : (
                resumeVerifications.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-lg border bg-neutral-50 dark:bg-neutral-800/50"
                  >
                    <button
                      onClick={() => toggleItem(v.id)}
                      className="flex w-full items-center justify-between p-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(v.status)}
                        <div>
                          <p className="font-medium">
                            {v.profile?.full_name || 'Unknown'}
                            {v.resume_label && (
                              <span className="ml-2 text-sm text-neutral-500">
                                ({v.resume_label})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {v.school_name} · {getStatusLabel(v.status)} · {formatDate(v.updated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {v.confidence !== null && (
                          <span className={`text-sm font-medium ${
                            v.confidence >= 0.8 ? 'text-green-600' :
                            v.confidence >= 0.5 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {Math.round(v.confidence * 100)}%
                          </span>
                        )}
                        {expandedItems.has(v.id) ? (
                          <ChevronDown className="h-4 w-4 text-neutral-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-neutral-400" />
                        )}
                      </div>
                    </button>
                    {expandedItems.has(v.id) && (
                      <div className="border-t bg-white p-3 dark:bg-neutral-900">
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-neutral-500">Is Valid Resume?</p>
                              <p className={`font-medium ${v.is_valid_resume ? 'text-green-600' : 'text-red-600'}`}>
                                {v.is_valid_resume === null ? 'N/A' : v.is_valid_resume ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500">Appears Authentic?</p>
                              <p className={`font-medium ${v.appears_authentic ? 'text-green-600' : 'text-red-600'}`}>
                                {v.appears_authentic === null ? 'N/A' : v.appears_authentic ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500">Confidence</p>
                              <p className="font-medium">
                                {v.confidence !== null ? `${Math.round(v.confidence * 100)}%` : 'N/A'}
                              </p>
                            </div>
                          </div>
                          {v.fake_indicators && v.fake_indicators.length > 0 && (
                            <div>
                              <p className="mb-1 text-xs text-neutral-500">Fake Indicators</p>
                              <div className="flex flex-wrap gap-1">
                                {v.fake_indicators.map((indicator, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                  >
                                    {indicator}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {v.reasoning && (
                            <div>
                              <p className="mb-1 flex items-center gap-1 text-xs text-neutral-500">
                                <Brain className="h-3 w-3" />
                                AI Reasoning
                              </p>
                              <p className="rounded-lg bg-neutral-100 p-2 text-sm dark:bg-neutral-800">
                                {v.reasoning}
                              </p>
                            </div>
                          )}
                          {v.reviewer_notes && (
                            <div>
                              <p className="mb-1 text-xs text-neutral-500">Reviewer Notes</p>
                              <p className="rounded-lg bg-blue-50 p-2 text-sm dark:bg-blue-900/20">
                                {v.reviewer_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
