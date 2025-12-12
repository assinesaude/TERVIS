import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check } from 'lucide-react';

type BillingCycle = 'monthly' | 'annual';

interface PlanConfig {
  name: string;
  description: string;
  productId: {
    monthly: string;
    annual: string;
  };
  priceId: {
    monthly: string;
    annual: string;
  };
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
}

const PLANS: Record<string, PlanConfig> = {
  essential: {
    name: 'Essencial',
    description: 'Ideal para profissionais iniciantes',
    productId: {
      monthly: 'prod_TZFx5XJXRsBkcJ',
      annual: 'prod_TZFyMEQOHJGYJO',
    },
    priceId: {
      monthly: 'price_1Sc7Rf4BKK7f95hTDvSi40vY',
      annual: 'price_1Sc7SU4BKK7f95hTguPiX6CF',
    },
    price: {
      monthly: 19.90,
      annual: 119.00,
    },
    features: [
      'Perfil básico',
      'Aparece quando não existirem planos superiores na especialidade',
      'Visibilidade inicial',
    ],
  },
  professional: {
    name: 'Profissional',
    description: 'Melhor custo-benefício para profissionais estabelecidos',
    productId: {
      monthly: 'prod_TZFzb4DJtX8wKW',
      annual: 'prod_TZFzOd4bJmDjuC',
    },
    priceId: {
      monthly: 'price_1Sc7TL4BKK7f95hTf9iplwXM',
      annual: 'price_1Sc7Te4BKK7f95hTHN0fPbY5',
    },
    price: {
      monthly: 49.90,
      annual: 249.00,
    },
    features: [
      'Perfil completo',
      'Agendamentos ilimitados',
      'Prioridade sobre o Essencial',
      'Relatórios e ferramentas de crescimento',
    ],
  },
  premium: {
    name: 'Premium',
    description: 'Máxima visibilidade e exclusividade',
    productId: {
      monthly: 'prod_TZFz1CxFD03Xna',
      annual: 'prod_TZG0fPPV24Z8Qg',
    },
    priceId: {
      monthly: 'price_1Sc7Tx4BKK7f95hTliy1fx8o',
      annual: 'price_1Sc7Ub4BKK7f95hTfxy8MGU3',
    },
    price: {
      monthly: 99.90,
      annual: 499.00,
    },
    features: [
      'Prioridade máxima',
      'Exclusividade em até 3 bairros',
      'Marketing personalizado',
      'Análises avançadas',
      'Suporte prioritário',
    ],
  },
};

export function PlansPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelectPlan(planKey: string) {
    if (!user) {
      window.location.href = '/profissional/cadastro';
      return;
    }

    setLoading(planKey);

    try {
      const plan = PLANS[planKey];
      const productId = plan.productId[billingCycle];
      const priceId = plan.priceId[billingCycle];

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          productId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Erro ao criar sessão de checkout. Por favor, tente novamente.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Expanda sua prática profissional e alcance mais pacientes com as ferramentas certas
          </p>

          <div className="inline-flex items-center bg-white rounded-full p-1.5 shadow-lg border border-gray-200 mb-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
            </button>
          </div>

          {billingCycle === 'annual' && (
            <div className="inline-block">
              <span className="px-5 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                Economize 50% no plano anual
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {PLANS.essential.name}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {PLANS.essential.description}
              </p>
              <div className="flex items-baseline mb-1">
                <span className="text-5xl font-bold text-gray-900">
                  ${PLANS.essential.price[billingCycle].toFixed(2)}
                </span>
                <span className="text-gray-600 ml-2">
                  {billingCycle === 'monthly' ? '/mês' : '/ano'}
                </span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-green-600 font-medium">
                  ${(PLANS.essential.price.annual / 12).toFixed(2)} por mês
                </p>
              )}
            </div>

            <button
              onClick={() => handleSelectPlan('essential')}
              disabled={loading !== null}
              className="w-full py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 mb-8 disabled:opacity-50"
            >
              {loading === 'essential' ? 'Carregando...' : 'Assinar agora'}
            </button>

            <div className="space-y-4">
              {PLANS.essential.features.map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-500 p-8 transform md:scale-105 hover:shadow-2xl transition-all duration-300 relative">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
              <span className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-full shadow-lg">
                Mais Popular
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {PLANS.professional.name}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {PLANS.professional.description}
              </p>
              <div className="flex items-baseline mb-1">
                <span className="text-5xl font-bold text-blue-600">
                  ${PLANS.professional.price[billingCycle].toFixed(2)}
                </span>
                <span className="text-gray-600 ml-2">
                  {billingCycle === 'monthly' ? '/mês' : '/ano'}
                </span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-green-600 font-medium">
                  ${(PLANS.professional.price.annual / 12).toFixed(2)} por mês
                </p>
              )}
            </div>

            <button
              onClick={() => handleSelectPlan('professional')}
              disabled={loading !== null}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 mb-8 shadow-md disabled:opacity-50"
            >
              {loading === 'professional' ? 'Carregando...' : 'Assinar agora'}
            </button>

            <div className="space-y-4">
              {PLANS.professional.features.map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {PLANS.premium.name}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {PLANS.premium.description}
              </p>
              <div className="flex items-baseline mb-1">
                <span className="text-5xl font-bold text-gray-900">
                  ${PLANS.premium.price[billingCycle].toFixed(2)}
                </span>
                <span className="text-gray-600 ml-2">
                  {billingCycle === 'monthly' ? '/mês' : '/ano'}
                </span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-green-600 font-medium">
                  ${(PLANS.premium.price.annual / 12).toFixed(2)} por mês
                </p>
              )}
            </div>

            <button
              onClick={() => handleSelectPlan('premium')}
              disabled={loading !== null}
              className="w-full py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 mb-8 disabled:opacity-50"
            >
              {loading === 'premium' ? 'Carregando...' : 'Assinar agora'}
            </button>

            <div className="space-y-4">
              {PLANS.premium.features.map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-gray-500">
            Pagamento seguro processado por Stripe. Cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  );
}
