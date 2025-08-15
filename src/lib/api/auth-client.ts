// Real API client for authentication endpoints
export interface AuthResponse {
  success: boolean
  error?: string
  user?: {
    id: string
    email: string
    fullName: string
    role: string
    emailVerified: boolean
  }
  tokens?: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
  details?: Array<{
    field: string
    message: string
  }>
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
  role: string
  businessStage: string
  productCategory: string
  businessName?: string
}

class AuthClient {
  private baseUrl: string
  private accessToken: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
    this.accessToken = this.getStoredToken()
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private setStoredToken(token: string | null) {
    if (typeof window === 'undefined') return
    
    if (token) {
      localStorage.setItem('access_token', token)
      this.accessToken = token
    } else {
      localStorage.removeItem('access_token')
      this.accessToken = null
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    return headers
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.tokens) {
        this.setStoredToken(result.tokens.accessToken)
        // Store refresh token separately
        localStorage.setItem('refresh_token', result.tokens.refreshToken)
      }

      return result
    } catch (error) {
      console.error('Registration API error:', error)
      return {
        success: false,
        error: 'Network error occurred. Please try again.'
      }
    }
  }

  async login(email: string, password: string, remember = false): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password, remember })
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.tokens) {
        this.setStoredToken(result.tokens.accessToken)
        localStorage.setItem('refresh_token', result.tokens.refreshToken)
      }

      return result
    } catch (error) {
      console.error('Login API error:', error)
      return {
        success: false,
        error: 'Network error occurred. Please try again.'
      }
    }
  }

  async logout(): Promise<void> {
    this.setStoredToken(null)
    localStorage.removeItem('refresh_token')
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  getAccessToken(): string | null {
    return this.accessToken
  }
}

// Export singleton instance
export const authClient = new AuthClient()