import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { registrationBaseSchema } from '@/lib/validation/auth'

// Security: Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

// Security: Request validation schema
const registerRequestSchema = registrationBaseSchema.extend({
  deviceId: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional()
})

function getRateLimit(identifier: string): { allowed: boolean, remaining: number } {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  // Clean old entries
  for (const [key, value] of rateLimitMap.entries()) {
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

function getClientIdentifier(request: NextRequest): string {
  // Use IP address as primary identifier
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip
}

function validateSecurityHeaders(request: NextRequest): { valid: boolean, errors: string[] } {
  const errors: string[] = []
  
  // Check Content-Type
  const contentType = request.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    errors.push('Invalid Content-Type header')
  }
  
  // In production, also validate:
  // - X-API-Key header
  // - X-Request-ID for tracking
  // - Origin header for CORS
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security: Validate headers
    const headerValidation = validateSecurityHeaders(request)
    if (!headerValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request headers',
          details: headerValidation.errors 
        }, 
        { status: 400 }
      )
    }

    // Security: Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimit = getRateLimit(clientId)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: 900 // 15 minutes in seconds
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': '900',
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Security: Input validation with Zod
    const validation = registerRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
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
      email, 
      password, 
      role, 
      businessStage, 
      productCategory, 
      businessName 
    } = validation.data

    // Security: Check if email already exists (in production, check database)
    // For demo, we'll simulate this check
    if (email === 'existing@example.com') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An account with this email already exists' 
        }, 
        { status: 409 }
      )
    }

    // Security: Hash password with bcrypt
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Security: Sanitize inputs (remove any potential XSS)
    const sanitizedData = {
      fullName: fullName.trim().replace(/[<>]/g, ''),
      email: email.toLowerCase().trim(),
      businessName: businessName?.trim().replace(/[<>]/g, '') || null,
      role,
      businessStage,
      productCategory
    }

    // In production, save to database:
    /*
    const user = await db.users.create({
      data: {
        email: sanitizedData.email,
        passwordHash: hashedPassword,
        profile: {
          create: {
            fullName: sanitizedData.fullName,
            businessName: sanitizedData.businessName,
            role: sanitizedData.role,
            businessStage: sanitizedData.businessStage,
            productCategory: sanitizedData.productCategory,
            emailVerified: false
          }
        }
      }
    })
    
    // Send verification email
    await sendVerificationEmail(user.email, user.id)
    */

    // For demo, simulate user creation
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Security: Don't return sensitive information
    const response = {
      success: true,
      message: 'Account created successfully',
      user: {
        id: userId,
        email: sanitizedData.email,
        fullName: sanitizedData.fullName,
        role: sanitizedData.role,
        emailVerified: false
      },
      nextSteps: [
        'Check your email for verification link',
        'Complete your store setup',
        'Start building your online presence'
      ]
    }

    // Security: Set secure headers
    const headers = {
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block'
    }

    return NextResponse.json(response, { 
      status: 201,
      headers 
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Security: Don't expose internal errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }, 
      { status: 500 }
    )
  }
}

// Security: Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' }, 
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' }, 
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' }, 
    { status: 405 }
  )
}