export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          created_at: string | null
          education_level: Database["public"]["Enums"]["education_level"] | null
          email_verified: boolean | null
          gpa: number
          gpa_verified: boolean | null
          graduation_year: number
          id: string
          last_activity_at: string | null
          major: string
          notes: string | null
          preferred_locations: string[] | null
          resume_url: string | null
          school_name: string
          school_verified: boolean | null
          status: Database["public"]["Enums"]["candidate_status"] | null
          tags: string[] | null
          target_roles: string[] | null
          transcript_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          education_level?: Database["public"]["Enums"]["education_level"] | null
          email_verified?: boolean | null
          gpa: number
          gpa_verified?: boolean | null
          graduation_year: number
          id?: string
          last_activity_at?: string | null
          major: string
          notes?: string | null
          preferred_locations?: string[] | null
          resume_url?: string | null
          school_name: string
          school_verified?: boolean | null
          status?: Database["public"]["Enums"]["candidate_status"] | null
          tags?: string[] | null
          target_roles?: string[] | null
          transcript_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          education_level?: Database["public"]["Enums"]["education_level"] | null
          email_verified?: boolean | null
          gpa?: number
          gpa_verified?: boolean | null
          graduation_year?: number
          id?: string
          last_activity_at?: string | null
          major?: string
          notes?: string | null
          preferred_locations?: string[] | null
          resume_url?: string | null
          school_name?: string
          school_verified?: boolean | null
          status?: Database["public"]["Enums"]["candidate_status"] | null
          tags?: string[] | null
          target_roles?: string[] | null
          transcript_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          linkedin_url: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          linkedin_url?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
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
          is_visible_to_candidates: boolean | null
          is_visible_to_recruiters: boolean | null
          is_visible_to_schools: boolean | null
          job_title: string
          linkedin_url: string | null
          locations: string[] | null
          profile_photo_url: string | null
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
          is_visible_to_candidates?: boolean | null
          is_visible_to_recruiters?: boolean | null
          is_visible_to_schools?: boolean | null
          job_title: string
          linkedin_url?: string | null
          locations?: string[] | null
          profile_photo_url?: string | null
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
          is_visible_to_candidates?: boolean | null
          is_visible_to_recruiters?: boolean | null
          is_visible_to_schools?: boolean | null
          job_title?: string
          linkedin_url?: string | null
          locations?: string[] | null
          profile_photo_url?: string | null
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
          school_domain: string | null
          school_name: string
          updated_at: string | null
          user_id: string | null
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
          school_domain?: string | null
          school_name: string
          updated_at?: string | null
          user_id?: string | null
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
          school_domain?: string | null
          school_name?: string
          updated_at?: string | null
          user_id?: string | null
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
      [_ in never]: never
    }
    Enums: {
      candidate_status:
        | "pending_verification"
        | "verified"
        | "active"
        | "placed"
        | "rejected"
      education_level: "bachelors" | "masters" | "mba" | "phd"
      user_role: "candidate" | "recruiter" | "admin" | "school_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

