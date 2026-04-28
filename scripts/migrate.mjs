/**
 * Script de migração: cria as 5 tabelas no Supabase
 * Uso: node scripts/migrate.mjs
 */

const PROJECT_REF = 'bflwumyjvsnzbdnvxrge'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || ''

const SQL = `
-- Usuários do sistema (membros da equipe)
create table if not exists usuarios_sistema (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  nome text not null,
  email text,
  nivel text default 'Visualizador' check (nivel in ('Administrador', 'Gerente', 'Analista', 'Associado', 'Visualizador')),
  equipe text,
  setor text,
  created_at timestamp with time zone default now()
);

alter table usuarios_sistema enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'usuarios_sistema' and policyname = 'usuarios_sistema_all') then
    execute 'create policy "usuarios_sistema_all" on usuarios_sistema for all using (true) with check (true)';
  end if;
end $$;

-- Parceiros (escritórios / empresas parceiras)
create table if not exists parceiros (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  nome text not null,
  cnpj text,
  email text,
  telefone text,
  qtd_processos integer default 0,
  created_at timestamp with time zone default now()
);

alter table parceiros enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'parceiros' and policyname = 'parceiros_all') then
    execute 'create policy "parceiros_all" on parceiros for all using (true) with check (true)';
  end if;
end $$;

-- Setores do sistema
create table if not exists setores (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references auth.users(id) on delete cascade,
  nome text not null unique,
  created_at timestamp with time zone default now()
);

alter table setores enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'setores' and policyname = 'setores_all') then
    execute 'create policy "setores_all" on setores for all using (true) with check (true)';
  end if;
end $$;

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

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'processos' and policyname = 'processos_all') then
    execute 'create policy "processos_all" on processos for all using (true) with check (true)';
  end if;
end $$;

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
  status text default 'Aberto' check (status in ('Aberto', 'Em Andamento', 'Concluído', 'Cancelado')),
  data_criacao timestamp with time zone default now(),
  data_conclusao timestamp with time zone,
  autor text,
  created_at timestamp with time zone default now()
);

create index if not exists tarefas_process_id_idx on tarefas(process_id);
create index if not exists tarefas_status_idx on tarefas(status);

alter table tarefas enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'tarefas' and policyname = 'tarefas_all') then
    execute 'create policy "tarefas_all" on tarefas for all using (true) with check (true)';
  end if;
end $$;

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
  created_at timestamp with time zone default now()
);

create index if not exists clientes_org_id_idx on clientes(org_id);

alter table clientes enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'clientes' and policyname = 'clientes_all') then
    execute 'create policy "clientes_all" on clientes for all using (true) with check (true)';
  end if;
end $$;
`

async function runMigration() {
  console.log('Executando migração no Supabase...')
  console.log(`Projeto: ${PROJECT_REF}`)

  // Tenta via Management API com Personal Access Token
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  })

  if (res.ok) {
    const data = await res.json()
    console.log('✅ Migração executada com sucesso!')
    console.log(JSON.stringify(data, null, 2))
    return
  }

  const errorText = await res.text()
  console.error(`❌ Management API retornou ${res.status}:`, errorText)

  // Tenta via endpoint direto do projeto
  console.log('\nTentando via endpoint direto do projeto...')
  const url2 = `https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql`
  const res2 = await fetch(url2, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: SQL }),
  })

  const body2 = await res2.text()
  if (res2.ok) {
    console.log('✅ Migração executada com sucesso!')
    return
  }

  console.error(`❌ Endpoint direto retornou ${res2.status}:`, body2)
  console.log('\n⚠️  Para executar manualmente:')
  console.log('1. Acesse: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql')
  console.log('2. Cole o SQL do arquivo src/utils/supabase/schema.sql (seção final)')
  console.log('3. Clique em "Run"')
}

runMigration().catch(console.error)
