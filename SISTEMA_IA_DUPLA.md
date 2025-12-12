# Sistema de IA Dupla - TERVIS.AI

Este documento descreve o sistema de inteligência artificial dupla implementado no TervisAI, que utiliza modelos diferentes baseados no tipo de usuário.

## Arquitetura

O sistema utiliza duas IAs distintas para atender diferentes perfis de usuário:

### 1. DeepSeek (Pacientes)
- **Modelo**: deepseek-chat
- **Endpoint**: https://api.deepseek.com/v1/chat/completions
- **Uso**: Pacientes e profissionais não verificados

### 2. Gemini 1.5 Pro (Profissionais Verificados)
- **Modelo**: gemini-1.5-pro
- **Endpoint**: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent
- **Uso**: Profissionais de saúde verificados

## Edge Function

A lógica de seleção de IA está implementada em uma Supabase Edge Function:

**Localização**: `supabase/functions/ai-chat/index.ts`

### Funcionamento

1. **Autenticação**: Verifica se o usuário está autenticado via JWT
2. **Detecção de Tipo**: Consulta a tabela `users` para identificar:
   - `user_type`: patient ou professional
   - `verification_status`: approved ou pending
3. **Seleção de Modelo**:
   - Se `user_type === 'patient'` OU (`user_type === 'professional'` E `verification_status !== 'approved'`) → **DeepSeek**
   - Se `user_type === 'professional'` E `verification_status === 'approved'` → **Gemini**
4. **Contexto Personalizado**: Adiciona prefix ao prompt informando o tipo de usuário
5. **Chamada à API**: Executa a chamada ao modelo correto
6. **Resposta**: Retorna a resposta formatada com o modelo usado

### Endpoint

```
POST /functions/v1/ai-chat
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "message": "Mensagem do usuário",
  "conversationHistory": [
    { "role": "user", "content": "mensagem anterior" },
    { "role": "assistant", "content": "resposta anterior" }
  ]
}
```

### Resposta

```json
{
  "response": "Resposta da IA",
  "model": "deepseek-chat" ou "gemini-1.5-pro",
  "userType": "patient" ou "professional"
}
```

## Prompt-Mestre (System Prompt)

O sistema utiliza um prompt-mestre unificado que define as regras de comportamento:

### Regras para PACIENTES

- ❌ NUNCA oferece diagnóstico
- ❌ NUNCA oferece hipótese diagnóstica
- ❌ NUNCA oferece prescrição
- ✅ Responde em linguagem simples, leiga e clara
- ✅ Educa, orienta e informa de maneira geral
- ✅ Incentiva busca de avaliação presencial
- ✅ Finaliza com: "Se quiser, posso indicar um profissional cadastrado e ativo na sua cidade. Qual o bairro?"

### Regras para PROFISSIONAIS VERIFICADOS

- ✅ Pode fornecer diagnósticos diferenciais
- ✅ Pode fornecer análises técnicas
- ✅ Pode citar condutas possíveis
- ✅ Utiliza linguagem técnica e médica
- ✅ SEMPRE inclui citações científicas (DOI, PubMed, periódicos)

### Artigos Científicos

Apenas para profissionais verificados, incluir:
- Título do estudo
- DOI ou link PubMed
- Resumo técnico breve

### Estilo

- Zero emojis
- Zero humor
- Texto limpo, direto, clínico e profissional
- Evitar opiniões
- Priorizar clareza e evidência científica

## Componente de Chat (Frontend)

**Localização**: `src/components/chat/AIChat.tsx`

### Funcionalidades

- Interface de chat responsiva
- Histórico de conversação
- Indicador de loading
- Tratamento de erros
- Scroll automático
- Suporte a Shift+Enter para múltiplas linhas

### Integração

O componente foi integrado na SearchPage (`src/pages/SearchPage.tsx`) com sistema de tabs:

- **Tab 1**: Chat com IA (padrão)
- **Tab 2**: Buscar Profissionais

## Segurança

### Autenticação

- Todas as chamadas requerem token JWT válido
- Verificação de usuário no Supabase
- RLS policies aplicadas automaticamente

### Validação

- Mensagens vazias são rejeitadas
- Histórico de conversação é sanitizado
- Erros de API são tratados adequadamente

### Rate Limiting

Implementar rate limiting no futuro para:
- Limitar chamadas por usuário
- Prevenir abuso
- Controlar custos de API

## Recomendação de Profissionais

### Sistema de Prioridade

Quando um paciente solicita indicação de profissional, a ordem de recomendação é:

1. **Plano Premium** (maior prioridade)
2. **Plano Profissional**
3. **Plano Essencial** (menor prioridade)

### Consulta ao Banco

```sql
SELECT * FROM professionals
WHERE city ILIKE '%{cidade}%'
  AND specialty ILIKE '%{especialidade}%'
  AND verification_status = 'approved'
  AND plan_type IN ('premium', 'professional', 'essential')
ORDER BY
  CASE plan_type
    WHEN 'premium' THEN 1
    WHEN 'professional' THEN 2
    WHEN 'essential' THEN 3
  END,
  rating DESC
LIMIT 5;
```

### Resposta sem Profissionais

Se não houver profissionais na região/especialidade:
"Ainda não há profissionais ativos nessa especialidade e região."

## Custos de API

### DeepSeek
- Input: ~$0.14 / 1M tokens
- Output: ~$0.28 / 1M tokens

### Gemini 1.5 Pro
- Input: ~$3.50 / 1M tokens
- Output: ~$10.50 / 1M tokens

## Monitoramento

Recomendações para monitoramento:

1. **Logs de uso**: Registrar chamadas por usuário
2. **Custos**: Monitorar gastos mensais com APIs
3. **Performance**: Tempo de resposta das IAs
4. **Erros**: Taxa de erros e tipos de falhas
5. **Satisfação**: Feedback dos usuários

## Testes

### Teste Manual

1. **Como Paciente**:
   - Fazer login como paciente
   - Acessar `/buscar`
   - Clicar em "Chat com IA"
   - Enviar: "O que é diabetes?"
   - Verificar: Resposta em linguagem leiga, sem diagnóstico
   - Verificar: Modelo usado = "deepseek-chat"

2. **Como Profissional Verificado**:
   - Fazer login como profissional verificado
   - Acessar `/buscar`
   - Clicar em "Chat com IA"
   - Enviar: "Protocolo para diagnóstico diferencial de diabetes tipo 2"
   - Verificar: Resposta técnica com citações científicas
   - Verificar: Modelo usado = "gemini-1.5-pro"

### Teste de Erro

- Tentar acessar sem estar logado → Erro de autenticação
- Enviar mensagem vazia → Mensagem de erro
- Desconectar internet durante chamada → Erro de rede

## Melhorias Futuras

1. **Streaming**: Implementar respostas em streaming para melhor UX
2. **Histórico Persistente**: Salvar conversações no banco de dados
3. **Análise de Sentimento**: Detectar urgência nas mensagens de pacientes
4. **Integração com Agenda**: Sugerir horários disponíveis ao recomendar profissionais
5. **Multilíngua**: Suporte a inglês e espanhol
6. **Voice Input**: Permitir mensagens por voz
7. **Anexos**: Suporte para envio de imagens e documentos
8. **Analytics**: Dashboard de métricas de uso da IA

## Compliance

O sistema foi projetado seguindo:

- ✅ LGPD: Dados pessoais protegidos
- ✅ CFM: Sem diagnósticos para pacientes
- ✅ Ética Médica: Profissionais seguem código de ética
- ✅ Segurança: Comunicação criptografada (HTTPS)

## Suporte

Para problemas ou dúvidas sobre o sistema de IA:
1. Verificar logs da Edge Function no Supabase
2. Consultar esta documentação
3. Testar manualmente os fluxos
4. Verificar status das APIs externas (DeepSeek e Google)
