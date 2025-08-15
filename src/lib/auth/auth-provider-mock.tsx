'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DemoDataBadge, DemoWarningBanner } from '@/components/ui/DemoDataBadge'

interface User {
  id: string
  email: string
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  agency_name: string
  role: 'agency_owner' | 'agency_member' | 'client'
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResult>
}

interface AuthResult {
  success: boolean
  error?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 🔴 MOCK USER DATA - REPLACE WITH REAL AUTHENTICATION
const MOCK_USER: User = {
  id: 'demo-user-123', // ← PLACEHOLDER ID
  email: 'demo@shopifyautomation.com', // ← PLACEHOLDER EMAIL  
  created_at: new Date().toISOString()
}

const MOCK_PROFILE: UserProfile = {
  id: 'demo-user-123', // ← PLACEHOLDER ID
  email: 'demo@shopifyautomation.com', // ← PLACEHOLDER EMAIL
  full_name: 'Demo User', // ← PLACEHOLDER NAME
  agency_name: 'My Online Store', // ← PLACEHOLDER BUSINESS (keeping field name for compatibility)
  role: 'aspiring_entrepreneur',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 🔴 MOCK AUTHENTICATION - Replace with real Supabase auth
    const timer = setTimeout(() => {
      // 🔴 Using localStorage for demo - NOT secure for production
      const isLoggedIn = localStorage.getItem('demo-logged-in') === 'true'
      if (isLoggedIn) {
        setUser(MOCK_USER) // ← REPLACE WITH REAL USER DATA
        setProfile(MOCK_PROFILE) // ← REPLACE WITH REAL PROFILE
      }
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const signUp = async (email: string, password: string, userData?: any): Promise<AuthResult> => {
    setLoading(true)
    
    // 🔴 SIMULATED API CALL - Replace with Supabase auth.signUp()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 🔴 DEMO MODE - Always succeeds, replace with real validation
    localStorage.setItem('demo-logged-in', 'true') // ← REMOVE - Use real auth
    setUser(MOCK_USER) // ← REPLACE WITH REAL USER
    setProfile({ ...MOCK_PROFILE, email, full_name: userData?.fullName || 'Demo User' })
    setLoading(false)
    
    return { success: true }
  }

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true)
    
    // 🔴 SIMULATED API CALL - Replace with Supabase auth.signInWithPassword()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 🔴 FAKE VALIDATION - Replace with real authentication
    if (email && password.length >= 6) {
      localStorage.setItem('demo-logged-in', 'true') // ← REMOVE - Use real auth
      setUser(MOCK_USER) // ← REPLACE WITH REAL USER
      setProfile({ ...MOCK_PROFILE, email })
      setLoading(false)
      router.push('/dashboard')
      return { success: true }
    } else {
      setLoading(false)
      return { success: false, error: 'Invalid email or password' }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('demo-logged-in')
    setUser(null)
    setProfile(null)
    router.push('/login')
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<AuthResult> => {
    if (!profile) return { success: false, error: 'No user logged in' }
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setProfile({ ...profile, ...updates, updated_at: new Date().toISOString() })
    setLoading(false)
    
    return { success: true }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login')
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}