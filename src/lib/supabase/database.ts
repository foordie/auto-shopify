import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Server component client
export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies })

// API route client  
export const createRouteClient = () =>
  createRouteHandlerClient<Database>({ cookies })

// Database utility functions
export class DatabaseService {
  private supabase: any

  constructor(client: any) {
    this.supabase = client
  }

  // User Profile Operations
  async createUserProfile(userId: string, profileData: {
    email: string
    full_name?: string
    agency_name?: string
    role?: 'agency_owner' | 'agency_member' | 'client'
  }) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData,
        role: profileData.role || 'agency_owner'
      })
      .select()
      .single()

    return { data, error }
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return { data, error }
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  }

  // Agency Operations
  async createAgency(agencyData: {
    name: string
    description?: string
    owner_id: string
  }) {
    const { data: agency, error: agencyError } = await this.supabase
      .from('agencies')
      .insert(agencyData)
      .select()
      .single()

    if (agencyError || !agency) {
      return { data: null, error: agencyError }
    }

    // Add owner as agency member
    const { error: memberError } = await this.supabase
      .from('agency_members')
      .insert({
        agency_id: agency.id,
        user_id: agencyData.owner_id,
        role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString()
      })

    if (memberError) {
      // Rollback agency creation if member insertion fails
      await this.supabase
        .from('agencies')
        .delete()
        .eq('id', agency.id)
      
      return { data: null, error: memberError }
    }

    return { data: agency, error: null }
  }

  async getUserAgencies(userId: string) {
    const { data, error } = await this.supabase
      .from('agency_members')
      .select(`
        *,
        agencies (
          id,
          name,
          description,
          subscription_status,
          created_at
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')

    return { data, error }
  }

  // Client Operations
  async createClient(clientData: {
    agency_id: string
    name: string
    email: string
    phone?: string
    company?: string
    created_by: string
  }) {
    const { data, error } = await this.supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    return { data, error }
  }

  async getAgencyClients(agencyId: string) {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Store Configuration Operations
  async createStoreConfig(configData: {
    client_id: string
    agency_id: string
    business_name: string
    business_description?: string
    business_type?: string
    target_audience?: string
    store_name: string
    domain_preference?: string
    currency?: string
    timezone?: string
    product_categories?: any
    estimated_products?: number
    price_range_min?: number
    price_range_max?: number
    theme_preference?: string
    color_scheme?: any
    branding_assets?: any
    features?: any
    integrations?: any
    created_by: string
  }) {
    const { data, error } = await this.supabase
      .from('store_configs')
      .insert(configData)
      .select()
      .single()

    return { data, error }
  }

  async updateStoreConfig(configId: string, updates: any) {
    const { data, error } = await this.supabase
      .from('store_configs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', configId)
      .select()
      .single()

    return { data, error }
  }

  async getStoreConfigs(agencyId: string, status?: string) {
    let query = this.supabase
      .from('store_configs')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    return { data, error }
  }

  // Automation Job Operations
  async createAutomationJob(jobData: {
    store_config_id: string
    job_type: 'store_creation' | 'product_import' | 'theme_setup' | 'content_generation'
    input_data?: any
  }) {
    const { data, error } = await this.supabase
      .from('automation_jobs')
      .insert(jobData)
      .select()
      .single()

    return { data, error }
  }

  async updateAutomationJob(jobId: string, updates: {
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
    progress?: number
    output_data?: any
    error_message?: string
    shopify_store_id?: string
    shopify_domain?: string
  }) {
    const updateData: any = { ...updates }
    
    if (updates.status === 'running' && !updates.progress) {
      updateData.started_at = new Date().toISOString()
    }
    
    if (updates.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
      updateData.progress = 100
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await this.supabase
      .from('automation_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single()

    return { data, error }
  }

  async getAutomationJob(jobId: string) {
    const { data, error } = await this.supabase
      .from('automation_jobs')
      .select(`
        *,
        store_configs (
          id,
          business_name,
          store_name,
          clients (
            id,
            name,
            email
          )
        )
      `)
      .eq('id', jobId)
      .single()

    return { data, error }
  }

  async getAgencyAutomationJobs(agencyId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from('automation_jobs')
      .select(`
        *,
        store_configs!inner (
          id,
          business_name,
          store_name,
          agency_id,
          clients (
            id,
            name,
            email
          )
        )
      `)
      .eq('store_configs.agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  // Analytics and Metrics
  async getAgencyMetrics(agencyId: string) {
    try {
      const [clients, stores, jobs, completedJobs] = await Promise.all([
        this.supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', agencyId),
        
        this.supabase
          .from('store_configs')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', agencyId),
        
        this.supabase
          .from('automation_jobs')
          .select('*, store_configs!inner(*)', { count: 'exact', head: true })
          .eq('store_configs.agency_id', agencyId),
        
        this.supabase
          .from('automation_jobs')
          .select('*, store_configs!inner(*)', { count: 'exact', head: true })
          .eq('store_configs.agency_id', agencyId)
          .eq('status', 'completed')
      ])

      return {
        data: {
          totalClients: clients.count || 0,
          totalStores: stores.count || 0,
          totalJobs: jobs.count || 0,
          completedJobs: completedJobs.count || 0,
          successRate: jobs.count ? Math.round(((completedJobs.count || 0) / jobs.count) * 100) : 0
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Real-time subscriptions
  subscribeToJobUpdates(jobId: string, callback: (payload: any) => void) {
    const subscription = this.supabase
      .channel(`automation_job_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'automation_jobs',
          filter: `id=eq.${jobId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }

  subscribeToAgencyJobs(agencyId: string, callback: (payload: any) => void) {
    const subscription = this.supabase
      .channel(`agency_jobs_${agencyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automation_jobs'
        },
        async (payload) => {
          // Only notify for jobs belonging to this agency
          if (payload.new?.store_config_id || payload.old?.store_config_id) {
            const configId = payload.new?.store_config_id || payload.old?.store_config_id
            const { data: config } = await this.supabase
              .from('store_configs')
              .select('agency_id')
              .eq('id', configId)
              .single()
            
            if (config?.agency_id === agencyId) {
              callback(payload)
            }
          }
        }
      )
      .subscribe()

    return subscription
  }
}