# Configurações Auth do Supabase - TERVIS.AI

## ⚠️ CONFIGURAÇÕES PENDENTES NO DASHBOARD

As seguintes configurações de segurança precisam ser ajustadas manualmente no Dashboard do Supabase:

---

## 1. 🔒 Habilitar Proteção contra Senhas Vazadas

**Problema Identificado:**
```
Leaked Password Protection Disabled
Supabase Auth prevents the use of compromised passwords by checking
against HaveIBeenPwned.org. Enable this feature to enhance security.
```

### Solução:

1. Acesse o Dashboard do Supabase: https://app.supabase.com
2. Selecione seu projeto TERVIS.AI
3. Navegue para: **Authentication** → **Policies** → **Password Policies**
4. Localize a opção: **"Check for breached passwords"**
5. **Habilite** esta opção

### O que isso faz:
- Verifica senhas contra o banco de dados HaveIBeenPwned.org
- Previne que usuários usem senhas comprometidas conhecidas
- Aumenta significativamente a segurança da aplicação
- Não afeta senhas já existentes, apenas novas senhas

### Recomendação:
✅ **HABILITAR IMEDIATAMENTE** para proteger contas de usuários

---

## 2. ⚡ Ajustar Estratégia de Conexões do Auth Server

**Problema Identificado:**
```
Auth DB Connection Strategy is not Percentage
Your project's Auth server is configured to use at most 10 connections.
Increasing the instance size without manually adjusting this number will
not improve the performance of the Auth server. Switch to a percentage
based connection allocation strategy instead.
```

### Solução:

1. Acesse o Dashboard do Supabase: https://app.supabase.com
2. Selecione seu projeto TERVIS.AI
3. Navegue para: **Settings** → **Database** → **Connection pooling**
4. Localize: **Auth Server Connection Pool**
5. Altere de **"Fixed number"** (10) para **"Percentage"**
6. Configure para: **10-15%** do total de conexões disponíveis

### Configuração Recomendada:

| Plano | Conexões Totais | Auth Connections (15%) |
|-------|----------------|------------------------|
| Free | 60 | 9 |
| Pro | 200 | 30 |
| Team | 400 | 60 |
| Enterprise | Custom | 15% do total |

### Benefícios:
- ✅ Escala automaticamente com upgrade de instância
- ✅ Melhor distribuição de recursos
- ✅ Mais resiliente sob carga
- ✅ Não requer ajuste manual ao fazer upgrade

### Recomendação:
✅ **CONFIGURAR PARA 15%** para melhor escalabilidade

---

## 3. 📊 Verificação de Configurações Atuais

Para verificar as configurações atuais do seu projeto:

### Via Dashboard:
1. **Authentication** → **Policies** → Verificar políticas de senha
2. **Settings** → **Database** → Verificar estratégia de conexões

### Via SQL (apenas para consulta):
```sql
-- Ver configurações de Auth (requer permissões admin)
SELECT * FROM auth.config;

-- Ver uso atual de conexões
SELECT
  count(*) as total_connections,
  usename,
  application_name
FROM pg_stat_activity
GROUP BY usename, application_name
ORDER BY total_connections DESC;
```

---

## 4. 🔐 Configurações de Segurança Adicionais Recomendadas

Enquanto estiver no Dashboard, aproveite para verificar:

### A. Email Templates
**Settings** → **Auth** → **Email Templates**
- ✅ Personalize templates de confirmação de email
- ✅ Adicione logo e branding TERVIS.AI
- ✅ Configure sender email adequado

### B. Email Provider
**Settings** → **Auth** → **Email**
- ⚠️ Considere usar provedor SMTP dedicado (SendGrid, Mailgun, etc)
- O provedor padrão do Supabase tem limites

### C. OAuth Providers
**Authentication** → **Providers**
- ✅ Google já configurado
- ⏸️ Facebook, Apple, X (em breve)
- ✅ Verificar redirect URLs corretos

### D. Rate Limiting
**Authentication** → **Rate Limits**
- ✅ Verificar limites de login (padrão: 5/hora/IP)
- ✅ Verificar limites de signup (padrão: 3/hora/IP)
- ✅ Ajustar se necessário para seu caso de uso

### E. Session Configuration
**Settings** → **Auth** → **Sessions**
- ✅ JWT Expiry: 3600 segundos (1 hora) - Padrão
- ✅ Refresh Token Expiry: 2592000 segundos (30 dias) - Padrão
- ⚠️ Considere reduzir para aplicações sensíveis

---

## 5. 📋 Checklist de Configuração

Marque conforme configurar:

- [ ] ✅ Proteção contra senhas vazadas habilitada
- [ ] ✅ Conexões Auth em porcentagem (15%)
- [ ] ✅ Email templates personalizados
- [ ] ✅ Rate limiting verificado
- [ ] ✅ Session timeouts adequados
- [ ] ✅ OAuth providers configurados
- [ ] 🔄 SMTP dedicado (opcional mas recomendado)

---

## 6. 🚨 Impacto das Mudanças

### Proteção de Senhas Vazadas:
- **Impacto:** BAIXO
- **Risco:** NENHUM
- **Usuários afetados:** Apenas novos cadastros ou mudanças de senha
- **Downtime:** ZERO

### Estratégia de Conexões:
- **Impacto:** NENHUM (imediato)
- **Benefício:** Alto (escalabilidade futura)
- **Risco:** NENHUM
- **Downtime:** ZERO

---

## 7. 📞 Suporte

Se tiver dúvidas sobre estas configurações:

1. **Documentação Oficial:**
   - https://supabase.com/docs/guides/auth
   - https://supabase.com/docs/guides/database/connecting-to-postgres

2. **Suporte Supabase:**
   - Dashboard: Ícone de suporte no canto inferior direito
   - Discord: https://discord.supabase.com
   - GitHub Issues: https://github.com/supabase/supabase

---

## ✅ Resumo

**AÇÕES NECESSÁRIAS:**
1. ✅ Habilitar proteção contra senhas vazadas (2 minutos)
2. ✅ Configurar conexões Auth para 15% (1 minuto)

**TOTAL DE TEMPO:** ~3 minutos

**RESULTADO:**
- 🔒 Maior segurança
- ⚡ Melhor escalabilidade
- 🎯 Conformidade com melhores práticas

---

**Última atualização:** 2025-12-11
**Versão:** 1.0
