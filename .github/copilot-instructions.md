# JusLaboral - Instruções de Desenvolvimento

## Visão Geral
Aplicação de gestão corporativa baseada em JusLaboral, modelo "Agenda-First" com React, TypeScript, Tailwind CSS e Lucide Icons.

## Requisitos Implementados

### ✅ Comportamento e Navegação
- Home = Agenda (obrigatória)
- Sidebar esquerda fixa (#212529) com:
  - Agenda (ícone Calendário, badge verde "50")
  - Processo Estadual (ícone Balança)
  - Processo Federal (ícone Tribunal)

### ✅ Tela de Agenda
- Grid mensal denso
- Cards horizontais pequenos com cores: Verde, Laranja, Roxo
- Padrão: "Tipo - Responsável - Cliente"
- Navegação mês anterior/próximo

### ✅ Tabela de Processos
- **Sem subpastas**: Vai direto para tabela ao clicar
- **Colunas** (respeitando ordem):
  1. # (número da linha)
  2. Parceiro (ex: UHLMANN & SANTOS)
  3. Cliente (nome completo)
  4. CPF
  5. CAT/Nº Processo
  6. Cidade/Comarca (ex: PAPANDUVA, CANOINHAS)
  7. UF (duas letras, ex: SC)
  8. Data Início
  9. Status (AG AJUIZAR 8, ARQUIVADO, PRECATÓRIO)
  10. Ações (ícones cinza: Detalhes, Anotações, Editar, Arquivo, Nova Aba)

### ✅ UI da Tabela
- Dark Mode: Fundo #343a40, Linhas #2c3034
- Filtro por Período: Data Inicial e Final (dd/mm/aaaa) com ícones calendário
- Download icon no canto superior direito
- Filtros inline abaixo de cada coluna
- Paginação no rodapé: ícones navegação e "1-10 de 26103"

### ✅ Header Superior
- Título da página à esquerda
- Dark Mode switch (on)
- Sino de notificações
- Perfil "Master"

### ✅ Tecnologias
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

## Estrutura do Projeto

```
src/
├── components/
│   ├── Layout.tsx       # Layout principal com Sidebar e Header
│   ├── Agenda.tsx       # Componente de calendário mensal
│   └── ProcessTable.tsx # Tabela de processos com filtros
├── types/
│   └── index.ts         # Interfaces TypeScript
├── App.tsx              # Componente raiz
└── main.tsx             # Ponto de entrada React
```

## Cores do Tema Dark

- `#0f0f0f` - Fundo principal
- `#1a1a1a` - Background secundário
- `#212529` - Sidebar
- `#2c3034` - Linhas tabela
- `#343a40` - Fundo tabela

## 🚀 Para Iniciar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Build produção**:
   ```bash
   npm run build
   ```

O servidor estará disponível em `http://localhost:3000`

## 📝 Data Mocking

- Agenda: 5 eventos de exemplo com datas variadas
- Tabela: 26.103 registros gerados proceduralmente
- Todos os dados são fake data para demonstração

## 🎯 Próximos Passos (Opcional)

- Backend API para persistência de dados
- Autenticação de usuários
- Sistema de notificações real
- Export para Excel/PDF
- Gráficos e dashboards
- Integração com calendários externos

## Notas de Desenvolvimento

- Usar componentes controlados para filtros
- Manter densidade informacional (fontes pequenas, espaçamento reduzido)
- Preservar paleta de cores dark mode
- Adicionar hover states em elementos interativos
- Manter performance com paginação para grandes datasets
- Type-safe: sempre usar interfaces TypeScript

## Suporte

Para dúvidas sobre o desenvolvimento, consulte a documentação do README.md ou revise os componentes em `src/components/`.
