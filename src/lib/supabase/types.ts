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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alert_actions: {
        Row: {
          action: string
          alert_id: string
          created_at: string | null
          details: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          alert_id: string
          created_at?: string | null
          details?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          alert_id?: string
          created_at?: string | null
          details?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_actions_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "triggered_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
            referencedRelation: "alert_rules"
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
      alert_rules: {
        Row: {
          active_days: number[] | null
          active_hours: Json | null
          channels: Json
          condition: Json
          config: Json | null
          cooldown_minutes: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean | null
          id: string
          last_triggered_at: string | null
          max_alerts_per_hour: number | null
          name: string
          organization_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active_days?: number[] | null
          active_hours?: Json | null
          channels: Json
          condition: Json
          config?: Json | null
          cooldown_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          max_alerts_per_hour?: number | null
          name: string
          organization_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          active_days?: number[] | null
          active_hours?: Json | null
          channels?: Json
          condition?: Json
          config?: Json | null
          cooldown_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          max_alerts_per_hour?: number | null
          name?: string
          organization_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      billing_settings: {
        Row: {
          ai_spend_limit: number | null
          auto_charge: boolean | null
          billing_address: Json | null
          billing_email: string | null
          billing_name: string | null
          created_at: string | null
          default_payment_method_id: string | null
          id: string
          invoice_due_days: number | null
          invoice_prefix: string | null
          minimum_monthly_fee: number | null
          org_id: string
          plan: string
          plan_expires_at: string | null
          plan_started_at: string | null
          providers_limit: number | null
          seats_limit: number | null
          stripe_customer_id: string | null
          tax_id: string | null
          tax_id_type: string | null
          trial_ends_at: string | null
          updated_at: string | null
          usage_based_pricing: boolean | null
          usage_rate_percent: number | null
        }
        Insert: {
          ai_spend_limit?: number | null
          auto_charge?: boolean | null
          billing_address?: Json | null
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string | null
          default_payment_method_id?: string | null
          id?: string
          invoice_due_days?: number | null
          invoice_prefix?: string | null
          minimum_monthly_fee?: number | null
          org_id: string
          plan?: string
          plan_expires_at?: string | null
          plan_started_at?: string | null
          providers_limit?: number | null
          seats_limit?: number | null
          stripe_customer_id?: string | null
          tax_id?: string | null
          tax_id_type?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          usage_based_pricing?: boolean | null
          usage_rate_percent?: number | null
        }
        Update: {
          ai_spend_limit?: number | null
          auto_charge?: boolean | null
          billing_address?: Json | null
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string | null
          default_payment_method_id?: string | null
          id?: string
          invoice_due_days?: number | null
          invoice_prefix?: string | null
          minimum_monthly_fee?: number | null
          org_id?: string
          plan?: string
          plan_expires_at?: string | null
          plan_started_at?: string | null
          providers_limit?: number | null
          seats_limit?: number | null
          stripe_customer_id?: string | null
          tax_id?: string | null
          tax_id_type?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          usage_based_pricing?: boolean | null
          usage_rate_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_adjustments: {
        Row: {
          adjustment_type: string
          amount: number
          approved_at: string | null
          approved_by: string | null
          budget_id: string
          budget_period_id: string | null
          created_at: string | null
          created_by: string
          id: string
          reason: string
          related_budget_id: string | null
          requires_approval: boolean | null
        }
        Insert: {
          adjustment_type: string
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          budget_id: string
          budget_period_id?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          reason: string
          related_budget_id?: string | null
          requires_approval?: boolean | null
        }
        Update: {
          adjustment_type?: string
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          budget_id?: string
          budget_period_id?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          reason?: string
          related_budget_id?: string | null
          requires_approval?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_adjustments_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_adjustments_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_adjustments_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_adjustments_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["period_id"]
          },
          {
            foreignKeyName: "budget_adjustments_related_budget_id_fkey"
            columns: ["related_budget_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_adjustments_related_budget_id_fkey"
            columns: ["related_budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_allocations: {
        Row: {
          allocation_type: string | null
          allocation_value: number
          child_budget_id: string
          created_at: string | null
          id: string
          max_amount: number | null
          min_amount: number | null
          parent_budget_id: string
          updated_at: string | null
        }
        Insert: {
          allocation_type?: string | null
          allocation_value: number
          child_budget_id: string
          created_at?: string | null
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          parent_budget_id: string
          updated_at?: string | null
        }
        Update: {
          allocation_type?: string | null
          allocation_value?: number
          child_budget_id?: string
          created_at?: string | null
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          parent_budget_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_allocations_child_budget_id_fkey"
            columns: ["child_budget_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_allocations_child_budget_id_fkey"
            columns: ["child_budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_allocations_parent_budget_id_fkey"
            columns: ["parent_budget_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_allocations_parent_budget_id_fkey"
            columns: ["parent_budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_consumption: {
        Row: {
          amount: number
          budget_period_id: string
          id: string
          recorded_at: string | null
          running_total: number
          usage_record_id: string | null
        }
        Insert: {
          amount: number
          budget_period_id: string
          id?: string
          recorded_at?: string | null
          running_total: number
          usage_record_id?: string | null
        }
        Update: {
          amount?: number
          budget_period_id?: string
          id?: string
          recorded_at?: string | null
          running_total?: number
          usage_record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_consumption_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_consumption_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["period_id"]
          },
        ]
      }
      budget_periods: {
        Row: {
          adjusted_amount: number | null
          allocated_amount: number
          budget_id: string
          created_at: string | null
          days_until_exhaustion: number | null
          forecasted_end_date: string | null
          forecasted_spend: number | null
          id: string
          last_calculated_at: string | null
          period_end: string
          period_start: string
          rollover_amount: number | null
          spent_amount: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          adjusted_amount?: number | null
          allocated_amount: number
          budget_id: string
          created_at?: string | null
          days_until_exhaustion?: number | null
          forecasted_end_date?: string | null
          forecasted_spend?: number | null
          id?: string
          last_calculated_at?: string | null
          period_end: string
          period_start: string
          rollover_amount?: number | null
          spent_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          adjusted_amount?: number | null
          allocated_amount?: number
          budget_id?: string
          created_at?: string | null
          days_until_exhaustion?: number | null
          forecasted_end_date?: string | null
          forecasted_spend?: number | null
          id?: string
          last_calculated_at?: string | null
          period_end?: string
          period_start?: string
          rollover_amount?: number | null
          spent_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_periods_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_periods_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_thresholds: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          action: string | null
          alert_channels: Json | null
          alert_enabled: boolean | null
          budget_id: string
          created_at: string | null
          id: string
          percentage: number
          triggered_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action?: string | null
          alert_channels?: Json | null
          alert_enabled?: boolean | null
          budget_id: string
          created_at?: string | null
          id?: string
          percentage: number
          triggered_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action?: string | null
          alert_channels?: Json | null
          alert_enabled?: boolean | null
          budget_id?: string
          created_at?: string | null
          id?: string
          percentage?: number
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_thresholds_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_thresholds_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          alert_thresholds: number[] | null
          amount: number
          api_key_id: string | null
          cost_center_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          current_spend: number | null
          description: string | null
          hard_limit: boolean | null
          id: string
          metadata: Json | null
          mode: string | null
          model: string | null
          name: string
          organization_id: string
          period: string
          period_end: string | null
          period_start: string | null
          project_id: string | null
          provider: string | null
          rollover_cap: number | null
          rollover_enabled: boolean | null
          rollover_percentage: number | null
          scope_id: string | null
          status: string | null
          tags: Json | null
          team_id: string | null
          throttle_percentage: number | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_thresholds?: number[] | null
          amount: number
          api_key_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_spend?: number | null
          description?: string | null
          hard_limit?: boolean | null
          id?: string
          metadata?: Json | null
          mode?: string | null
          model?: string | null
          name: string
          organization_id: string
          period: string
          period_end?: string | null
          period_start?: string | null
          project_id?: string | null
          provider?: string | null
          rollover_cap?: number | null
          rollover_enabled?: boolean | null
          rollover_percentage?: number | null
          scope_id?: string | null
          status?: string | null
          tags?: Json | null
          team_id?: string | null
          throttle_percentage?: number | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_thresholds?: number[] | null
          amount?: number
          api_key_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_spend?: number | null
          description?: string | null
          hard_limit?: boolean | null
          id?: string
          metadata?: Json | null
          mode?: string | null
          model?: string | null
          name?: string
          organization_id?: string
          period?: string
          period_end?: string | null
          period_start?: string | null
          project_id?: string | null
          provider?: string | null
          rollover_cap?: number | null
          rollover_enabled?: boolean | null
          rollover_percentage?: number | null
          scope_id?: string | null
          status?: string | null
          tags?: Json | null
          team_id?: string | null
          throttle_percentage?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      chargeback_configurations: {
        Row: {
          allocation_basis: string
          allocation_rules: Json | null
          approvers: string[] | null
          auto_distribute: boolean | null
          created_at: string | null
          currency: string | null
          distribution_list: Json | null
          id: string
          include_breakdown_by: Json | null
          is_active: boolean | null
          name: string
          organization_id: string
          report_frequency: string | null
          requires_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          allocation_basis: string
          allocation_rules?: Json | null
          approvers?: string[] | null
          auto_distribute?: boolean | null
          created_at?: string | null
          currency?: string | null
          distribution_list?: Json | null
          id?: string
          include_breakdown_by?: Json | null
          is_active?: boolean | null
          name: string
          organization_id: string
          report_frequency?: string | null
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allocation_basis?: string
          allocation_rules?: Json | null
          approvers?: string[] | null
          auto_distribute?: boolean | null
          created_at?: string | null
          currency?: string | null
          distribution_list?: Json | null
          id?: string
          include_breakdown_by?: Json | null
          is_active?: boolean | null
          name?: string
          organization_id?: string
          report_frequency?: string | null
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chargeback_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      chargeback_records: {
        Row: {
          allocated_cost: number
          allocations: Json
          approved_at: string | null
          approved_by: string | null
          config_id: string
          created_at: string | null
          id: string
          organization_id: string
          period_end: string
          period_start: string
          rejection_reason: string | null
          report_id: string | null
          status: string | null
          total_cost: number
          unallocated_cost: number
        }
        Insert: {
          allocated_cost: number
          allocations: Json
          approved_at?: string | null
          approved_by?: string | null
          config_id: string
          created_at?: string | null
          id?: string
          organization_id: string
          period_end: string
          period_start: string
          rejection_reason?: string | null
          report_id?: string | null
          status?: string | null
          total_cost: number
          unallocated_cost: number
        }
        Update: {
          allocated_cost?: number
          allocations?: Json
          approved_at?: string | null
          approved_by?: string | null
          config_id?: string
          created_at?: string | null
          id?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          rejection_reason?: string | null
          report_id?: string | null
          status?: string | null
          total_cost?: number
          unallocated_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "chargeback_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chargeback_records_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "chargeback_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chargeback_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chargeback_records_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "generated_reports"
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
            referencedRelation: "project_summary"
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
            referencedRelation: "team_summary"
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
      cost_center_allocations: {
        Row: {
          allocation_percentage: number | null
          cost_center_id: string
          created_at: string | null
          effective_from: string | null
          effective_until: string | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          allocation_percentage?: number | null
          cost_center_id: string
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          allocation_percentage?: number | null
          cost_center_id?: string
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_center_allocations_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          department_code: string | null
          description: string | null
          gl_account: string | null
          id: string
          manager_id: string | null
          metadata: Json | null
          monthly_budget: number | null
          name: string
          org_id: string | null
          organization_id: string
          parent_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          department_code?: string | null
          description?: string | null
          gl_account?: string | null
          id?: string
          manager_id?: string | null
          metadata?: Json | null
          monthly_budget?: number | null
          name: string
          org_id?: string | null
          organization_id: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          department_code?: string | null
          description?: string | null
          gl_account?: string | null
          id?: string
          manager_id?: string | null
          metadata?: Json | null
          monthly_budget?: number | null
          name?: string
          org_id?: string | null
          organization_id?: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_digest_preferences: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          digest_time: string | null
          frequency: string
          id: string
          include_anomalies: boolean | null
          include_forecast: boolean | null
          include_recommendations: boolean | null
          include_summary: boolean | null
          include_team_breakdown: boolean | null
          is_active: boolean | null
          last_sent_at: string | null
          organization_id: string
          project_filter: string[] | null
          team_filter: string[] | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          digest_time?: string | null
          frequency?: string
          id?: string
          include_anomalies?: boolean | null
          include_forecast?: boolean | null
          include_recommendations?: boolean | null
          include_summary?: boolean | null
          include_team_breakdown?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          organization_id: string
          project_filter?: string[] | null
          team_filter?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          digest_time?: string | null
          frequency?: string
          id?: string
          include_anomalies?: boolean | null
          include_forecast?: boolean | null
          include_recommendations?: boolean | null
          include_summary?: boolean | null
          include_team_breakdown?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          organization_id?: string
          project_filter?: string[] | null
          team_filter?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_digest_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_digest_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          created_at: string | null
          email_log_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          resend_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_log_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          resend_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_log_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          resend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_email_log_id_fkey"
            columns: ["email_log_id"]
            isOneToOne: false
            referencedRelation: "email_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          bounced_at: string | null
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          email: string
          email_type: string
          error_message: string | null
          from_address: string
          id: string
          opened_at: string | null
          organization_id: string | null
          queued_at: string | null
          resend_id: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_data: Json | null
          user_id: string | null
        }
        Insert: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email: string
          email_type: string
          error_message?: string | null
          from_address: string
          id?: string
          opened_at?: string | null
          organization_id?: string | null
          queued_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_data?: Json | null
          user_id?: string | null
        }
        Update: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email?: string
          email_type?: string
          error_message?: string | null
          from_address?: string
          id?: string
          opened_at?: string | null
          organization_id?: string | null
          queued_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_preferences: {
        Row: {
          alert_emails: boolean | null
          billing_emails: boolean | null
          created_at: string | null
          email: string
          id: string
          monthly_report: boolean | null
          onboarding_emails: boolean | null
          report_emails: boolean | null
          security_emails: boolean | null
          team_emails: boolean | null
          unsubscribed_at: string | null
          unsubscribed_from_all: boolean | null
          updated_at: string | null
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          alert_emails?: boolean | null
          billing_emails?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          monthly_report?: boolean | null
          onboarding_emails?: boolean | null
          report_emails?: boolean | null
          security_emails?: boolean | null
          team_emails?: boolean | null
          unsubscribed_at?: string | null
          unsubscribed_from_all?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          alert_emails?: boolean | null
          billing_emails?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          monthly_report?: boolean | null
          onboarding_emails?: boolean | null
          report_emails?: boolean | null
          security_emails?: boolean | null
          team_emails?: boolean | null
          unsubscribed_at?: string | null
          unsubscribed_from_all?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          enabled: boolean | null
          expires_at: string | null
          id: string
          key: string
          name: string
          rollout_percentage: number | null
          scope: string
          starts_at: string | null
          tags: Json | null
          target_id: string | null
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          expires_at?: string | null
          id?: string
          key: string
          name: string
          rollout_percentage?: number | null
          scope?: string
          starts_at?: string | null
          tags?: Json | null
          target_id?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          expires_at?: string | null
          id?: string
          key?: string
          name?: string
          rollout_percentage?: number | null
          scope?: string
          starts_at?: string | null
          tags?: Json | null
          target_id?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      feature_unlocks: {
        Row: {
          celebrated: boolean | null
          feature_id: string
          id: string
          unlock_trigger: string | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          celebrated?: boolean | null
          feature_id: string
          id?: string
          unlock_trigger?: string | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          celebrated?: boolean | null
          feature_id?: string
          id?: string
          unlock_trigger?: string | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      generated_reports: {
        Row: {
          created_at: string | null
          date_range_end: string
          date_range_start: string
          distributed_at: string | null
          distribution_status: Json | null
          download_count: number | null
          download_expires_at: string | null
          download_url: string | null
          error_message: string | null
          expires_at: string | null
          file_path: string | null
          file_size: number | null
          filters: Json | null
          format: string
          generated_by: string | null
          generation_time_ms: number | null
          id: string
          name: string
          organization_id: string
          page_count: number | null
          scheduled_report_id: string | null
          status: string
          summary_data: Json | null
          template_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          date_range_end: string
          date_range_start: string
          distributed_at?: string | null
          distribution_status?: Json | null
          download_count?: number | null
          download_expires_at?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          filters?: Json | null
          format?: string
          generated_by?: string | null
          generation_time_ms?: number | null
          id?: string
          name: string
          organization_id: string
          page_count?: number | null
          scheduled_report_id?: string | null
          status?: string
          summary_data?: Json | null
          template_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          date_range_end?: string
          date_range_start?: string
          distributed_at?: string | null
          distribution_status?: Json | null
          download_count?: number | null
          download_expires_at?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          filters?: Json | null
          format?: string
          generated_by?: string | null
          generation_time_ms?: number | null
          id?: string
          name?: string
          organization_id?: string
          page_count?: number | null
          scheduled_report_id?: string | null
          status?: string
          summary_data?: Json | null
          template_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_scheduled_report_id_fkey"
            columns: ["scheduled_report_id"]
            isOneToOne: false
            referencedRelation: "scheduled_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          config: Json
          config_encrypted: string | null
          connected_at: string | null
          connected_by: string | null
          created_at: string | null
          enabled: boolean | null
          error_message: string | null
          id: string
          integration_type: string
          last_used_at: string | null
          name: string
          org_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json
          config_encrypted?: string | null
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string | null
          enabled?: boolean | null
          error_message?: string | null
          id?: string
          integration_type: string
          last_used_at?: string | null
          name: string
          org_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json
          config_encrypted?: string | null
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string | null
          enabled?: boolean | null
          error_message?: string | null
          id?: string
          integration_type?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_settings_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_settings_org_id_fkey"
            columns: ["org_id"]
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
            referencedRelation: "project_summary"
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
            referencedRelation: "team_summary"
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
      notification_delivery_log: {
        Row: {
          attempt_count: number | null
          channel: string
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          next_retry_at: string | null
          notification_id: string
          opened_at: string | null
          provider_message_id: string | null
          provider_response: Json | null
          status: string
        }
        Insert: {
          attempt_count?: number | null
          channel: string
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          next_retry_at?: string | null
          notification_id: string
          opened_at?: string | null
          provider_message_id?: string | null
          provider_response?: Json | null
          status?: string
        }
        Update: {
          attempt_count?: number | null
          channel?: string
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          next_retry_at?: string | null
          notification_id?: string
          opened_at?: string | null
          provider_message_id?: string | null
          provider_response?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_mutes: {
        Row: {
          created_at: string | null
          id: string
          mute_type: string
          muted_until: string | null
          org_id: string
          reason: string | null
          target_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mute_type: string
          muted_until?: string | null
          org_id: string
          reason?: string | null
          target_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mute_type?: string
          muted_until?: string | null
          org_id?: string
          reason?: string | null
          target_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_mutes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category_preferences: Json | null
          created_at: string | null
          dnd_enabled: boolean | null
          dnd_end_time: string | null
          dnd_override_urgent: boolean | null
          dnd_start_time: string | null
          dnd_timezone: string | null
          email_address: string | null
          email_digest_day: number | null
          email_digest_time: string | null
          email_enabled: boolean | null
          email_frequency: string | null
          id: string
          in_app_desktop_notifications: boolean | null
          in_app_enabled: boolean | null
          in_app_sound: boolean | null
          max_emails_per_day: number | null
          max_notifications_per_hour: number | null
          notifications_enabled: boolean | null
          org_id: string
          push_enabled: boolean | null
          push_subscription: Json | null
          slack_dm_enabled: boolean | null
          slack_enabled: boolean | null
          slack_user_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_preferences?: Json | null
          created_at?: string | null
          dnd_enabled?: boolean | null
          dnd_end_time?: string | null
          dnd_override_urgent?: boolean | null
          dnd_start_time?: string | null
          dnd_timezone?: string | null
          email_address?: string | null
          email_digest_day?: number | null
          email_digest_time?: string | null
          email_enabled?: boolean | null
          email_frequency?: string | null
          id?: string
          in_app_desktop_notifications?: boolean | null
          in_app_enabled?: boolean | null
          in_app_sound?: boolean | null
          max_emails_per_day?: number | null
          max_notifications_per_hour?: number | null
          notifications_enabled?: boolean | null
          org_id: string
          push_enabled?: boolean | null
          push_subscription?: Json | null
          slack_dm_enabled?: boolean | null
          slack_enabled?: boolean | null
          slack_user_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_preferences?: Json | null
          created_at?: string | null
          dnd_enabled?: boolean | null
          dnd_end_time?: string | null
          dnd_override_urgent?: boolean | null
          dnd_start_time?: string | null
          dnd_timezone?: string | null
          email_address?: string | null
          email_digest_day?: number | null
          email_digest_time?: string | null
          email_enabled?: boolean | null
          email_frequency?: string | null
          id?: string
          in_app_desktop_notifications?: boolean | null
          in_app_enabled?: boolean | null
          in_app_sound?: boolean | null
          max_emails_per_day?: number | null
          max_notifications_per_hour?: number | null
          notifications_enabled?: boolean | null
          org_id?: string
          push_enabled?: boolean | null
          push_subscription?: Json | null
          slack_dm_enabled?: boolean | null
          slack_enabled?: boolean | null
          slack_user_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_subscriptions: {
        Row: {
          channels: string[] | null
          created_at: string | null
          enabled: boolean | null
          id: string
          min_severity: string | null
          org_id: string
          subscription_type: string
          target_id: string
          user_id: string
        }
        Insert: {
          channels?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          min_severity?: string | null
          org_id: string
          subscription_type: string
          target_id: string
          user_id: string
        }
        Update: {
          channels?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          min_severity?: string | null
          org_id?: string
          subscription_type?: string
          target_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body_html_template: string | null
          body_template: string
          category: string
          created_at: string | null
          default_color: string | null
          default_icon: string | null
          default_primary_action_label: string | null
          default_primary_action_url_template: string | null
          default_priority: string
          default_secondary_action_label: string | null
          default_secondary_action_url_template: string | null
          description: string | null
          enabled: boolean | null
          id: string
          is_system: boolean | null
          key: string
          name: string
          org_id: string | null
          title_template: string
          updated_at: string | null
        }
        Insert: {
          body_html_template?: string | null
          body_template: string
          category: string
          created_at?: string | null
          default_color?: string | null
          default_icon?: string | null
          default_primary_action_label?: string | null
          default_primary_action_url_template?: string | null
          default_priority?: string
          default_secondary_action_label?: string | null
          default_secondary_action_url_template?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          is_system?: boolean | null
          key: string
          name: string
          org_id?: string | null
          title_template: string
          updated_at?: string | null
        }
        Update: {
          body_html_template?: string | null
          body_template?: string
          category?: string
          created_at?: string | null
          default_color?: string | null
          default_icon?: string | null
          default_primary_action_label?: string | null
          default_primary_action_url_template?: string | null
          default_priority?: string
          default_secondary_action_label?: string | null
          default_secondary_action_url_template?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          is_system?: boolean | null
          key?: string
          name?: string
          org_id?: string | null
          title_template?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          archived_at: string | null
          body: string
          body_html: string | null
          category: string
          color: string | null
          created_at: string | null
          dedup_key: string | null
          delivery_status: Json | null
          dismissed_at: string | null
          expires_at: string | null
          icon: string | null
          id: string
          metadata: Json | null
          org_id: string
          primary_action_label: string | null
          primary_action_url: string | null
          priority: string
          read_at: string | null
          recipient_id: string
          recipient_type: string
          secondary_action_label: string | null
          secondary_action_url: string | null
          source_id: string | null
          source_type: string
          subcategory: string | null
          title: string
        }
        Insert: {
          archived_at?: string | null
          body: string
          body_html?: string | null
          category: string
          color?: string | null
          created_at?: string | null
          dedup_key?: string | null
          delivery_status?: Json | null
          dismissed_at?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          org_id: string
          primary_action_label?: string | null
          primary_action_url?: string | null
          priority?: string
          read_at?: string | null
          recipient_id: string
          recipient_type: string
          secondary_action_label?: string | null
          secondary_action_url?: string | null
          source_id?: string | null
          source_type: string
          subcategory?: string | null
          title: string
        }
        Update: {
          archived_at?: string | null
          body?: string
          body_html?: string | null
          category?: string
          color?: string | null
          created_at?: string | null
          dedup_key?: string | null
          delivery_status?: Json | null
          dismissed_at?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          org_id?: string
          primary_action_label?: string | null
          primary_action_url?: string | null
          priority?: string
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
          secondary_action_label?: string | null
          secondary_action_url?: string | null
          source_id?: string | null
          source_type?: string
          subcategory?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_invitations: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_at: string | null
          inviter_id: string
          organization_id: string
          role: string | null
          sent_at: string | null
          status: string | null
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          inviter_id: string
          organization_id: string
          role?: string | null
          sent_at?: string | null
          status?: string | null
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          inviter_id?: string
          organization_id?: string
          role?: string | null
          sent_at?: string | null
          status?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_profiles: {
        Row: {
          ai_providers: string[] | null
          company_name: string | null
          company_size: string | null
          company_website: string | null
          completed_at: string | null
          created_at: string | null
          goals: string[] | null
          id: string
          industry: string | null
          monthly_ai_spend: string | null
          onboarding_completed_at: string | null
          onboarding_metadata: Json | null
          onboarding_skipped_steps: string[] | null
          onboarding_status: string | null
          onboarding_step: string | null
          organization_id: string | null
          profile_completed: boolean | null
          recommended_path: string | null
          skipped_steps: string[] | null
          updated_at: string | null
          use_cases: string[] | null
          user_id: string
          user_role: string | null
          user_segment: string | null
        }
        Insert: {
          ai_providers?: string[] | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          created_at?: string | null
          goals?: string[] | null
          id?: string
          industry?: string | null
          monthly_ai_spend?: string | null
          onboarding_completed_at?: string | null
          onboarding_metadata?: Json | null
          onboarding_skipped_steps?: string[] | null
          onboarding_status?: string | null
          onboarding_step?: string | null
          organization_id?: string | null
          profile_completed?: boolean | null
          recommended_path?: string | null
          skipped_steps?: string[] | null
          updated_at?: string | null
          use_cases?: string[] | null
          user_id: string
          user_role?: string | null
          user_segment?: string | null
        }
        Update: {
          ai_providers?: string[] | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          created_at?: string | null
          goals?: string[] | null
          id?: string
          industry?: string | null
          monthly_ai_spend?: string | null
          onboarding_completed_at?: string | null
          onboarding_metadata?: Json | null
          onboarding_skipped_steps?: string[] | null
          onboarding_status?: string | null
          onboarding_step?: string | null
          organization_id?: string | null
          profile_completed?: boolean | null
          recommended_path?: string | null
          skipped_steps?: string[] | null
          updated_at?: string | null
          use_cases?: string[] | null
          user_id?: string
          user_role?: string | null
          user_segment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_profiles_organization_id_fkey"
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
      optimization_metrics: {
        Row: {
          cache_hit: boolean | null
          estimated_savings: number | null
          id: string
          latency_overhead_ms: number | null
          optimizations_applied: string[] | null
          organization_id: string
          original_model: string
          routing_rule_id: string | null
          selected_model: string
          task_type: string | null
          timestamp: string | null
        }
        Insert: {
          cache_hit?: boolean | null
          estimated_savings?: number | null
          id?: string
          latency_overhead_ms?: number | null
          optimizations_applied?: string[] | null
          organization_id: string
          original_model: string
          routing_rule_id?: string | null
          selected_model: string
          task_type?: string | null
          timestamp?: string | null
        }
        Update: {
          cache_hit?: boolean | null
          estimated_savings?: number | null
          id?: string
          latency_overhead_ms?: number | null
          optimizations_applied?: string[] | null
          organization_id?: string
          original_model?: string
          routing_rule_id?: string | null
          selected_model?: string
          task_type?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "optimization_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "optimization_metrics_routing_rule_id_fkey"
            columns: ["routing_rule_id"]
            isOneToOne: false
            referencedRelation: "routing_rules"
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
      organization_settings: {
        Row: {
          allowed_ip_ranges: Json | null
          audit_log_retention_days: number | null
          created_at: string | null
          currency: string | null
          date_format: string | null
          default_alert_channels: Json | null
          default_budget_period: string | null
          default_cost_center_id: string | null
          display_name: string | null
          features_enabled: Json | null
          fiscal_year_start: number | null
          id: string
          locale: string | null
          locked_settings: Json | null
          logo_url: string | null
          org_id: string
          password_expire_days: number | null
          password_min_length: number | null
          password_require_numbers: boolean | null
          password_require_special: boolean | null
          require_2fa: boolean | null
          session_timeout_minutes: number | null
          timezone: string | null
          updated_at: string | null
          usage_data_retention_days: number | null
        }
        Insert: {
          allowed_ip_ranges?: Json | null
          audit_log_retention_days?: number | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          default_alert_channels?: Json | null
          default_budget_period?: string | null
          default_cost_center_id?: string | null
          display_name?: string | null
          features_enabled?: Json | null
          fiscal_year_start?: number | null
          id?: string
          locale?: string | null
          locked_settings?: Json | null
          logo_url?: string | null
          org_id: string
          password_expire_days?: number | null
          password_min_length?: number | null
          password_require_numbers?: boolean | null
          password_require_special?: boolean | null
          require_2fa?: boolean | null
          session_timeout_minutes?: number | null
          timezone?: string | null
          updated_at?: string | null
          usage_data_retention_days?: number | null
        }
        Update: {
          allowed_ip_ranges?: Json | null
          audit_log_retention_days?: number | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          default_alert_channels?: Json | null
          default_budget_period?: string | null
          default_cost_center_id?: string | null
          display_name?: string | null
          features_enabled?: Json | null
          fiscal_year_start?: number | null
          id?: string
          locale?: string | null
          locked_settings?: Json | null
          logo_url?: string | null
          org_id?: string
          password_expire_days?: number | null
          password_min_length?: number | null
          password_require_numbers?: boolean | null
          password_require_special?: boolean | null
          require_2fa?: boolean | null
          session_timeout_minutes?: number | null
          timezone?: string | null
          updated_at?: string | null
          usage_data_retention_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
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
      project_api_keys: {
        Row: {
          created_at: string | null
          environment: string | null
          id: string
          key_identifier: string
          key_type: string | null
          label: string | null
          project_id: string
          provider: string
        }
        Insert: {
          created_at?: string | null
          environment?: string | null
          id?: string
          key_identifier: string
          key_type?: string | null
          label?: string | null
          project_id: string
          provider: string
        }
        Update: {
          created_at?: string | null
          environment?: string | null
          id?: string
          key_identifier?: string
          key_type?: string | null
          label?: string | null
          project_id?: string
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_api_keys_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_api_keys_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_teams: {
        Row: {
          access_level: string | null
          added_at: string | null
          added_by: string | null
          id: string
          project_id: string
          team_id: string
        }
        Insert: {
          access_level?: string | null
          added_at?: string | null
          added_by?: string | null
          id?: string
          project_id: string
          team_id: string
        }
        Update: {
          access_level?: string | null
          added_at?: string | null
          added_by?: string | null
          id?: string
          project_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_teams_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_teams_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_teams_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          api_key_patterns: string[] | null
          category: string | null
          color: string | null
          cost_center_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          icon: string | null
          id: string
          metadata: Json | null
          monthly_budget: number | null
          name: string
          org_id: string | null
          organization_id: string
          owner_team_id: string | null
          owner_user_id: string | null
          settings: Json | null
          slug: string
          start_date: string | null
          status: string | null
          tags: string[] | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          api_key_patterns?: string[] | null
          category?: string | null
          color?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          monthly_budget?: number | null
          name: string
          org_id?: string | null
          organization_id: string
          owner_team_id?: string | null
          owner_user_id?: string | null
          settings?: Json | null
          slug: string
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key_patterns?: string[] | null
          category?: string | null
          color?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          monthly_budget?: number | null
          name?: string
          org_id?: string | null
          organization_id?: string
          owner_team_id?: string | null
          owner_user_id?: string | null
          settings?: Json | null
          slug?: string
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
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
          consecutive_failures: number | null
          created_at: string | null
          credentials_encrypted: Json
          display_name: string | null
          id: string
          last_error: string | null
          last_error_at: string | null
          last_sync_at: string | null
          last_sync_duration_ms: number | null
          last_sync_records: number | null
          name: string | null
          organization_id: string
          provider: string
          provider_metadata: Json | null
          settings: Json | null
          status: string | null
          sync_error: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          consecutive_failures?: number | null
          created_at?: string | null
          credentials_encrypted: Json
          display_name?: string | null
          id?: string
          last_error?: string | null
          last_error_at?: string | null
          last_sync_at?: string | null
          last_sync_duration_ms?: number | null
          last_sync_records?: number | null
          name?: string | null
          organization_id: string
          provider: string
          provider_metadata?: Json | null
          settings?: Json | null
          status?: string | null
          sync_error?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          consecutive_failures?: number | null
          created_at?: string | null
          credentials_encrypted?: Json
          display_name?: string | null
          id?: string
          last_error?: string | null
          last_error_at?: string | null
          last_sync_at?: string | null
          last_sync_duration_ms?: number | null
          last_sync_records?: number | null
          name?: string | null
          organization_id?: string
          provider?: string
          provider_metadata?: Json | null
          settings?: Json | null
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
      provider_health_snapshots: {
        Row: {
          api_error: string | null
          api_status_code: number | null
          avg_sync_duration_ms: number | null
          checked_at: string | null
          connection_id: string
          health_score: number | null
          id: string
          is_reachable: boolean
          latency_ms: number | null
          organization_id: string
          success_rate_24h: number | null
          syncs_last_24h: number | null
        }
        Insert: {
          api_error?: string | null
          api_status_code?: number | null
          avg_sync_duration_ms?: number | null
          checked_at?: string | null
          connection_id: string
          health_score?: number | null
          id?: string
          is_reachable: boolean
          latency_ms?: number | null
          organization_id: string
          success_rate_24h?: number | null
          syncs_last_24h?: number | null
        }
        Update: {
          api_error?: string | null
          api_status_code?: number | null
          avg_sync_duration_ms?: number | null
          checked_at?: string | null
          connection_id?: string
          health_score?: number | null
          id?: string
          is_reachable?: boolean
          latency_ms?: number | null
          organization_id?: string
          success_rate_24h?: number | null
          syncs_last_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_health_snapshots_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "provider_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_health_snapshots_organization_id_fkey"
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
          routing_rule_id: string | null
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
          routing_rule_id?: string | null
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
          routing_rule_id?: string | null
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
          {
            foreignKeyName: "recommendations_routing_rule_id_fkey"
            columns: ["routing_rule_id"]
            isOneToOne: false
            referencedRelation: "routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          branding: Json | null
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          branding?: Json | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          branding?: Json | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_organization_id_fkey"
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
          date_range_end: string | null
          date_range_start: string | null
          download_count: number | null
          download_url: string | null
          error_message: string | null
          file_size: number | null
          filters: Json | null
          format: string | null
          generation_time_ms: number | null
          id: string
          name: string
          organization_id: string
          status: string | null
          summary_data: Json | null
          template_id: string | null
          type: string
        }
        Insert: {
          completed_at?: string | null
          config: Json
          created_at?: string | null
          created_by?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          download_count?: number | null
          download_url?: string | null
          error_message?: string | null
          file_size?: number | null
          filters?: Json | null
          format?: string | null
          generation_time_ms?: number | null
          id?: string
          name: string
          organization_id: string
          status?: string | null
          summary_data?: Json | null
          template_id?: string | null
          type: string
        }
        Update: {
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          download_count?: number | null
          download_url?: string | null
          error_message?: string | null
          file_size?: number | null
          filters?: Json | null
          format?: string | null
          generation_time_ms?: number | null
          id?: string
          name?: string
          organization_id?: string
          status?: string | null
          summary_data?: Json | null
          template_id?: string | null
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
      routing_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          created_from_recommendation_id: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          organization_id: string
          priority: number | null
          rule_type: string
          stats: Json | null
          updated_at: string | null
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          created_from_recommendation_id?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          organization_id: string
          priority?: number | null
          rule_type: string
          stats?: Json | null
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          created_from_recommendation_id?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          organization_id?: string
          priority?: number | null
          rule_type?: string
          stats?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routing_rules_created_from_recommendation_id_fkey"
            columns: ["created_from_recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_emails: {
        Row: {
          created_at: string | null
          email: string
          email_type: string
          error_message: string | null
          id: string
          organization_id: string | null
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          template_data: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_type: string
          error_message?: string | null
          id?: string
          organization_id?: string | null
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          template_data?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_type?: string
          error_message?: string | null
          id?: string
          organization_id?: string | null
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          template_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_emails_organization_id_fkey"
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
          filters: Json | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          next_run_at: string
          organization_id: string
          recipients: string[]
          run_count: number | null
          schedule_config: Json
          template_id: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          filters?: Json | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          next_run_at: string
          organization_id: string
          recipients: string[]
          run_count?: number | null
          schedule_config?: Json
          template_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          filters?: Json | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string
          organization_id?: string
          recipients?: string[]
          run_count?: number | null
          schedule_config?: Json
          template_id?: string | null
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
          {
            foreignKeyName: "scheduled_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sdk_usage_daily: {
        Row: {
          avg_latency_ms: number | null
          by_environment: Json | null
          by_feature: Json | null
          by_team: Json | null
          cache_hit_count: number | null
          created_at: string | null
          date: string
          error_count: number | null
          id: string
          max_latency_ms: number | null
          min_latency_ms: number | null
          model: string
          org_id: string
          p50_latency_ms: number | null
          p95_latency_ms: number | null
          p99_latency_ms: number | null
          provider: string
          request_count: number | null
          total_cached_tokens: number | null
          total_cost: number | null
          total_input_cost: number | null
          total_input_tokens: number | null
          total_output_cost: number | null
          total_output_tokens: number | null
          unique_users: number | null
          updated_at: string | null
        }
        Insert: {
          avg_latency_ms?: number | null
          by_environment?: Json | null
          by_feature?: Json | null
          by_team?: Json | null
          cache_hit_count?: number | null
          created_at?: string | null
          date: string
          error_count?: number | null
          id?: string
          max_latency_ms?: number | null
          min_latency_ms?: number | null
          model: string
          org_id: string
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          provider: string
          request_count?: number | null
          total_cached_tokens?: number | null
          total_cost?: number | null
          total_input_cost?: number | null
          total_input_tokens?: number | null
          total_output_cost?: number | null
          total_output_tokens?: number | null
          unique_users?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_latency_ms?: number | null
          by_environment?: Json | null
          by_feature?: Json | null
          by_team?: Json | null
          cache_hit_count?: number | null
          created_at?: string | null
          date?: string
          error_count?: number | null
          id?: string
          max_latency_ms?: number | null
          min_latency_ms?: number | null
          model?: string
          org_id?: string
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          provider?: string
          request_count?: number | null
          total_cached_tokens?: number | null
          total_cost?: number | null
          total_input_cost?: number | null
          total_input_tokens?: number | null
          total_output_cost?: number | null
          total_output_tokens?: number | null
          unique_users?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sdk_usage_daily_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sdk_usage_hourly: {
        Row: {
          avg_latency_ms: number | null
          by_environment: Json | null
          by_feature: Json | null
          by_team: Json | null
          cache_hit_count: number | null
          created_at: string | null
          error_count: number | null
          hour: string
          id: string
          max_latency_ms: number | null
          min_latency_ms: number | null
          model: string
          org_id: string
          p50_latency_ms: number | null
          p95_latency_ms: number | null
          p99_latency_ms: number | null
          provider: string
          request_count: number | null
          total_cached_tokens: number | null
          total_cost: number | null
          total_input_cost: number | null
          total_input_tokens: number | null
          total_output_cost: number | null
          total_output_tokens: number | null
          updated_at: string | null
        }
        Insert: {
          avg_latency_ms?: number | null
          by_environment?: Json | null
          by_feature?: Json | null
          by_team?: Json | null
          cache_hit_count?: number | null
          created_at?: string | null
          error_count?: number | null
          hour: string
          id?: string
          max_latency_ms?: number | null
          min_latency_ms?: number | null
          model: string
          org_id: string
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          provider: string
          request_count?: number | null
          total_cached_tokens?: number | null
          total_cost?: number | null
          total_input_cost?: number | null
          total_input_tokens?: number | null
          total_output_cost?: number | null
          total_output_tokens?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_latency_ms?: number | null
          by_environment?: Json | null
          by_feature?: Json | null
          by_team?: Json | null
          cache_hit_count?: number | null
          created_at?: string | null
          error_count?: number | null
          hour?: string
          id?: string
          max_latency_ms?: number | null
          min_latency_ms?: number | null
          model?: string
          org_id?: string
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          provider?: string
          request_count?: number | null
          total_cached_tokens?: number | null
          total_cost?: number | null
          total_input_cost?: number | null
          total_input_tokens?: number | null
          total_output_cost?: number | null
          total_output_tokens?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sdk_usage_hourly_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sdk_usage_records: {
        Row: {
          api_key_id: string | null
          cache_hit_type: string | null
          cached_cost: number | null
          cached_tokens: number | null
          cost_center_id: string | null
          created_at: string | null
          environment: string | null
          error_code: string | null
          error_message: string | null
          error_type: string | null
          feature: string | null
          id: string
          input_cost: number
          input_tokens: number
          is_error: boolean | null
          is_streaming: boolean | null
          latency_ms: number
          metadata: Json | null
          method_path: string | null
          model: string
          org_id: string
          original_model: string | null
          output_cost: number
          output_tokens: number
          project_id: string | null
          prompt_hash: string | null
          provider: string
          request_id: string
          routed_by_rule: string | null
          sdk_language: string
          sdk_version: string
          source: string | null
          team_id: string | null
          time_to_first_token_ms: number | null
          timestamp: string
          user_ids: string[] | null
          was_cached: boolean | null
        }
        Insert: {
          api_key_id?: string | null
          cache_hit_type?: string | null
          cached_cost?: number | null
          cached_tokens?: number | null
          cost_center_id?: string | null
          created_at?: string | null
          environment?: string | null
          error_code?: string | null
          error_message?: string | null
          error_type?: string | null
          feature?: string | null
          id?: string
          input_cost?: number
          input_tokens?: number
          is_error?: boolean | null
          is_streaming?: boolean | null
          latency_ms?: number
          metadata?: Json | null
          method_path?: string | null
          model: string
          org_id: string
          original_model?: string | null
          output_cost?: number
          output_tokens?: number
          project_id?: string | null
          prompt_hash?: string | null
          provider: string
          request_id: string
          routed_by_rule?: string | null
          sdk_language?: string
          sdk_version?: string
          source?: string | null
          team_id?: string | null
          time_to_first_token_ms?: number | null
          timestamp?: string
          user_ids?: string[] | null
          was_cached?: boolean | null
        }
        Update: {
          api_key_id?: string | null
          cache_hit_type?: string | null
          cached_cost?: number | null
          cached_tokens?: number | null
          cost_center_id?: string | null
          created_at?: string | null
          environment?: string | null
          error_code?: string | null
          error_message?: string | null
          error_type?: string | null
          feature?: string | null
          id?: string
          input_cost?: number
          input_tokens?: number
          is_error?: boolean | null
          is_streaming?: boolean | null
          latency_ms?: number
          metadata?: Json | null
          method_path?: string | null
          model?: string
          org_id?: string
          original_model?: string | null
          output_cost?: number
          output_tokens?: number
          project_id?: string | null
          prompt_hash?: string | null
          provider?: string
          request_id?: string
          routed_by_rule?: string | null
          sdk_language?: string
          sdk_version?: string
          source?: string | null
          team_id?: string | null
          time_to_first_token_ms?: number | null
          timestamp?: string
          user_ids?: string[] | null
          was_cached?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sdk_usage_records_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdk_usage_records_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdk_usage_records_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdk_usage_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdk_usage_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdk_usage_records_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdk_usage_records_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      semantic_cache: {
        Row: {
          created_at: string | null
          expires_at: string
          hit_count: number | null
          id: string
          last_hit_at: string | null
          model: string
          organization_id: string
          original_cost: number
          output_tokens: number
          prompt_embedding: string | null
          prompt_hash: string
          response: string
          savings_generated: number | null
          system_prompt_hash: string | null
          task_type: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          hit_count?: number | null
          id?: string
          last_hit_at?: string | null
          model: string
          organization_id: string
          original_cost: number
          output_tokens: number
          prompt_embedding?: string | null
          prompt_hash: string
          response: string
          savings_generated?: number | null
          system_prompt_hash?: string | null
          task_type?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          hit_count?: number | null
          id?: string
          last_hit_at?: string | null
          model?: string
          organization_id?: string
          original_cost?: number
          output_tokens?: number
          prompt_embedding?: string | null
          prompt_hash?: string
          response?: string
          savings_generated?: number | null
          system_prompt_hash?: string | null
          task_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semantic_cache_organization_id_fkey"
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
          ip_address: unknown
          token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
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
      settings_audit_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          org_id: string | null
          setting_key: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string | null
          setting_key: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string | null
          setting_key?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_history: {
        Row: {
          completed_at: string | null
          connection_id: string
          created_at: string | null
          duration_ms: number | null
          error_code: string | null
          error_details: Json | null
          error_message: string | null
          granularity: string | null
          id: string
          options: Json | null
          organization_id: string
          records_created: number | null
          records_fetched: number | null
          records_skipped: number | null
          records_updated: number | null
          retry_count: number | null
          started_at: string
          status: string
          sync_type: string | null
          sync_window_end: string | null
          sync_window_start: string | null
          total_cost_synced: number | null
          total_tokens_synced: number | null
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_details?: Json | null
          error_message?: string | null
          granularity?: string | null
          id?: string
          options?: Json | null
          organization_id: string
          records_created?: number | null
          records_fetched?: number | null
          records_skipped?: number | null
          records_updated?: number | null
          retry_count?: number | null
          started_at?: string
          status?: string
          sync_type?: string | null
          sync_window_end?: string | null
          sync_window_start?: string | null
          total_cost_synced?: number | null
          total_tokens_synced?: number | null
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_details?: Json | null
          error_message?: string | null
          granularity?: string | null
          id?: string
          options?: Json | null
          organization_id?: string
          records_created?: number | null
          records_fetched?: number | null
          records_skipped?: number | null
          records_updated?: number | null
          retry_count?: number | null
          started_at?: string
          status?: string
          sync_type?: string | null
          sync_window_end?: string | null
          sync_window_start?: string | null
          total_cost_synced?: number | null
          total_tokens_synced?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_history_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "provider_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
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
          avatar_url: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          default_cost_center_id: string | null
          description: string | null
          id: string
          metadata: Json | null
          monthly_budget: number | null
          name: string
          org_id: string | null
          organization_id: string
          parent_team_id: string | null
          settings: Json | null
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          api_key_patterns?: string[] | null
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_cost_center_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          monthly_budget?: number | null
          name: string
          org_id?: string | null
          organization_id: string
          parent_team_id?: string | null
          settings?: Json | null
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key_patterns?: string[] | null
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_cost_center_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          monthly_budget?: number | null
          name?: string
          org_id?: string | null
          organization_id?: string
          parent_team_id?: string | null
          settings?: Json | null
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_default_cost_center_id_fkey"
            columns: ["default_cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tooltip_dismissals: {
        Row: {
          dismissed_at: string | null
          id: string
          tooltip_id: string
          user_id: string
        }
        Insert: {
          dismissed_at?: string | null
          id?: string
          tooltip_id: string
          user_id: string
        }
        Update: {
          dismissed_at?: string | null
          id?: string
          tooltip_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tour_completions: {
        Row: {
          completed_at: string | null
          id: string
          skipped: boolean | null
          steps_viewed: number | null
          total_steps: number | null
          tour_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          skipped?: boolean | null
          steps_viewed?: number | null
          total_steps?: number | null
          tour_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          skipped?: boolean | null
          steps_viewed?: number | null
          total_steps?: number | null
          tour_id?: string
          user_id?: string
        }
        Relationships: []
      }
      triggered_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          acknowledgment_note: string | null
          context: Json | null
          created_at: string | null
          current_value: number | null
          description: string | null
          id: string
          notifications_sent: Json | null
          organization_id: string
          resolution_note: string | null
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          rule_id: string | null
          severity: string
          snoozed_by: string | null
          snoozed_until: string | null
          status: string
          threshold_value: number | null
          title: string
          triggered_at: string | null
          type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledgment_note?: string | null
          context?: Json | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          notifications_sent?: Json | null
          organization_id: string
          resolution_note?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id?: string | null
          severity?: string
          snoozed_by?: string | null
          snoozed_until?: string | null
          status?: string
          threshold_value?: number | null
          title: string
          triggered_at?: string | null
          type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledgment_note?: string | null
          context?: Json | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          notifications_sent?: Json | null
          organization_id?: string
          resolution_note?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id?: string | null
          severity?: string
          snoozed_by?: string | null
          snoozed_until?: string | null
          status?: string
          threshold_value?: number | null
          title?: string
          triggered_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "triggered_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triggered_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triggered_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triggered_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triggered_alerts_snoozed_by_fkey"
            columns: ["snoozed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_baselines: {
        Row: {
          created_at: string | null
          data_points: number
          filters: Json | null
          id: string
          mad: number
          max_value: number
          mean: number
          median: number
          metric: string
          min_value: number
          organization_id: string
          period_end: string
          period_start: string
          q1: number
          q3: number
          std_dev: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_points: number
          filters?: Json | null
          id?: string
          mad: number
          max_value: number
          mean: number
          median: number
          metric: string
          min_value: number
          organization_id: string
          period_end: string
          period_start: string
          q1: number
          q3: number
          std_dev: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_points?: number
          filters?: Json | null
          id?: string
          mad?: number
          max_value?: number
          mean?: number
          median?: number
          metric?: string
          min_value?: number
          organization_id?: string
          period_end?: string
          period_start?: string
          q1?: number
          q3?: number
          std_dev?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_baselines_organization_id_fkey"
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
          cache_creation_tokens: number | null
          cached_tokens: number | null
          connection_id: string | null
          cost: number
          cost_center_id: string | null
          created_at: string | null
          currency: string | null
          dimension_hash: string | null
          end_time: string | null
          endpoint: string | null
          error_code: string | null
          feature_tag: string | null
          granularity: string | null
          id: string
          input_tokens: number
          latency_ms: number | null
          metadata: Json | null
          model: string
          model_family: string | null
          model_version: string | null
          organization_id: string
          output_tokens: number
          project_id: string | null
          provider: string
          provider_metadata: Json | null
          request_id: string | null
          status: string | null
          team_id: string | null
          timestamp: string
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          cache_creation_tokens?: number | null
          cached_tokens?: number | null
          connection_id?: string | null
          cost: number
          cost_center_id?: string | null
          created_at?: string | null
          currency?: string | null
          dimension_hash?: string | null
          end_time?: string | null
          endpoint?: string | null
          error_code?: string | null
          feature_tag?: string | null
          granularity?: string | null
          id?: string
          input_tokens?: number
          latency_ms?: number | null
          metadata?: Json | null
          model: string
          model_family?: string | null
          model_version?: string | null
          organization_id: string
          output_tokens?: number
          project_id?: string | null
          provider: string
          provider_metadata?: Json | null
          request_id?: string | null
          status?: string | null
          team_id?: string | null
          timestamp: string
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          cache_creation_tokens?: number | null
          cached_tokens?: number | null
          connection_id?: string | null
          cost?: number
          cost_center_id?: string | null
          created_at?: string | null
          currency?: string | null
          dimension_hash?: string | null
          end_time?: string | null
          endpoint?: string | null
          error_code?: string | null
          feature_tag?: string | null
          granularity?: string | null
          id?: string
          input_tokens?: number
          latency_ms?: number | null
          metadata?: Json | null
          model?: string
          model_family?: string | null
          model_version?: string | null
          organization_id?: string
          output_tokens?: number
          project_id?: string | null
          provider?: string
          provider_metadata?: Json | null
          request_id?: string | null
          status?: string | null
          team_id?: string | null
          timestamp?: string
          total_tokens?: number | null
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
            foreignKeyName: "usage_records_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "provider_connections"
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
            referencedRelation: "project_summary"
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
            referencedRelation: "team_summary"
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
      user_settings: {
        Row: {
          avatar_url: string | null
          chart_preferences: Json | null
          collapsed_sections: Json | null
          created_at: string | null
          custom_shortcuts: Json | null
          date_format: string | null
          default_dashboard_view: string | null
          default_date_range: string | null
          display_name: string | null
          favorite_pages: Json | null
          font_size: string | null
          high_contrast: boolean | null
          id: string
          locale: string | null
          org_id: string
          pinned_widgets: Json | null
          recent_pages: Json | null
          reduce_motion: boolean | null
          shortcuts_enabled: boolean | null
          sidebar_collapsed: boolean | null
          table_preferences: Json | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          chart_preferences?: Json | null
          collapsed_sections?: Json | null
          created_at?: string | null
          custom_shortcuts?: Json | null
          date_format?: string | null
          default_dashboard_view?: string | null
          default_date_range?: string | null
          display_name?: string | null
          favorite_pages?: Json | null
          font_size?: string | null
          high_contrast?: boolean | null
          id?: string
          locale?: string | null
          org_id: string
          pinned_widgets?: Json | null
          recent_pages?: Json | null
          reduce_motion?: boolean | null
          shortcuts_enabled?: boolean | null
          sidebar_collapsed?: boolean | null
          table_preferences?: Json | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          chart_preferences?: Json | null
          collapsed_sections?: Json | null
          created_at?: string | null
          custom_shortcuts?: Json | null
          date_format?: string | null
          default_dashboard_view?: string | null
          default_date_range?: string | null
          display_name?: string | null
          favorite_pages?: Json | null
          font_size?: string | null
          high_contrast?: boolean | null
          id?: string
          locale?: string | null
          org_id?: string
          pinned_widgets?: Json | null
          recent_pages?: Json | null
          reduce_motion?: boolean | null
          shortcuts_enabled?: boolean | null
          sidebar_collapsed?: boolean | null
          table_preferences?: Json | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      webhooks: {
        Row: {
          created_at: string | null
          custom_headers: Json | null
          enabled: boolean | null
          events: Json
          failure_count: number | null
          id: string
          last_status_code: number | null
          last_triggered_at: string | null
          name: string
          org_id: string
          retry_count: number | null
          retry_delay_seconds: number | null
          secret: string | null
          status: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          custom_headers?: Json | null
          enabled?: boolean | null
          events?: Json
          failure_count?: number | null
          id?: string
          last_status_code?: number | null
          last_triggered_at?: string | null
          name: string
          org_id: string
          retry_count?: number | null
          retry_delay_seconds?: number | null
          secret?: string | null
          status?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          custom_headers?: Json | null
          enabled?: boolean | null
          events?: Json
          failure_count?: number | null
          id?: string
          last_status_code?: number | null
          last_triggered_at?: string | null
          name?: string
          org_id?: string
          retry_count?: number | null
          retry_delay_seconds?: number | null
          secret?: string | null
          status?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      budget_summary: {
        Row: {
          base_amount: number | null
          cost_center_id: string | null
          cost_center_name: string | null
          created_at: string | null
          days_until_exhaustion: number | null
          description: string | null
          forecasted_end_date: string | null
          forecasted_spend: number | null
          id: string | null
          mode: string | null
          model: string | null
          name: string | null
          organization_id: string | null
          period: string | null
          period_end: string | null
          period_id: string | null
          period_start: string | null
          project_id: string | null
          project_name: string | null
          provider: string | null
          remaining_amount: number | null
          rollover_enabled: boolean | null
          spent_amount: number | null
          status: string | null
          tags: Json | null
          team_id: string | null
          team_name: string | null
          total_budget: number | null
          type: string | null
          updated_at: string | null
          utilization_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_center_hierarchy: {
        Row: {
          code: string | null
          created_at: string | null
          created_by: string | null
          department_code: string | null
          depth: number | null
          description: string | null
          full_path: string | null
          gl_account: string | null
          id: string | null
          manager_id: string | null
          metadata: Json | null
          name: string | null
          org_id: string | null
          parent_id: string | null
          path: string[] | null
          status: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      project_summary: {
        Row: {
          category: string | null
          color: string | null
          cost_center_id: string | null
          cost_center_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          icon: string | null
          id: string | null
          metadata: Json | null
          name: string | null
          org_id: string | null
          owner_team_id: string | null
          owner_team_name: string | null
          owner_user_id: string | null
          settings: Json | null
          slug: string | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          teams: Json | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_summary: {
        Row: {
          avatar_url: string | null
          color: string | null
          cost_center_code: string | null
          cost_center_name: string | null
          created_at: string | null
          created_by: string | null
          default_cost_center_id: string | null
          description: string | null
          id: string | null
          member_count: number | null
          metadata: Json | null
          name: string | null
          org_id: string | null
          parent_team_id: string | null
          project_count: number | null
          settings: Json | null
          slug: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_default_cost_center_id_fkey"
            columns: ["default_cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_connection_health_status: {
        Args: { p_connection_id: string }
        Returns: {
          avg_duration_ms: number
          consecutive_failures: number
          is_stale: boolean
          last_sync_at: string
          status: string
          success_rate: number
        }[]
      }
      get_current_budget_period: {
        Args: { p_budget_id: string }
        Returns: string
      }
      get_provider_sync_summary: {
        Args: { p_org_id: string }
        Returns: {
          connected_count: number
          error_count: number
          successful_syncs_today: number
          syncing_count: number
          total_connections: number
          total_cost_today: number
          total_records_today: number
          total_syncs_today: number
        }[]
      }
      get_unread_notification_count: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: {
          by_category: Json
          by_priority: Json
          total: number
        }[]
      }
      increment_rule_match_count: {
        Args: { p_rule_id: string }
        Returns: undefined
      }
      mark_notifications_read: {
        Args: {
          p_mark_all?: boolean
          p_notification_ids: string[]
          p_user_id: string
        }
        Returns: number
      }
      update_budget_spend: {
        Args: { p_amount: number; p_budget_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
