'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-provider'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import BusinessInfoForm from './BusinessInfoForm'
import { DemoDataBadge } from '@/components/ui/DemoDataBadge'
import ProgressTracker from './ProgressTracker'

interface StoreData {
  businessInfo?: {
    businessName: string
    businessDescription: string
    businessType: string
    targetAudience: string
    contactEmail: string
    contactPhone?: string
  }
  storeConfig?: {
    storeName: string
    domainPreference: string
    currency: string
    timezone: string
    productCategories: string[]
    estimatedProducts: number
    priceRangeMin: number
    priceRangeMax: number
  }
  designPreferences?: {
    themePreference: string
    colorScheme: {
      primary: string
      secondary: string
      accent: string
    }
    brandingAssets?: {
      logo?: File | null
      favicon?: File | null
    }
  }
  features?: {
    paymentMethods: string[]
    shippingOptions: string[]
    marketingFeatures: string[]
    integrations: string[]
  }
}

const STEPS = [
  { id: 1, name: 'Business Info', component: 'business' },
  { id: 2, name: 'Store Config', component: 'config' },
  { id: 3, name: 'Design', component: 'design' },
  { id: 4, name: 'Features', component: 'features' },
  { id: 5, name: 'Review', component: 'review' }
]

export default function StoreCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [storeData, setStoreData] = useState<StoreData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, profile } = useAuth()
  const router = useRouter()

  const handleStepData = (stepData: any) => {
    setStoreData(prev => ({
      ...prev,
      ...stepData
    }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalSubmit = async () => {
    if (!user || !profile) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)

    try {
      // Submit store creation request
      const response = await fetch('/api/stores/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...storeData,
          userId: user.id,
          agencyId: profile.id // In a real app, this would be the user's agency ID
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create store')
      }

      const result = await response.json()
      
      // Redirect to job tracking page
      router.push(`/dashboard/jobs/${result.jobId}`)
      
    } catch (error) {
      console.error('Error creating store:', error)
      // Handle error - could show toast notification
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessInfoForm
            initialData={storeData.businessInfo}
            onSubmit={(data) => {
              handleStepData({ businessInfo: data })
              nextStep()
            }}
          />
        )
      case 2:
        return (
          <div className="space-y-6">
            <DemoDataBadge type="process" label="STORE CONFIG FORM - COMING SOON" />
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Store Configuration</h3>
              <p className="text-gray-600 mb-6">Configure your store settings, domain, and basic preferences</p>
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={() => {
                    handleStepData({ storeConfig: { storeName: 'Demo Store', currency: 'USD' } })
                    nextStep()
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <DemoDataBadge type="process" label="DESIGN PREFERENCES - COMING SOON" />
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Design Preferences</h3>
              <p className="text-gray-600 mb-6">Choose your theme, colors, and branding preferences</p>
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={() => {
                    handleStepData({ designPreferences: { themePreference: 'modern', colorScheme: { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' } } })
                    nextStep()
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <DemoDataBadge type="process" label="FEATURES SELECTION - COMING SOON" />
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Features Selection</h3>
              <p className="text-gray-600 mb-6">Select payment methods, shipping options, and integrations</p>
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={() => {
                    handleStepData({ features: { paymentMethods: ['stripe', 'paypal'], shippingOptions: ['standard'], marketingFeatures: ['seo'], integrations: [] } })
                    nextStep()
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <DemoDataBadge type="process" label="REVIEW & SUBMIT - DEMO" />
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Store Configuration</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                  <p className="text-sm text-gray-600">{storeData.businessInfo?.businessName || 'Not provided'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Store Configuration</h4>
                  <p className="text-sm text-gray-600">{storeData.storeConfig?.storeName || 'Demo Store'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Design & Features</h4>
                  <p className="text-sm text-gray-600">Theme: {storeData.designPreferences?.themePreference || 'Modern'}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Store...' : 'Create Store'}
                  {!isSubmitting && <Check className="w-4 h-4 ml-2" />}
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Your Shopify Store
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Follow these steps to set up your automated store creation
          </p>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={currentStep - 1}
          className="mb-8"
        />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Step Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Step {currentStep}: {STEPS[currentStep - 1]?.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {currentStep === 1 && "Tell us about your business"}
                  {currentStep === 2 && "Configure your store settings"}
                  {currentStep === 3 && "Choose your design preferences"}
                  {currentStep === 4 && "Select features and integrations"}
                  {currentStep === 5 && "Review and confirm your settings"}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {currentStep} of {STEPS.length}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="px-6 py-8">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Need help?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Our automated system will create your complete Shopify store based on your preferences. 
                  This typically takes 15-20 minutes and includes products, theme customization, and basic setup.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    className="bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-100"
                  >
                    View Documentation
                  </button>
                  <button
                    type="button"
                    className="ml-3 bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-100"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}