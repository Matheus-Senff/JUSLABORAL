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
  dataInicio: string
  status: string
}

export interface AgendaEvent {
  id: string
  tipo: string
  responsavel: string
  cliente: string
  data: Date
  color: 'green' | 'orange' | 'purple'
}
