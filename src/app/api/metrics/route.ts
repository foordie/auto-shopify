import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient, DatabaseService } from '@/lib/supabase/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    const db = new DatabaseService(supabase)
    
    // Get authenticated user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Collect application metrics
    const [
      { count: totalUsers },
      { count: totalAgencies },
      { count: totalClients },
      { count: totalStores },
      { count: activeJobs },
      { count: completedJobs }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('agencies').select('*', { count: 'exact', head: true }),
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('store_configs').select('*', { count: 'exact', head: true }),
      supabase.from('automation_jobs').select('*', { count: 'exact', head: true }).in('status', ['pending', 'running']),
      supabase.from('automation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    ])

    // Performance metrics from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { count: storesCreatedToday } = await supabase
      .from('store_configs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday)
      .eq('status', 'completed')

    const { count: jobsCompletedToday } = await supabase
      .from('automation_jobs')
      .select('*', { count: 'exact', head: true })
      .gte('completed_at', yesterday)
      .eq('status', 'completed')

    // Error metrics
    const { count: failedJobs } = await supabase
      .from('automation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', yesterday)

    // Average job completion time (for completed jobs today)
    const { data: completedJobsToday } = await supabase
      .from('automation_jobs')
      .select('created_at, completed_at')
      .eq('status', 'completed')
      .gte('completed_at', yesterday)
      .not('completed_at', 'is', null)

    let averageCompletionTime = 0
    if (completedJobsToday && completedJobsToday.length > 0) {
      const completionTimes = completedJobsToday.map(job => {
        const created = new Date(job.created_at).getTime()
        const completed = new Date(job.completed_at!).getTime()
        return completed - created
      })
      
      averageCompletionTime = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      averageCompletionTime = Math.round(averageCompletionTime / 1000 / 60) // Convert to minutes
    }

    // System health metrics
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      application: {
        totalUsers: totalUsers || 0,
        totalAgencies: totalAgencies || 0,
        totalClients: totalClients || 0,
        totalStores: totalStores || 0,
        activeJobs: activeJobs || 0,
        completedJobs: completedJobs || 0,
        
        // Daily metrics
        storesCreatedToday: storesCreatedToday || 0,
        jobsCompletedToday: jobsCompletedToday || 0,
        failedJobsToday: failedJobs || 0,
        
        // Performance metrics
        averageCompletionTimeMinutes: averageCompletionTime,
        successRate: (totalStores || 0) > 0 ? Math.round(((totalStores || 0) / ((totalStores || 0) + (totalAgencies || 0) + (activeJobs || 0))) * 100) : 0,
        
        // Growth metrics (simplified for demo)
        userGrowthRate: 0, // Would calculate based on historical data
        storeCreationRate: storesCreatedToday || 0
      },
      system: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      },
      performance: {
        databaseResponseTime: 0, // Would be measured from actual queries
        averageApiResponseTime: 0, // Would be tracked via middleware
        healthCheckStatus: 'healthy' // Would check actual health
      }
    }

    // Add some calculated business metrics
    const businessMetrics = {
      conversionRate: (totalClients || 0) > 0 && (totalStores || 0) > 0 ? ((totalStores || 0) / (totalClients || 1) * 100) : 0,
      agencyUtilization: (totalAgencies || 0) > 0 ? ((totalClients || 0) / (totalAgencies || 1)) : 0,
      automationEfficiency: (activeJobs || 0) > 0 ? (jobsCompletedToday || 0) / ((activeJobs || 0) + (jobsCompletedToday || 1)) * 100 : 100
    }

    const response = {
      ...systemMetrics,
      business: businessMetrics
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, max-age=60', // Cache for 1 minute
        'Content-Type': 'application/json'
      }
    })

  } catch (error: any) {
    console.error('Error collecting metrics:', error)
    
    return NextResponse.json({
      error: 'Failed to collect metrics',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Custom metrics endpoint for specific metric types
export async function POST(request: NextRequest) {
  try {
    const { type, name, value, tags } = await request.json()
    
    // In a production environment, you would send this to your metrics service
    // (e.g., DataDog, New Relic, custom metrics endpoint)
    
    const metric = {
      type,
      name,
      value,
      tags,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }

    // For demo purposes, just log the metric
    console.log('Custom Metric:', metric)
    
    // In production, you might store this in a time-series database
    // or send to an external monitoring service
    
    return NextResponse.json({ 
      success: true, 
      message: 'Metric recorded',
      metric 
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to record metric',
      details: error.message
    }, { status: 400 })
  }
}