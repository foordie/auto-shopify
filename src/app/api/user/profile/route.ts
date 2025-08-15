import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Security: JWT secret (in production, use proper env vars)
const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-change-in-production'

// Security: Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT_MAX = 15
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

// Profile update validation schema
const profileUpdateSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  businessName: z.string()
    .max(100, 'Business name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s&.,'-]*$/, 'Business name contains invalid characters')
    .optional(),
  role: z.enum([
    'first_time_builder',
    'aspiring_entrepreneur',
    'small_business_owner',
    'side_hustle_starter',
    'creative_professional'
  ]).optional(),
  productCategory: z.enum([
    'fashion_style',
    'handmade_crafts',
    'electronics_gadgets',
    'health_wellness',
    'home_living',
    'food_beverage',
    'art_collectibles',
    'sports_outdoors',
    'books_education',
    'not_sure_yet'
  ]).optional(),
  businessStage: z.enum([
    'just_an_idea',
    'have_products',
    'selling_elsewhere',
    'expanding_online'
  ]).optional(),
  currentPassword: z.string().min(1, 'Current password is required').optional(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .optional()
}).refine((data) => {
  // If newPassword is provided, currentPassword must also be provided
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  return true
}, {
  message: 'Current password is required when changing password',
  path: ['currentPassword']
})

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip
}

function checkRateLimit(identifier: string): { allowed: boolean, remaining: number } {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  // Clean old entries
  const entries = Array.from(rateLimitMap.entries())
  for (const [key, value] of entries) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }
  
  const current = rateLimitMap.get(identifier)
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }
  
  if (current.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }
  
  current.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - current.count }
}

function verifyJWT(request: NextRequest): { valid: boolean, userId?: string, email?: string, error?: string } {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    return { valid: true, userId: decoded.userId, email: decoded.email }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' }
    }
    return { valid: false, error: 'Invalid token' }
  }
}

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    // Security: Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimit = checkRateLimit(clientId)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: { 'Retry-After': '900' }
        }
      )
    }

    // Security: JWT authentication
    const auth = verifyJWT(request)
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    // In production, query database for user profile
    // For demo, return mock user data
    const mockUser = {
      id: auth.userId,
      email: auth.email || 'demo@example.com',
      fullName: 'Demo User',
      businessName: 'My Demo Store',
      role: 'aspiring_entrepreneur',
      productCategory: 'handmade_crafts',
      businessStage: 'have_products',
      emailVerified: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:22:00Z',
      preferences: {
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        theme: 'light'
      },
      stats: {
        storesCreated: 1,
        activeStores: 1,
        accountAge: '2 days'
      }
    }

    const response = {
      success: true,
      user: mockUser
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve profile' },
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Security: Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimit = checkRateLimit(clientId)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: { 'Retry-After': '900' }
        }
      )
    }

    // Security: JWT authentication
    const auth = verifyJWT(request)
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = profileUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid profile data',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }, 
        { status: 400 }
      )
    }

    const { 
      fullName, 
      businessName, 
      role, 
      productCategory, 
      businessStage, 
      currentPassword, 
      newPassword 
    } = validation.data

    // Security: Sanitize inputs
    const sanitizedData = {
      fullName: fullName?.trim().replace(/[<>]/g, ''),
      businessName: businessName?.trim().replace(/[<>]/g, ''),
      role,
      productCategory,
      businessStage
    }

    // Handle password change if requested
    let passwordUpdated = false
    if (newPassword && currentPassword) {
      // In production, verify current password against database
      // For demo, simulate password verification
      const mockCurrentPasswordHash = await bcrypt.hash('password123', 12)
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, mockCurrentPasswordHash)
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12)
      passwordUpdated = true
      
      // In production, update password in database
      /*
      await db.users.update({
        where: { id: auth.userId },
        data: { passwordHash: newPasswordHash }
      })
      */
    }

    // In production, update profile in database
    /*
    const updatedUser = await db.users.update({
      where: { id: auth.userId },
      data: {
        profile: {
          update: sanitizedData
        }
      },
      include: {
        profile: true
      }
    })
    */

    // For demo, simulate profile update
    const updatedProfile = {
      id: auth.userId,
      email: auth.email,
      ...sanitizedData,
      emailVerified: true,
      updatedAt: new Date().toISOString()
    }

    const response = {
      success: true,
      message: passwordUpdated ? 'Profile and password updated successfully' : 'Profile updated successfully',
      user: updatedProfile
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// Security: Only allow GET and PUT
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}