# CORREÇÃO DO LOGIN OAUTH - INSTRUÇÕES OBRIGATÓRIAS

## Problema Identificado

O login OAuth (Google, Facebook) entra em loop ou dá erro "token não encontrado" porque:

1. As URLs de callback não estão configuradas corretamente no Supabase
2. Os provedores OAuth não estão habilitados ou configurados

## SOLUÇÃO PASSO A PASSO

### 1. Configure as URLs de Callback no Supabase

Acesse: https://supabase.com/dashboard/project/ioadeaoakauckklsemfi/auth/url-configuration

**Adicione estas URLs:**

- **Site URL:** `https://tervis.bolt.new` (ou seu domínio)
- **Redirect URLs:**
  - `https://tervis.bolt.new/auth/callback`
  - `http://localhost:5173/auth/callback` (para desenvolvimento)

### 2. Configure o Provedor Google

Acesse: https://supabase.com/dashboard/project/ioadeaoakauckklsemfi/auth/providers

**Google OAuth:**

1. Clique em "Google"
2. Habilite "Enable Sign in with Google"
3. Você precisa de:
   - **Client ID** do Google Cloud Console
   - **Client Secret** do Google Cloud Console

**Como obter as credenciais do Google:**

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Crie um projeto (se ainda não tiver)
3. Vá em "Credenciais" → "Criar credenciais" → "ID do cliente OAuth 2.0"
4. Tipo: Aplicativo da Web
5. **URIs de redirecionamento autorizados:**
   - `https://ioadeaoakauckklsemfi.supabase.co/auth/v1/callback`
6. Copie o Client ID e Client Secret
7. Cole no Supabase

### 3. Configure o Provedor Facebook

**Facebook OAuth:**

1. Acesse: https://developers.facebook.com/apps/
2. Crie um app
3. Adicione "Login do Facebook"
4. Em Configurações → Básico:
   - Copie "ID do Aplicativo" e "Chave Secreta do Aplicativo"
5. Em "Login do Facebook" → Configurações:
   - **URIs de redirecionamento OAuth válidos:**
     - `https://ioadeaoakauckklsemfi.supabase.co/auth/v1/callback`
6. Cole as credenciais no Supabase

### 4. Alterações no Código (JÁ FEITAS)

O callback foi corrigido para:
- Não depender mais do `access_token` no hash da URL
- Usar apenas `getSession()` que funciona com cookies
- Fazer retry se a sessão não estiver disponível imediatamente
- Tratamento de erro mais claro

### 5. Teste

1. Limpe os cookies do navegador
2. Acesse a página de login
3. Clique em "Continuar com Google" ou "Continuar com Facebook"
4. Autorize a aplicação
5. Você deve ser redirecionado para `/` automaticamente

## SE AINDA NÃO FUNCIONAR

1. Verifique o console do navegador (F12) para ver erros
2. Verifique se as URLs de callback estão EXATAMENTE iguais no Supabase e nos provedores
3. Certifique-se de que os provedores OAuth estão **habilitados** no Supabase
4. Limpe TODOS os cookies e tente novamente

## URLs Importantes

- Dashboard Supabase Auth: https://supabase.com/dashboard/project/ioadeaoakauckklsemfi/auth/providers
- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Facebook Developers: https://developers.facebook.com/apps/
