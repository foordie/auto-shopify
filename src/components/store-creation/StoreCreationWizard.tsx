'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-provider'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import BusinessInfoForm from './BusinessInfoForm'
// import StoreConfigForm from './StoreConfigForm'
// import DesignPreferencesForm from './DesignPreferencesForm'
// import FeaturesSelectionForm from './FeaturesSelectionForm'
// import ReviewAndSubmitForm from './ReviewAndSubmitForm'
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
          <StoreConfigForm
            initialData={storeData.storeConfig}
            onSubmit={(data) => {
              handleStepData({ storeConfig: data })
              nextStep()
            }}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <DesignPreferencesForm
            initialData={storeData.designPreferences}
            onSubmit={(data) => {
              handleStepData({ designPreferences: data })
              nextStep()
            }}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <FeaturesSelectionForm
            initialData={storeData.features}
            onSubmit={(data) => {
              handleStepData({ features: data })
              nextStep()
            }}
            onBack={prevStep}
          />
        )
      case 5:
        return (
          <ReviewAndSubmitForm
            storeData={storeData}
            onBack={prevStep}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
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