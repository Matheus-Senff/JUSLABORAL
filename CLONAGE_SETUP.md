# 🚀 Guia de Clonagem e Configuração - JusLaboral

Seu repositório foi atualizado com sucesso! Use este guia para clonar e configurar em outro computador.

## ✅ O que foi atualizado no GitHub

**Commit:** `feat: Update system with Supabase integration, real-time sync, and UI improvements`

### Mudanças principais:
- ✅ Supabase backend integrado (PostgreSQL + Autenticação)
- ✅ Sincronização em tempo real de Compromissos
- ✅ Login redesenhado com animações
- ✅ Navegação reorganizada (Cálculo → Compromissos → Documentos → Agenda → etc)
- ✅ Bug de remarque corrigido
- ✅ Dados duplicados consolidados em mockData.ts
- ✅ Testes removidos
- ✅ README.md completo com instruções de setup
- ✅ .env.example configurado

## 📥 Passo 1: Clone o repositório

```bash
git clone https://github.com/Matheus-Senff/JUSLABORAL.git
cd JUSLABORAL
```

## 📦 Passo 2: Instale as dependências

```bash
npm install
```

## 🔐 Passo 3: Configure Supabase

### 3.1. Crie uma conta (se não tiver)
- Acesse: https://supabase.com
- Clique em "Get Started"
- Crie uma nova organização (ou use a existente)

### 3.2. Crie um novo projeto
- Clique em "New Project"
- Nome: `juslaboral`
- Password: Use uma senha forte
- Region: `South America (São Paulo)`
- Clique em "Create new project"

### 3.3. Copie as credenciais
1. Vá para **Settings → API**
2. Copie:
   - `Project URL` → VITE_SUPABASE_URL
   - `anon` (chave pública) → VITE_SUPABASE_PUBLISHABLE_KEY

### 3.4. Crie o arquivo `.env.local`
Na raiz do projeto, crie `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-aqui
```

**IMPORTANTE:** Nunca faça commit do `.env.local` (está no .gitignore)

## 🗄️ Passo 4: Configure o Banco de Dados

1. No Supabase Dashboard, vá para **SQL Editor**
2. Clique em "New Query"
3. Copie e cole o SQL abaixo:

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

4. Clique em "Run" (ou Ctrl+Enter)

## ✅ Passo 5: Crie uma conta de teste

1. Vá para **Authentication → Users** no Supabase
2. Clique em "Add user"
3. Preencha:
   - Email: `seu-email@example.com`
   - Password: Crie uma senha
4. Clique em "Save"

## 🚀 Passo 6: Inicie a aplicação

```bash
npm run dev
```

A aplicação estará em: **http://localhost:3002**

## 🎉 Pronto!

Faça login com a conta criada em Passo 5 e comece a usar!

## 📋 Credenciais padrão (dev)

Se quiser usar as credenciais pré-preenchidas:
- Email: `contatomatheussenff@gmail.com`
- Senha: `123456`

(Você precisa criar essa conta no Supabase para usar)

## 🔧 Troubleshooting

### Erro: "VITE_SUPABASE_URL is not defined"
- Verifique que `.env.local` existe na raiz do projeto
- Restart o servidor (Ctrl+C e `npm run dev` novamente)

### Erro: "Cannot connect to database"
- Confirme que o SQL foi executado corretamente
- Verifique as credenciais em `.env.local`
- Teste em https://supabase.com → SQL Editor

### Erro: "RLS policy error"
- As 4 policies devem estar criadas em Supabase
- Verifique em **Authentication → Policies**

## 📚 Documentação

- README.md - Setup completo
- .env.example - Variáveis necessárias
- SKILL.md - Instruções de desenvolvimento

## 🌐 Links úteis

- Repository: https://github.com/Matheus-Senff/JUSLABORAL
- Supabase: https://supabase.com
- React: https://react.dev
- Tailwind: https://tailwindcss.com

---

**✨ Sistema 100% atualizado e pronto para uso em múltiplos computadores!**
