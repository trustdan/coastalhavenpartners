"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/types/database.types"

interface SubmitApplicationInput {
  candidateProfileId: string
  coverLetter: string
  outreachApproach: string
}

export async function submitCapitalApplication(input: SubmitApplicationInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Use admin client to bypass RLS for creating the application
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // Verify the candidate profile belongs to this user
  const { data: candidateProfile } = await supabaseAdmin
    .from("candidate_profiles")
    .select("*")
    .eq("id", input.candidateProfileId)
    .eq("user_id", user.id)
    .single()

  if (!candidateProfile) {
    return { error: "Candidate profile not found" }
  }

  // Check profile is verified
  if (
    candidateProfile.status !== "verified" &&
    candidateProfile.status !== "active"
  ) {
    return { error: "Profile must be verified to apply" }
  }

  // Get base profile data
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email, phone, linkedin_url")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return { error: "Profile not found" }
  }

  // Check for existing application
  const { data: existingApp } = await supabaseAdmin
    .from("applications")
    .select("id")
    .eq("candidate_profile_id", input.candidateProfileId)
    .eq("target_type", "capital")
    .single()

  if (existingApp) {
    return { error: "You have already applied to Coastal Haven Capital" }
  }

  // Create application with snapshot
  const snapshot = {
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    linkedin_url: profile.linkedin_url,
    school_name: candidateProfile.school_name,
    major: candidateProfile.major,
    graduation_year: candidateProfile.graduation_year,
    gpa: candidateProfile.gpa,
    resume_url: candidateProfile.resume_url,
    transcript_url: candidateProfile.transcript_url,
    scheduling_url: candidateProfile.scheduling_url,
    bio: candidateProfile.bio,
    target_roles: candidateProfile.target_roles,
    preferred_locations: candidateProfile.preferred_locations,
  }

  const { data: application, error } = await supabaseAdmin
    .from("applications")
    .insert({
      candidate_profile_id: input.candidateProfileId,
      target_type: "capital",
      firm_id: null,
      snapshot,
      cover_letter: input.coverLetter,
      outreach_approach: input.outreachApproach,
      status: "pending",
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating application:", error)
    return { error: "Failed to submit application. Please try again." }
  }

  // TODO: Send notification email to admin via Resend

  revalidatePath("/apply/capital")
  revalidatePath("/candidate")

  return { success: true, applicationId: application.id }
}
