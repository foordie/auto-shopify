'use client'

import { useState } from 'react'
import { useAuth, withAuth } from '@/lib/auth/auth-context'
import { storesClient } from '@/lib/api/stores-client'
import { useRouter } from 'next/navigation'
import { DemoDataBadge, DemoWarningBanner } from '@/components/ui/DemoDataBadge'
import { StoreProgressTracker } from '@/components/ui/StoreProgressTracker'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Store, 
  Palette, 
  Package, 
  CreditCard,
  Globe,
  Loader2,
  CheckCircle,
  Upload,
  Zap
} from 'lucide-react'

interface StoreDetails {
  name: string
  description: string
  industry: string
  targetAudience: string
  domain?: string
}

interface DesignPreferences {
  theme: string
  primaryColor: string
  logoUrl?: string
  brandStyle: string
}

interface ProductSetup {
  productCategories: string[]
  generateSampleProducts: boolean
  productCount: number
}

const INDUSTRIES = [
  'Fashion & Apparel',
  'Electronics & Technology',
  'Health & Beauty',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Food & Beverage',
  'Jewelry & Accessories',
  'Art & Crafts',
  'Other'
]

const THEMES = [
  { id: 'modern', name: 'Modern Minimal', preview: 'Clean, professional look with white space' },
  { id: 'bold', name: 'Bold & Vibrant', preview: 'Eye-catching colors and dynamic layouts' },
  { id: 'classic', name: 'Classic Elegant', preview: 'Timeless design with serif fonts' },
  { id: 'tech', name: 'Tech Forward', preview: 'Sleek, high-tech aesthetic' }
]

const BRAND_STYLES = [
  'Professional',
  'Friendly',
  'Luxury',
  'Playful',
  'Minimalist',
  'Bold'
]

function StoreCreationWizard() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [creationComplete, setCreationComplete] = useState(false)
  const [createdStoreId, setCreatedStoreId] = useState<string | null>(null)
  
  const [storeDetails, setStoreDetails] = useState<StoreDetails>({
    name: '',
    description: '',
    industry: '',
    targetAudience: ''
  })
  
  const [designPreferences, setDesignPreferences] = useState<DesignPreferences>({
    theme: '',
    primaryColor: '#3B82F6',
    brandStyle: ''
  })
  
  const [productSetup, setProductSetup] = useState<ProductSetup>({
    productCategories: [],
    generateSampleProducts: true,
    productCount: 10
  })

  const steps = [
    { number: 1, title: 'Store Details', icon: Store },
    { number: 2, title: 'Design & Branding', icon: Palette },
    { number: 3, title: 'Products & Inventory', icon: Package },
    { number: 4, title: 'Launch Configuration', icon: Globe }
  ]

  const handleStoreDetailsChange = (field: keyof StoreDetails, value: string) => {
    setStoreDetails(prev => ({ ...prev, [field]: value }))
  }

  const handleDesignChange = (field: keyof DesignPreferences, value: string) => {
    setDesignPreferences(prev => ({ ...prev, [field]: value }))
  }

  const handleProductChange = (field: keyof ProductSetup, value: any) => {
    setProductSetup(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryToggle = (category: string) => {
    setProductSetup(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }))
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return storeDetails.name && storeDetails.description && storeDetails.industry && storeDetails.targetAudience
      case 2:
        return designPreferences.theme && designPreferences.brandStyle
      case 3:
        return productSetup.productCategories.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const handleCreateStore = async () => {
    setIsCreating(true)
    
    try {
      // Map form data to API format
      const storeData = {
        name: storeDetails.name,
        description: storeDetails.description,
        category: storeDetails.industry,
        theme: designPreferences.theme,
        customDomain: storeDetails.domain
      }

      const result = await storesClient.createStore(storeData)
      
      if (result.success) {
        // Set store ID for progress tracking
        if (result.store?.id) {
          setCreatedStoreId(result.store.id)
        }
        setCreationComplete(true)
      } else {
        // Handle API errors
        console.error('Store creation failed:', result.error)
        setIsCreating(false)
        // You could add error state handling here
      }
    } catch (error) {
      console.error('Store creation error:', error)
      setIsCreating(false)
      // You could add error state handling here
    }
  }

  if (creationComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-gray-900">Creating Your Store</h1>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Store Creation Started!
            </h2>
            <p className="text-gray-600">
              Your store "{storeDetails.name}" is being set up. Track the progress below.
            </p>
          </div>
          
          {createdStoreId ? (
            <StoreProgressTracker
              storeId={createdStoreId}
              autoRefresh={true}
              onComplete={() => {
                // Redirect to dashboard when complete
                setTimeout(() => {
                  router.push('/dashboard')
                }, 3000)
              }}
              className="max-w-2xl mx-auto"
            />
          ) : (
            <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-6 w-6 text-primary-500 mr-3" />
                <span className="text-gray-600">Initializing store creation...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Launch Your Online Store</h1>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              const Icon = step.icon
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'border-primary-500 text-primary-500'
                        : 'border-gray-300 text-gray-300'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-8 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your business idea</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's your store name? *
                  </label>
                  <input
                    type="text"
                    value={storeDetails.name}
                    onChange={(e) => handleStoreDetailsChange('name', e.target.value)}
                    className="input"
                    placeholder="e.g., Sarah's Fashion Boutique, Mike's Tech Corner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What will you sell? *
                  </label>
                  <textarea
                    value={storeDetails.description}
                    onChange={(e) => handleStoreDetailsChange('description', e.target.value)}
                    rows={3}
                    className="input"
                    placeholder="Tell us about your products and what makes your business special..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    value={storeDetails.industry}
                    onChange={(e) => handleStoreDetailsChange('industry', e.target.value)}
                    className="input"
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who are your ideal customers? *
                  </label>
                  <input
                    type="text"
                    value={storeDetails.targetAudience}
                    onChange={(e) => handleStoreDetailsChange('targetAudience', e.target.value)}
                    className="input"
                    placeholder="e.g., Busy parents, College students, Fitness enthusiasts"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose your store's look and feel</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Pick a design style that matches your brand *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {THEMES.map(theme => (
                      <div
                        key={theme.id}
                        onClick={() => handleDesignChange('theme', theme.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          designPreferences.theme === theme.id 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-medium text-gray-900 mb-1">{theme.name}</h3>
                        <p className="text-sm text-gray-600">{theme.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={designPreferences.primaryColor}
                      onChange={(e) => handleDesignChange('primaryColor', e.target.value)}
                      className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designPreferences.primaryColor}
                      onChange={(e) => handleDesignChange('primaryColor', e.target.value)}
                      className="input max-w-xs"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Style *
                  </label>
                  <select
                    value={designPreferences.brandStyle}
                    onChange={(e) => handleDesignChange('brandStyle', e.target.value)}
                    className="input"
                  >
                    <option value="">Select a brand style</option>
                    {BRAND_STYLES.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Upload your logo or leave empty to generate one</p>
                    <button className="mt-2 btn btn-secondary">Choose File</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What will you sell?</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Product Categories *
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose all the product types you plan to sell (you can add more later)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Shirts & Tops',
                      'Dresses',
                      'Pants & Jeans',
                      'Shoes',
                      'Accessories',
                      'Electronics',
                      'Home & Garden',
                      'Beauty',
                      'Sports',
                      'Books'
                    ].map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={`p-3 text-sm border rounded-lg transition-colors ${
                          productSetup.productCategories.includes(category)
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="generateSampleProducts"
                    type="checkbox"
                    checked={productSetup.generateSampleProducts}
                    onChange={(e) => handleProductChange('generateSampleProducts', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="generateSampleProducts" className="ml-2 text-sm text-gray-900">
                    Generate sample products to get started quickly
                  </label>
                </div>

                {productSetup.generateSampleProducts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of sample products
                    </label>
                    <select
                      value={productSetup.productCount}
                      onChange={(e) => handleProductChange('productCount', parseInt(e.target.value))}
                      className="input max-w-xs"
                    >
                      <option value={5}>5 products</option>
                      <option value={10}>10 products</option>
                      <option value={20}>20 products</option>
                      <option value={50}>50 products</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready to launch</h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <DemoDataBadge type="process" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-900 mb-2">
                        🔴 Simulated Store Creation Process
                      </h3>
                      <p className="text-red-800 text-sm mb-4">
                        🔴 DEMO: This simulates AI-powered store creation. Replace with real Shopify Partner API integration.
                      </p>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• 🔴 MOCK: Set up Shopify store with chosen theme</li>
                        <li>• 🔴 MOCK: Generate sample products for categories</li>
                        <li>• 🔴 MOCK: Configure payment and shipping settings</li>
                        <li>• 🔴 MOCK: Set up basic SEO and analytics</li>
                        <li>• 🔴 MOCK: Apply branding and design preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Store Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Store Name:</span>
                      <span className="font-medium">{storeDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium">{storeDetails.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Theme:</span>
                      <span className="font-medium">
                        {THEMES.find(t => t.id === designPreferences.theme)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand Style:</span>
                      <span className="font-medium">{designPreferences.brandStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product Categories:</span>
                      <span className="font-medium">{productSetup.productCategories.length} selected</span>
                    </div>
                    {productSetup.generateSampleProducts && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sample Products:</span>
                        <span className="font-medium">{productSetup.productCount} products</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNextStep()}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  canProceedToNextStep()
                    ? 'text-white bg-primary-600 hover:bg-primary-700'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleCreateStore}
                disabled={!canProceedToNextStep() || isCreating}
                className={`flex items-center px-6 py-2 text-sm font-medium rounded-md ${
                  canProceedToNextStep() && !isCreating
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Creating Store...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Create Store
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(StoreCreationWizard)