import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyFirm } from './actions'
import { FirmProfileForm } from './firm-profile-form'
import { CreateFirmPrompt } from './create-firm-prompt'

export default async function FirmSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if recruiter is approved
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('is_approved, firm_name')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.is_approved) {
    redirect('/recruiter')
  }

  const firm = await getMyFirm()

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Firm Profile</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your firm's public profile that candidates can view
        </p>
      </div>

      {firm ? (
        <FirmProfileForm firm={firm} />
      ) : (
        <CreateFirmPrompt firmName={recruiterProfile.firm_name} />
      )}
    </div>
  )
}
