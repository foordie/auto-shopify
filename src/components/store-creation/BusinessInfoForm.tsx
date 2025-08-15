'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building, Mail, Phone, Users, FileText } from 'lucide-react'

const businessInfoSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessDescription: z.string().min(10, 'Please provide a more detailed description'),
  businessType: z.string().min(1, 'Please select a business type'),
  targetAudience: z.string().min(5, 'Please describe your target audience'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().optional()
})

type BusinessInfoData = z.infer<typeof businessInfoSchema>

interface BusinessInfoFormProps {
  initialData?: Partial<BusinessInfoData>
  onSubmit: (data: BusinessInfoData) => void
}

const BUSINESS_TYPES = [
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'electronics', label: 'Electronics & Tech' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Outdoor' },
  { value: 'arts', label: 'Arts & Crafts' },
  { value: 'books', label: 'Books & Media' },
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'services', label: 'Professional Services' },
  { value: 'other', label: 'Other' }
]

export default function BusinessInfoForm({ initialData, onSubmit }: BusinessInfoFormProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: initialData?.businessName || '',
      businessDescription: initialData?.businessDescription || '',
      businessType: initialData?.businessType || '',
      targetAudience: initialData?.targetAudience || '',
      contactEmail: initialData?.contactEmail || '',
      contactPhone: initialData?.contactPhone || ''
    }
  })

  const businessType = watch('businessType')

  const handleFormSubmit = (data: BusinessInfoData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Business Name */}
      <div>
        <label htmlFor="businessName" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Building className="h-4 w-4 mr-2" />
          Business Name
        </label>
        <input
          {...register('businessName')}
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Enter your business name"
        />
        {errors.businessName && (
          <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
        )}
      </div>

      {/* Business Description */}
      <div>
        <label htmlFor="businessDescription" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <FileText className="h-4 w-4 mr-2" />
          Business Description
        </label>
        <textarea
          {...register('businessDescription')}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Describe what your business does, what products you sell, and what makes you unique..."
        />
        {errors.businessDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.businessDescription.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          This helps us create relevant product descriptions and marketing content.
        </p>
      </div>

      {/* Business Type */}
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
          Business Type
        </label>
        <select
          {...register('businessType')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">Select your business type</option>
          {BUSINESS_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.businessType && (
          <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
        )}
      </div>

      {/* Target Audience */}
      <div>
        <label htmlFor="targetAudience" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Users className="h-4 w-4 mr-2" />
          Target Audience
        </label>
        <textarea
          {...register('targetAudience')}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Describe your ideal customers (age, interests, demographics, etc.)"
        />
        {errors.targetAudience && (
          <p className="mt-1 text-sm text-red-600">{errors.targetAudience.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Example: "Women aged 25-40 interested in sustainable fashion" or "Small business owners looking for productivity tools"
        </p>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contactEmail" className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 mr-2" />
            Contact Email
          </label>
          <input
            {...register('contactEmail')}
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="your@email.com"
          />
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPhone" className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 mr-2" />
            Phone Number (Optional)
          </label>
          <input
            {...register('contactPhone')}
            type="tel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="+1 (555) 123-4567"
          />
          {errors.contactPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
          )}
        </div>
      </div>

      {/* Business Type Specific Tips */}
      {businessType && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Tips for {BUSINESS_TYPES.find(t => t.value === businessType)?.label} businesses:
          </h4>
          <div className="text-sm text-blue-800">
            {businessType === 'fashion' && (
              <ul className="space-y-1">
                <li>• Focus on visual appeal and brand storytelling</li>
                <li>• Consider size charts and fitting guides</li>
                <li>• Seasonal collections work well</li>
              </ul>
            )}
            {businessType === 'food' && (
              <ul className="space-y-1">
                <li>• Include ingredient information and allergen warnings</li>
                <li>• Consider local delivery options</li>
                <li>• Food photography is crucial</li>
              </ul>
            )}
            {businessType === 'services' && (
              <ul className="space-y-1">
                <li>• Focus on showcasing your expertise</li>
                <li>• Include customer testimonials</li>
                <li>• Consider booking/consultation features</li>
              </ul>
            )}
            {!['fashion', 'food', 'services'].includes(businessType) && (
              <p>We'll optimize your store based on your business type and target audience.</p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Continue to Store Configuration
        </button>
      </div>
    </form>
  )
}