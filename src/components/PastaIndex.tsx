import React from 'react'
import { PastaApp } from './pasta/PastaApp'

interface PastaIndexProps {
  darkMode: boolean
}

export const PastaIndex: React.FC<PastaIndexProps> = ({ darkMode }) => {
  return <PastaApp darkMode={darkMode} />
}
