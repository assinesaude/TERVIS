export const STRIPE_PLANS = {
  essential: {
    name: 'Essencial',
    productId: {
      monthly: 'prod_TZFx5XJXRsBkcJ',
      annual: 'prod_TZFyMEQOHJGYJO',
    },
    monthly: {
      price: 19.90,
      priceId: 'price_1Sc7Rf4BKK7f95hTDvSi40vY',
    },
    annual: {
      price: 119.00,
      pricePerMonth: 9.92,
      priceId: 'price_1Sc7SU4BKK7f95hTguPiX6CF',
      discount: 50,
    },
    description: 'Ideal para profissionais iniciantes',
    features: [
      'Perfil profissional básico',
      'Aparecimento quando não houver profissionais superiores',
      'Visibilidade inicial',
      'Acesso ao sistema de recomendações (sem prioridade)',
    ],
  },
  professional: {
    name: 'Profissional',
    productId: {
      monthly: 'prod_TZFzb4DJtX8wKW',
      annual: 'prod_TZFzOd4bJmDjuC',
    },
    monthly: {
      price: 49.90,
      priceId: 'price_1Sc7TL4BKK7f95hTf9iplwXM',
    },
    annual: {
      price: 249.00,
      pricePerMonth: 20.75,
      priceId: 'price_1Sc7Te4BKK7f95hTHN0fPbY5',
      discount: 50,
    },
    description: 'Melhor custo-benefício para profissionais estabelecidos',
    features: [
      'Perfil completo',
      'Agendamentos ilimitados',
      'Prioridade acima do Essencial',
      'Relatórios e ferramentas de crescimento',
      'Mais recomendado para profissionais estabelecidos',
    ],
  },
  premium: {
    name: 'Premium',
    productId: {
      monthly: 'prod_TZFz1CxFD03Xna',
      annual: 'prod_TZG0fPPV24Z8Qg',
    },
    monthly: {
      price: 99.90,
      priceId: 'price_1Sc7Tx4BKK7f95hTliy1fx8o',
    },
    annual: {
      price: 499.00,
      pricePerMonth: 41.58,
      priceId: 'price_1Sc7Ub4BKK7f95hTfxy8MGU3',
      discount: 50,
    },
    description: 'Máxima visibilidade e exclusividade',
    features: [
      'Prioridade máxima',
      'Exclusividade em até 3 bairros',
      'Marketing personalizado',
      'Análises avançadas',
      'Suporte prioritário',
      'Indicação sempre antes dos demais',
    ],
  },
};

export async function createCheckoutSession(
  priceId: string,
  mode: 'subscription' | 'payment' = 'subscription',
  accessToken?: string
) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!accessToken) {
    throw new Error('User must be authenticated');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      price_id: priceId,
      mode,
      success_url: `${window.location.origin}/success`,
      cancel_url: `${window.location.origin}/pricing`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  const data = await response.json();

  if (data.url) {
    window.location.href = data.url;
  }

  return data;
}

export async function createPortalSession(accessToken: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!accessToken) {
    throw new Error('User must be authenticated');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/stripe-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      return_url: `${window.location.origin}/dashboard`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create portal session');
  }

  const data = await response.json();

  if (data.url) {
    window.location.href = data.url;
  }

  return data;
}