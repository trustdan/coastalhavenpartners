import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { CampaignBuilder } from '@/components/recruiter/campaign-builder'
import { getSavedSearches } from '../actions'

export default async function NewCampaignPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get recruiter profile
  const { data: recruiterProfileRow } = await supabase
    .from('recruiter_profiles')
    .select('id, firm_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfileRow) {
    redirect('/recruiter')
  }

  // Get full name from profiles table
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const recruiterProfile = {
    ...recruiterProfileRow,
    full_name: userProfile?.full_name || 'Unknown',
  }

  if (!recruiterProfile.is_approved) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recruiter/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">New Campaign</h1>
        </div>

        <div className="rounded-lg border bg-yellow-50 p-6 text-center dark:bg-yellow-950">
          <h2 className="text-lg font-semibold">Account Pending Approval</h2>
          <p className="mt-2 text-muted-foreground">
            You need to be verified before you can create campaigns.
          </p>
        </div>
      </div>
    )
  }

  const savedSearches = await getSavedSearches()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/recruiter/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Campaign</h1>
          <p className="text-muted-foreground">
            Create a bulk outreach campaign to reach multiple candidates
          </p>
        </div>
      </div>

      <CampaignBuilder
        savedSearches={savedSearches}
        recruiterName={recruiterProfile.full_name}
        firmName={recruiterProfile.firm_name || ''}
      />
    </div>
  )
}
