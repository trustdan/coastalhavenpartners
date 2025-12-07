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
      applications: {
        Row: {
          applied_at: string | null
          candidate_profile_id: string
          cover_letter: string
          firm_id: string | null
          id: string
          internal_notes: string | null
          job_listing_id: string | null
          outreach_approach: string
          reviewed_at: string | null
          reviewed_by: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["application_status"]
          target_type: Database["public"]["Enums"]["application_target"]
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          candidate_profile_id: string
          cover_letter: string
          firm_id?: string | null
          id?: string
          internal_notes?: string | null
          job_listing_id?: string | null
          outreach_approach: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          snapshot: Json
          status?: Database["public"]["Enums"]["application_status"]
          target_type?: Database["public"]["Enums"]["application_target"]
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          candidate_profile_id?: string
          cover_letter?: string
          firm_id?: string | null
          id?: string
          internal_notes?: string | null
          job_listing_id?: string | null
          outreach_approach?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["application_status"]
          target_type?: Database["public"]["Enums"]["application_target"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_profile_id_fkey"
            columns: ["candidate_profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarked_candidates: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          notes: string | null
          recruiter_id: string
          status: Database["public"]["Enums"]["bookmark_status"]
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          recruiter_id: string
          status?: Database["public"]["Enums"]["bookmark_status"]
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          recruiter_id?: string
          status?: Database["public"]["Enums"]["bookmark_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bookmarked_candidates_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarked_candidates_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          candidate_profile_id: string
          conversation_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          message_id: string | null
          opened_at: string | null
          replied_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          candidate_profile_id: string
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_id?: string | null
          opened_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          candidate_profile_id?: string
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_id?: string | null
          opened_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_stats"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "recruiter_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_candidate_profile_id_fkey"
            columns: ["candidate_profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_firm_interests: {
        Row: {
          candidate_id: string
          created_at: string | null
          firm_name: string
          id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          firm_name: string
          id?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          firm_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_firm_interests_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          documents_verified_at: string | null
          documents_verified_by: string | null
          education_level: Database["public"]["Enums"]["education_level"] | null
          email_verified: boolean | null
          gpa: number
          gpa_verification_status: string | null
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
          resume_verification_status: string | null
          resume_verified: boolean | null
          scheduling_url: string | null
          school_name: string
          school_verified: boolean | null
          status: Database["public"]["Enums"]["candidate_status"] | null
          tags: string[] | null
          target_roles: string[] | null
          transcript_url: string | null
          transcript_verified: boolean | null
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
          documents_verified_at?: string | null
          documents_verified_by?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          email_verified?: boolean | null
          gpa: number
          gpa_verification_status?: string | null
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
          resume_verification_status?: string | null
          resume_verified?: boolean | null
          scheduling_url?: string | null
          school_name: string
          school_verified?: boolean | null
          status?: Database["public"]["Enums"]["candidate_status"] | null
          tags?: string[] | null
          target_roles?: string[] | null
          transcript_url?: string | null
          transcript_verified?: boolean | null
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
          documents_verified_at?: string | null
          documents_verified_by?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          email_verified?: boolean | null
          gpa?: number
          gpa_verification_status?: string | null
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
          resume_verification_status?: string | null
          resume_verified?: boolean | null
          scheduling_url?: string | null
          school_name?: string
          school_verified?: boolean | null
          status?: Database["public"]["Enums"]["candidate_status"] | null
          tags?: string[] | null
          target_roles?: string[] | null
          transcript_url?: string | null
          transcript_verified?: boolean | null
          undergrad_degree_type?: string | null
          undergrad_specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
          visible_fields_to_recruiters?: Json | null
          visible_fields_to_schools?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_documents_verified_by_fkey"
            columns: ["documents_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      candidate_resumes: {
        Row: {
          candidate_profile_id: string
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          label: string
          resume_url: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          candidate_profile_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          label: string
          resume_url: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          candidate_profile_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          label?: string
          resume_url?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_resumes_candidate_profile_id_fkey"
            columns: ["candidate_profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_resumes_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_transcripts: {
        Row: {
          candidate_profile_id: string
          created_at: string | null
          degree_type: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          gpa: number | null
          gpa_verified: boolean | null
          id: string
          is_verified: boolean | null
          school_name: string | null
          transcript_url: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          candidate_profile_id: string
          created_at?: string | null
          degree_type?: string | null
          education_level?: Database["public"]["Enums"]["education_level"]
          gpa?: number | null
          gpa_verified?: boolean | null
          id?: string
          is_verified?: boolean | null
          school_name?: string | null
          transcript_url: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          candidate_profile_id?: string
          created_at?: string | null
          degree_type?: string | null
          education_level?: Database["public"]["Enums"]["education_level"]
          gpa?: number | null
          gpa_verified?: boolean | null
          id?: string
          is_verified?: boolean | null
          school_name?: string | null
          transcript_url?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_transcripts_candidate_profile_id_fkey"
            columns: ["candidate_profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_transcripts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_transcripts_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string | null
          participant_type: Database["public"]["Enums"]["conversation_participant_type"]
          profile_id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string | null
          participant_type: Database["public"]["Enums"]["conversation_participant_type"]
          profile_id: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string | null
          participant_type?: Database["public"]["Enums"]["conversation_participant_type"]
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          recruiter_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          recruiter_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          recruiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
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
      firms: {
        Row: {
          created_at: string | null
          culture: string | null
          description: string | null
          employee_count: string | null
          firm_type: string | null
          founded_year: number | null
          hiring_roles: string[] | null
          id: string
          is_visible: boolean | null
          locations: string[] | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          culture?: string | null
          description?: string | null
          employee_count?: string | null
          firm_type?: string | null
          founded_year?: number | null
          hiring_roles?: string[] | null
          id?: string
          is_visible?: boolean | null
          locations?: string[] | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          culture?: string | null
          description?: string | null
          employee_count?: string | null
          firm_type?: string | null
          founded_year?: number | null
          hiring_roles?: string[] | null
          id?: string
          is_visible?: boolean | null
          locations?: string[] | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      job_listings: {
        Row: {
          application_count: number
          application_deadline: string | null
          application_instructions: string | null
          closed_at: string | null
          compensation_range: string | null
          created_at: string
          description: string
          external_url: string | null
          firm_id: string
          id: string
          is_featured: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          locations: string[] | null
          min_gpa: number | null
          posted_by: string
          published_at: string | null
          requirements: string | null
          responsibilities: string | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["job_listing_status"]
          target_grad_years: number[] | null
          target_roles: string[] | null
          target_schools: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          application_count?: number
          application_deadline?: string | null
          application_instructions?: string | null
          closed_at?: string | null
          compensation_range?: string | null
          created_at?: string
          description: string
          external_url?: string | null
          firm_id: string
          id?: string
          is_featured?: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          locations?: string[] | null
          min_gpa?: number | null
          posted_by: string
          published_at?: string | null
          requirements?: string | null
          responsibilities?: string | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_listing_status"]
          target_grad_years?: number[] | null
          target_roles?: string[] | null
          target_schools?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          application_count?: number
          application_deadline?: string | null
          application_instructions?: string | null
          closed_at?: string | null
          compensation_range?: string | null
          created_at?: string
          description?: string
          external_url?: string | null
          firm_id?: string
          id?: string
          is_featured?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          locations?: string[] | null
          min_gpa?: number | null
          posted_by?: string
          published_at?: string | null
          requirements?: string | null
          responsibilities?: string | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_listing_status"]
          target_grad_years?: number[] | null
          target_roles?: string[] | null
          target_schools?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_preferences: {
        Row: {
          allow_messages_from_candidates: boolean
          allow_messages_from_recruiters: boolean
          allow_messages_from_schools: boolean
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_messages_from_candidates?: boolean
          allow_messages_from_recruiters?: boolean
          allow_messages_from_schools?: boolean
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_messages_from_candidates?: boolean
          allow_messages_from_recruiters?: boolean
          allow_messages_from_schools?: boolean
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      notification_log: {
        Row: {
          body: string
          clicked_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          subscription_id: string | null
          title: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          clicked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          subscription_id?: string | null
          title: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          clicked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          subscription_id?: string | null
          title?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          notify_candidate_interest: boolean | null
          notify_deadline_reminders: boolean | null
          notify_job_matches: boolean | null
          notify_messages: boolean | null
          notify_new_candidates: boolean | null
          notify_profile_views: boolean | null
          notify_saved_search_matches: boolean | null
          notify_student_placements: boolean | null
          notify_verification_requests: boolean | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notify_candidate_interest?: boolean | null
          notify_deadline_reminders?: boolean | null
          notify_job_matches?: boolean | null
          notify_messages?: boolean | null
          notify_new_candidates?: boolean | null
          notify_profile_views?: boolean | null
          notify_saved_search_matches?: boolean | null
          notify_student_placements?: boolean | null
          notify_verification_requests?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notify_candidate_interest?: boolean | null
          notify_deadline_reminders?: boolean | null
          notify_job_matches?: boolean | null
          notify_messages?: boolean | null
          notify_new_candidates?: boolean | null
          notify_profile_views?: boolean | null
          notify_saved_search_matches?: boolean | null
          notify_student_placements?: boolean | null
          notify_verification_requests?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
          referral_code: string | null
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
          referral_code?: string | null
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
          referral_code?: string | null
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
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          endpoint: string
          id: string
          last_used_at: string | null
          p256dh_key: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          endpoint: string
          id?: string
          last_used_at?: string | null
          p256dh_key: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          last_used_at?: string | null
          p256dh_key?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_campaigns: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          message_template: string
          name: string
          recruiter_profile_id: string
          saved_search_id: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          message_template: string
          name: string
          recruiter_profile_id: string
          saved_search_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          message_template?: string
          name?: string
          recruiter_profile_id?: string
          saved_search_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_campaigns_recruiter_profile_id_fkey"
            columns: ["recruiter_profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_campaigns_saved_search_id_fkey"
            columns: ["saved_search_id"]
            isOneToOne: false
            referencedRelation: "saved_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_candidate_notes: {
        Row: {
          candidate_id: string
          content: string
          created_at: string | null
          id: string
          recruiter_id: string
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          content?: string
          created_at?: string | null
          id?: string
          recruiter_id: string
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          content?: string
          created_at?: string | null
          id?: string
          recruiter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_candidate_notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_candidate_notes_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
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
          email_domain: string | null
          email_domain_matches_company: boolean | null
          firm_id: string | null
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
          verification_notes: string | null
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
          email_domain?: string | null
          email_domain_matches_company?: boolean | null
          firm_id?: string | null
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
          verification_notes?: string | null
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
          email_domain?: string | null
          email_domain_matches_company?: boolean | null
          firm_id?: string | null
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
          verification_notes?: string | null
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
            foreignKeyName: "recruiter_profiles_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
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
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          signed_up_at: string | null
          status: Database["public"]["Enums"]["referral_status"] | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          signed_up_at?: string | null
          status?: Database["public"]["Enums"]["referral_status"] | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          signed_up_at?: string | null
          status?: Database["public"]["Enums"]["referral_status"] | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_verifications: {
        Row: {
          appears_authentic: boolean | null
          candidate_profile_id: string
          confidence: number | null
          created_at: string
          error_message: string | null
          fake_indicators: Json | null
          id: string
          is_valid_resume: boolean | null
          reasoning: string | null
          resume_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appears_authentic?: boolean | null
          candidate_profile_id: string
          confidence?: number | null
          created_at?: string
          error_message?: string | null
          fake_indicators?: Json | null
          id?: string
          is_valid_resume?: boolean | null
          reasoning?: string | null
          resume_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appears_authentic?: boolean | null
          candidate_profile_id?: string
          confidence?: number | null
          created_at?: string
          error_message?: string | null
          fake_indicators?: Json | null
          id?: string
          is_valid_resume?: boolean | null
          reasoning?: string | null
          resume_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_verifications_candidate_profile_id_fkey"
            columns: ["candidate_profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_verifications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: true
            referencedRelation: "candidate_resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          name: string
          notify_new_matches: boolean | null
          recruiter_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json
          id?: string
          name: string
          notify_new_matches?: boolean | null
          recruiter_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          name?: string
          notify_new_matches?: boolean | null
          recruiter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
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
      transcript_verifications: {
        Row: {
          candidate_profile_id: string
          created_at: string | null
          entered_gpa: number | null
          error_message: string | null
          extracted_gpa: number | null
          extracted_gpa_scale: string | null
          extracted_text: string | null
          extraction_confidence: string | null
          extraction_reasoning: string | null
          gpa_difference: number | null
          gpa_match: boolean | null
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transcript_id: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_profile_id: string
          created_at?: string | null
          entered_gpa?: number | null
          error_message?: string | null
          extracted_gpa?: number | null
          extracted_gpa_scale?: string | null
          extracted_text?: string | null
          extraction_confidence?: string | null
          extraction_reasoning?: string | null
          gpa_difference?: number | null
          gpa_match?: boolean | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transcript_id?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_profile_id?: string
          created_at?: string | null
          entered_gpa?: number | null
          error_message?: string | null
          extracted_gpa?: number | null
          extracted_gpa_scale?: string | null
          extracted_text?: string | null
          extraction_confidence?: string | null
          extraction_reasoning?: string | null
          gpa_difference?: number | null
          gpa_match?: boolean | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transcript_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcript_verifications_candidate_profile_id_fkey"
            columns: ["candidate_profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcript_verifications_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: true
            referencedRelation: "candidate_transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      campaign_stats: {
        Row: {
          campaign_id: string | null
          failed_count: number | null
          name: string | null
          opened_count: number | null
          replied_count: number | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          total_recipients: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_to_job: {
        Args: {
          p_cover_letter: string
          p_job_listing_id: string
          p_resume_id?: string
        }
        Returns: string
      }
      can_user_message: {
        Args: { recipient_user_id: string; sender_user_id: string }
        Returns: boolean
      }
      check_domain_match: {
        Args: { email: string; website: string }
        Returns: boolean
      }
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
      create_capital_application: {
        Args: { p_cover_letter: string; p_outreach_approach: string }
        Returns: string
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      extract_domain: { Args: { input: string }; Returns: string }
      find_conversation_between_users: {
        Args: { user_a: string; user_b: string }
        Returns: string
      }
      generate_firm_slug: { Args: { firm_name: string }; Returns: string }
      generate_job_slug: {
        Args: { p_firm_name: string; p_title: string }
        Returns: string
      }
      generate_referral_code: { Args: never; Returns: string }
      get_referral_stats: { Args: { user_id: string }; Returns: Json }
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
      is_user_verified_for_messaging: {
        Args: { check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status:
        | "pending"
        | "reviewing"
        | "interviewed"
        | "accepted"
        | "rejected"
        | "withdrawn"
      application_target: "capital" | "firm"
      bookmark_status:
        | "new"
        | "contacted"
        | "interviewing"
        | "offer_extended"
        | "hired"
        | "passed"
        | "not_a_fit"
      candidate_status:
        | "pending_verification"
        | "verified"
        | "active"
        | "placed"
        | "rejected"
      conversation_participant_type: "candidate" | "recruiter" | "school"
      education_level: "bachelors" | "masters" | "mba" | "phd" | "professional"
      job_listing_status: "draft" | "active" | "paused" | "closed" | "filled"
      job_type: "full_time" | "internship" | "summer_analyst" | "off_cycle"
      referral_status: "pending" | "signed_up" | "verified"
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
      application_status: [
        "pending",
        "reviewing",
        "interviewed",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      application_target: ["capital", "firm"],
      bookmark_status: [
        "new",
        "contacted",
        "interviewing",
        "offer_extended",
        "hired",
        "passed",
        "not_a_fit",
      ],
      candidate_status: [
        "pending_verification",
        "verified",
        "active",
        "placed",
        "rejected",
      ],
      conversation_participant_type: ["candidate", "recruiter", "school"],
      education_level: ["bachelors", "masters", "mba", "phd", "professional"],
      job_listing_status: ["draft", "active", "paused", "closed", "filled"],
      job_type: ["full_time", "internship", "summer_analyst", "off_cycle"],
      referral_status: ["pending", "signed_up", "verified"],
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
