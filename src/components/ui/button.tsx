import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', type = 'button', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
    const variantClass =
      variant === 'outline'
        ? 'border border-gray-600 bg-transparent text-white hover:bg-gray-800'
        : 'bg-blue-600 text-white hover:bg-blue-700'

    return <button ref={ref} type={type} className={`${base} ${variantClass} ${className}`} {...props} />
  }
)

Button.displayName = 'Button'
