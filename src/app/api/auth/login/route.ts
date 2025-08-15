import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Security: Rate limiting for login attempts
const loginAttemptMap = new Map<string, { count: number, resetTime: number, lockedUntil?: number }>()
const LOGIN_RATE_LIMIT = 5
const LOGIN_WINDOW = 15 * 60 * 1000 // 15 minutes
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes after max attempts

// Login request validation
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().optional(),
  remember: z.boolean().optional()
})

// JWT secret (in production, use a proper secret from env vars)
const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-change-in-production'

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip
}

function checkLoginRateLimit(identifier: string): { allowed: boolean, remaining: number, lockedUntil?: number } {
  const now = Date.now()
  const current = loginAttemptMap.get(identifier)
  
  // Check if currently locked out
  if (current?.lockedUntil && current.lockedUntil > now) {
    return { allowed: false, remaining: 0, lockedUntil: current.lockedUntil }
  }
  
  // Reset if window expired
  if (!current || current.resetTime < now) {
    loginAttemptMap.set(identifier, { count: 0, resetTime: now + LOGIN_WINDOW })
    return { allowed: true, remaining: LOGIN_RATE_LIMIT }
  }
  
  // Check if exceeded limit
  if (current.count >= LOGIN_RATE_LIMIT) {
    const lockedUntil = now + LOCKOUT_DURATION
    loginAttemptMap.set(identifier, { ...current, lockedUntil })
    return { allowed: false, remaining: 0, lockedUntil }
  }
  
  return { allowed: true, remaining: LOGIN_RATE_LIMIT - current.count }
}

function recordFailedLogin(identifier: string) {
  const now = Date.now()
  const current = loginAttemptMap.get(identifier)
  
  if (!current || current.resetTime < now) {
    loginAttemptMap.set(identifier, { count: 1, resetTime: now + LOGIN_WINDOW })
  } else {
    current.count++
  }
}

function clearFailedLogins(identifier: string) {
  loginAttemptMap.delete(identifier)
}

export async function POST(request: NextRequest) {
  try {
    // Security: Rate limiting check
    const clientId = getClientIdentifier(request)
    const rateLimit = checkLoginRateLimit(clientId)
    
    if (!rateLimit.allowed) {
      const lockoutMinutes = rateLimit.lockedUntil 
        ? Math.ceil((rateLimit.lockedUntil - Date.now()) / (60 * 1000))
        : 15
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Account temporarily locked due to too many failed attempts. Try again in ${lockoutMinutes} minutes.`,
          lockedUntil: rateLimit.lockedUntil
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': (lockoutMinutes * 60).toString()
          }
        }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const validation = loginSchema.safeParse(body)
    
    if (!validation.success) {
      recordFailedLogin(clientId)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: validation.error.issues
        }, 
        { status: 400 }
      )
    }

    const { email, password, remember = false } = validation.data

    // In production, query database for user
    // For demo, simulate user lookup with some mock data
    const mockUsers = [
      {
        id: 'demo-user-123',
        email: 'demo@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        profile: {
          fullName: 'Demo User',
          role: 'aspiring_entrepreneur',
          businessName: 'My Demo Store',
          emailVerified: true
        }
      }
    ]

    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      recordFailedLogin(clientId)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' }, 
        { status: 401 }
      )
    }

    // Security: Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    
    if (!isValidPassword) {
      recordFailedLogin(clientId)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' }, 
        { status: 401 }
      )
    }

    // Security: Clear failed attempts on successful login
    clearFailedLogins(clientId)

    // Create JWT tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.profile.role
    }

    const accessToken = jwt.sign(
      tokenPayload, 
      JWT_SECRET, 
      { 
        expiresIn: '15m',
        issuer: 'shopify-automation-platform',
        audience: 'shopify-automation-users'
      }
    )

    const refreshToken = jwt.sign(
      { userId: user.id }, 
      JWT_SECRET, 
      { 
        expiresIn: remember ? '30d' : '7d',
        issuer: 'shopify-automation-platform',
        audience: 'shopify-automation-refresh'
      }
    )

    // Response data (excluding sensitive info)
    const responseData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile.fullName,
        role: user.profile.role,
        businessName: user.profile.businessName,
        emailVerified: user.profile.emailVerified
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900 // 15 minutes
      }
    }

    // Security: Set secure headers
    const response = NextResponse.json(responseData, { status: 200 })
    
    // Optional: Set httpOnly cookies for web clients
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: remember ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 days or 7 days
    })

    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    // Record as failed attempt on server error (prevents timing attacks)
    const clientId = getClientIdentifier(request)
    recordFailedLogin(clientId)
    
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' }, 
      { status: 500 }
    )
  }
}

// Security: Only allow POST for login
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}