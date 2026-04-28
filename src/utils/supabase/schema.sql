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

-- Create policy for users to read their own compromissos
create policy "Users can read their own compromissos"
  on compromissos
  for select
  using (auth.uid() = user_id);

-- Create policy for users to insert their own compromissos
create policy "Users can insert their own compromissos"
  on compromissos
  for insert
  with check (auth.uid() = user_id);

-- Create policy for users to update their own compromissos
create policy "Users can update their own compromissos"
  on compromissos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create policy for users to delete their own compromissos
create policy "Users can delete their own compromissos"
  on compromissos
  for delete
  using (auth.uid() = user_id);

-- ============================================================
-- TABELAS DO MÓDULO CANON
-- ============================================================

-- user_templates
create table if not exists user_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null default 'geral',
  structure jsonb not null default '{}',
  font_family text,
  font_size integer,
  margins jsonb,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table user_templates enable row level security;
create policy "select_own_templates" on user_templates for select using (auth.uid() = user_id);
create policy "insert_own_templates" on user_templates for insert with check (auth.uid() = user_id);
create policy "update_own_templates" on user_templates for update using (auth.uid() = user_id);
create policy "delete_own_templates" on user_templates for delete using (auth.uid() = user_id);

-- saved_prompts
create table if not exists saved_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  is_favorite boolean default false,
  usage_count integer default 0,
  created_at timestamptz default now()
);
alter table saved_prompts enable row level security;
create policy "select_own_prompts" on saved_prompts for select using (auth.uid() = user_id);
create policy "insert_own_prompts" on saved_prompts for insert with check (auth.uid() = user_id);
create policy "update_own_prompts" on saved_prompts for update using (auth.uid() = user_id);
create policy "delete_own_prompts" on saved_prompts for delete using (auth.uid() = user_id);

-- document_templates
create table if not exists document_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  image_path text not null,
  image_filename text,
  mime_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
  {SONPREV sql.font_size}
);
alter table document_templates enable row level security;
create policy "select_own_doc_templates" on document_templates for select using (auth.uid() = user_id);
create policy "insert_own_doc_templates" on document_templates for insert with check (auth.uid() = user_id);
create policy "update_own_doc_templates" on document_templates for update using (auth.uid() = user_id);
create policy "delete_own_doc_templates" on document_templates for delete using (auth.uid() = user_id);

-- storage: bucket document-templates (executar no dashboard Storage ou via SQL abaixo)
insert into storage.buckets (id, name, public) values ('document-templates', 'document-templates', false)
  on conflict (id) do nothing;
create policy "upload_own_doc_templates" on storage.objects for insert
  with check (bucket_id = 'document-templates' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "read_own_doc_templates" on storage.objects for select
  using (bucket_id = 'document-templates' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "delete_own_doc_templates" on storage.objects for delete
  using (bucket_id = 'document-templates' and auth.uid()::text = (storage.foldername(name))[1]);

-- generation_history
create table if not exists generation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  template_name text,
  prompt_used text,
  extension_mode text not null default 'curto',
  effort_level integer not null default 3,
  result_text text not null,
  created_at timestamptz default now()
);
alter table generation_history enable row level security;
create policy "select_own_history" on generation_history for select using (auth.uid() = user_id);
create policy "insert_own_history" on generation_history for insert with check (auth.uid() = user_id);
create policy "delete_own_history" on generation_history for delete using (auth.uid() = user_id);

-- team_members
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  nome text not null,
  email text not null,
  nivel text not null default 'Visualizador',
  equipe text,
  setor text,
  created_at timestamptz default now()
);
alter table team_members enable row level security;
create policy "select_team_members" on team_members for select using (true);
create policy "insert_team_members" on team_members for insert with check (true);
create policy "update_team_members" on team_members for update using (true);
create policy "delete_team_members" on team_members for delete using (true);

-- ============================================================
-- MÓDULO JURÍDICO: USUÁRIOS, PARCEIROS, PROCESSOS, TAREFAS, CLIENTES
-- Execute este SQL no editor SQL do Supabase
-- ============================================================

-- Usuários do sistema (membros da equipe)
create table if not exists usuarios_sistema (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  nome text not null,
  email text,
  nivel text default 'Utilizador' check (nivel in ('Administrador', 'Utilizador')),
  equipe text,
  setor text,
  created_at timestamp with time zone default now()
);

alter table usuarios_sistema enable row level security;
create policy "usuarios_sistema_all" on usuarios_sistema for all using (true) with check (true);

-- Parceiros (escritórios / empresas parceiras)
create table if not exists parceiros (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  nome text not null,
  cnpj text,
  email text,
  telefone text,
  qtd_processos integer default 0,
  criador uuid references usuarios_sistema(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table parceiros enable row level security;
create policy "parceiros_all" on parceiros for all using (true) with check (true);

-- Setores do sistema
create table if not exists setores (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  nome text not null unique,
  criador uuid references usuarios_sistema(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table setores enable row level security;
create policy "setores_all" on setores for all using (true) with check (true);

-- Processos (estaduais e federais)
create table if not exists processos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  tipo text not null default 'estadual' check (tipo in ('estadual', 'federal')),
  numero serial,
  parceiro text,
  parceiro_id uuid references parceiros(id),
  cliente text not null,
  cpf text,
  processo text,
  cidade text,
  uf text,
  responsavel text,
  responsavel_id uuid references usuarios_sistema(id),
  data_inicio date,
  status text default 'Não Ajuizado',
  ultima_alteracao timestamp with time zone default now(),
  telefone text,
  email text,
  natureza text check (natureza in ('CIVIL', 'TRABALHISTA', 'PREVIDENCIÁRIA')),
  tipo_processo text,
  orgao text,
  endereco text,
  n_processo text,
  setor text,
  fase text,
  andamento text,
  created_at timestamp with time zone default now()
);

create index if not exists processos_org_id_tipo_idx on processos(org_id, tipo);
create index if not exists processos_status_idx on processos(status);

alter table processos enable row level security;
create policy "processos_all" on processos for all using (true) with check (true);

-- Tarefas (vinculadas a processos)
create table if not exists tarefas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  process_id uuid references processos(id) on delete set null,
  process_id_texto text,
  titulo text not null,
  descricao text,
  tipo text check (tipo in ('Documento', 'Evento', 'Anotação')),
  acao text,
  tarefa text,
  observacao text,
  prazo date,
  responsavel text,
  responsavel_id uuid references usuarios_sistema(id),
  setor text,
  tipo_responsavel text check (tipo_responsavel in ('Setor', 'Usuário', 'Equipe')),
  tipo_acao text check (tipo_acao in ('Pedir Documentação', 'Anotação', 'Evento', 'Reunião', 'Análise', 'Outro')),
  status text default 'Não Ajuizado' check (status in ('Não Ajuizado', 'Ajuizado', 'Pendência', 'Pendência Cumprida', 'Aguardando Ajuizamento', 'Arquivado', 'Aberto', 'Em Andamento', 'Concluído', 'Cancelado')),
  data_criacao timestamp with time zone default now(),
  data_conclusao timestamp with time zone,
  autor text,
  created_at timestamp with time zone default now()
);

create index if not exists tarefas_process_id_idx on tarefas(process_id);
create index if not exists tarefas_status_idx on tarefas(status);

alter table tarefas enable row level security;
create policy "tarefas_all" on tarefas for all using (true) with check (true);

-- Clientes
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  nome text not null,
  cpf_cnpj text,
  parceiro text,
  parceiro_id uuid references parceiros(id),
  email text,
  telefone text,
  uf text,
  cidade text,
  criador uuid references usuarios_sistema(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index if not exists clientes_org_id_idx on clientes(org_id);

alter table clientes enable row level security;
create policy "clientes_all" on clientes for all using (true) with check (true);

-- Equipes
create table if not exists equipes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  nome text not null,
  setor text,
  criador uuid references usuarios_sistema(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index if not exists equipes_org_id_idx on equipes(org_id);

alter table equipes enable row level security;
create policy "equipes_all" on equipes for all using (true) with check (true);

-- Histórico de Processos
create table if not exists process_history (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  process_id uuid references processos(id) on delete cascade,
  process_id_texto text,
  tipo text not null check (tipo in ('status', 'auditoria', 'comentario')),
  campo text,
  valor_anterior text,
  valor_novo text,
  texto text,
  autor text,
  data timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create index if not exists process_history_process_id_idx on process_history(process_id);
create index if not exists process_history_org_id_idx on process_history(org_id);

alter table process_history enable row level security;
create policy "process_history_all" on process_history for all using (true) with check (true);

-- Anotações de Processos
create table if not exists process_notes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  process_id uuid references processos(id) on delete cascade,
  process_id_texto text,
  titulo text,
  numero_cat text,
  senha_inss text,
  rg text,
  observacao text,
  autor text,
  data timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create index if not exists process_notes_process_id_idx on process_notes(process_id);
create index if not exists process_notes_org_id_idx on process_notes(org_id);

alter table process_notes enable row level security;
create policy "process_notes_all" on process_notes for all using (true) with check (true);

-- Comentário Dev --

  console.log('Verificar') user.id (default) "compromissos" existe e está acessível
id: 'test-${Date.now()}'
  data: new Date().toISOString().split('T')[0],
    local: "Sitema",
      prioridade: 'media',
        const { data: tableData, error: tableError } = await Supabase
        .from('compromissos')
        .select('*')
        .limit(1)(0)(2)
      alter table process_notes enable row level security:
      create index if not exist process_notes_org_id_org
    alter table process_notes enable row level security
  .from('compromissos')
    console.error(Error acess) user.process_id_texto:text
      id: `test-${Date.now()}`,
        user_id: session.user.id,
          data: new Date().toISOString().split('T')[0],
            horario: '14:00',
             descricao: 'Teste de conexão',
               local: 'Sistema',
                prioridade: 'media',
                  status: 'pendente', {
  console.log('Canon');(Cálculo) "cálculo" user.id }
    // Processos
    if (filters.processo && matches) {
      matches = matches && process.processo.includes(filters.processo)
        // cidade
      if (filters.cidade && matches) }

const [currentPage, setCurrentPage] = useState(1)
  const [showDetailedFilter, setShowDetailedFilter] = useState(false)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
      const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
    import React, { useSTATE, use emo} Use (effort_leve)
  