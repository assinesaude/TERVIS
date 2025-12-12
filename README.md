# TERVIS.AI

A primeira IA do Brasil exclusivamente para promoção da relação profissional de saúde x pacientes.

## Sobre o Projeto

TERVIS.AI é uma plataforma que conecta profissionais de saúde verificados com pacientes que precisam de atendimento. A plataforma oferece:

- Sistema de verificação profissional
- Agendamento online
- Pagamentos seguros via Stripe
- Login social (Google e Facebook)
- Planos de assinatura (Starter, Pro, Premium)

## Tecnologias Utilizadas

- **Frontend**: Vite + React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Banco de Dados**: Supabase
- **Autenticação**: Supabase Auth (Google, Facebook, Email)
- **Storage**: Supabase Storage
- **Pagamentos**: Stripe (preparado para integração)
- **Ícones**: Lucide React

## Estrutura do Banco de Dados

### Tabelas Criadas

1. **users** - Perfis de usuários (pacientes e profissionais)
2. **professionals** - Dados dos profissionais de saúde
3. **professional_documents** - Documentos para verificação (CRP, CRM, etc)
4. **professional_services** - Serviços oferecidos
5. **professional_schedules** - Horários de atendimento
6. **appointments** - Agendamentos
7. **subscriptions** - Assinaturas Stripe

### Storage

- **documentos_verificacao** - Armazenamento de documentos profissionais

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

\`\`\`env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
\`\`\`

### 2. Configurar Autenticação Social

#### Google OAuth
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs & Services" > "Credentials"
4. Crie uma "OAuth 2.0 Client ID"
5. Configure as URLs de redirecionamento:
   - `https://seu-projeto.supabase.co/auth/v1/callback`
6. Copie o Client ID e Client Secret
7. No Supabase Dashboard, vá para Authentication > Providers > Google
8. Cole as credenciais e habilite o provider

#### Facebook OAuth
1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie um novo app ou selecione um existente
3. Adicione o produto "Facebook Login"
4. Configure as URLs de redirecionamento válidas:
   - `https://seu-projeto.supabase.co/auth/v1/callback`
5. Copie o App ID e App Secret
6. No Supabase Dashboard, vá para Authentication > Providers > Facebook
7. Cole as credenciais e habilite o provider

### 3. Configurar Stripe

1. Crie uma conta em [Stripe](https://stripe.com)
2. Acesse o Dashboard > Developers > API Keys
3. Copie suas chaves de API (Publishable Key e Secret Key)
4. Crie produtos no Stripe para os planos:
   - Starter: R$ 29/mês
   - Pro: R$ 59/mês
   - Premium: R$ 99/mês
5. Configure webhooks para:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Fluxos Principais

### Fluxo do Profissional

1. Cadastro inicial (nome, profissão, especialidade, cidade)
2. Login via Google/Facebook ou email
3. Upload de documentos profissionais
4. Aguardar verificação (24-48h)
5. Após verificação:
   - Configurar horários
   - Definir preços
   - Completar perfil
   - Escolher plano de assinatura

### Fluxo do Paciente

1. Buscar profissionais (por cidade, área, especialidade)
2. Visualizar perfis verificados
3. Agendar consulta
4. Pagamento via Stripe
5. Receber confirmação

## Planos

### Starter - R$ 29/mês
- Perfil verificado
- Agenda básica
- Até 30 agendamentos/mês
- Suporte por email

### Pro - R$ 59/mês
- Tudo do Starter
- Agenda avançada
- URLs personalizadas
- Destaque nas buscas
- Agendamentos ilimitados
- Suporte prioritário

### Premium - R$ 99/mês
- Tudo do Pro
- Prioridade máxima nas buscas
- Selo Premium
- Acesso a IA de diagnóstico assistido
- Analytics avançado
- Suporte VIP 24/7

## Design System

### Cores

- **Azul**: #0066CC → #33CCFF (degradê)
- **Verde**: #00A859 → #A2FF6C (degradê)
- **Fundo**: #FFFFFF (branco puro)
- **Destaques**: #F4F4F4 (cinza neutro)

### Tipografia

- Fonte: Inter
- Design moderno e minimalista
- Cantos arredondados
- Sombras leves

## Desenvolvimento

### Instalar Dependências

\`\`\`bash
npm install
\`\`\`

### Executar em Desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

### Build de Produção

\`\`\`bash
npm run build
\`\`\`

### Deploy

O projeto está configurado para deploy no Vercel. Para migrar para Next.js 15:

1. Crie um novo projeto Next.js 15
2. Migre os componentes React (funcionam em ambos)
3. Adapte as rotas para App Router do Next.js
4. Configure as variáveis de ambiente no Vercel
5. Deploy automático via GitHub

## Próximos Passos

- [ ] Migrar para Next.js 15 + React 19
- [ ] Implementar Edge Functions para webhooks Stripe
- [ ] Adicionar sistema de avaliações
- [ ] Implementar chat em tempo real
- [ ] Criar sistema de notificações
- [ ] Adicionar IA de diagnóstico assistido (Premium)
- [ ] Implementar analytics avançado

## Suporte

Para dúvidas ou suporte, entre em contato através de:
- Email: contato@tervis.ai
- Website: https://tervis.ai

## Licença

Todos os direitos reservados © 2025 TERVIS.AI