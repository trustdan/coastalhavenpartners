'use server'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

export async function createSchoolProfile(data: {
  userId: string
  email: string
  fullName: string
  schoolName: string
  schoolDomain: string
  departmentName: string
  contactEmail: string
  verificationDocumentType?: string
  verificationDocumentBase64?: string
  verificationDocumentExt?: string
  verificationDocumentMimeType?: string
}) {
  console.log('Creating school profile for:', data.userId)

  // Use service role to bypass RLS for profile creation and file upload
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 1. Ensure Profile Exists (Retry Logic)
  let profileExists = false
  
  for (let i = 0; i < 3; i++) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', data.userId)
      .single()
    
    if (profile) {
      profileExists = true
      break
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // If not found, force create it
  if (!profileExists) {
    console.log('Force creating school admin base profile...')
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: data.userId,
        email: data.email,
        full_name: data.fullName,
        role: 'school_admin',
      }, { onConflict: 'id' })

    if (insertError) {
      console.error('Error creating base profile:', insertError)
    }
  } else {
    // Update role if profile already exists
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'school_admin' })
      .eq('id', data.userId)
  }

  // 2. Upload verification document if provided
  let verificationDocumentUrl: string | null = null
  
  if (data.verificationDocumentBase64 && data.verificationDocumentExt) {
    const fileName = `${data.userId}/verification-${Date.now()}.${data.verificationDocumentExt}`
    
    // Convert base64 to buffer
    const buffer = Buffer.from(data.verificationDocumentBase64, 'base64')
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('school-documents')
      .upload(fileName, buffer, {
        contentType: data.verificationDocumentMimeType || 'application/pdf',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Document upload error:', uploadError)
      // Continue without document - admin can request later
    } else {
      // Get the URL (using service role, we can access private bucket)
      const { data: urlData } = supabaseAdmin.storage
        .from('school-documents')
        .getPublicUrl(fileName)
      
      verificationDocumentUrl = urlData.publicUrl
      console.log('Document uploaded successfully:', verificationDocumentUrl)
    }
  }

  // 3. Create school profile with verification fields
  const { data: schoolProfile, error: schoolError } = await supabaseAdmin
    .from('school_profiles')
    .insert({
      user_id: data.userId,
      school_name: data.schoolName,
      school_domain: data.schoolDomain,
      department_name: data.departmentName,
      contact_email: data.contactEmail,
      verification_document_url: verificationDocumentUrl,
      verification_document_type: data.verificationDocumentType || null,
      verification_status: verificationDocumentUrl ? 'documents_submitted' : 'pending_documents',
      is_approved: false,
    })
    .select()
    .single()

  if (schoolError) {
    console.error('Error creating school profile:', schoolError)
    throw new Error(`Failed to create school profile: ${schoolError.message}`)
  }

  if (!schoolProfile) {
    throw new Error('School profile was not created')
  }

  console.log('School profile created successfully:', schoolProfile.id)
  return { success: true }
}
