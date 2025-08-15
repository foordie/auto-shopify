// Auto-generated TypeScript types for Supabase
// Based on the database schema from master-project-overview.md

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          agency_name: string | null
          role: 'agency_owner' | 'agency_member' | 'client'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          agency_name?: string | null
          role?: 'agency_owner' | 'agency_member' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          agency_name?: string | null
          role?: 'agency_owner' | 'agency_member' | 'client'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agencies: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          subscription_status: 'active' | 'cancelled' | 'past_due'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          subscription_status?: 'active' | 'cancelled' | 'past_due'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          subscription_status?: 'active' | 'cancelled' | 'past_due'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agencies_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      agency_members: {
        Row: {
          id: string
          agency_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          invited_at: string
          joined_at: string | null
          status: 'pending' | 'active' | 'inactive'
        }
        Insert: {
          id?: string
          agency_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          invited_at?: string
          joined_at?: string | null
          status?: 'pending' | 'active' | 'inactive'
        }
        Update: {
          id?: string
          agency_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          invited_at?: string
          joined_at?: string | null
          status?: 'pending' | 'active' | 'inactive'
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          id: string
          agency_id: string
          name: string
          email: string
          phone: string | null
          company: string | null
          status: 'active' | 'inactive' | 'pending'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          name: string
          email: string
          phone?: string | null
          company?: string | null
          status?: 'active' | 'inactive' | 'pending'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          name?: string
          email?: string
          phone?: string | null
          company?: string | null
          status?: 'active' | 'inactive' | 'pending'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_agency_id_fkey"
            columns: ["agency_id"]
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      store_configs: {
        Row: {
          id: string
          client_id: string
          agency_id: string
          business_name: string
          business_description: string | null
          business_type: string | null
          target_audience: string | null
          store_name: string
          domain_preference: string | null
          currency: string
          timezone: string
          product_categories: Json | null
          estimated_products: number | null
          price_range_min: number | null
          price_range_max: number | null
          theme_preference: string | null
          color_scheme: Json | null
          branding_assets: Json | null
          features: Json | null
          integrations: Json | null
          status: 'draft' | 'submitted' | 'in_progress' | 'completed' | 'error'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          agency_id: string
          business_name: string
          business_description?: string | null
          business_type?: string | null
          target_audience?: string | null
          store_name: string
          domain_preference?: string | null
          currency?: string
          timezone?: string
          product_categories?: Json | null
          estimated_products?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          theme_preference?: string | null
          color_scheme?: Json | null
          branding_assets?: Json | null
          features?: Json | null
          integrations?: Json | null
          status?: 'draft' | 'submitted' | 'in_progress' | 'completed' | 'error'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          agency_id?: string
          business_name?: string
          business_description?: string | null
          business_type?: string | null
          target_audience?: string | null
          store_name?: string
          domain_preference?: string | null
          currency?: string
          timezone?: string
          product_categories?: Json | null
          estimated_products?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          theme_preference?: string | null
          color_scheme?: Json | null
          branding_assets?: Json | null
          features?: Json | null
          integrations?: Json | null
          status?: 'draft' | 'submitted' | 'in_progress' | 'completed' | 'error'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_configs_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_configs_agency_id_fkey"
            columns: ["agency_id"]
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_configs_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      automation_jobs: {
        Row: {
          id: string
          store_config_id: string
          job_type: 'store_creation' | 'product_import' | 'theme_setup' | 'content_generation'
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          progress: number
          input_data: Json | null
          output_data: Json | null
          error_message: string | null
          shopify_store_id: string | null
          shopify_domain: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_config_id: string
          job_type: 'store_creation' | 'product_import' | 'theme_setup' | 'content_generation'
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          input_data?: Json | null
          output_data?: Json | null
          error_message?: string | null
          shopify_store_id?: string | null
          shopify_domain?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_config_id?: string
          job_type?: 'store_creation' | 'product_import' | 'theme_setup' | 'content_generation'
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          input_data?: Json | null
          output_data?: Json | null
          error_message?: string | null
          shopify_store_id?: string | null
          shopify_domain?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_jobs_store_config_id_fkey"
            columns: ["store_config_id"]
            referencedRelation: "store_configs"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}