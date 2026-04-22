# 🚀 Configuração Completa - Supabase + JusLaboral

## 1️⃣ CRIAR PROJETO NO SUPABASE

### Passo 1: Acessar Supabase
- Acesse: https://app.supabase.com
- Faça login com sua conta (ou crie uma nova)

### Passo 2: Criar Novo Projeto
1. Clique em **"New Project"** (ou ícone +)
2. Selecione uma **Organization** (ou crie uma)
3. Configure:
   - **Project Name**: `juslaboral`
   - **Database Password**: Crie uma senha forte (salve em local seguro!)
   - **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
4. Clique em **"Create new project"**
5. **Aguarde 3-5 minutos** enquanto o projeto é inicializado

### Passo 3: Copiar Credenciais
Após criar, você será redirecionado ao Dashboard. Vá para:
1. **Settings** (engrenagem no canto inferior esquerdo)
2. **API** (menu esquerdo)
3. Copie:
   - **Project URL** → Cole em `.env.local` como `VITE_SUPABASE_URL`
   - **anon public** (em "Project API keys") → Cole em `.env.local` como `VITE_SUPABASE_PUBLISHABLE_KEY`

Seu `.env.local` ficará assim:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=seu_anon_key_aqui
```

---

## 2️⃣ EXECUTAR O SCHEMA SQL

### Passo 1: Abrir SQL Editor
1. No Dashboard do Supabase, clique em **"SQL Editor"** (menu esquerdo)
2. Clique em **"New query"**

### Passo 2: Colar o Schema
1. Abra o arquivo: `src/utils/supabase/schema.sql`
2. Copie TODO o conteúdo
3. Cole no editor SQL do Supabase
4. Clique em **"Run"** (ícone ▶️ ou Ctrl+Enter)

Você verá:
```
Query executed successfully
```

---

## 3️⃣ ATIVAR AUTENTICAÇÃO POR EMAIL

### Passo 1: Habilitar Email Provider
1. No Dashboard, vá para **Authentication** (menu esquerdo)
2. Clique em **"Providers"**
3. Procure por **"Email"**
4. Ative o switch (se não estiver ativo)
5. Clique em **"Save"**

---

## 4️⃣ TESTAR A APLICAÇÃO

### Terminal
```bash
npm run dev
```

### No Browser
1. Acesse: http://localhost:3000
2. Você deve ver a página de **Login/Registra**
3. Clique em **"Não tem conta? Registrar"**
4. Preencha:
   - Email: seu@email.com
   - Senha: SenhaForte123!
   - Confirmar Senha: SenhaForte123!
5. Clique em **"Registrar"**
6. **Verifique seu email** (pode ir para spam!)
7. Clique no link de confirmação
8. Volte ao app e faça login

---

## 5️⃣ VERIFICAR DADOS NO SUPABASE

### Ver Usuários Criados
1. Dashboard → **Authentication** → **Users**
2. Você deve ver seu usuário criado

### Ver Compromissos (Tabela)
1. Dashboard → **Table Editor** (menu esquerdo)
2. Clique em **"compromissos"**
3. A tabela estará vazia (você criará compromissos pelo app)

---

## 📝 Resumo das URLs e Credenciais

| Item | Onde Encontrar |
|------|---|
| **Project URL** | Settings → API |
| **Anon Key** | Settings → API |
| **SQL Editor** | Menu esquerdo |
| **Authentication** | Menu esquerdo |
| **Table Editor** | Menu esquerdo |

---

## ⚠️ Troubleshooting

### "Projeto não aparece em Meus Projetos"
- O projeto pode estar em outra **Organization**
- Verifique no dropdown de Organization (canto superior)

### "SQL error: relation 'compromissos' does not exist"
- O schema.sql não foi executado corretamente
- Vá para SQL Editor e clique em "Run" novamente

### "Cannot find module '@/utils/supabase/client'"
- Rode: `npm install`
- Depois: `npm run build`

### Email de confirmação não chega
- Verifique a pasta **Spam** do seu email
- Espere alguns minutos (pode ser lento)

---

## 🎯 Próximos Passos Após Configurar

1. ✅ Criar conta e fazer login
2. ✅ Acessar a seção "Compromissos"
3. ✅ Criar, editar e remarcar compromissos
4. ✅ Sincronização automática com Supabase em tempo real
5. ✅ Fazer logout e login novamente para confirmar persistência

---

## 💬 Dúvidas?

Se ficar preso em qualquer etapa, verifique:
- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Dashboard Help](https://app.supabase.com/help)
- Console do navegador (F12) para ver erros

Boa sorte! 🚀
