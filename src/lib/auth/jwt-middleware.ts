import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Security: JWT secret (in production, use proper env vars)
const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-change-in-production'

export interface AuthResult {
  valid: boolean
  userId?: string
  email?: string
  role?: string
  error?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime?: number
}

// Security: Rate limiting maps (in production, use Redis)
const rateLimitMaps = new Map<string, Map<string, { count: number, resetTime: number }>>()

/**
 * Verify JWT token from Authorization header
 */
export function verifyJWT(request: NextRequest): AuthResult {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    return { 
      valid: true, 
      userId: decoded.userId, 
      email: decoded.email,
      role: decoded.role 
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' }
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token format' }
    }
    return { valid: false, error: 'Token verification failed' }
  }
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip.trim()
}

/**
 * Check rate limit for a specific endpoint
 */
export function checkRateLimit(
  identifier: string, 
  endpoint: string,
  maxRequests: number = 10,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Get or create rate limit map for this endpoint
  if (!rateLimitMaps.has(endpoint)) {
    rateLimitMaps.set(endpoint, new Map())
  }
  const endpointMap = rateLimitMaps.get(endpoint)!
  
  // Clean old entries
  const entries = Array.from(endpointMap.entries())
  for (const [key, value] of entries) {
    if (value.resetTime < windowStart) {
      endpointMap.delete(key)
    }
  }
  
  const current = endpointMap.get(identifier)
  if (!current || current.resetTime < windowStart) {
    const resetTime = now + windowMs
    endpointMap.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }
  
  current.count++
  return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime }
}

/**
 * Security headers for API responses
 */
export function getSecurityHeaders(rateLimit?: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }

  if (rateLimit) {
    headers['X-RateLimit-Remaining'] = rateLimit.remaining.toString()
    if (rateLimit.resetTime) {
      headers['X-RateLimit-Reset'] = Math.ceil(rateLimit.resetTime / 1000).toString()
    }
  }

  return headers
}

/**
 * Validate request headers for security
 */
export function validateSecurityHeaders(request: NextRequest): { valid: boolean, errors: string[] } {
  const errors: string[] = []
  
  // Check Content-Type for POST/PUT requests
  const method = request.method
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      errors.push('Invalid Content-Type header')
    }
  }
  
  // In production, also validate:
  // - Origin header for CORS
  // - X-Requested-With for CSRF protection
  // - Custom API key headers if required
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string, maxLength: number = 255): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['\"]/g, (char) => char === '\"' ? '&quot;' : '&#x27;') // Escape quotes
    .substring(0, maxLength) // Limit length
}

/**
 * Generate a new JWT token
 */
export function generateJWT(payload: {
  userId: string
  email: string
  role?: string
}, expiresIn: string = '15m'): string {
  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn,
      issuer: 'shopify-automation-platform',
      audience: 'shopify-automation-users'
    }
  )
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string, remember: boolean = false): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    {
      expiresIn: remember ? '30d' : '7d',
      issuer: 'shopify-automation-platform',
      audience: 'shopify-automation-refresh'
    }
  )
}

/**
 * Middleware function for protecting API routes
 */
export function withAuth(
  handler: (request: NextRequest, auth: AuthResult) => Promise<Response>,
  options: {
    rateLimit?: { max: number, windowMs: number }
    endpoint?: string
  } = {}
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const endpoint = options.endpoint || request.url
      
      // Rate limiting
      if (options.rateLimit) {
        const clientId = getClientIdentifier(request)
        const rateLimit = checkRateLimit(
          clientId, 
          endpoint, 
          options.rateLimit.max, 
          options.rateLimit.windowMs
        )
        
        if (!rateLimit.allowed) {
          const retryAfter = rateLimit.resetTime 
            ? Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
            : 900
            
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Too many requests. Please try again later.'
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': retryAfter.toString(),
                ...getSecurityHeaders(rateLimit)
              }
            }
          )
        }
      }
      
      // Authentication
      const auth = verifyJWT(request)
      if (!auth.valid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: auth.error || 'Authentication failed'
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...getSecurityHeaders()
            }
          }
        )
      }
      
      return await handler(request, auth)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...getSecurityHeaders()
          }
        }
      )
    }
  }
}