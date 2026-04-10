import React from 'react'
import CanonApp from '@canon/App.tsx'
import '@canon/index.css'

interface CanonIndexProps {
  darkMode: boolean
}

export const CanonIndex: React.FC<CanonIndexProps> = ({ darkMode }) => {
  return <CanonApp />
}
