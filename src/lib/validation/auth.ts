import { z } from 'zod'

// Security-focused validation schemas with comprehensive checks

const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must be less than 254 characters')
  .refine(
    (email) => {
      // Block common disposable/temporary email domains
      const blockedDomains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
        'mailinator.com', 'yopmail.com', 'throwaway.email'
      ]
      const domain = email.split('@')[1]?.toLowerCase()
      return !blockedDomains.includes(domain)
    },
    { message: 'Temporary email addresses are not allowed' }
  )

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
  .refine(
    (password) => {
      // Check against common passwords
      const commonPasswords = [
        'password', '12345678', 'qwerty123', 'admin123', 'welcome123'
      ]
      return !commonPasswords.includes(password.toLowerCase())
    },
    { message: 'Password is too common, please choose a stronger password' }
  )

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .refine(
    (name) => name.trim().length > 0,
    { message: 'Name cannot be empty or just spaces' }
  )

const businessNameSchema = z
  .string()
  .max(100, 'Business name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s&.,'-]*$/, 'Business name contains invalid characters')
  .optional()

// Step 1: Personal Information Schema
const step1BaseSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
})

export const step1Schema = step1BaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
)

// Step 2: Journey & Role Schema
export const step2Schema = z.object({
  role: z.enum([
    'first_time_builder',
    'aspiring_entrepreneur', 
    'small_business_owner',
    'side_hustle_starter',
    'creative_professional'
  ], {
    required_error: 'Please select your role',
    invalid_type_error: 'Invalid role selection'
  }),
  businessStage: z.enum([
    'just_an_idea',
    'have_products', 
    'selling_elsewhere',
    'expanding_online'
  ], {
    required_error: 'Please select your business stage',
    invalid_type_error: 'Invalid business stage'
  })
})

// Step 3: Product Category & Business Info Schema
export const step3Schema = z.object({
  productCategory: z.enum([
    'fashion_style',
    'handmade_crafts',
    'electronics_gadgets', 
    'health_wellness',
    'home_living',
    'food_beverage',
    'art_collectibles',
    'sports_outdoors',
    'books_education',
    'not_sure_yet'
  ], {
    required_error: 'Please select a product category',
    invalid_type_error: 'Invalid product category'
  }),
  businessName: businessNameSchema
})

// Base registration schema for API extending
export const registrationBaseSchema = step1BaseSchema.merge(step2Schema).merge(step3Schema)

// Combined schema for full form validation
export const registrationSchema = registrationBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
)

// Type exports
export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type RegistrationData = z.infer<typeof registrationSchema>

// Password strength checker
export const getPasswordStrength = (password: string): {
  score: number
  feedback: string
  color: string
} => {
  let score = 0
  let feedback = 'Very Weak'
  let color = 'bg-red-500'

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  if (password.length >= 16) score += 1

  switch (score) {
    case 0-1:
      feedback = 'Very Weak'
      color = 'bg-red-500'
      break
    case 2-3:
      feedback = 'Weak'
      color = 'bg-orange-500'
      break
    case 4-5:
      feedback = 'Good'
      color = 'bg-yellow-500'
      break
    case 6:
      feedback = 'Strong'
      color = 'bg-green-500'
      break
    case 7:
      feedback = 'Very Strong'
      color = 'bg-green-600'
      break
  }

  return { score, feedback, color }
}

// Email validation helper
export const validateEmailDomain = async (email: string): Promise<boolean> => {
  try {
    const domain = email.split('@')[1]
    if (!domain) return false
    
    // Basic DNS check would go here in production
    // For now, just check format and common domains
    const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    const isCommonDomain = validDomains.includes(domain.toLowerCase())
    const hasValidTLD = /\.[a-z]{2,}$/i.test(domain)
    
    return hasValidTLD || isCommonDomain
  } catch {
    return false
  }
}

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, (char) => char === '"' ? '&quot;' : '&#x27;') // Escape quotes
    .substring(0, 255) // Limit length
}

export const sanitizeBusinessName = (name: string): string => {
  return name
    .trim()
    .replace(/[<>]/g, '')
    .replace(/[^\w\s&.,'-]/g, '') // Only allow word chars, spaces, and business-appropriate punctuation
    .substring(0, 100)
}