'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast, { Toaster } from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight,
  Check,
  Shield,
  Zap,
  Briefcase,
  Target,
  Package,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

import { authClient } from '@/lib/api/auth-client'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  step1Schema, 
  step2Schema, 
  step3Schema,
  getPasswordStrength,
  sanitizeInput,
  type Step1Data,
  type Step2Data, 
  type Step3Data,
  type RegistrationData
} from '@/lib/validation/auth'

// Security: Rate limiting state
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 5 * 60 * 1000 // 5 minutes

interface FormStep {
  title: string
  subtitle: string
  icon: React.ComponentType<any>
  fields: string[]
}

const FORM_STEPS: FormStep[] = [
  {
    title: 'Create Your Account',
    subtitle: 'Start your journey to online success',
    icon: User,
    fields: ['fullName', 'email', 'password', 'confirmPassword']
  },
  {
    title: 'Tell Us About You',
    subtitle: 'Help us personalize your experience',
    icon: Target,
    fields: ['role', 'businessStage']
  },
  {
    title: 'Your Products & Business',
    subtitle: 'What will you be selling?',
    icon: Package,
    fields: ['productCategory', 'businessName']
  }
]

const ROLE_OPTIONS = [
  {
    value: 'first_time_builder',
    label: 'First-time store builder',
    description: 'New to e-commerce and excited to start',
    icon: '🚀'
  },
  {
    value: 'aspiring_entrepreneur',
    label: 'Aspiring entrepreneur', 
    description: 'Have a business idea ready to launch',
    icon: '💡'
  },
  {
    value: 'small_business_owner',
    label: 'Small business owner',
    description: 'Taking my existing business online',
    icon: '🏪'
  },
  {
    value: 'side_hustle_starter',
    label: 'Side hustle starter',
    description: 'Building something on the side',
    icon: '⚡'
  },
  {
    value: 'creative_professional',
    label: 'Creative professional',
    description: 'Artist, designer, or maker selling products',
    icon: '🎨'
  }
]

const BUSINESS_STAGE_OPTIONS = [
  {
    value: 'just_an_idea',
    label: 'Just have an idea',
    description: 'Still planning and researching',
    icon: '💭'
  },
  {
    value: 'have_products',
    label: 'Have products, need a store',
    description: 'Ready to sell but need an online presence',
    icon: '📦'
  },
  {
    value: 'selling_elsewhere',
    label: 'Currently selling elsewhere',
    description: 'Want to expand or move to my own store',
    icon: '🔄'
  },
  {
    value: 'expanding_online',
    label: 'Expanding existing business',
    description: 'Adding online sales to my business',
    icon: '📈'
  }
]

const PRODUCT_CATEGORIES = [
  { value: 'fashion_style', label: 'Fashion & Style', icon: '👗' },
  { value: 'handmade_crafts', label: 'Handmade & Crafts', icon: '🎨' },
  { value: 'electronics_gadgets', label: 'Electronics & Gadgets', icon: '📱' },
  { value: 'health_wellness', label: 'Health & Wellness', icon: '🌿' },
  { value: 'home_living', label: 'Home & Living', icon: '🏠' },
  { value: 'food_beverage', label: 'Food & Beverage', icon: '🍕' },
  { value: 'art_collectibles', label: 'Art & Collectibles', icon: '🖼️' },
  { value: 'sports_outdoors', label: 'Sports & Outdoors', icon: '🏃' },
  { value: 'books_education', label: 'Books & Education', icon: '📚' },
  { value: 'not_sure_yet', label: 'Not sure yet', icon: '🤔' }
]

export default function SecureRegisterPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutEnd, setLockoutEnd] = useState<Date | null>(null)
  
  const router = useRouter()
  const { checkAuth } = useAuth()

  // Security: Check for existing lockout
  useEffect(() => {
    const storedLockout = localStorage.getItem('register_lockout')
    if (storedLockout) {
      const lockoutTime = new Date(storedLockout)
      if (lockoutTime > new Date()) {
        setIsLocked(true)
        setLockoutEnd(lockoutTime)
      } else {
        localStorage.removeItem('register_lockout')
      }
    }
  }, [])

  // Form setup with security validation
  const methods = useForm<RegistrationData>({
    resolver: zodResolver(
      currentStep === 0 ? step1Schema :
      currentStep === 1 ? step2Schema :
      step3Schema
    ),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      businessStage: undefined,
      productCategory: undefined,
      businessName: ''
    }
  })

  const { handleSubmit, watch, formState: { errors, isValid }, setValue } = methods
  const watchedPassword = watch('password', '')

  // Security: Handle rate limiting
  const handleAttemptLockout = () => {
    const newCount = attemptCount + 1
    setAttemptCount(newCount)
    
    if (newCount >= MAX_ATTEMPTS) {
      const lockoutTime = new Date(Date.now() + LOCKOUT_TIME)
      setIsLocked(true)
      setLockoutEnd(lockoutTime)
      localStorage.setItem('register_lockout', lockoutTime.toISOString())
      toast.error(`Too many attempts. Account creation locked for 5 minutes.`)
    }
  }

  const nextStep = async () => {
    const isStepValid = await methods.trigger()
    
    if (isStepValid) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        await handleFinalSubmit()
      }
    } else {
      handleAttemptLockout()
      toast.error('Please fix the errors before continuing')
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalSubmit = async () => {
    if (isLocked) {
      toast.error('Account creation is temporarily locked')
      return
    }

    setIsLoading(true)
    
    try {
      const formData = methods.getValues()
      
      // Security: Sanitize inputs
      const sanitizedData = {
        ...formData,
        fullName: sanitizeInput(formData.fullName),
        email: formData.email.toLowerCase().trim(),
        businessName: formData.businessName ? sanitizeInput(formData.businessName) : ''
      }

      const result = await authClient.register({
        fullName: sanitizedData.fullName,
        email: sanitizedData.email,
        password: sanitizedData.password,
        role: sanitizedData.role,
        productCategory: sanitizedData.productCategory,
        businessStage: sanitizedData.businessStage,
        businessName: sanitizedData.businessName
      })

      if (result.success) {
        // Clear any lockout on success
        localStorage.removeItem('register_lockout')
        setAttemptCount(0)
        
        toast.success('Account created successfully!')
        
        // Refresh authentication state
        await checkAuth()
        router.push('/dashboard')
      } else {
        handleAttemptLockout()
        
        // Show specific field errors if available
        if (result.details && result.details.length > 0) {
          result.details.forEach(detail => {
            toast.error(`${detail.field}: ${detail.message}`)
          })
        } else {
          toast.error(result.error || 'Registration failed')
        }
      }
    } catch (error) {
      handleAttemptLockout()
      toast.error('An unexpected error occurred')
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(watchedPassword)

  // Security: Prevent access if locked
  if (isLocked && lockoutEnd) {
    const timeLeft = Math.ceil((lockoutEnd.getTime() - Date.now()) / 1000)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Account Creation Locked
            </h2>
            <p className="text-gray-600 mb-6">
              Too many failed attempts. Please wait {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} before trying again.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="btn btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <Toaster position="top-right" />
      
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => currentStep > 0 ? prevStep() : router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Secure Registration</span>
            </div>
            
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {FORM_STEPS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4">
            {FORM_STEPS.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${index <= currentStep 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'border-gray-300 text-gray-300'}
                `}>
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                {index < FORM_STEPS.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2 
                    ${index < currentStep ? 'bg-primary-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6 sm:p-8"
              >
                {/* Step header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {React.createElement(FORM_STEPS[currentStep].icon, {
                      className: "h-12 w-12 text-primary-600"
                    })}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {FORM_STEPS[currentStep].title}
                  </h2>
                  <p className="text-gray-600">
                    {FORM_STEPS[currentStep].subtitle}
                  </p>
                </div>

                {/* Step 1: Personal Information */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          {...methods.register('fullName')}
                          type="text"
                          className={`input pl-10 ${errors.fullName ? 'border-red-300' : ''}`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          {...methods.register('email')}
                          type="email"
                          className={`input pl-10 ${errors.email ? 'border-red-300' : ''}`}
                          placeholder="Enter your email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          {...methods.register('password')}
                          type={showPassword ? 'text' : 'password'}
                          className={`input pl-10 pr-10 ${errors.password ? 'border-red-300' : ''}`}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                      )}
                      
                      {/* Password strength indicator */}
                      {watchedPassword && (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Password strength:</span>
                            <span className="font-medium">{passwordStrength.feedback}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          {...methods.register('confirmPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Journey & Role */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        What best describes you? *
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {ROLE_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={`
                              relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50
                              ${methods.watch('role') === option.value 
                                ? 'border-primary-500 bg-primary-50' 
                                : 'border-gray-200'}
                            `}
                          >
                            <input
                              {...methods.register('role')}
                              type="radio"
                              value={option.value}
                              className="sr-only"
                            />
                            <div className="flex items-center space-x-4 flex-1">
                              <span className="text-2xl">{option.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900">{option.label}</div>
                                <div className="text-sm text-gray-500">{option.description}</div>
                              </div>
                            </div>
                            {methods.watch('role') === option.value && (
                              <CheckCircle className="h-5 w-5 text-primary-500" />
                            )}
                          </label>
                        ))}
                      </div>
                      {errors.role && (
                        <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Where are you in your journey? *
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {BUSINESS_STAGE_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={`
                              relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50
                              ${methods.watch('businessStage') === option.value 
                                ? 'border-primary-500 bg-primary-50' 
                                : 'border-gray-200'}
                            `}
                          >
                            <input
                              {...methods.register('businessStage')}
                              type="radio"
                              value={option.value}
                              className="sr-only"
                            />
                            <div className="flex items-center space-x-4 flex-1">
                              <span className="text-2xl">{option.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900">{option.label}</div>
                                <div className="text-sm text-gray-500">{option.description}</div>
                              </div>
                            </div>
                            {methods.watch('businessStage') === option.value && (
                              <CheckCircle className="h-5 w-5 text-primary-500" />
                            )}
                          </label>
                        ))}
                      </div>
                      {errors.businessStage && (
                        <p className="mt-2 text-sm text-red-600">{errors.businessStage.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Products & Business */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        What type of products will you sell? *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {PRODUCT_CATEGORIES.map((category) => (
                          <label
                            key={category.value}
                            className={`
                              relative flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 text-center
                              ${methods.watch('productCategory') === category.value 
                                ? 'border-primary-500 bg-primary-50' 
                                : 'border-gray-200'}
                            `}
                          >
                            <input
                              {...methods.register('productCategory')}
                              type="radio"
                              value={category.value}
                              className="sr-only"
                            />
                            <span className="text-3xl mb-2">{category.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{category.label}</span>
                            {methods.watch('productCategory') === category.value && (
                              <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary-500" />
                            )}
                          </label>
                        ))}
                      </div>
                      {errors.productCategory && (
                        <p className="mt-2 text-sm text-red-600">{errors.productCategory.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name (Optional)
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          {...methods.register('businessName')}
                          type="text"
                          className={`input pl-10 ${errors.businessName ? 'border-red-300' : ''}`}
                          placeholder="Your business or brand name (you can add this later)"
                        />
                      </div>
                      {errors.businessName && (
                        <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Don't have a name yet? No problem! You can always add or change this later.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`
                      flex items-center px-4 py-2 text-sm font-medium rounded-lg
                      ${currentStep === 0 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading || !isValid}
                    className={`
                      flex items-center px-6 py-2 text-sm font-medium rounded-lg
                      ${isLoading || !isValid
                        ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                        : 'text-white bg-primary-600 hover:bg-primary-700'}
                    `}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                        Creating Account...
                      </>
                    ) : currentStep === FORM_STEPS.length - 1 ? (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Create My Store
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Security notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                <Shield className="inline h-3 w-3 mr-1" />
                Your information is secured with enterprise-grade encryption
              </p>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}