'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CampaignFilters {
  schools?: string[]
  graduationYears?: number[]
  minGpa?: number
  maxGpa?: number
  majors?: string[]
  targetRoles?: string[]
  status?: string
}

export interface Campaign {
  id: string
  name: string
  subject: string
  message_template: string
  filters: CampaignFilters
  saved_search_id: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface CampaignRecipient {
  id: string
  campaign_id: string
  candidate_profile_id: string
  status: 'pending' | 'sent' | 'failed' | 'opened' | 'replied'
  sent_at: string | null
  opened_at: string | null
  replied_at: string | null
  error_message: string | null
  candidate?: {
    id: string
    full_name: string
    school_name: string
    graduation_year: number | null
    major: string | null
    gpa: number | null
  }
}

export interface CampaignWithStats extends Campaign {
  total_recipients: number
  sent_count: number
  opened_count: number
  replied_count: number
  failed_count: number
}

async function getRecruiterProfileId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return data?.id || null
}

// Helper to access tables not yet in the generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromTable(supabase: any, table: string) {
  return supabase.from(table)
}

// Get all campaigns for the current recruiter
export async function getCampaigns(): Promise<CampaignWithStats[]> {
  const supabase = await createClient()
  const recruiterProfileId = await getRecruiterProfileId()
  if (!recruiterProfileId) return []

  const { data: campaigns } = await fromTable(supabase, 'recruiter_campaigns')
    .select('*')
    .eq('recruiter_profile_id', recruiterProfileId)
    .order('created_at', { ascending: false })

  if (!campaigns) return []

  // Get recipient counts for each campaign
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaignIds = campaigns.map((c: any) => c.id)

  const { data: recipients } = await fromTable(supabase, 'campaign_recipients')
    .select('campaign_id, status')
    .in('campaign_id', campaignIds)

  // Calculate stats for each campaign
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return campaigns.map((campaign: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaignRecipients = recipients?.filter((r: any) => r.campaign_id === campaign.id) || []

    return {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      message_template: campaign.message_template,
      filters: campaign.filters as CampaignFilters,
      saved_search_id: campaign.saved_search_id,
      status: campaign.status as Campaign['status'],
      scheduled_at: campaign.scheduled_at,
      sent_at: campaign.sent_at,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
      total_recipients: campaignRecipients.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sent_count: campaignRecipients.filter((r: any) => ['sent', 'opened', 'replied'].includes(r.status)).length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opened_count: campaignRecipients.filter((r: any) => ['opened', 'replied'].includes(r.status)).length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      replied_count: campaignRecipients.filter((r: any) => r.status === 'replied').length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      failed_count: campaignRecipients.filter((r: any) => r.status === 'failed').length,
    }
  })
}

// Get a single campaign with its recipients
export async function getCampaign(campaignId: string): Promise<{
  campaign: Campaign | null
  recipients: CampaignRecipient[]
  stats: {
    total: number
    sent: number
    opened: number
    replied: number
    failed: number
  }
}> {
  const supabase = await createClient()
  const recruiterProfileId = await getRecruiterProfileId()
  if (!recruiterProfileId) {
    return { campaign: null, recipients: [], stats: { total: 0, sent: 0, opened: 0, replied: 0, failed: 0 } }
  }

  // Get campaign
  const { data: campaign } = await fromTable(supabase, 'recruiter_campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('recruiter_profile_id', recruiterProfileId)
    .single()

  if (!campaign) {
    return { campaign: null, recipients: [], stats: { total: 0, sent: 0, opened: 0, replied: 0, failed: 0 } }
  }

  // Get recipients
  const { data: recipients } = await fromTable(supabase, 'campaign_recipients')
    .select('id, campaign_id, candidate_profile_id, status, sent_at, opened_at, replied_at, error_message')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })

  // Get candidate details for recipients - join with profiles for full_name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidateIds = recipients?.map((r: any) => r.candidate_profile_id) || []

  let candidatesWithNames: { id: string; full_name: string; school_name: string; graduation_year: number | null; major: string | null; gpa: number | null }[] = []

  if (candidateIds.length > 0) {
    const { data: candidateProfiles } = await supabase
      .from('candidate_profiles')
      .select('id, user_id, school_name, graduation_year, major, gpa')
      .in('id', candidateIds)

    if (candidateProfiles) {
      // Get user IDs to fetch names from profiles
      const userIds = candidateProfiles.map(c => c.user_id).filter(Boolean) as string[]

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      candidatesWithNames = candidateProfiles.map(c => ({
        id: c.id,
        full_name: profiles?.find(p => p.id === c.user_id)?.full_name || 'Unknown',
        school_name: c.school_name,
        graduation_year: c.graduation_year,
        major: c.major,
        gpa: c.gpa ? Number(c.gpa) : null,
      }))
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recipientsWithCandidates: CampaignRecipient[] = (recipients || []).map((r: any) => ({
    id: r.id,
    campaign_id: r.campaign_id,
    candidate_profile_id: r.candidate_profile_id,
    status: r.status as CampaignRecipient['status'],
    sent_at: r.sent_at,
    opened_at: r.opened_at,
    replied_at: r.replied_at,
    error_message: r.error_message,
    candidate: candidatesWithNames.find(c => c.id === r.candidate_profile_id),
  }))

  // Calculate stats
  const stats = {
    total: recipientsWithCandidates.length,
    sent: recipientsWithCandidates.filter(r => ['sent', 'opened', 'replied'].includes(r.status)).length,
    opened: recipientsWithCandidates.filter(r => ['opened', 'replied'].includes(r.status)).length,
    replied: recipientsWithCandidates.filter(r => r.status === 'replied').length,
    failed: recipientsWithCandidates.filter(r => r.status === 'failed').length,
  }

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      message_template: campaign.message_template,
      filters: campaign.filters as CampaignFilters,
      saved_search_id: campaign.saved_search_id,
      status: campaign.status as Campaign['status'],
      scheduled_at: campaign.scheduled_at,
      sent_at: campaign.sent_at,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
    },
    recipients: recipientsWithCandidates,
    stats,
  }
}

// Create a new campaign
export async function createCampaign(data: {
  name: string
  subject: string
  message_template: string
  filters?: CampaignFilters
  saved_search_id?: string
}): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  const supabase = await createClient()
  const recruiterProfileId = await getRecruiterProfileId()
  if (!recruiterProfileId) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: campaign, error } = await fromTable(supabase, 'recruiter_campaigns')
    .insert({
      recruiter_profile_id: recruiterProfileId,
      name: data.name,
      subject: data.subject,
      message_template: data.message_template,
      filters: data.filters || {},
      saved_search_id: data.saved_search_id || null,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/recruiter/campaigns')
  return { success: true, campaignId: campaign?.id }
}

// Update a campaign (only drafts can be edited)
export async function updateCampaign(
  campaignId: string,
  data: {
    name?: string
    subject?: string
    message_template?: string
    filters?: CampaignFilters
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const recruiterProfileId = await getRecruiterProfileId()
  if (!recruiterProfileId) {
    return { success: false, error: 'Unauthorized' }
  }

  // Check campaign exists and is in draft status
  const { data: existing } = await fromTable(supabase, 'recruiter_campaigns')
    .select('status')
    .eq('id', campaignId)
    .eq('recruiter_profile_id', recruiterProfileId)
    .single()

  if (!existing) {
    return { success: false, error: 'Campaign not found' }
  }

  if (existing.status !== 'draft') {
    return { success: false, error: 'Only draft campaigns can be edited' }
  }

  const { error } = await fromTable(supabase, 'recruiter_campaigns')
    .update(data)
    .eq('id', campaignId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/recruiter/campaigns')
  revalidatePath(`/recruiter/campaigns/${campaignId}`)
  return { success: true }
}

// Delete a campaign (only drafts)
export async function deleteCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const recruiterProfileId = await getRecruiterProfileId()
  if (!recruiterProfileId) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await fromTable(supabase, 'recruiter_campaigns')
    .delete()
    .eq('id', campaignId)
    .eq('recruiter_profile_id', recruiterProfileId)
    .eq('status', 'draft')

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/recruiter/campaigns')
  return { success: true }
}

// Add recipients to a campaign based on filters or candidate IDs
export async function addCampaignRecipients(
  campaignId: string,
  options: {
    candidateIds?: string[]
    useFilters?: boolean
  }
): Promise<{ success: boolean; addedCount?: number; error?: string }> {
  const supabase = await createClient()
  const recruiterProfileId = await getRecruiterProfileId()
  if (!recruiterProfileId) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get campaign
  const { data: campaign } = await fromTable(supabase, 'recruiter_campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('recruiter_profile_id', recruiterProfileId)
    .single()

  if (!campaign) {
    return { success: false, error: 'Campaign not found' }
  }

  if (campaign.status !== 'draft') {
    return { success: false, error: 'Can only add recipients to draft campaigns' }
  }

  let candidateIds = options.candidateIds || []

  // If using filters, query for matching candidates
  if (options.useFilters && campaign.filters) {
    const filters = campaign.filters as CampaignFilters

    let query = supabase
      .from('candidate_profiles')
      .select('id')
      .eq('status', 'verified')
      .eq('visibility', 'visible')

    if (filters.schools?.length) {
      query = query.in('school_name', filters.schools)
    }

    if (filters.graduationYears?.length) {
      query = query.in('graduation_year', filters.graduationYears)
    }

    if (filters.minGpa) {
      query = query.gte('gpa', filters.minGpa)
    }

    if (filters.maxGpa) {
      query = query.lte('gpa', filters.maxGpa)
    }

    if (filters.majors?.length) {
      query = query.in('major', filters.majors)
    }

    if (filters.targetRoles?.length) {
      query = query.overlaps('target_roles', filters.targetRoles)
    }

    const { data: candidates } = await query.limit(50) // Rate limit: max 50 per campaign

    candidateIds = candidates?.map(c => c.id) || []
  }

  if (candidateIds.length === 0) {
    return { success: false, error: 'No matching candidates found' }
  }

  // Limit to 50 recipients
  if (candidateIds.length > 50) {
    candidateIds = candidateIds.slice(0, 50)
  }

  // Get existing recipients to avoid duplicates
  const { data: existing } = await fromTable(supabase, 'campaign_recipients')
    .select('candidate_profile_id')
    .eq('campaign_id', campaignId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingIds = new Set(existing?.map((e: any) => e.candidate_profile_id) || [])
  const newCandidateIds = candidateIds.filter(id => !existingIds.has(id))

  if (newCandidateIds.length === 0) {
    return { success: true, addedCount: 0 }
  }

  // Check total doesn't exceed 50
  const totalAfter = existingIds.size + newCandidateIds.length
  if (totalAfter > 50) {
    const canAdd = 50 - existingIds.size
    if (canAdd <= 0) {
      return { success: false, error: 'Campaign already has maximum 50 recipients' }
    }
    newCandidateIds.splice(canAdd)
  }

  // Insert new recipients
  const { error } = await fromTable(supabase, 'campaign_recipients')
    .insert(newCandidateIds.map(candidateId => ({
      campaign_id: campaignId,
      candidate_profile_id: candidateId,
      status: 'pending',
    })))

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/recruiter/campaigns/${campaignId}`)
  return { success: true, addedCount: newCandidateIds.length }
}

// Remove a recipient from a campaign
export async function removeCampaignRecipient(
  campaignId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const recruiterProfileId = await getRecruiterProfileId()
  if (!recruiterProfileId) {
    return { success: false, error: 'Unauthorized' }
  }

  // Verify campaign is in draft and belongs to this recruiter
  const { data: campaign } = await fromTable(supabase, 'recruiter_campaigns')
    .select('status')
    .eq('id', campaignId)
    .eq('recruiter_profile_id', recruiterProfileId)
    .single()

  if (!campaign) {
    return { success: false, error: 'Campaign not found' }
  }

  if (campaign.status !== 'draft') {
    return { success: false, error: 'Can only remove recipients from draft campaigns' }
  }

  const { error } = await fromTable(supabase, 'campaign_recipients')
    .delete()
    .eq('id', recipientId)
    .eq('campaign_id', campaignId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/recruiter/campaigns/${campaignId}`)
  return { success: true }
}

// Render template with candidate data (internal helper, not a server action)
function renderTemplate(
  template: string,
  candidate: {
    full_name: string
    school_name?: string | null
    major?: string | null
    graduation_year?: number | null
    gpa?: number | null
  },
  recruiter: {
    full_name: string
    firm_name?: string | null
  }
): string {
  const firstName = candidate.full_name.split(' ')[0]

  return template
    .replace(/\{\{candidate_name\}\}/g, candidate.full_name)
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{school\}\}/g, candidate.school_name || '')
    .replace(/\{\{major\}\}/g, candidate.major || '')
    .replace(/\{\{graduation_year\}\}/g, candidate.graduation_year?.toString() || '')
    .replace(/\{\{gpa\}\}/g, candidate.gpa?.toFixed(2) || '')
    .replace(/\{\{recruiter_name\}\}/g, recruiter.full_name)
    .replace(/\{\{firm_name\}\}/g, recruiter.firm_name || '')
}

// Send a campaign - creates conversations and messages for each recipient
export async function sendCampaign(campaignId: string): Promise<{
  success: boolean
  sentCount?: number
  failedCount?: number
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get recruiter profile with full_name from profiles table
  const { data: recruiterProfileRow } = await supabase
    .from('recruiter_profiles')
    .select('id, firm_name, is_approved, user_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfileRow || !recruiterProfileRow.is_approved) {
    return { success: false, error: 'Recruiter profile not found or not approved' }
  }

  // Get recruiter's full name from profiles
  const { data: recruiterUserProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const recruiterProfile = {
    id: recruiterProfileRow.id,
    full_name: recruiterUserProfile?.full_name || 'Unknown',
    firm_name: recruiterProfileRow.firm_name,
    is_approved: recruiterProfileRow.is_approved,
  }

  // Get campaign with recipients
  const { data: campaign } = await fromTable(supabase, 'recruiter_campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('recruiter_profile_id', recruiterProfile.id)
    .single()

  if (!campaign) {
    return { success: false, error: 'Campaign not found' }
  }

  if (campaign.status !== 'draft') {
    return { success: false, error: 'Only draft campaigns can be sent' }
  }

  // Get pending recipients
  const { data: recipients } = await fromTable(supabase, 'campaign_recipients')
    .select('id, candidate_profile_id')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')

  if (!recipients || recipients.length === 0) {
    return { success: false, error: 'No recipients to send to' }
  }

  // Update campaign status to sending
  await fromTable(supabase, 'recruiter_campaigns')
    .update({ status: 'sending' })
    .eq('id', campaignId)

  // Get candidate profiles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidateIds = recipients.map((r: any) => r.candidate_profile_id)
  const { data: candidateProfiles } = await supabase
    .from('candidate_profiles')
    .select('id, user_id, school_name, major, graduation_year, gpa')
    .in('id', candidateIds)

  // Get candidate names from profiles
  const candidateUserIds = candidateProfiles?.map(c => c.user_id).filter(Boolean) as string[]
  const { data: candidateUserProfiles } = candidateUserIds?.length
    ? await supabase.from('profiles').select('id, full_name').in('id', candidateUserIds)
    : { data: [] }

  // Build candidates array with full_name
  const candidates = candidateProfiles?.map(c => ({
    id: c.id,
    user_id: c.user_id,
    full_name: candidateUserProfiles?.find(p => p.id === c.user_id)?.full_name || 'Unknown',
    school_name: c.school_name,
    major: c.major,
    graduation_year: c.graduation_year,
    gpa: c.gpa ? Number(c.gpa) : null,
  })) || []

  let sentCount = 0
  let failedCount = 0

  // Send message to each recipient
  for (const recipient of recipients) {
    const candidate = candidates.find(c => c.id === recipient.candidate_profile_id)
    if (!candidate) {
      await fromTable(supabase, 'campaign_recipients')
        .update({ status: 'failed', error_message: 'Candidate not found' })
        .eq('id', recipient.id)
      failedCount++
      continue
    }

    try {
      // Check for existing conversation
      const { data: existingParticipation } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)

      let conversationId: string | null = null

      if (existingParticipation && existingParticipation.length > 0) {
        const { data: targetParticipation } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', candidate.user_id!)
          .in('conversation_id', existingParticipation.map(p => p.conversation_id))
          .limit(1)
          .single()

        if (targetParticipation) {
          conversationId = targetParticipation.conversation_id
        }
      }

      // Create new conversation if needed
      if (!conversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select('id')
          .single()

        if (convError) throw new Error(convError.message)
        conversationId = newConversation.id

        // Add participants
        await supabase.from('conversation_participants').insert([
          {
            conversation_id: conversationId,
            user_id: user.id,
            participant_type: 'recruiter' as const,
            profile_id: recruiterProfile.id,
          },
          {
            conversation_id: conversationId,
            user_id: candidate.user_id!,
            participant_type: 'candidate' as const,
            profile_id: candidate.id,
          },
        ])
      }

      // Render the message template
      const renderedMessage = renderTemplate(
        campaign.message_template,
        candidate,
        recruiterProfile
      )

      // Send the message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: renderedMessage,
        })
        .select('id')
        .single()

      if (msgError) throw new Error(msgError.message)

      // Update recipient status
      await fromTable(supabase, 'campaign_recipients')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          message_id: message.id,
          conversation_id: conversationId,
        })
        .eq('id', recipient.id)

      sentCount++
    } catch (err) {
      console.error(`Failed to send to recipient ${recipient.id}:`, err)
      await fromTable(supabase, 'campaign_recipients')
        .update({
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Unknown error',
        })
        .eq('id', recipient.id)
      failedCount++
    }
  }

  // Update campaign status to sent
  await fromTable(supabase, 'recruiter_campaigns')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', campaignId)

  revalidatePath('/recruiter/campaigns')
  revalidatePath(`/recruiter/campaigns/${campaignId}`)
  revalidatePath('/messages')

  return { success: true, sentCount, failedCount }
}

// Get saved searches for the recruiter (for campaign creation)
export async function getSavedSearches(): Promise<{
  id: string
  name: string
  filters: CampaignFilters
}[]> {
  const supabase = await createClient()
  const recruiterProfileId = await getRecruiterProfileId()
  if (!recruiterProfileId) return []

  const { data } = await supabase
    .from('saved_searches')
    .select('id, name, filters')
    .eq('recruiter_id', recruiterProfileId)
    .order('name')

  return (data || []).map(s => ({
    ...s,
    filters: s.filters as CampaignFilters,
  }))
}

// Preview recipients based on filters (without adding them)
export async function previewRecipients(filters: CampaignFilters): Promise<{
  count: number
  sample: {
    id: string
    full_name: string
    school_name: string
    graduation_year: number | null
    major: string | null
  }[]
}> {
  const supabase = await createClient()

  let query = supabase
    .from('candidate_profiles')
    .select('id, user_id, school_name, graduation_year, major')
    .eq('status', 'verified')
    .eq('visibility', 'visible')

  if (filters.schools?.length) {
    query = query.in('school_name', filters.schools)
  }

  if (filters.graduationYears?.length) {
    query = query.in('graduation_year', filters.graduationYears)
  }

  if (filters.minGpa) {
    query = query.gte('gpa', filters.minGpa)
  }

  if (filters.maxGpa) {
    query = query.lte('gpa', filters.maxGpa)
  }

  if (filters.majors?.length) {
    query = query.in('major', filters.majors)
  }

  if (filters.targetRoles?.length) {
    query = query.overlaps('target_roles', filters.targetRoles)
  }

  const { data } = await query.limit(10)

  if (!data || data.length === 0) {
    return { count: 0, sample: [] }
  }

  // Get full names from profiles
  const userIds = data.map(c => c.user_id).filter(Boolean) as string[]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  const sample = data.map(c => ({
    id: c.id,
    full_name: profiles?.find(p => p.id === c.user_id)?.full_name || 'Unknown',
    school_name: c.school_name,
    graduation_year: c.graduation_year,
    major: c.major,
  }))

  return {
    count: data.length,
    sample,
  }
}
