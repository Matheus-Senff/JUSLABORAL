export const mockDocuments = [
  {
    id: 'doc-1',
    title: 'Petição Inicial Trabalhista',
    type: 'Petição',
    client: 'João Almeida',
    status: 'Rascunho',
    author: 'Equipe Pasta',
    createdAt: '12/03/2026',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut.'
  },
  {
    id: 'doc-2',
    title: 'Recurso de Agravo',
    type: 'Recurso',
    client: 'Mariana Souza',
    status: 'Em revisão',
    author: 'Equipe Pasta',
    createdAt: '18/03/2026',
    content: 'Proin eget enim facilisis, vulputate metus at, condimentum mauris. Etiam vitae.'
  }
]

export const mockTasks = [
  {
    id: 'task-1',
    title: 'Revisar documento de dispensa',
    description: 'Validar cláusulas e atualizar prazos para cliente',
    client: 'UHLMANN & SANTOS',
    assignee: 'Ana',
    dueDate: '24/04/2026',
    priority: 'Alta',
    status: 'Backlog'
  },
  {
    id: 'task-2',
    title: 'Estruturar petição inicial',
    description: 'Coletar dados do trabalhador e construir tese principal',
    client: 'Mariana Souza',
    assignee: 'Lucas',
    dueDate: '26/04/2026',
    priority: 'Média',
    status: 'Em andamento'
  }
]

export const mockClients = [
  {
    id: 'client-1',
    name: 'UHLMANN & SANTOS',
    company: 'UHLMANN Advocacia',
    role: 'Sócio',
    email: 'contato@uhlmannsantos.com',
    phone: '(47) 99999-0001',
    status: 'Ativo',
    stage: 'Pós-litígios'
  },
  {
    id: 'client-2',
    name: 'Mariana Souza',
    company: 'Souza Comércio',
    role: 'Sócia',
    email: 'mariana@souza.com',
    phone: '(47) 99999-0002',
    status: 'Ativo',
    stage: 'Pré-audiência'
  }
]

export const mockTimeline = [
  {
    id: 'event-1',
    title: 'Prazo de juntada de documentos',
    category: 'Prazos',
    author: 'Equipe Pasta',
    date: '15/04/2026',
    details: 'Submeter prova documental para audiência marcada em 22/04.'
  },
  {
    id: 'event-2',
    title: 'Reunião com cliente',
    category: 'Reunião',
    author: 'Ana',
    date: '20/04/2026',
    details: 'Planejar estratégia de mediação e revisar proposta de acordo.'
  }
]

export const mockUsers = [
  {
    id: 'user-1',
    name: 'Master',
    email: 'master@juslaboral.local',
    password: '$2a$10$KbGhn8kQkI46YGsBxm9I1e0Pv9xnO66Q7Jl6YHxJ0q7l0s0bFYxMy',
    role: 'admin'
  }
]
