'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Wrench,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Mail,
  User,
  Calendar,
  ShieldAlert,
  FileWarning,
  KeyRound,
  HelpCircle,
  Smartphone,
  Globe,
  Paperclip,
} from 'lucide-react'
import { updateSupportMessageStatus, addAdminNotes, deleteSupportMessage } from './actions'

type SupportStatus = 'new' | 'in_progress' | 'resolved' | 'spam'
type MessageType = 'technical_support' | 'feedback' | 'verification_appeal' | 'document_issue' | 'account_access' | 'other'
type SourceType = 'web' | 'mobile' | 'api'

interface SupportMessage {
  id: string
  created_at: string
  message_type: MessageType
  user_id: string
  sender_name: string
  sender_email: string
  subject: string
  message: string
  status: SupportStatus
  handled_by: string | null
  handled_at: string | null
  admin_notes: string | null
  // New appeal-specific fields
  user_role: string | null
  appeal_type: string | null
  additional_info: string | null
  has_attachments: boolean | null
  attachment_urls: string[] | null
  source: SourceType | null
}

interface SupportInboxProps {
  messages: SupportMessage[]
  currentStatusFilter: string
  currentTypeFilter: string
  counts: {
    new: number
    inProgress: number
    support: number
    feedback: number
    appeals: number
  }
}

const statusConfig: Record<SupportStatus, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Mail },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  spam: { label: 'Spam', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
}

function StatusBadge({ status }: { status: SupportStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

const typeConfig: Record<MessageType, { label: string; color: string; icon: React.ElementType }> = {
  technical_support: {
    label: 'Support',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: Wrench
  },
  feedback: {
    label: 'Feedback',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    icon: MessageSquare
  },
  verification_appeal: {
    label: 'Appeal',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    icon: ShieldAlert
  },
  document_issue: {
    label: 'Document',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    icon: FileWarning
  },
  account_access: {
    label: 'Access',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    icon: KeyRound
  },
  other: {
    label: 'Other',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    icon: HelpCircle
  },
}

function TypeBadge({ type }: { type: MessageType }) {
  const config = typeConfig[type] || typeConfig.other
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

function SourceBadge({ source }: { source: SourceType | null }) {
  if (!source) return null

  const config = {
    web: { label: 'Web', icon: Globe, color: 'text-blue-600 dark:text-blue-400' },
    mobile: { label: 'Mobile', icon: Smartphone, color: 'text-green-600 dark:text-green-400' },
    api: { label: 'API', icon: Globe, color: 'text-purple-600 dark:text-purple-400' },
  }

  const { label, icon: Icon, color } = config[source]

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

function MessageCard({ message, onUpdate }: { message: SupportMessage; onUpdate: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(message.admin_notes || '')
  const [showNotes, setShowNotes] = useState(false)

  const handleStatusChange = (newStatus: SupportStatus) => {
    startTransition(async () => {
      const result = await updateSupportMessageStatus(message.id, newStatus)
      if (result.success) {
        onUpdate()
      }
    })
  }

  const handleSaveNotes = () => {
    startTransition(async () => {
      const result = await addAdminNotes(message.id, notes)
      if (result.success) {
        setShowNotes(false)
        onUpdate()
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this message? This cannot be undone.')) {
      return
    }

    startTransition(async () => {
      const result = await deleteSupportMessage(message.id)
      if (result.success) {
        onUpdate()
      }
    })
  }

  const formattedDate = new Date(message.created_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-lg border ${
      message.status === 'new'
        ? 'border-blue-300 dark:border-blue-700'
        : 'border-neutral-200 dark:border-neutral-700'
    } overflow-hidden`}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <TypeBadge type={message.message_type} />
          <StatusBadge status={message.status} />
          <span className="font-medium truncate">{message.subject}</span>
          {message.has_attachments && (
            <Paperclip className="h-4 w-4 text-neutral-400" title="Has attachments" />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <SourceBadge source={message.source} />
          <span className="hidden sm:inline">{message.sender_name}</span>
          <span className="hidden md:inline">{formattedDate}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700">
          {/* Sender Info */}
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400" />
              <span className="font-medium">{message.sender_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-neutral-400" />
              <a
                href={`mailto:${message.sender_email}`}
                className="text-blue-600 hover:underline"
                onClick={e => e.stopPropagation()}
              >
                {message.sender_email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Message Content */}
          <div className="px-4 py-4">
            <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
              {message.message}
            </p>
          </div>

          {/* Appeal Details - shown for appeal-type messages */}
          {(message.user_role || message.additional_info || message.has_attachments) && (
            <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-orange-50 dark:bg-orange-900/10">
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-3">
                Appeal Details
              </h4>
              <div className="space-y-3 text-sm">
                {message.user_role && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 dark:text-neutral-400 w-24">User Role:</span>
                    <span className="capitalize font-medium text-neutral-700 dark:text-neutral-300">
                      {message.user_role}
                    </span>
                  </div>
                )}
                {message.appeal_type && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 dark:text-neutral-400 w-24">Appeal Type:</span>
                    <span className="capitalize font-medium text-neutral-700 dark:text-neutral-300">
                      {message.appeal_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
                {message.additional_info && (
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400 block mb-1">Additional Info:</span>
                    <p className="text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 p-2 rounded border border-neutral-200 dark:border-neutral-700">
                      {message.additional_info}
                    </p>
                  </div>
                )}
                {message.has_attachments && message.attachment_urls && message.attachment_urls.length > 0 && (
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400 block mb-2">
                      Attachments ({message.attachment_urls.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {message.attachment_urls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          <Paperclip className="h-4 w-4 text-neutral-400" />
                          <span className="text-sm text-blue-600 dark:text-blue-400">
                            Attachment {idx + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes Section */}
          {(message.admin_notes || showNotes) && (
            <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-yellow-50 dark:bg-yellow-900/10">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                Admin Notes
              </h4>
              {showNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600"
                    rows={3}
                    placeholder="Add internal notes about this message..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNotes} disabled={isPending}>
                      Save Notes
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNotes(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {message.admin_notes}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-neutral-500 mr-2">Set status:</span>
              {message.status !== 'new' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('new')}
                  disabled={isPending}
                >
                  New
                </Button>
              )}
              {message.status !== 'in_progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isPending}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  In Progress
                </Button>
              )}
              {message.status !== 'resolved' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('resolved')}
                  disabled={isPending}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  Resolved
                </Button>
              )}
              {message.status !== 'spam' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('spam')}
                  disabled={isPending}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Spam
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {!showNotes && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNotes(true)}
                >
                  {message.admin_notes ? 'Edit Notes' : 'Add Notes'}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`mailto:${message.sender_email}?subject=Re: ${message.subject}`, '_blank')}
              >
                Reply via Email
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function SupportInbox({ messages, currentStatusFilter, currentTypeFilter, counts }: SupportInboxProps) {
  const router = useRouter()

  const updateFilters = (status?: string, type?: string) => {
    const params = new URLSearchParams()
    const newStatus = status ?? currentStatusFilter
    const newType = type ?? currentTypeFilter

    if (newStatus !== 'all') params.set('status', newStatus)
    if (newType !== 'all') params.set('type', newType)

    router.push(`/admin/support${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleUpdate = () => {
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={currentStatusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => updateFilters('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={currentStatusFilter === 'new' ? 'default' : 'outline'}
              onClick={() => updateFilters('new')}
            >
              New {counts.new > 0 && <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs">{counts.new}</span>}
            </Button>
            <Button
              size="sm"
              variant={currentStatusFilter === 'in_progress' ? 'default' : 'outline'}
              onClick={() => updateFilters('in_progress')}
            >
              In Progress {counts.inProgress > 0 && <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 text-white rounded-full text-xs">{counts.inProgress}</span>}
            </Button>
            <Button
              size="sm"
              variant={currentStatusFilter === 'resolved' ? 'default' : 'outline'}
              onClick={() => updateFilters('resolved')}
            >
              Resolved
            </Button>
            <Button
              size="sm"
              variant={currentStatusFilter === 'spam' ? 'default' : 'outline'}
              onClick={() => updateFilters('spam')}
            >
              Spam
            </Button>
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={currentTypeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => updateFilters(undefined, 'all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={currentTypeFilter === 'technical_support' ? 'default' : 'outline'}
              onClick={() => updateFilters(undefined, 'technical_support')}
            >
              <Wrench className="h-4 w-4 mr-1" />
              Support {counts.support > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">{counts.support}</span>}
            </Button>
            <Button
              size="sm"
              variant={currentTypeFilter === 'feedback' ? 'default' : 'outline'}
              onClick={() => updateFilters(undefined, 'feedback')}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Feedback {counts.feedback > 0 && <span className="ml-1 px-1.5 py-0.5 bg-purple-500 text-white rounded-full text-xs">{counts.feedback}</span>}
            </Button>
            <Button
              size="sm"
              variant={currentTypeFilter === 'appeals' ? 'default' : 'outline'}
              onClick={() => updateFilters(undefined, 'appeals')}
            >
              <ShieldAlert className="h-4 w-4 mr-1" />
              Appeals {counts.appeals > 0 && <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white rounded-full text-xs">{counts.appeals}</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              No messages found
            </h3>
            <p className="text-neutral-500">
              {currentStatusFilter !== 'all' || currentTypeFilter !== 'all'
                ? 'Try adjusting your filters to see more messages.'
                : 'Support messages will appear here when users submit them.'}
            </p>
          </div>
        ) : (
          messages.map(message => (
            <MessageCard key={message.id} message={message} onUpdate={handleUpdate} />
          ))
        )}
      </div>
    </div>
  )
}
