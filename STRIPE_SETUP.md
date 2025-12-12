# 🎯 Guia de Configuração do Sistema de Planos Stripe - Tervis.AI

## ✅ Mudanças Implementadas

### 1. Novos Preços (USD)
Todos os planos agora usam **$** ao invés de **R$**:

#### 🟦 Plano Essencial
- **Mensal**: $19.90/mês
- **Anual**: $119.00/ano (equivalente a $9.90/mês - **50% OFF**)

#### 🟩 Plano Profissional (Mais Popular)
- **Mensal**: $49.90/mês
- **Anual**: $249.00/ano (equivalente a $20.75/mês - **50% OFF**)

#### 🟪 Plano Premium
- **Mensal**: $99.90/mês
- **Anual**: $499.00/ano (equivalente a $41.50/mês - **50% OFF**)

---

### 2. Toggle Mensal/Anual Implementado

A página de planos agora possui:

✅ **Toggle animado** para alternar entre mensal e anual
✅ **Destaque visual** quando plano anual está selecionado:
  - Selo "Economize 50%" em cada card
  - Borda verde nos cards
  - Ícone com ring verde e scale aumentado
  - Texto "Melhor escolha! 🎉"
  - Banner animado no topo: "Aproveite 50% OFF no plano anual!"

✅ **Transições suaves** ao alternar entre os modos
✅ **Preços dinâmicos** que mudam instantaneamente

---

### 3. Estrutura de Dados Atualizada

Arquivo: `src/lib/stripe.ts`

```typescript
export const STRIPE_PLANS = {
  essential: {
    name: 'Essencial',
    monthly: { price: 19.90, priceId: '...' },
    annual: { price: 119.00, pricePerMonth: 9.90, priceId: '...', discount: 50 }
  },
  professional: { /* ... */ },
  premium: { /* ... */ }
}
```

---

## 🔧 Configuração Necessária no Stripe

Para ativar os pagamentos, você precisa criar **6 produtos** no Stripe Dashboard:

### Passo 1: Acesse o Stripe Dashboard
1. Vá para [dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login na sua conta
3. Navegue até **Products** no menu lateral

### Passo 2: Criar os 6 Produtos

#### Produto 1: Essencial Mensal
- **Nome**: Tervis.AI - Plano Essencial (Mensal)
- **Preço**: $19.90 USD
- **Tipo de cobrança**: Recorrente
- **Intervalo**: Mensal (Monthly)
- **Copie o Price ID**: `price_xxxxxxxxxxxxx`

#### Produto 2: Essencial Anual
- **Nome**: Tervis.AI - Plano Essencial (Anual)
- **Preço**: $119.00 USD
- **Tipo de cobrança**: Recorrente
- **Intervalo**: Anual (Yearly)
- **Copie o Price ID**: `price_xxxxxxxxxxxxx`

#### Produto 3: Profissional Mensal
- **Nome**: Tervis.AI - Plano Profissional (Mensal)
- **Preço**: $49.90 USD
- **Tipo de cobrança**: Recorrente
- **Intervalo**: Mensal (Monthly)
- **Copie o Price ID**: `price_xxxxxxxxxxxxx`

#### Produto 4: Profissional Anual
- **Nome**: Tervis.AI - Plano Profissional (Anual)
- **Preço**: $249.00 USD
- **Tipo de cobrança**: Recorrente
- **Intervalo**: Anual (Yearly)
- **Copie o Price ID**: `price_xxxxxxxxxxxxx`

#### Produto 5: Premium Mensal
- **Nome**: Tervis.AI - Plano Premium (Mensal)
- **Preço**: $99.90 USD
- **Tipo de cobrança**: Recorrente
- **Intervalo**: Mensal (Monthly)
- **Copie o Price ID**: `price_xxxxxxxxxxxxx`

#### Produto 6: Premium Anual
- **Nome**: Tervis.AI - Plano Premium (Anual)
- **Preço**: $499.00 USD
- **Tipo de cobrança**: Recorrente
- **Intervalo**: Anual (Yearly)
- **Copie o Price ID**: `price_xxxxxxxxxxxxx`

### Passo 3: Copiar a Secret Key
1. Vá em **Developers** > **API Keys**
2. Copie sua **Secret Key** (começa com `sk_test_...` ou `sk_live_...`)

### Passo 4: Atualizar o arquivo `.env`

Cole os Price IDs no arquivo `.env`:

```env
# Essential Plan Price IDs
VITE_STRIPE_PRICE_ESSENTIAL_MONTHLY=price_xxxxxxxxxxxxx
VITE_STRIPE_PRICE_ESSENTIAL_ANNUAL=price_xxxxxxxxxxxxx

# Professional Plan Price IDs
VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxxxxxxxxxxxx
VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_xxxxxxxxxxxxx

# Premium Plan Price IDs
VITE_STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxxxxxxxxxx
VITE_STRIPE_PRICE_PREMIUM_ANNUAL=price_xxxxxxxxxxxxx

# Stripe Secret Key
VITE_STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

---

## 🎨 Recursos Visuais Implementados

### Banner de Destaque
- Badge animado com pulse no topo
- Texto: "Aproveite 50% OFF no plano anual!"
- Gradiente verde chamativo

### Toggle Mensal/Anual
- Design pill com shadow
- Botão mensal: gradiente azul
- Botão anual: gradiente verde + badge "-50%"
- Transições suaves

### Cards de Plano (Modo Anual)
- Ring verde em todos os cards
- Selo "Economize 50%" no canto superior direito
- Ícone com ring verde e scale 110%
- Preço por mês destacado ($9.90/mês)
- Valor total anual em texto menor
- Badge "Melhor escolha! 🎉"
- Botões com ring verde

### Plano Profissional (Sempre Destacado)
- Badge "Mais Popular" no topo
- Ring azul
- Scale 105%
- Maior destaque visual

---

## 📊 Estrutura de Features por Plano

### 🟦 Essencial
- Perfil verificado com selo de autenticidade
- Apareça nas buscas de pacientes
- Até 30 agendamentos por mês
- Suporte via email em até 24h
- Painel de controle básico

### 🟩 Profissional
- Tudo do Essencial
- Destaque nas buscas
- Agendamentos ilimitados
- Agenda avançada com lembretes automáticos
- URL personalizada (tervis.ai/seu-nome)
- Analytics de performance
- Suporte prioritário

### 🟪 Premium
- Tudo do Profissional
- Prioridade máxima nas buscas
- Selo Premium visível no perfil
- Acesso à IA de diagnóstico assistido
- Relatórios avançados e exportação de dados
- Integração com calendário (Google/Outlook)
- Suporte VIP 24/7 via WhatsApp
- Consultor dedicado

---

## 🚀 Próximos Passos

Após configurar os Price IDs no Stripe:

1. **Teste em modo Test**
   - Use cartões de teste do Stripe
   - Verifique se os webhooks funcionam
   - Confirme que as assinaturas são criadas corretamente

2. **Implemente o Checkout**
   - Precisa criar a rota para checkout
   - Integrar com Stripe Checkout Session
   - Implementar webhook handler

3. **Ative em Produção**
   - Mude de Test Mode para Live Mode
   - Atualize as chaves para `sk_live_...`
   - Configure webhooks em produção

---

## ❓ Dúvidas Comuns

**P: Posso mudar os preços depois?**
R: Sim, mas você precisará criar novos Price IDs no Stripe e atualizar o `.env`

**P: Posso adicionar trial period?**
R: Sim, configure no Stripe ao criar cada produto (ex: 14 dias grátis)

**P: Como funciona o desconto anual?**
R: O desconto está nos preços. O anual custa metade do que custaria 12 meses individuais.

**P: Posso ter mais que 3 planos?**
R: Sim, mas precisará ajustar `stripe.ts` e `PlansPage.tsx`

---

## 📞 Suporte

Se precisar de ajuda para configurar, me avise quando tiver:
1. Os 6 Price IDs criados no Stripe
2. A Secret Key copiada

Aí eu implemento a integração completa com checkout e webhooks!
