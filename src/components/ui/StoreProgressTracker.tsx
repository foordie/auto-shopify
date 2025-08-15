'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertCircle,
  Package,
  Palette,
  Globe,
  Settings,
  Zap
} from 'lucide-react'

interface StoreProgress {
  setupComplete: number
  stepsCompleted: string[]
  nextStep: string
}

interface StoreProgressTrackerProps {
  storeId: string
  initialProgress?: StoreProgress
  autoRefresh?: boolean
  refreshInterval?: number
  onComplete?: () => void
  showDetailed?: boolean
  className?: string
}

const PROGRESS_STEPS = [
  {
    id: 'store_creation',
    label: 'Creating Store',
    icon: Package,
    description: 'Setting up your Shopify store'
  },
  {
    id: 'theme_setup',
    label: 'Theme Setup',
    icon: Palette,
    description: 'Applying your design preferences'
  },
  {
    id: 'product_creation',
    label: 'Product Creation',
    icon: Package,
    description: 'Adding your initial products'
  },
  {
    id: 'domain_configuration',
    label: 'Domain Setup',
    icon: Globe,
    description: 'Configuring your store domain'
  },
  {
    id: 'final_configuration',
    label: 'Final Setup',
    icon: Settings,
    description: 'Completing store configuration'
  },
  {
    id: 'store_launch',
    label: 'Store Launch',
    icon: Zap,
    description: 'Activating your store'
  }
]

export function StoreProgressTracker({
  storeId,
  initialProgress,
  autoRefresh = true,
  refreshInterval = 2000,
  onComplete,
  showDetailed = true,
  className = ''
}: StoreProgressTrackerProps) {
  const [progress, setProgress] = useState<StoreProgress | null>(initialProgress || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch progress from API
  const fetchProgress = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const response = await fetch(`/api/stores/${storeId}/progress`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch progress')
      }

      const data = await response.json()
      if (data.success) {
        setProgress(data.progress)
        
        // Check if store creation is complete
        if (data.progress.setupComplete >= 100 && onComplete) {
          onComplete()
        }
      } else {
        setError(data.error || 'Failed to fetch progress')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh progress
  useEffect(() => {
    if (!autoRefresh || !storeId) return

    fetchProgress()
    
    const interval = setInterval(() => {
      if (progress?.setupComplete !== 100) {
        fetchProgress()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [storeId, autoRefresh, refreshInterval, progress?.setupComplete])

  // Get step status
  const getStepStatus = (stepId: string): 'completed' | 'active' | 'pending' => {
    if (!progress) return 'pending'
    
    if (progress.stepsCompleted.includes(stepId)) {
      return 'completed'
    }
    
    if (progress.nextStep === stepId) {
      return 'active'
    }
    
    return 'pending'
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Progress Tracking Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
          <span className="text-sm text-gray-600">Loading progress...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Store Creation Progress</h3>
          <span className="text-sm font-medium text-gray-600">
            {progress.setupComplete}% Complete
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.setupComplete}%` }}
          />
        </div>
        
        {progress.nextStep && (
          <p className="text-sm text-gray-600 mt-2">
            Next: {progress.nextStep.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        )}
      </div>

      {/* Detailed Steps */}
      {showDetailed && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Setup Steps</h4>
          
          {PROGRESS_STEPS.map((step, index) => {
            const status = getStepStatus(step.id)
            const Icon = step.icon
            
            return (
              <div key={step.id} className="flex items-center gap-4">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${status === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : status === 'active'
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-300 bg-gray-50 text-gray-400'}
                `}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : status === 'active' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'active' ? 'text-primary-700' :
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
                
                <div className="flex items-center">
                  {status === 'completed' && (
                    <span className="text-xs text-green-600 font-medium">✓ Done</span>
                  )}
                  {status === 'active' && (
                    <span className="text-xs text-primary-600 font-medium">In Progress</span>
                  )}
                  {status === 'pending' && (
                    <span className="text-xs text-gray-400">Pending</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {progress.setupComplete === 100 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Store Creation Complete!</h3>
              <p className="text-sm text-green-700">Your store is ready and live.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}