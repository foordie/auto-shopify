'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  name: string
  component: string
}

interface ProgressTrackerProps {
  steps: Step[]
  currentStep: number
  completedSteps: number
  className?: string
}

export default function ProgressTracker({ 
  steps, 
  currentStep, 
  completedSteps, 
  className 
}: ProgressTrackerProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber <= completedSteps
          const isCurrent = stepNumber === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    {
                      "bg-green-500 border-green-500 text-white": isCompleted,
                      "bg-blue-500 border-blue-500 text-white": isCurrent,
                      "bg-white border-gray-300 text-gray-500": !isCompleted && !isCurrent
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="ml-3">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      {
                        "text-green-600": isCompleted,
                        "text-blue-600": isCurrent,
                        "text-gray-500": !isCompleted && !isCurrent
                      }
                    )}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {stepNumber === 1 && "Basic information"}
                    {stepNumber === 2 && "Store settings"}
                    {stepNumber === 3 && "Visual design"}
                    {stepNumber === 4 && "Features & tools"}
                    {stepNumber === 5 && "Final review"}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors duration-200",
                    {
                      "bg-green-500": stepNumber <= completedSteps,
                      "bg-gray-300": stepNumber > completedSteps
                    }
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Math.round((completedSteps / steps.length) * 100)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Mobile Progress (Hidden on Desktop) */}
      <div className="md:hidden mt-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep - 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {steps[currentStep - 1]?.name}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-4 text-center">
        {currentStep === 1 && (
          <p className="text-sm text-gray-600">
            Let's start by gathering some basic information about your business
          </p>
        )}
        {currentStep === 2 && (
          <p className="text-sm text-gray-600">
            Now let's configure your store settings and product details
          </p>
        )}
        {currentStep === 3 && (
          <p className="text-sm text-gray-600">
            Time to make your store look amazing with custom design
          </p>
        )}
        {currentStep === 4 && (
          <p className="text-sm text-gray-600">
            Select the features and integrations you need
          </p>
        )}
        {currentStep === 5 && (
          <p className="text-sm text-gray-600">
            Almost done! Review your settings and launch your store
          </p>
        )}
      </div>
    </div>
  )
}