'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveFirm(firmId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('saved_firms')
    .insert({
      user_id: user.id,
      firm_id: firmId,
    })

  if (error) {
    // Ignore duplicate errors (already saved)
    if (error.code !== '23505') {
      console.error('Error saving firm:', error)
      throw new Error('Failed to save firm')
    }
  }

  revalidatePath('/firms')
}

export async function unsaveFirm(firmId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('saved_firms')
    .delete()
    .eq('user_id', user.id)
    .eq('firm_id', firmId)

  if (error) {
    console.error('Error unsaving firm:', error)
    throw new Error('Failed to unsave firm')
  }

  revalidatePath('/firms')
}

export async function getSavedFirms() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data: savedFirms } = await supabase
    .from('saved_firms')
    .select(`
      firm_id,
      created_at,
      firms (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return savedFirms || []
}
