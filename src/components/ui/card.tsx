import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`rounded-3xl border border-gray-700 bg-dark-800 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}
