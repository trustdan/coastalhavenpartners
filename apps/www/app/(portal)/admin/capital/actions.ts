"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/types/database.types"

type ApplicationStatus = Database["public"]["Enums"]["application_status"]

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

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

  // Verify admin role
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  // Update application status
  const { error } = await supabaseAdmin
    .from("applications")
    .update({
      status: newStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId)

  if (error) {
    console.error("Error updating application status:", error)
    return { error: "Failed to update status" }
  }

  revalidatePath("/admin/capital")
  return { success: true }
}

export async function addInternalNotes(applicationId: string, notes: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

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

  // Verify admin role
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  // Update internal notes
  const { error } = await supabaseAdmin
    .from("applications")
    .update({
      internal_notes: notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId)

  if (error) {
    console.error("Error updating internal notes:", error)
    return { error: "Failed to update notes" }
  }

  revalidatePath("/admin/capital")
  return { success: true }
}
