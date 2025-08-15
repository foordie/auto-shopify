import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Security: JWT secret (in production, use proper env vars)
const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-change-in-production'

// Security: Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

// Store creation/update validation schema
const storesSchema = z.object({
  name: z.string()
    .min(1, 'Store name is required')
    .max(100, 'Store name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s&.,'-]*$/, 'Store name contains invalid characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z.enum([
    'fashion_style',
    'handmade_crafts', 
    'electronics_gadgets',
    'health_wellness',
    'home_living',
    'food_beverage',
    'art_collectibles',
    'sports_outdoors',
    'books_education',
    'other'
  ]),
  theme: z.string()
    .max(50, 'Theme name too long')
    .optional(),
  customDomain: z.string()
    .max(253, 'Domain name too long')
    .regex(/^[a-zA-Z0-9.-]*$/, 'Invalid domain format')
    .optional()
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

// GET /api/stores - List user's stores
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

    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50
    const offset = parseInt(searchParams.get('offset') || '0')

    // In production, query database for user's stores
    // For demo, return mock data
    const mockStores = [
      {
        id: 'store_demo_123',
        name: 'My First Store',
        description: 'A demo store for testing',
        category: 'handmade_crafts',
        status: 'draft',
        progress: {
          setupComplete: 45,
          stepsCompleted: ['basic_info', 'theme_selection'],
          nextStep: 'product_import'
        },
        domain: 'my-first-store.myshopify.com',
        customDomain: null,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:22:00Z'
      }
    ]

    const response = {
      success: true,
      stores: mockStores,
      totalStores: mockStores.length,
      pagination: {
        limit,
        offset,
        total: mockStores.length
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
    console.error('Store list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve stores' },
      { status: 500 }
    )
  }
}

// POST /api/stores - Create new store
export async function POST(request: NextRequest) {
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
    const validation = storesSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid store data',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }, 
        { status: 400 }
      )
    }

    const { name, description, category, theme, customDomain } = validation.data

    // Security: Sanitize inputs
    const sanitizedData = {
      name: name.trim().replace(/[<>]/g, ''),
      description: description?.trim().replace(/[<>]/g, '') || '',
      category,
      theme: theme?.trim() || 'default',
      customDomain: customDomain?.toLowerCase().trim() || null
    }

    // In production, create store in database and initiate Shopify store creation
    /*
    const store = await db.stores.create({
      data: {
        userId: auth.userId,
        name: sanitizedData.name,
        description: sanitizedData.description,
        category: sanitizedData.category,
        theme: sanitizedData.theme,
        customDomain: sanitizedData.customDomain,
        status: 'creating',
        progress: {
          setupComplete: 0,
          stepsCompleted: [],
          nextStep: 'shopify_setup'
        }
      }
    })

    // Trigger automated Shopify store creation
    await createShopifyStore({
      storeId: store.id,
      userId: auth.userId,
      storeData: sanitizedData
    })
    */

    // For demo, simulate store creation
    const newStore = {
      id: `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: sanitizedData.name,
      description: sanitizedData.description,
      category: sanitizedData.category,
      status: 'creating',
      progress: {
        setupComplete: 10,
        stepsCompleted: ['basic_info'],
        nextStep: 'shopify_setup',
        estimatedCompletion: '15-20 minutes'
      },
      domain: `${sanitizedData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.myshopify.com`,
      customDomain: sanitizedData.customDomain,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = {
      success: true,
      message: 'Store creation initiated successfully',
      store: newStore,
      nextSteps: [
        'Shopify store setup in progress',
        'Theme customization will begin shortly',
        'You will receive updates via email and dashboard'
      ]
    }

    return NextResponse.json(response, {
      status: 201,
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    })

  } catch (error) {
    console.error('Store creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create store' },
      { status: 500 }
    )
  }
}

// Security: Only allow GET and POST methods for mobile integration
// Store updates will be handled through specialized endpoints

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}