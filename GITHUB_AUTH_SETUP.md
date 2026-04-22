# 🔐 Configuração de Autenticação GitHub com Supabase

## Passo 1: Criar uma Aplicação GitHub OAuth

1. Acesse [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Clique em **"New OAuth App"**
3. Preencha os dados:
   - **Application name**: `JusLaboral`
   - **Homepage URL**: `http://localhost:3000` (desenvolvimento) ou seu domínio em produção
   - **Authorization callback URL**: `https://bflwumyjvsnzbdnvxrge.supabase.co/auth/v1/callback`
     - Substitua o domínio pelo seu projeto Supabase
4. Clique em **"Register application"**

## Passo 2: Obter as Credenciais

Após criar a aplicação, você verá:
- **Client ID**: Copie este valor
- **Client Secret**: Clique em "Generate a new client secret" e copie

## Passo 3: Configurar no Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá para **Authentication** → **Providers**
3. Procure por **GitHub** e clique para expandir
4. Cole:
   - **Client ID** (obtido no passo anterior)
   - **Client Secret** (obtido no passo anterior)
5. Clique em **"Save"**

## Passo 4: Testar

1. Execute a aplicação: `npm run dev`
2. Clique em **"Entrar com GitHub"** na página de login
3. Você será redirecionado para GitHub para autorizar
4. Após autorizar, será redirecionado de volta e logado automaticamente

## URL de Callback (Reference)

Formato padrão do Supabase:
```
https://<seu-projeto>.supabase.co/auth/v1/callback
```

Você pode encontrar seu domínio em:
- Supabase Dashboard → Project Settings → API

## Variáveis de Ambiente

As credenciais já estão configuradas em `.env.local`:
```env
VITE_SUPABASE_URL=https://bflwumyjvsnzbdnvxrge.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Xm4J8SIBI1Xps23wSp1hsA_Mxa_49NT
```

## Troubleshooting

### "Invalid OAuth redirect URL"
- Verifique se a URL de callback no GitHub OAuth App bate com a do Supabase
- Certifique-se de não ter espaços ou caracteres especiais

### "Invalid client id"
- Verifique se copiu corretamente o Client ID do GitHub
- Salve as mudanças no Supabase clicando em "Save"

### Redirecionamento infinito
- Limpe os cookies do navegador
- Verifique se o usuário existe no Supabase (deve ser criado automaticamente)

## Próximos Passos

- Configure URLs de redirecionamento para produção
- Implemente logout em outras páginas
- Adicione verificação de email (opcional)

Para mais detalhes, consulte:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
