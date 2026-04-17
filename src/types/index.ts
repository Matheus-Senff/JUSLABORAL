import React from 'react'

export interface Process {
  id: string
  numero: number
  parceiro: string
  cliente: string
  cpf: string
  processo: string
  cidade: string
  uf: string
  responsavel: string
  dataInicio: string
  status: string
  ultimaAlteracao: string
}

export interface AgendaEvent {
  id: string
  tipo: string
  responsavel: string
  cliente: string
  data: Date
  color: 'green' | 'orange' | 'purple'
  hora?: string
  local?: string
  solicitante?: string
  parceiro?: string
  observacao?: string
  status?: string
}
