'use client'

import { useState, useEffect } from 'react'
import { useAuth, withAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'
import { DemoDataBadge, DemoWarningBanner } from '@/components/ui/DemoDataBadge'
import { storesClient, Store } from '@/lib/api/stores-client'
import { StoreProgressTracker } from '@/components/ui/StoreProgressTracker'
import { 
  Plus, 
  Store as StoreIcon, 
  TrendingUp, 
  Clock, 
  Users, 
  MoreVertical,
  Eye,
  Settings,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'

// Using Store interface from API client

function StoreCard({ store, onProgressExpand }: { store: Store; onProgressExpand?: (storeId: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'creating': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />
      case 'creating': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      case 'draft': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="relative card p-6 hover:shadow-md transition-shadow border border-red-200 bg-red-50/30 rounded-lg">
      <div className="absolute -top-2 -right-2 z-10">
        <DemoDataBadge type="data" label="MOCK STORE" />
      </div>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StoreIcon className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">{store.name}</h3>
          </div>
          
          {store.domain && (
            <p className="text-sm text-gray-500 mb-3">{store.domain}</p>
          )}
          
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(store.status)}`}>
            {getStatusIcon(store.status)}
            {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
          </div>
          
          {store.status === 'creating' && store.progress && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Setup Progress</span>
                <span>{store.progress.setupComplete}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${store.progress.setupComplete}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {store.progress.nextStep?.replace(/_/g, ' ')}
              </p>
            </div>
          )}
          
          {store.progress && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Setup Progress</span>
                <span className="font-medium">{store.progress.setupComplete}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${store.progress.setupComplete}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Next: {store.progress.nextStep?.replace(/_/g, ' ')}
              </p>
            </div>
          )}
          
          {store.status === 'active' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Store is live and ready!</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        {store.status === 'active' && store.domain && (
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
            <Eye className="h-3 w-3" />
            View Store
          </button>
        )}
        {store.status === 'creating' && onProgressExpand && (
          <button 
            onClick={() => onProgressExpand(store.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
          >
            <Eye className="h-3 w-3" />
            View Progress
          </button>
        )}
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
          <Settings className="h-3 w-3" />
          Settings
        </button>
        {store.status === 'draft' && (
          <Link 
            href="/store-creation" 
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-md"
          >
            <ExternalLink className="h-3 w-3" />
            Continue Setup
          </Link>
        )}
      </div>
    </div>
  )
}

function DashboardPage() {
  const { user, logout } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProgressStore, setExpandedProgressStore] = useState<string | null>(null)

  const loadStores = async () => {
    setLoading(true)
    try {
      const result = await storesClient.getStores()
      if (result.success) {
        setStores(result.stores)
      } else {
        console.error('Failed to load stores:', result.error)
      }
    } catch (error) {
      console.error('Error loading stores:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStores()
  }, [])

  const activeStores = stores.filter(s => s.status === 'active').length
  const storesInProgress = stores.filter(s => s.status === 'creating').length
  const completedStores = stores.filter(s => s.status === 'active').length
  const totalStores = stores.length

  const handleProgressExpand = (storeId: string) => {
    setExpandedProgressStore(expandedProgressStore === storeId ? null : storeId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                Shopify Automation Platform
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  Welcome back, {user?.fullName}
                </p>
                <p className="text-gray-500">
                  {user?.role === 'aspiring_entrepreneur' ? 'Aspiring Entrepreneur' :
                   user?.role === 'first_time_builder' ? 'Store Builder' :
                   user?.role === 'small_business_owner' ? 'Business Owner' :
                   user?.role === 'side_hustle_starter' ? 'Side Hustle Starter' :
                   user?.role === 'creative_professional' ? 'Creative Professional' :
                   'Store Builder'}
                </p>
              </div>
              <button 
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DemoWarningBanner 
          message="All store data, statistics, and metrics shown below are simulated for demo purposes. Replace with real database integration."
          className="mb-6"
        />
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <StoreIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Stores</p>
                <p className="text-2xl font-bold text-gray-900">{activeStores}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900">{totalStores}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{storesInProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedStores}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Stores</h2>
            <p className="text-gray-600">Create and manage your online business</p>
          </div>
          
          <Link
            href="/store-creation"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Store
          </Link>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} onProgressExpand={handleProgressExpand} />
              ))}
            </div>
            
            {/* Expanded Progress View */}
            {expandedProgressStore && (
              <div className="mt-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Store Creation Progress</h3>
                    <button
                      onClick={() => setExpandedProgressStore(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  
                  <StoreProgressTracker
                    storeId={expandedProgressStore}
                    autoRefresh={true}
                    onComplete={() => {
                      // Refresh stores list when complete
                      loadStores()
                      setExpandedProgressStore(null)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)