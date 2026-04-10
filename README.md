# JusLaboral - Gestão Corporativa Agenda-First

Aplicação profissional de gestão corporativa baseada em JusLaboral, focada em modelo "Agenda-First" com dashboard intuitivo para gerenciar processos judiciais.

## 🚀 Recursos

- **Sidebar Fixa**: Navegação rápida entre Agenda, Processos Estaduais e Federais
- **Home = Agenda**: Página inicial baseada em calendário mensal com cards de eventos
- **Tabela de Processos**: Interface densa e profissional com filtros por coluna e período
- **Dark Mode**: Tema profissional dark baseado em #212529
- **Responsivo**: Otimizado para desktop com densidade informacional alta
- **Alta Performance**: ~26k registros com paginação eficiente

## 📋 Estrutura do Projeto

```
src/
├── components/
│   ├── Layout.tsx       # Layout principal, Sidebar e Header
│   ├── Agenda.tsx       # Componente de calendário mensal
│   └── ProcessTable.tsx # Tabela de processos com filtros
├── types/
│   └── index.ts         # Tipos TypeScript
├── App.tsx              # Componente raiz
└── main.tsx             # Ponto de entrada React

public/                  # Arquivos estáticos
```

## 🛠 Tecnologias

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Lucide Icons** - Ícones
- **Vite** - Build Tool

## 🎨 Componentes Principais

### Layout
- Sidebar fixa à esquerda (#212529)
- Header superior com controles dark mode, notificações e perfil
- Navegação entre Agenda, Processo Estadual e Federal

### Agenda (Home)
- Grid mensal denso
- Cards horizontais coloridos (Verde, Laranja, Roxo)
- Padrão de exibição: "Tipo - Responsável - Cliente"

### Tabela de Processos
- 10 colunas: #, Parceiro, Cliente, CPF, CAT/Nº Processo, Cidade/Comarca, UF, Data Início, Status, Ações
- Filtros inline por coluna
- Filtro por período (Data Inicial e Final)
- Paginação no rodapé
- Ícones de ação: Detalhes, Anotações, Editar, Arquivo, Nova Aba

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🎯 Cores do Tema Dark

- Fundo Principal: #0f0f0f
- Background Alto: #1a1a1a
- Sidebar: #212529
- Layout: #2c3034
- Tabela: #343a40
- Hover: #495057

## 📝 Funcionalidades

- ✅ Navegação baseada em Agenda
- ✅ Tabela com 26.103 registros de exemplo
- ✅ Filtros por período e coluna
- ✅ Paginação inteligente
- ✅ Dark mode profissional
- ✅ Ícones Lucide React
- ✅ Layout responsivo
- ✅ Type-safe com TypeScript

## 📄 Licença

Proprietary © 2026 JusLaboral
