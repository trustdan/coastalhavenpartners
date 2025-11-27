export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      candidate_interactions: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          id: string
          interaction_type: string
          notes: string | null
          recruiter_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          notes?: string | null
          recruiter_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          notes?: string | null
          recruiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_interactions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_interactions_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          education_level: Database["public"]["Enums"]["education_level"] | null
          email_verified: boolean | null
          gpa: number
          gpa_verified: boolean | null
          grad_degree_type: string | null
          grad_gpa: number | null
          grad_graduation_year: number | null
          grad_major: string | null
          grad_school: string | null
          grad_specialty: string | null
          graduation_year: number
          id: string
          is_rejected: boolean | null
          last_activity_at: string | null
          major: string
          notes: string | null
          preferred_locations: string[] | null
          rejected_at: string | null
          rejected_by: string | null
          resume_url: string | null
          scheduling_url: string | null
          school_name: string
          school_verified: boolean | null
          status: Database["public"]["Enums"]["candidate_status"] | null
          tags: string[] | null
          target_roles: string[] | null
          transcript_url: string | null
          undergrad_degree_type: string | null
          undergrad_specialty: string | null
          updated_at: string | null
          user_id: string | null
          visible_fields_to_recruiters: Json | null
          visible_fields_to_schools: Json | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          email_verified?: boolean | null
          gpa: number
          gpa_verified?: boolean | null
          grad_degree_type?: string | null
          grad_gpa?: number | null
          grad_graduation_year?: number | null
          grad_major?: string | null
          grad_school?: string | null
          grad_specialty?: string | null
          graduation_year: number
          id?: string
          is_rejected?: boolean | null
          last_activity_at?: string | null
          major: string
          notes?: string | null
          preferred_locations?: string[] | null
          rejected_at?: string | null
          rejected_by?: string | null
          resume_url?: string | null
          scheduling_url?: string | null
          school_name: string
          school_verified?: boolean | null
          status?: Database["public"]["Enums"]["candidate_status"] | null
          tags?: string[] | null
          target_roles?: string[] | null
          transcript_url?: string | null
          undergrad_degree_type?: string | null
          undergrad_specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
          visible_fields_to_recruiters?: Json | null
          visible_fields_to_schools?: Json | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          email_verified?: boolean | null
          gpa?: number
          gpa_verified?: boolean | null
          grad_degree_type?: string | null
          grad_gpa?: number | null
          grad_graduation_year?: number | null
          grad_major?: string | null
          grad_school?: string | null
          grad_specialty?: string | null
          graduation_year?: number
          id?: string
          is_rejected?: boolean | null
          last_activity_at?: string | null
          major?: string
          notes?: string | null
          preferred_locations?: string[] | null
          rejected_at?: string | null
          rejected_by?: string | null
          resume_url?: string | null
          scheduling_url?: string | null
          school_name?: string
          school_verified?: boolean | null
          status?: Database["public"]["Enums"]["candidate_status"] | null
          tags?: string[] | null
          target_roles?: string[] | null
          transcript_url?: string | null
          undergrad_degree_type?: string | null
          undergrad_specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
          visible_fields_to_recruiters?: Json | null
          visible_fields_to_schools?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discord_reports: {
        Row: {
          action_id: string | null
          channel_id: string | null
          created_at: string | null
          id: string
          message_content: string | null
          message_link: string | null
          reason: string
          reported_discord_id: string
          reported_user_id: string | null
          reporter_discord_id: string
          reporter_user_id: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          action_id?: string | null
          channel_id?: string | null
          created_at?: string | null
          id?: string
          message_content?: string | null
          message_link?: string | null
          reason: string
          reported_discord_id: string
          reported_user_id?: string | null
          reporter_discord_id: string
          reporter_user_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          action_id?: string | null
          channel_id?: string | null
          created_at?: string | null
          id?: string
          message_content?: string | null
          message_link?: string | null
          reason?: string
          reported_discord_id?: string
          reported_user_id?: string | null
          reporter_discord_id?: string
          reporter_user_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discord_reports_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "moderation_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discord_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discord_reports_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discord_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string | null
          discord_channel_id: string | null
          discord_message_id: string | null
          evidence_urls: string[] | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          moderator_discord_id: string | null
          moderator_id: string | null
          platform: string
          reason: string | null
          target_discord_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          discord_channel_id?: string | null
          discord_message_id?: string | null
          evidence_urls?: string[] | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          moderator_discord_id?: string | null
          moderator_id?: string | null
          platform?: string
          reason?: string | null
          target_discord_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          discord_channel_id?: string | null
          discord_message_id?: string | null
          evidence_urls?: string[] | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          moderator_discord_id?: string | null
          moderator_id?: string | null
          platform?: string
          reason?: string | null
          target_discord_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ban_expires_at: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          created_at: string | null
          discord_id: string | null
          discord_username: string | null
          discord_verified_at: string | null
          email: string
          full_name: string
          id: string
          is_banned: boolean | null
          linkedin_url: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          ban_expires_at?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          created_at?: string | null
          discord_id?: string | null
          discord_username?: string | null
          discord_verified_at?: string | null
          email: string
          full_name: string
          id: string
          is_banned?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          ban_expires_at?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          created_at?: string | null
          discord_id?: string | null
          discord_username?: string | null
          discord_verified_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_banned?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          company_website: string | null
          created_at: string | null
          firm_name: string
          firm_type: string | null
          id: string
          is_approved: boolean | null
          is_rejected: boolean | null
          is_visible_to_candidates: boolean | null
          is_visible_to_recruiters: boolean | null
          is_visible_to_schools: boolean | null
          job_title: string
          linkedin_url: string | null
          locations: string[] | null
          profile_photo_url: string | null
          rejected_at: string | null
          rejected_by: string | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string | null
          visible_fields_to_candidates: Json | null
          visible_fields_to_recruiters: Json | null
          visible_fields_to_schools: Json | null
          years_experience: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          company_website?: string | null
          created_at?: string | null
          firm_name: string
          firm_type?: string | null
          id?: string
          is_approved?: boolean | null
          is_rejected?: boolean | null
          is_visible_to_candidates?: boolean | null
          is_visible_to_recruiters?: boolean | null
          is_visible_to_schools?: boolean | null
          job_title: string
          linkedin_url?: string | null
          locations?: string[] | null
          profile_photo_url?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          visible_fields_to_candidates?: Json | null
          visible_fields_to_recruiters?: Json | null
          visible_fields_to_schools?: Json | null
          years_experience?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          company_website?: string | null
          created_at?: string | null
          firm_name?: string
          firm_type?: string | null
          id?: string
          is_approved?: boolean | null
          is_rejected?: boolean | null
          is_visible_to_candidates?: boolean | null
          is_visible_to_recruiters?: boolean | null
          is_visible_to_schools?: boolean | null
          job_title?: string
          linkedin_url?: string | null
          locations?: string[] | null
          profile_photo_url?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          visible_fields_to_candidates?: Json | null
          visible_fields_to_recruiters?: Json | null
          visible_fields_to_schools?: Json | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_profiles_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          department_name: string | null
          id: string
          is_approved: boolean | null
          is_rejected: boolean | null
          rejected_at: string | null
          rejected_by: string | null
          school_domain: string | null
          school_name: string
          updated_at: string | null
          user_id: string | null
          verification_document_type: string | null
          verification_document_url: string | null
          verification_notes: string | null
          verification_status: string | null
          website: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          department_name?: string | null
          id?: string
          is_approved?: boolean | null
          is_rejected?: boolean | null
          rejected_at?: string | null
          rejected_by?: string | null
          school_domain?: string | null
          school_name: string
          updated_at?: string | null
          user_id?: string | null
          verification_document_type?: string | null
          verification_document_url?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          website?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          department_name?: string | null
          id?: string
          is_approved?: boolean | null
          is_rejected?: boolean | null
          rejected_at?: string | null
          rejected_by?: string | null
          school_domain?: string | null
          school_name?: string
          updated_at?: string | null
          user_id?: string | null
          verification_document_type?: string | null
          verification_document_url?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_profiles_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_candidate_profile: {
        Args: {
          p_gpa: number
          p_graduation_year: number
          p_major: string
          p_school_name: string
          p_user_id: string
        }
        Returns: string
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_school_candidates: {
        Args: { school_admin_id: string }
        Returns: {
          candidate_id: string
          email: string
          full_name: string
          gpa: number
          graduation_year: number
          major: string
          school_name: string
          status: Database["public"]["Enums"]["candidate_status"]
        }[]
      }
      get_visible_candidate_fields: {
        Args: {
          candidate_profile_id: string
          viewer_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Json
      }
      get_visible_recruiter_fields: {
        Args: {
          recruiter_profile_id: string
          viewer_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      candidate_status:
        | "pending_verification"
        | "verified"
        | "active"
        | "placed"
        | "rejected"
      education_level: "bachelors" | "masters" | "mba" | "phd"
      school_verification_status:
        | "pending_documents"
        | "documents_submitted"
        | "under_review"
        | "approved"
        | "rejected"
      user_role: "candidate" | "recruiter" | "admin" | "school_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      candidate_status: [
        "pending_verification",
        "verified",
        "active",
        "placed",
        "rejected",
      ],
      education_level: ["bachelors", "masters", "mba", "phd"],
      school_verification_status: [
        "pending_documents",
        "documents_submitted",
        "under_review",
        "approved",
        "rejected",
      ],
      user_role: ["candidate", "recruiter", "admin", "school_admin"],
    },
  },
} as const
