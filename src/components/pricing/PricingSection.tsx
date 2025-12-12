import React, { useState } from 'react'
import { PricingCard } from './PricingCard'
import { stripeProducts, StripeProduct } from '../../stripe-config'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Alert } from '../ui/Alert'

type BillingCycle = 'monthly' | 'annual'

export function PricingSection() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')

  const handleSelectPlan = async (product: StripeProduct) => {
    if (!user) {
      setError('Você precisa estar logado para assinar um plano')
      return
    }

    setLoading(product.priceId)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Sessão não encontrada')
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/pricing`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar sessão de checkout')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('URL de checkout não recebida')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento')
    } finally {
      setLoading(null)
    }
  }

  const billingFilter = billingCycle === 'monthly' ? 'Mensal' : 'Anual'

  const essentialPlan = stripeProducts.find(p => p.name.includes('Essencial') && p.name.includes(billingFilter))
  const professionalPlan = stripeProducts.find(p => p.name.includes('Profissional') && p.name.includes(billingFilter))
  const premiumPlan = stripeProducts.find(p => p.name.includes('Premium') && p.name.includes(billingFilter))

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Escolha o plano ideal para você
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Planos flexíveis para profissionais de saúde em todos os estágios da carreira
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

      {error && (
        <div className="mb-8">
          <Alert type="error">
            {error}
          </Alert>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {essentialPlan && (
          <PricingCard
            product={essentialPlan}
            onSelect={handleSelectPlan}
            loading={loading === essentialPlan.priceId}
          />
        )}

        {professionalPlan && (
          <PricingCard
            product={professionalPlan}
            onSelect={handleSelectPlan}
            loading={loading === professionalPlan.priceId}
            popular={true}
          />
        )}

        {premiumPlan && (
          <PricingCard
            product={premiumPlan}
            onSelect={handleSelectPlan}
            loading={loading === premiumPlan.priceId}
          />
        )}
      </div>
    </div>
  )
}