import { AlertTriangle, Database, Code, Zap } from 'lucide-react'

interface DemoDataBadgeProps {
  type?: 'data' | 'api' | 'auth' | 'process'
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function DemoDataBadge({ 
  type = 'data', 
  label,
  className = '',
  size = 'sm',
  showIcon = true
}: DemoDataBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case 'data': return <Database className="h-3 w-3" />
      case 'api': return <Code className="h-3 w-3" />
      case 'auth': return <AlertTriangle className="h-3 w-3" />
      case 'process': return <Zap className="h-3 w-3" />
      default: return <AlertTriangle className="h-3 w-3" />
    }
  }

  const getLabel = () => {
    if (label) return label
    switch (type) {
      case 'data': return 'DEMO DATA'
      case 'api': return 'MOCK API'
      case 'auth': return 'DEMO AUTH'
      case 'process': return 'SIMULATED'
      default: return 'DEMO'
    }
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  return (
    <div className={`
      inline-flex items-center gap-1 
      bg-red-100 text-red-800 
      border border-red-200 
      rounded-full font-medium 
      ${sizeClasses[size]} 
      ${className}
    `}>
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </div>
  )
}

interface DemoWarningBannerProps {
  title?: string
  message: string
  type?: 'warning' | 'info'
  className?: string
}

export function DemoWarningBanner({ 
  title = 'Demo Mode', 
  message, 
  type = 'warning',
  className = ''
}: DemoWarningBannerProps) {
  const bgColor = type === 'warning' ? 'bg-red-50' : 'bg-blue-50'
  const borderColor = type === 'warning' ? 'border-red-200' : 'border-blue-200'
  const textColor = type === 'warning' ? 'text-red-800' : 'text-blue-800'
  const iconColor = type === 'warning' ? 'text-red-600' : 'text-blue-600'

  return (
    <div className={`
      ${bgColor} ${borderColor} ${textColor}
      border rounded-lg p-4 mb-4
      ${className}
    `}>
      <div className="flex items-start">
        <AlertTriangle className={`h-5 w-5 ${iconColor} mt-0.5 mr-3`} />
        <div>
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  )
}

interface DemoContainerProps {
  children: React.ReactNode
  badge?: boolean
  badgeProps?: DemoDataBadgeProps
  className?: string
}

export function DemoContainer({ 
  children, 
  badge = true, 
  badgeProps = {},
  className = ''
}: DemoContainerProps) {
  return (
    <div className={`
      relative border border-red-200 bg-red-50/30 rounded-lg p-4
      ${className}
    `}>
      {badge && (
        <div className="absolute -top-2 -right-2 z-10">
          <DemoDataBadge {...badgeProps} />
        </div>
      )}
      {children}
    </div>
  )
}