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
