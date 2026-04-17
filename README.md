# 🏛️ JusLaboral - Gestão Corporativa

Plataforma moderna de gestão de processos, documentos e equipes para escritórios de advocacia e empresas jurídicas.

## 🚀 Características

- **📅 Compromissos**: Calendário integrado com sincronização em tempo real
- **📋 Gestão de Processos**: Controle total de processos estaduais e federais
- **📁 Documentos**: Sistema de gerenciamento de arquivos compartilhados
- **👥 Equipe Colaborativa**: Trabalhe em equipe com permissões granulares
- **🔐 Segurança**: Autenticação com email/senha via Supabase
- **🌓 Dark Mode**: Interface otimizada para qualquer hora do dia
- **⚡ Performance**: Interface otimizada para máxima produtividade

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Vite 4.5.14
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Real-time**: Supabase Realtime Subscriptions
- **PDF**: jsPDF + html2canvas

## 📦 Requisitos

- Node.js 16+
- npm ou yarn
- Conta Supabase (gratuita em https://supabase.com)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/juslaboral.git
cd juslaboral
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

**Obtendo as credenciais:**

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto ou use um existente
3. Vá para **Settings → API**
4. Copie `Project URL` e `anon public` key
5. Paste no `.env.local`

### 4. Configure o Banco de Dados

Execute o SQL em **SQL Editor** do Supabase:

```sql
-- Create compromissos table
create table compromissos (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data date not null,
  horario time not null,
  descricao text not null,
  local text,
  prioridade text default 'media' check (prioridade in ('baixa', 'media', 'alta', 'critica')),
  status text default 'pendente' check (status in ('pendente', 'concluido', 'remarcado')),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create index for faster queries
create index compromissos_user_id_data_idx on compromissos(user_id, data);

-- Enable RLS (Row Level Security)
alter table compromissos enable row level security;

-- Create policies
create policy "Users can read their own compromissos"
  on compromissos for select using (auth.uid() = user_id);

create policy "Users can insert their own compromissos"
  on compromissos for insert with check (auth.uid() = user_id);

create policy "Users can update their own compromissos"
  on compromissos for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own compromissos"
  on compromissos for delete using (auth.uid() = user_id);
```

### 5. Ative Email Authentication

No Supabase Dashboard:

1. Vá para **Authentication → Providers**
2. Ative **Email** (já vem habilitado por padrão)
3. Configure em **Email Templates** se necessário

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em **http://localhost:3002**

## 📝 Credenciais de Teste

- **Email**: contatomatheussenff@gmail.com
- **Senha**: 123456

⚠️ **Nota**: Crie sua própria conta Supabase antes de usar em produção!

## 🏗️ Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── Layout.tsx       # Layout principal com sidebar
│   ├── AuthPage.tsx     # Página de login
│   ├── Agenda.tsx       # Agenda (não utilizada)
│   ├── ProcessTable.tsx # Tabela de processos
│   ├── ClientsTable.tsx # Tabela de clientes
│   ├── Settings.tsx     # Configurações
│   ├── Calculo.tsx      # Cálculo previdenciário
│   ├── CanonIndex.tsx   # Módulo Canon
│   ├── PastaIndex.tsx   # Módulo Documentos
│   └── pasta/           # Componentes de Compromissos
│       ├── CalendarView.tsx
│       ├── CompromissoModal.tsx
│       ├── CompromissosDiaModal.tsx
│       └── pastaStore.ts
├── hooks/               # Custom React Hooks
│   ├── useSupabaseAuth.ts
│   └── useSupabaseCompromissos.ts
├── contexts/            # Context API
│   └── ThemeContext.tsx
├── types/               # TypeScript types
│   └── index.ts
├── data/                # Mock data centralizado
│   └── mockData.ts
├── utils/               # Utilitários
│   ├── supabase/
│   │   └── client.ts
│   └── fuzzySearch.ts
├── App.tsx              # Componente raiz
└── main.tsx             # Ponto de entrada
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev           # Inicia servidor de desenvolvimento

# Build
npm run build         # Build para produção
npm run preview       # Preview da build de produção

# Linting
npm run lint          # Analisa código TypeScript
```

## 🔐 Autenticação

O sistema usa autenticação com **Supabase Auth**:

1. **Signup**: Crie uma nova conta com email/senha
2. **Email Confirmation**: Confirme o email (pode ser automático em dev)
3. **Login**: Entre com suas credenciais
4. **Session**: Sessão persistida automaticamente
5. **Logout**: Opção no header da aplicação

### Row Level Security (RLS)

Todos os dados estão protegidos com RLS:
- Usuários só podem ver seus próprios compromissos
- Dados são isolados por `user_id`
- Políticas aplicadas em tempo de query

## 🎨 Personalização

### Tema Dark Mode

Toggle disponível no header. Configuração persiste em localStorage.

### Cores

Defina no `tailwind.config.js`:

```javascript
colors: {
  dark: {
    900: '#0f0f0f',
    800: '#1a1a1a',
    700: '#212529',
    600: '#2c3034',
  }
}
```

## 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

## 🐛 Resolução de Problemas

### Erro: "Cannot find module '@/...'"

Verifique se `tsconfig.json` tem o alias configurado:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Erro: "VITE_SUPABASE_URL is not defined"

Confirme que `.env.local` está na raiz e contém:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

### RLS Policy Error ao salvar

Verifique se as políticas RLS foram criadas corretamente no Supabase.

## 🔄 Sincronização em Tempo Real

Os Compromissos sincronizam automaticamente entre abas/dispositivos via:

- **Supabase Realtime**: Subscriptions em mudanças do banco
- **Optimistic Updates**: Atualizações locais imediatas
- **Rollback Automático**: Reverte se houver erro no servidor

## 📦 Deployment

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

Configurar variáveis de ambiente no dashboard do Vercel.

### Netlify

```bash
npm run build
# Deploy a pasta 'dist'
```

## 🗂️ Roadmap

- [ ] Integração com calendários externos (Google Calendar, Outlook)
- [ ] Notificações push em tempo real
- [ ] Export para Excel/PDF avançado
- [ ] Dashboard com gráficos e analytics
- [ ] API REST pública
- [ ] Mobile app (React Native)
- [ ] Integração com Stripe para pagamentos
- [ ] Sistema de roles e permissões avançado

## 🎉 Agradecimentos

Desenvolvido com ❤️ para profissionais jurídicos

---

**Versão**: 1.0.0
**Última atualização**: 17 de abril de 2026
