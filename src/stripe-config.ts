export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
  interval?: 'month' | 'year';
  features: string[];
}

export const stripeProducts: StripeProduct[] = [
  // Essential Plans
  {
    id: 'prod_TZFx5XJXRsBkcJ',
    priceId: 'price_1Sc7Rf4BKK7f95hTDvSi40vY',
    name: 'Plano Essencial – Mensal',
    description: 'Ideal para profissionais iniciantes',
    price: 19.90,
    currency: 'BRL',
    mode: 'subscription',
    interval: 'month',
    features: [
      'Perfil profissional básico',
      'Até 10 agendamentos por mês',
      'Suporte por email',
      'Acesso ao sistema de recomendações'
    ]
  },
  {
    id: 'prod_TZFyMEQOHJGYJO',
    priceId: 'price_1Sc7SU4BKK7f95hTguPiX6CF',
    name: 'Plano Essencial – Anual',
    description: 'Ideal para profissionais iniciantes (economize 50%)',
    price: 119.00,
    currency: 'BRL',
    mode: 'payment',
    interval: 'year',
    features: [
      'Perfil profissional básico',
      'Até 10 agendamentos por mês',
      'Suporte por email',
      'Acesso ao sistema de recomendações',
      '2 meses grátis'
    ]
  },
  // Professional Plans
  {
    id: 'prod_TZFzb4DJtX8wKW',
    priceId: 'price_1Sc7TL4BKK7f95hTf9iplwXM',
    name: 'Plano Profissional – Mensal',
    description: 'Para profissionais estabelecidos',
    price: 49.90,
    currency: 'BRL',
    mode: 'subscription',
    interval: 'month',
    features: [
      'Perfil profissional completo',
      'Agendamentos ilimitados',
      'Prioridade nas recomendações',
      'Suporte prioritário',
      'Relatórios avançados',
      'Integração com calendário'
    ]
  },
  {
    id: 'prod_TZFzOd4bJmDjuC',
    priceId: 'price_1Sc7Te4BKK7f95hTHN0fPbY5',
    name: 'Plano Profissional – Anual',
    description: 'Para profissionais estabelecidos (economize 58%)',
    price: 249.00,
    currency: 'BRL',
    mode: 'payment',
    interval: 'year',
    features: [
      'Perfil profissional completo',
      'Agendamentos ilimitados',
      'Prioridade nas recomendações',
      'Suporte prioritário',
      'Relatórios avançados',
      'Integração com calendário',
      '5 meses grátis'
    ]
  },
  // Premium Plans
  {
    id: 'prod_TZFz1CxFD03Xna',
    priceId: 'price_1Sc7Tx4BKK7f95hTliy1fx8o',
    name: 'Plano Premium – Mensal',
    description: 'Máxima visibilidade e exclusividade',
    price: 99.90,
    currency: 'BRL',
    mode: 'subscription',
    interval: 'month',
    features: [
      'Todos os recursos do Profissional',
      'Exclusividade em até 3 bairros',
      'Máxima prioridade nas recomendações',
      'Suporte VIP 24/7',
      'Marketing personalizado',
      'Análises detalhadas de mercado',
      'Badge Premium no perfil'
    ]
  },
  {
    id: 'prod_TZG0fPPV24Z8Qg',
    priceId: 'price_1Sc7Ub4BKK7f95hTfxy8MGU3',
    name: 'Plano Premium – Anual',
    description: 'Máxima visibilidade e exclusividade (economize 58%)',
    price: 499.00,
    currency: 'BRL',
    mode: 'payment',
    interval: 'year',
    features: [
      'Todos os recursos do Profissional',
      'Exclusividade em até 3 bairros',
      'Máxima prioridade nas recomendações',
      'Suporte VIP 24/7',
      'Marketing personalizado',
      'Análises detalhadas de mercado',
      'Badge Premium no perfil',
      '5 meses grátis'
    ]
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductsByPlan(planType: 'essential' | 'professional' | 'premium'): StripeProduct[] {
  return stripeProducts.filter(product => 
    product.name.toLowerCase().includes(planType)
  );
}

export function formatPrice(price: number, currency: string): string {
  if (currency === 'BRL') {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  }
  return `${price.toFixed(2)} ${currency}`;
}