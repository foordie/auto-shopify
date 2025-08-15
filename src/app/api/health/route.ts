import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/database'

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {} as any
  }

  try {
    // Check database connection
    const supabase = createRouteClient()
    const { error: dbError } = await supabase.from('profiles').select('count').limit(1)
    
    healthCheck.services.database = {
      status: dbError ? 'unhealthy' : 'healthy',
      error: dbError?.message,
      responseTime: Date.now() - new Date(healthCheck.timestamp).getTime()
    }

    // Check Shopify API availability
    if (process.env.SHOPIFY_PARTNER_API_KEY) {
      try {
        const shopifyStart = Date.now()
        const response = await fetch('https://partners.shopify.com/api/2023-07/graphql.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOPIFY_PARTNER_API_KEY
          },
          body: JSON.stringify({
            query: '{ currentAppInstallation { id } }'
          })
        })
        
        healthCheck.services.shopify = {
          status: response.ok ? 'healthy' : 'unhealthy',
          httpStatus: response.status,
          responseTime: Date.now() - shopifyStart
        }
      } catch (error: any) {
        healthCheck.services.shopify = {
          status: 'unhealthy',
          error: error.message,
          responseTime: null
        }
      }
    } else {
      healthCheck.services.shopify = {
        status: 'not_configured',
        error: 'Shopify API credentials not provided'
      }
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    healthCheck.services.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'degraded',
      missingVariables: missingEnvVars.length > 0 ? missingEnvVars : undefined
    }

    // Determine overall status
    const services = Object.values(healthCheck.services)
    const unhealthyServices = services.filter((service: any) => service.status === 'unhealthy')
    const degradedServices = services.filter((service: any) => service.status === 'degraded' || service.status === 'not_configured')

    if (unhealthyServices.length > 0) {
      healthCheck.status = 'unhealthy'
    } else if (degradedServices.length > 0) {
      healthCheck.status = 'degraded'
    }

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error.message,
      services: {
        application: {
          status: 'unhealthy',
          error: 'Critical application error'
        }
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}