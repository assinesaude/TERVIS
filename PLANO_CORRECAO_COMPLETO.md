# PLANO DE CORREÇÃO COMPLETO - TERVIS.AI
**Data:** 2025-12-11
**Status:** EM EXECUÇÃO

---

## PROBLEMAS IDENTIFICADOS E AÇÕES

### 🔴 CRÍTICO - SEM ESTAR LOGADO

| # | Problema | Causa Provável | Ação | Status |
|---|----------|----------------|------|--------|
| 1 | Logos redes sociais não aparecem | Ícones não carregando | Verificar paths e componentes | ⏳ PENDENTE |
| 2 | Login redes sociais em looping | Callback não configurado | Corrigir CallbackPage | ⏳ PENDENTE |
| 3 | Bulário ANVISA retorna "undefined" | Modal ou edge function | Verificar BularioModal | ⏳ PENDENTE |
| 4 | Procurar profissionais exige login | Lógica de auth incorreta | Remover restrição | ⏳ PENDENTE |
| 5 | Anexar exame erro 500 | Edge function ou storage | Verificar analyze-file | ⏳ PENDENTE |
| 6 | Bulário vet 404/402 | API keys ou modal | Verificar BularioVetModal | ⏳ PENDENTE |
| 7 | Criar site looping login | Restrição desnecessária | Ajustar permissões | ⏳ PENDENTE |
| 8 | Botões /search ilegíveis | CSS/Tailwind quebrado | Refazer layout | ⏳ PENDENTE |
| 9 | Busca profissionais não filtra | Lógica de busca | Corrigir SearchPage | ⏳ PENDENTE |
| 10 | Assinar plano exige login mesmo logado | Verificação auth | Corrigir PlansPage | ⏳ PENDENTE |
| 11 | Logo TERVIS não é PNG | Formato incorreto | Trocar logo | ⏳ PENDENTE |

### 🔴 CRÍTICO - PACIENTE

| # | Problema | Causa Provável | Ação | Status |
|---|----------|----------------|------|--------|
| 12 | Cadastro paciente habilita profissional | Permissões RLS erradas | Corrigir RLS policies | ⏳ PENDENTE |
| 13 | /profile botões não funcionam | Lógica de edit | Implementar edit | ⏳ PENDENTE |
| 14 | Erro verification_status | Campo não existe em users | Corrigir queries | ⏳ PENDENTE |
| 15 | /settings inoperante | Componente não implementado | Implementar settings | ⏳ PENDENTE |

### 🔴 CRÍTICO - PROFISSIONAL

| # | Problema | Causa Provável | Ação | Status |
|---|----------|----------------|------|--------|
| 16 | /plans não exibe planos | Dados não carregando | Corrigir PlansPage | ⏳ PENDENTE |
| 17 | Pesquisas erro verification_status | Query errada | Corrigir queries | ⏳ PENDENTE |
| 18 | Dashboard quebrado | Múltiplos erros | Refazer DashboardPage | ⏳ PENDENTE |
| 19 | Upload docs página branca | Routing ou component | Corrigir routing | ⏳ PENDENTE |

---

## CORREÇÕES PLANEJADAS

### FASE 1: AUTENTICAÇÃO E CALLBACK ✅
- [ ] Corrigir CallbackPage para redes sociais
- [ ] Adicionar tratamento de erro robusto
- [ ] Testar Google, Facebook, Apple login

### FASE 2: MODALS E EDGE FUNCTIONS
- [ ] Corrigir BularioModal
- [ ] Corrigir BularioVetModal
- [ ] Corrigir UploadExamModal
- [ ] Verificar variáveis de ambiente

### FASE 3: PÁGINAS E COMPONENTES
- [ ] Refazer SearchPage (layout + filtros)
- [ ] Corrigir ProfilePage (edição)
- [ ] Implementar SettingsPage
- [ ] Corrigir PlansPage

### FASE 4: PERMISSÕES E RLS
- [ ] Corrigir permissões paciente vs profissional
- [ ] Revisar todas as RLS policies
- [ ] Garantir separação correta

### FASE 5: ASSETS E IMAGENS
- [ ] Trocar logo TERVIS por PNG
- [ ] Verificar todos os ícones de redes sociais
- [ ] Garantir que todas as imagens carregam

### FASE 6: TESTES COMPLETOS
- [ ] Testar TODOS os fluxos sem login
- [ ] Testar TODOS os fluxos como paciente
- [ ] Testar TODOS os fluxos como profissional
- [ ] Documentar resultados

---

## TIMELINE

**Início:** 2025-12-11 [AGORA]
**Conclusão Estimada:** 2025-12-11 (mesmo dia)
**Downtime:** ZERO

---

## PRÓXIMOS PASSOS IMEDIATOS

1. ✅ Corrigir CallbackPage
2. ✅ Corrigir modals de bulário
3. ✅ Corrigir SearchPage layout
4. ✅ Corrigir permissões e RLS
5. ✅ Trocar logos
6. ✅ Testar tudo

---

**EXECUÇÃO INICIADA: AGORA**
