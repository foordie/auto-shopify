import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Security: JWT secret (in production, use proper env vars)
const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-change-in-production'

// Security: Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

// Progress update validation schema
const progressUpdateSchema = z.object({
  step: z.string().min(1, 'Step name is required'),
  status: z.enum(['started', 'in_progress', 'completed', 'failed']),
  progress: z.number().min(0).max(100).optional(),
  message: z.string().max(500).optional(),
  metadata: z.record(z.any()).optional()
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

function verifyJWT(request: NextRequest): { valid: boolean, userId?: string, error?: string } {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    return { valid: true, userId: decoded.userId }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' }
    }
    return { valid: false, error: 'Invalid token' }
  }
}

// GET /api/stores/[id]/progress - Get store creation progress
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const storeId = params.id

    // Validate store ID format
    if (!storeId || !/^[a-zA-Z0-9_-]+$/.test(storeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid store ID format' },
        { status: 400 }
      )
    }

    // In production, query database for store progress
    // For demo, return mock progress data
    const mockProgress = {
      storeId,
      status: 'in_progress',
      overallProgress: 65,
      currentStep: 'theme_customization',
      estimatedTimeRemaining: '8-12 minutes',
      steps: [
        {
          name: 'basic_info',
          label: 'Basic Store Information',
          status: 'completed',
          progress: 100,
          completedAt: '2024-01-16T10:30:00Z',
          message: 'Store name and basic details configured'
        },
        {
          name: 'shopify_setup',
          label: 'Shopify Store Creation',
          status: 'completed',
          progress: 100,
          completedAt: '2024-01-16T10:35:00Z',
          message: 'Shopify store instance created successfully'
        },
        {
          name: 'theme_selection',
          label: 'Theme Selection & Installation',
          status: 'completed',
          progress: 100,
          completedAt: '2024-01-16T10:42:00Z',
          message: 'Theme "Debut" installed and activated'
        },
        {
          name: 'theme_customization',
          label: 'Theme Customization',
          status: 'in_progress',
          progress: 45,
          startedAt: '2024-01-16T10:43:00Z',
          message: 'Customizing colors, fonts, and layout'
        },
        {
          name: 'product_import',
          label: 'Product Import & Setup',
          status: 'pending',
          progress: 0,
          message: 'Waiting for theme customization to complete'
        },
        {
          name: 'payment_setup',
          label: 'Payment Configuration',
          status: 'pending',
          progress: 0,
          message: 'Will configure payment providers'
        },
        {
          name: 'final_review',
          label: 'Final Review & Activation',
          status: 'pending',
          progress: 0,
          message: 'Final checks before store goes live'
        }
      ],
      nextActions: [
        'Theme customization in progress',
        'Product catalog will be set up next',
        'Payment setup will follow'
      ],
      createdAt: '2024-01-16T10:30:00Z',
      updatedAt: new Date().toISOString()
    }

    const response = {
      success: true,
      progress: mockProgress
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve progress' },
      { status: 500 }
    )
  }
}

// POST /api/stores/[id]/progress - Update progress (for internal automation use)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const storeId = params.id

    // Validate store ID format
    if (!storeId || !/^[a-zA-Z0-9_-]+$/.test(storeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid store ID format' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = progressUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid progress data',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }, 
        { status: 400 }
      )
    }

    const { step, status, progress, message, metadata } = validation.data

    // Security: Sanitize inputs
    const sanitizedData = {
      step: step.trim(),
      status,
      progress: progress || 0,
      message: message?.trim().replace(/[<>]/g, '') || '',
      metadata: metadata || {}
    }

    // In production, update progress in database and trigger notifications
    /*
    await db.storeProgress.upsert({
      where: {
        storeId_step: {
          storeId,
          step: sanitizedData.step
        }
      },
      update: {
        status: sanitizedData.status,
        progress: sanitizedData.progress,
        message: sanitizedData.message,
        metadata: sanitizedData.metadata,
        updatedAt: new Date()
      },
      create: {
        storeId,
        step: sanitizedData.step,
        status: sanitizedData.status,
        progress: sanitizedData.progress,
        message: sanitizedData.message,
        metadata: sanitizedData.metadata
      }
    })

    // Send real-time updates to user
    await sendProgressUpdate(storeId, sanitizedData)
    */

    // For demo, simulate progress update
    const response = {
      success: true,
      message: 'Progress updated successfully',
      update: {
        storeId,
        step: sanitizedData.step,
        status: sanitizedData.status,
        progress: sanitizedData.progress,
        message: sanitizedData.message,
        updatedAt: new Date().toISOString()
      }
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
    console.error('Progress update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// Security: Only allow GET and POST
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}