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
      alert_events: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_id: string | null
          context: Json | null
          id: string
          message: string
          organization_id: string
          resolved_at: string | null
          severity: string
          status: string | null
          title: string
          triggered_at: string | null
          type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_id?: string | null
          context?: Json | null
          id?: string
          message: string
          organization_id: string
          resolved_at?: string | null
          severity: string
          status?: string | null
          title: string
          triggered_at?: string | null
          type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_id?: string | null
          context?: Json | null
          id?: string
          message?: string
          organization_id?: string
          resolved_at?: string | null
          severity?: string
          status?: string | null
          title?: string
          triggered_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_events_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          channels: Json
          condition: Json
          created_at: string | null
          enabled: boolean | null
          id: string
          last_triggered_at: string | null
          name: string
          organization_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          channels: Json
          condition: Json
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          name: string
          organization_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          channels?: Json
          condition?: Json
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          name?: string
          organization_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_usage_log: {
        Row: {
          api_key_id: string | null
          endpoint: string
          id: string
          organization_id: string
          request_count: number | null
          timestamp: string | null
        }
        Insert: {
          api_key_id?: string | null
          endpoint: string
          id?: string
          organization_id: string
          request_count?: number | null
          timestamp?: string | null
        }
        Update: {
          api_key_id?: string | null
          endpoint?: string
          id?: string
          organization_id?: string
          request_count?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_key_usage_log_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_key_usage_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          environment: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          revoked_at: string | null
          scopes: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          revoked_at?: string | null
          scopes?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          revoked_at?: string | null
          scopes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          alert_thresholds: number[] | null
          amount: number
          created_at: string | null
          currency: string | null
          current_spend: number | null
          hard_limit: boolean | null
          id: string
          name: string
          organization_id: string
          period: string
          scope_id: string | null
          scope_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          alert_thresholds?: number[] | null
          amount: number
          created_at?: string | null
          currency?: string | null
          current_spend?: number | null
          hard_limit?: boolean | null
          id?: string
          name: string
          organization_id: string
          period: string
          scope_id?: string | null
          scope_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_thresholds?: number[] | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          current_spend?: number | null
          hard_limit?: boolean | null
          id?: string
          name?: string
          organization_id?: string
          period?: string
          scope_id?: string | null
          scope_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_allocations: {
        Row: {
          cost_center_id: string
          created_at: string | null
          id: string
          percentage: number
          project_id: string | null
          team_id: string | null
        }
        Insert: {
          cost_center_id: string
          created_at?: string | null
          id?: string
          percentage: number
          project_id?: string | null
          team_id?: string | null
        }
        Update: {
          cost_center_id?: string
          created_at?: string | null
          id?: string
          percentage?: number
          project_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_allocations_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_allocations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          monthly_budget: number | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_budget?: number | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_budget?: number | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      model_pricing: {
        Row: {
          cached_price_per_1m: number | null
          capabilities: string[] | null
          context_window: number | null
          display_name: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          input_price_per_1m: number
          is_active: boolean | null
          model: string
          output_price_per_1m: number
          provider: string
        }
        Insert: {
          cached_price_per_1m?: number | null
          capabilities?: string[] | null
          context_window?: number | null
          display_name?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          input_price_per_1m: number
          is_active?: boolean | null
          model: string
          output_price_per_1m: number
          provider: string
        }
        Update: {
          cached_price_per_1m?: number | null
          capabilities?: string[] | null
          context_window?: number | null
          display_name?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          input_price_per_1m?: number
          is_active?: boolean | null
          model?: string
          output_price_per_1m?: number
          provider?: string
        }
        Relationships: []
      }
      monthly_spend_cache: {
        Row: {
          cost_center_id: string | null
          id: string
          organization_id: string
          project_id: string | null
          team_id: string | null
          total_cost: number | null
          total_requests: number | null
          total_tokens: number | null
          updated_at: string | null
          year_month: string
        }
        Insert: {
          cost_center_id?: string | null
          id?: string
          organization_id: string
          project_id?: string | null
          team_id?: string | null
          total_cost?: number | null
          total_requests?: number | null
          total_tokens?: number | null
          updated_at?: string | null
          year_month: string
        }
        Update: {
          cost_center_id?: string | null
          id?: string
          organization_id?: string
          project_id?: string | null
          team_id?: string | null
          total_cost?: number | null
          total_requests?: number | null
          total_tokens?: number | null
          updated_at?: string | null
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_spend_cache_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_spend_cache_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_spend_cache_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_spend_cache_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_channels: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          is_verified: boolean | null
          name: string
          organization_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          name: string
          organization_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          name?: string
          organization_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_actions: {
        Row: {
          action_type: string
          actual_savings: number | null
          after_state: Json | null
          applied_at: string | null
          applied_by: string | null
          before_state: Json | null
          id: string
          organization_id: string
          recommendation_id: string | null
        }
        Insert: {
          action_type: string
          actual_savings?: number | null
          after_state?: Json | null
          applied_at?: string | null
          applied_by?: string | null
          before_state?: Json | null
          id?: string
          organization_id: string
          recommendation_id?: string | null
        }
        Update: {
          action_type?: string
          actual_savings?: number | null
          after_state?: Json | null
          applied_at?: string | null
          applied_by?: string | null
          before_state?: Json | null
          id?: string
          organization_id?: string
          recommendation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "optimization_actions_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "optimization_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "optimization_actions_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string | null
          id: string
          name: string
          plan: string | null
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          api_key_patterns: string[] | null
          created_at: string | null
          description: string | null
          id: string
          monthly_budget: number | null
          name: string
          organization_id: string
          status: string | null
          tags: string[] | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          api_key_patterns?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_budget?: number | null
          name: string
          organization_id: string
          status?: string | null
          tags?: string[] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key_patterns?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_budget?: number | null
          name?: string
          organization_id?: string
          status?: string | null
          tags?: string[] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_connections: {
        Row: {
          config: Json | null
          created_at: string | null
          credentials: Json
          id: string
          last_sync_at: string | null
          name: string | null
          organization_id: string
          provider: string
          status: string | null
          sync_error: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          credentials: Json
          id?: string
          last_sync_at?: string | null
          name?: string | null
          organization_id: string
          provider: string
          status?: string | null
          sync_error?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          credentials?: Json
          id?: string
          last_sync_at?: string | null
          name?: string | null
          organization_id?: string
          provider?: string
          status?: string | null
          sync_error?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          created_at: string | null
          description: string
          details: Json
          dismissed_at: string | null
          dismissed_by: string | null
          expires_at: string | null
          id: string
          impact: Json
          organization_id: string
          status: string | null
          title: string
          type: string
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          created_at?: string | null
          description: string
          details: Json
          dismissed_at?: string | null
          dismissed_by?: string | null
          expires_at?: string | null
          id?: string
          impact: Json
          organization_id: string
          status?: string | null
          title: string
          type: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          created_at?: string | null
          description?: string
          details?: Json
          dismissed_at?: string | null
          dismissed_by?: string | null
          expires_at?: string | null
          id?: string
          impact?: Json
          organization_id?: string
          status?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_dismissed_by_fkey"
            columns: ["dismissed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          completed_at: string | null
          config: Json
          created_at: string | null
          created_by: string | null
          download_url: string | null
          file_size: number | null
          id: string
          name: string
          organization_id: string
          status: string | null
          type: string
        }
        Insert: {
          completed_at?: string | null
          config: Json
          created_at?: string | null
          created_by?: string | null
          download_url?: string | null
          file_size?: number | null
          id?: string
          name: string
          organization_id: string
          status?: string | null
          type: string
        }
        Update: {
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          download_url?: string | null
          file_size?: number | null
          id?: string
          name?: string
          organization_id?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          enabled: boolean | null
          frequency: string
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string
          organization_id: string
          recipients: string[]
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          frequency: string
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at: string
          organization_id: string
          recipients: string[]
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          frequency?: string
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string
          organization_id?: string
          recipients?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          api_key_patterns: string[] | null
          created_at: string | null
          description: string | null
          id: string
          monthly_budget: number | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          api_key_patterns?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_budget?: number | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          api_key_patterns?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_budget?: number | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          api_key_id: string | null
          cached_tokens: number | null
          cost: number
          cost_center_id: string | null
          created_at: string | null
          currency: string | null
          endpoint: string | null
          error_code: string | null
          feature_tag: string | null
          id: string
          input_tokens: number
          latency_ms: number | null
          metadata: Json | null
          model: string
          organization_id: string
          output_tokens: number
          project_id: string | null
          provider: string
          request_id: string | null
          status: string | null
          team_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          cached_tokens?: number | null
          cost: number
          cost_center_id?: string | null
          created_at?: string | null
          currency?: string | null
          endpoint?: string | null
          error_code?: string | null
          feature_tag?: string | null
          id?: string
          input_tokens?: number
          latency_ms?: number | null
          metadata?: Json | null
          model: string
          organization_id: string
          output_tokens?: number
          project_id?: string | null
          provider: string
          request_id?: string | null
          status?: string | null
          team_id?: string | null
          timestamp: string
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          cached_tokens?: number | null
          cost?: number
          cost_center_id?: string | null
          created_at?: string | null
          currency?: string | null
          endpoint?: string | null
          error_code?: string | null
          feature_tag?: string | null
          id?: string
          input_tokens?: number
          latency_ms?: number | null
          metadata?: Json | null
          model?: string
          organization_id?: string
          output_tokens?: number
          project_id?: string | null
          provider?: string
          request_id?: string | null
          status?: string | null
          team_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          name: string | null
          password_hash: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          name?: string | null
          password_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          name?: string | null
          password_hash?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
