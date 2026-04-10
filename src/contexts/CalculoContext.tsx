import React, { createContext, useContext, useState } from 'react'

type CalculoMode = 'inicial' | 'execucao' | ''

interface FormData {
  [key: string]: any
}

interface CalculoContextValue {
  currentStep: number
  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  formData: FormData
  calculoMode: CalculoMode
  setCalculoMode: (mode: CalculoMode) => void
}

const CalculoContext = createContext<CalculoContextValue | null>(null)

export const CalculoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(-1)
  const [calculoMode, setCalculoMode] = useState<CalculoMode>('')
  const [formData, setFormData] = useState<FormData>({})

  const markStepComplete = (step: number) => {
    setFormData((prev) => ({ ...prev, [`step${step}Complete`]: true }))
  }

  return (
    <CalculoContext.Provider value={{
      currentStep,
      setCurrentStep,
      markStepComplete,
      formData,
      calculoMode,
      setCalculoMode,
    }}>
      {children}
    </CalculoContext.Provider>
  )
}

export const useCalculo = () => {
  const context = useContext(CalculoContext)
  if (!context) {
    throw new Error('useCalculo must be used within a CalculoProvider')
  }
  return context
}
