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
  // campos extras de detalhe
  telefone?: string
  email?: string
  natureza?: string
  tipo?: string
  orgao?: string
  endereco?: string
  nProcesso?: string
  fase?: string
  setor?: string
  andamento?: string
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
  processId?: string
  processType?: 'estadual' | 'federal'
}

export interface ProcessHistoryEntry {
  id: string
  processId: string
  tipo: 'status' | 'setor' | 'auditoria' | 'comentario'
  campo?: string
  valorAnterior?: string
  valorNovo?: string
  texto?: string
  autor: string
  data: string
}

export interface ProcessEvent {
  id: string
  processId: string
  tipoEvento: 'Perícia Adm.' | 'Perícia Jur.' | 'Audiência' | 'Reunião Cliente'
  data: string
  hora: string
  endereco?: string
  cliente: string
  responsavel: string
  parceiro: string
  processType?: 'estadual' | 'federal'
  cpf?: string
  natureza?: string
  status?: string
}

export interface EventHistoryEntry {
  id: string
  eventId: string
  titulo: 'Status do Evento' | 'Auditoria' | 'Comentário'
  descricao: string
  autor: string
  data: string
}

export interface ProcessNote {
  id: string
  processId: string
  titulo: string
  numeroCat?: string
  senhaInss?: string
  rg?: string
  observacao?: string
  autor: string
  data: string
}

export interface ProcessTask {
  id: string
  processId: string
  titulo: string
  descricao?: string
  responsavel: string
  setor: string
  observacao: string
  tipoAcao: 'Pedir Documentação' | 'Anotação' | 'Evento' | 'Reunião' | 'Análise' | 'Outro'
  status: 'Não Ajuizado' | 'Ajuizado' | 'Pendência' | 'Pendência Cumprida' | 'Aguardando Ajuizamento' | 'Arquivado'
  dataCriacao: string
  dataConclusao?: string
  autor: string
  // Campos do novo formulário
  tipo?: 'Documento' | 'Evento' | 'Anotação'
  acao?: string
  tarefa?: string
  prazo?: string
  tipoResponsavel?: 'Setor' | 'Usuário' | 'Equipe'
}
