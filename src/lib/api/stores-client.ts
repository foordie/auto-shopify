// API client for stores endpoints
export interface Store {
  id: string
  name: string
  description?: string
  category: string
  status: 'creating' | 'draft' | 'active' | 'paused' | 'failed'
  progress?: {
    setupComplete: number
    stepsCompleted: string[]
    nextStep: string
  }
  domain?: string
  customDomain?: string | null
  createdAt: string
  updatedAt: string
}

export interface StoresResponse {
  success: boolean
  stores: Store[]
  totalStores: number
  pagination: {
    limit: number
    offset: number
    total: number
  }
  error?: string
}

export interface CreateStoreData {
  name: string
  description?: string
  category: string
  theme?: string
  customDomain?: string
}

export interface CreateStoreResponse {
  success: boolean
  message?: string
  store?: Store
  nextSteps?: string[]
  error?: string
  details?: Array<{
    field: string
    message: string
  }>
}

export interface StoreProgressResponse {
  success: boolean
  progress: {
    setupComplete: number
    stepsCompleted: string[]
    nextStep: string
  }
  error?: string
}

class StoresClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async getStores(limit = 10, offset = 0): Promise<StoresResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stores?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const result: StoresResponse = await response.json()
      return result
    } catch (error) {
      console.error('Get stores API error:', error)
      return {
        success: false,
        stores: [],
        totalStores: 0,
        pagination: { limit, offset, total: 0 },
        error: 'Network error occurred. Please try again.'
      }
    }
  }

  async createStore(data: CreateStoreData): Promise<CreateStoreResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stores`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      })

      const result: CreateStoreResponse = await response.json()
      return result
    } catch (error) {
      console.error('Create store API error:', error)
      return {
        success: false,
        error: 'Network error occurred. Please try again.'
      }
    }
  }

  async getStoreProgress(storeId: string): Promise<StoreProgressResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stores/${storeId}/progress`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const result: StoreProgressResponse = await response.json()
      return result
    } catch (error) {
      console.error('Get store progress API error:', error)
      return {
        success: false,
        progress: {
          setupComplete: 0,
          stepsCompleted: [],
          nextStep: 'store_creation'
        },
        error: 'Network error occurred. Please try again.'
      }
    }
  }
}

// Export singleton instance
export const storesClient = new StoresClient()