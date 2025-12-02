'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Building2, Loader2, Sparkles } from 'lucide-react'
import { createFirmForRecruiter } from './actions'

interface CreateFirmPromptProps {
  firmName: string
}

export function CreateFirmPrompt({ firmName }: CreateFirmPromptProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createFirmForRecruiter()
        toast.success('Firm profile created successfully')
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to create firm profile')
      }
    })
  }

  return (
    <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center dark:from-blue-950/20 dark:to-purple-950/20 dark:border-neutral-800">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
        <Building2 className="h-8 w-8 text-white" />
      </div>

      <h2 className="mt-6 text-xl font-semibold">Create Your Firm Profile</h2>

      <p className="mt-3 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
        Create a public profile for <strong>{firmName}</strong> so candidates can learn more
        about your firm and express interest.
      </p>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button onClick={handleCreate} disabled={isPending} size="lg">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Create Firm Profile
        </Button>

        <p className="text-xs text-neutral-500">
          This will create a public page at /firms/{firmName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
        </p>
      </div>

      <div className="mt-8 rounded-lg bg-white/50 p-4 dark:bg-neutral-900/50">
        <h3 className="font-medium flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Benefits of a Firm Profile
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <li>• Candidates can discover and learn about your firm</li>
          <li>• Show your culture, values, and what makes you unique</li>
          <li>• Display current hiring roles to attract talent</li>
          <li>• Build your employer brand with future candidates</li>
        </ul>
      </div>
    </div>
  )
}
