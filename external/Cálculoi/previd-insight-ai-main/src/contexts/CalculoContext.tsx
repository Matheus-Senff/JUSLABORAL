import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Dependente {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  inicioCotas: string;
  fimCotas: string;
  parentesco: string;
}

export type CalculoMode = 'inicial' | 'execucao' | null;

export interface FormData {
  // Step 1 - Identificação
  autor: string;
  cpf: string;
  nascimento: string;
  sexo: string;

  // Step 2 - Processo
  nup: string;
  dataAjuizamento: string;
  apurarVC: boolean;
  limitar60SM: boolean;
  incluir12Vincendas: boolean;
  incluir13Vincendas: boolean;
  dataCitacao: string;
  percentualRenuncia: string;

  // Step 3 - Parâmetros
  dataInicioCalculo: string;
  dataTerminoCalculo: string;
  dataAtualizacao: string;
  afastarPrescricao: boolean;
  calcular13Dezembro: boolean;
  incluir13UltimoAno: boolean;
  integral13UltimoAno: boolean;
  sistematicaReajuste: 'judiciario' | 'inss';

  // Step 4 - Benefício
  especie: string;
  nb: string;
  dib: string;
  dip: string;
  rmi: string;
  fixarSalarioMinimo: boolean;
  grauIncapacidade: string;

  // Step 5 - Correção Monetária
  limitarTeto: boolean;
  beneficioAnterior: string;
  beneficioPrecedido: string;
  adicional25: boolean;
  correcaoMonetaria: boolean;
  indiceCorrecao: 'ipca_selic' | 'manual';
  modoPrecatorio: boolean;

  // Step 6 - Dependentes
  dependentes: Dependente[];
}

interface CalculoContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  completedSteps: Set<number>;
  markStepComplete: (step: number) => void;
  calculoMode: CalculoMode;
  setCalculoMode: (mode: CalculoMode) => void;
  resetFormData: () => void;
}

const defaultFormData: FormData = {
  autor: '', cpf: '', nascimento: '', sexo: '',
  nup: '', dataAjuizamento: '', dataCitacao: '', percentualRenuncia: '', apurarVC: false, limitar60SM: false, incluir12Vincendas: false, incluir13Vincendas: false,
  dataInicioCalculo: '', dataTerminoCalculo: '', dataAtualizacao: '', afastarPrescricao: false,
  calcular13Dezembro: true, incluir13UltimoAno: true, integral13UltimoAno: false, sistematicaReajuste: 'judiciario',
  especie: '', nb: '', dib: '', dip: '', rmi: '', fixarSalarioMinimo: false, grauIncapacidade: '',
  limitarTeto: false, beneficioAnterior: '', beneficioPrecedido: '', adicional25: false,
  correcaoMonetaria: true, indiceCorrecao: 'ipca_selic', modoPrecatorio: false,
  dependentes: [],
};

const CalculoContext = createContext<CalculoContextType | null>(null);

export function CalculoProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [calculoMode, setCalculoMode] = useState<CalculoMode>(null);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const resetFormData = () => {
    setFormData(defaultFormData);
    setCompletedSteps(new Set());
  };

  return (
    <CalculoContext.Provider value={{ currentStep, setCurrentStep, formData, updateFormData, completedSteps, markStepComplete, calculoMode, setCalculoMode, resetFormData }}>
      {children}
    </CalculoContext.Provider>
  );
}

export function useCalculo() {
  const ctx = useContext(CalculoContext);
  if (!ctx) throw new Error('useCalculo must be used within CalculoProvider');
  return ctx;
}
