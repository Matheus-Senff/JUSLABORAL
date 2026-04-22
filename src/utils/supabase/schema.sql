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
