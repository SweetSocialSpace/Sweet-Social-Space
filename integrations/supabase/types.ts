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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          id: string
          processed_at: string | null
          reason: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      alert_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          alert_id: string | null
          created_at: string
          id: string
          snapshot: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          alert_id?: string | null
          created_at?: string
          id?: string
          snapshot?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          alert_id?: string | null
          created_at?: string
          id?: string
          snapshot?: Json
        }
        Relationships: []
      }
      alerts: {
        Row: {
          body: string
          category: string
          city: string | null
          created_at: string
          created_by: string | null
          id: string
          is_automated: boolean
          latitude: number | null
          location_label: string | null
          longitude: number | null
          severity: string
          source_label: string | null
          source_url: string | null
          state_code: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          category?: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_automated?: boolean
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          severity?: string
          source_label?: string | null
          source_url?: string | null
          state_code?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_automated?: boolean
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          severity?: string
          source_label?: string | null
          source_url?: string | null
          state_code?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bot_secrets: {
        Row: {
          name: string
          updated_at: string
          value: string
        }
        Insert: {
          name: string
          updated_at?: string
          value: string
        }
        Update: {
          name?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      bot_state: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      business_claims: {
        Row: {
          business_id: string
          claimant_id: string
          contact_email: string | null
          created_at: string
          id: string
          message: string | null
          proof_url: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          claimant_id: string
          contact_email?: string | null
          created_at?: string
          id?: string
          message?: string | null
          proof_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          claimant_id?: string
          contact_email?: string | null
          created_at?: string
          id?: string
          message?: string | null
          proof_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_claims_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_photos: {
        Row: {
          business_id: string
          caption: string | null
          created_at: string
          created_by: string | null
          id: string
          sort_order: number
          url: string
        }
        Insert: {
          business_id: string
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          sort_order?: number
          url: string
        }
        Update: {
          business_id?: string
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_photos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_promotions: {
        Row: {
          body: string | null
          business_id: string
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          business_id: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          business_id?: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_promotions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          country_code: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          hours_json: Json | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          owner_id: string
          phone: string | null
          slug: string
          state_code: string | null
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          country_code?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          hours_json?: Json | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          owner_id: string
          phone?: string | null
          slug: string
          state_code?: string | null
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          country_code?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          hours_json?: Json | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          slug?: string
          state_code?: string | null
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      comment_reports: {
        Row: {
          category: Database["public"]["Enums"]["report_category"]
          created_at: string
          details: string | null
          id: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Insert: {
          category?: Database["public"]["Enums"]["report_category"]
          created_at?: string
          details?: string | null
          id?: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Update: {
          category?: Database["public"]["Enums"]["report_category"]
          created_at?: string
          details?: string | null
          id?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target_type"]
        }
        Relationships: []
      }
      community_bot_runs: {
        Row: {
          id: string
          notes: string | null
          posts_created: number
          ran_at: string
          skipped: boolean
          zip: string
        }
        Insert: {
          id?: string
          notes?: string | null
          posts_created?: number
          ran_at?: string
          skipped?: boolean
          zip: string
        }
        Update: {
          id?: string
          notes?: string | null
          posts_created?: number
          ran_at?: string
          skipped?: boolean
          zip?: string
        }
        Relationships: []
      }
      community_update_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          update_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          update_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_update_comments_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "community_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      community_updates: {
        Row: {
          category: string
          city: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_automated: boolean
          latitude: number | null
          longitude: number | null
          source_label: string | null
          source_url: string | null
          state: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          is_automated?: boolean
          latitude?: number | null
          longitude?: number | null
          source_label?: string | null
          source_url?: string | null
          state?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_automated?: boolean
          latitude?: number | null
          longitude?: number | null
          source_label?: string | null
          source_url?: string | null
          state?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      consent_log: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          policy_version: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted: boolean
          id?: string
          policy_version: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          policy_version?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_members: {
        Row: {
          conversation_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          business_id: string
          code: string | null
          created_at: string
          description: string | null
          discount_text: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          redemption_count: number
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          business_id: string
          code?: string | null
          created_at?: string
          description?: string | null
          discount_text?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          redemption_count?: number
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          code?: string | null
          created_at?: string
          description?: string | null
          discount_text?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          redemption_count?: number
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_money_tips: {
        Row: {
          category: string
          created_at: string
          id: number
          source: string
          tip: string
          used_at: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: number
          source: string
          tip: string
          used_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: number
          source?: string
          tip?: string
          used_at?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      event_comments: {
        Row: {
          author_label: string | null
          body: string
          created_at: string
          event_id: string
          id: string
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Insert: {
          author_label?: string | null
          body: string
          created_at?: string
          event_id: string
          id?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Update: {
          author_label?: string | null
          body?: string
          created_at?: string
          event_id?: string
          id?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_media: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string
          id: string
          storage_path: string | null
          url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id: string
          id?: string
          storage_path?: string | null
          url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string
          id?: string
          storage_path?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          reminded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          reminded_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          reminded_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          business_id: string | null
          city: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          event_type: string
          hidden: boolean
          id: string
          image_url: string | null
          is_automated: boolean
          latitude: number | null
          link_url: string | null
          longitude: number | null
          organizer: string | null
          report_count: number
          source_label: string | null
          source_url: string | null
          starts_at: string | null
          state_code: string | null
          title: string
          updated_at: string
          venue_name: string | null
        }
        Insert: {
          address?: string | null
          business_id?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: string
          hidden?: boolean
          id?: string
          image_url?: string | null
          is_automated?: boolean
          latitude?: number | null
          link_url?: string | null
          longitude?: number | null
          organizer?: string | null
          report_count?: number
          source_label?: string | null
          source_url?: string | null
          starts_at?: string | null
          state_code?: string | null
          title: string
          updated_at?: string
          venue_name?: string | null
        }
        Update: {
          address?: string | null
          business_id?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: string
          hidden?: boolean
          id?: string
          image_url?: string | null
          is_automated?: boolean
          latitude?: number | null
          link_url?: string | null
          longitude?: number | null
          organizer?: string | null
          report_count?: number
          source_label?: string | null
          source_url?: string | null
          starts_at?: string | null
          state_code?: string | null
          title?: string
          updated_at?: string
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          room_name: string
          started_at: string
          status: string
          title: string
          updated_at: string
          user_id: string
          viewer_peak: number
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          room_name: string
          started_at?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          viewer_peak?: number
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          room_name?: string
          started_at?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          viewer_peak?: number
        }
        Relationships: []
      }
      marketplace_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          listing_id: string
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          listing_id: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          listing_id?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_comments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listing_photos: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string
          id: string
          listing_id: string
          sort_order: number
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by: string
          id?: string
          listing_id: string
          sort_order?: number
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string
          id?: string
          listing_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          city: string | null
          condition: string
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          price_cents: number
          seller_id: string | null
          state_code: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          city?: string | null
          condition?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          price_cents?: number
          seller_id?: string | null
          state_code?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          city?: string | null
          condition?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          price_cents?: number
          seller_id?: string | null
          state_code?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          listing_id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          listing_id: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          listing_id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_saves: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_saves_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      message_ciphertexts: {
        Row: {
          ciphertext: string
          created_at: string
          ephemeral_public_key: string
          id: string
          iv: string
          message_id: string
          recipient_id: string
        }
        Insert: {
          ciphertext: string
          created_at?: string
          ephemeral_public_key: string
          id?: string
          iv: string
          message_id: string
          recipient_id: string
        }
        Update: {
          ciphertext?: string
          created_at?: string
          ephemeral_public_key?: string
          id?: string
          iv?: string
          message_id?: string
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_ciphertexts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reports: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message_id: string
          reason: string
          reporter_id: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message_id: string
          reason: string
          reporter_id: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body?: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action: Database["public"]["Enums"]["moderation_action_type"]
          actor_id: string | null
          affected_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          notes: string | null
          reason: string | null
          target_id: string | null
          target_type: Database["public"]["Enums"]["report_target_type"] | null
        }
        Insert: {
          action: Database["public"]["Enums"]["moderation_action_type"]
          actor_id?: string | null
          affected_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          reason?: string | null
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["report_target_type"] | null
        }
        Update: {
          action?: Database["public"]["Enums"]["moderation_action_type"]
          actor_id?: string | null
          affected_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          reason?: string | null
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["report_target_type"] | null
        }
        Relationships: []
      }
      moderation_appeals: {
        Row: {
          action_id: string | null
          appellant_id: string
          created_at: string
          id: string
          message: string
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          status: string
          target_id: string | null
          target_type: Database["public"]["Enums"]["report_target_type"] | null
        }
        Insert: {
          action_id?: string | null
          appellant_id: string
          created_at?: string
          id?: string
          message: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["report_target_type"] | null
        }
        Update: {
          action_id?: string | null
          appellant_id?: string
          created_at?: string
          id?: string
          message?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["report_target_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_appeals_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "moderation_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row:
