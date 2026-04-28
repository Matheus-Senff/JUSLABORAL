-- Criar tabela setores
create table if not exists setores (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  nome text not null unique,
  created_at timestamp with time zone default now()
);

alter table setores enable row level security;

create policy "setores_all" on setores for all using (true) with check (true);
