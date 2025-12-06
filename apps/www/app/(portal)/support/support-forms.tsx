'use client'

import { useState } from 'react'
import {
  Wrench,
  MessageSquareHeart,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitSupportMessage } from './actions'

type MessageType = 'technical_support' | 'feedback'

interface FormState {
  loading: boolean
  error: string | null
  submitted: boolean
}

function SupportForm({
  type,
  icon: Icon,
  title,
  description,
  placeholders,
  defaultName,
  defaultEmail
}: {
  type: MessageType
  icon: React.ElementType
  title: string
  description: string
  placeholders: {
    subject: string
    message: string
  }
  defaultName: string
  defaultEmail: string
}) {
  const [formState, setFormState] = useState<FormState>({
    loading: false,
    error: null,
    submitted: false
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState({ loading: true, error: null, submitted: false })

    const formData = new FormData(e.currentTarget)

    const result = await submitSupportMessage({
      messageType: type,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string
    })

    if (result.success) {
      setFormState({ loading: false, error: null, submitted: true })
    } else {
      setFormState({ loading: false, error: result.error || 'Something went wrong', submitted: false })
    }
  }

  if (formState.submitted) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-4 text-xl font-semibold">Thank You!</h3>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {type === 'technical_support'
            ? "We've received your support request and will get back to you as soon as possible."
            : "Thank you for your feedback! We appreciate you taking the time to help us improve."}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setFormState({ loading: false, error: null, submitted: false })}
        >
          Submit Another Message
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center gap-3 mb-4">
        <div className={`rounded-full p-2 ${
          type === 'technical_support'
            ? 'bg-orange-100 dark:bg-orange-900/20'
            : 'bg-purple-100 dark:bg-purple-900/20'
        }`}>
          <Icon className={`h-5 w-5 ${
            type === 'technical_support'
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-purple-600 dark:text-purple-400'
          }`} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formState.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {formState.error}
          </div>
        )}

        {/* Show user info (read-only) */}
        <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Submitting as <span className="font-medium text-neutral-900 dark:text-neutral-100">{defaultName || defaultEmail}</span>
          </p>
        </div>

        <div>
          <Label htmlFor={`${type}-subject`}>Subject</Label>
          <Input
            id={`${type}-subject`}
            name="subject"
            type="text"
            required
            placeholder={placeholders.subject}
            disabled={formState.loading}
          />
        </div>

        <div>
          <Label htmlFor={`${type}-message`}>Message</Label>
          <textarea
            id={`${type}-message`}
            name="message"
            required
            rows={5}
            maxLength={5000}
            placeholder={placeholders.message}
            disabled={formState.loading}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-neutral-500">Maximum 5000 characters</p>
        </div>

        <Button type="submit" disabled={formState.loading} className="w-full">
          {formState.loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </form>
    </div>
  )
}

interface SupportFormsProps {
  userName: string
  userEmail: string
}

export function SupportForms({ userName, userEmail }: SupportFormsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Technical Support Form */}
      <SupportForm
        type="technical_support"
        icon={Wrench}
        title="Technical Support"
        description="Having issues with the platform? Let us know."
        placeholders={{
          subject: "e.g., Can't upload my resume",
          message: "Please describe the issue you're experiencing in detail. Include any error messages you've seen..."
        }}
        defaultName={userName}
        defaultEmail={userEmail}
      />

      {/* Feedback Form */}
      <SupportForm
        type="feedback"
        icon={MessageSquareHeart}
        title="Share Feedback"
        description="Ideas, suggestions, or general feedback."
        placeholders={{
          subject: "e.g., Feature suggestion",
          message: "Tell us what you think! What features would you like to see? How can we improve your experience?"
        }}
        defaultName={userName}
        defaultEmail={userEmail}
      />
    </div>
  )
}
