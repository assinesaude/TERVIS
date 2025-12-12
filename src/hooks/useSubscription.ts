import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getProductByPriceId } from '../stripe-config'
import { useAuth } from './useAuth'

export interface UserSubscription {
  customer_id: string
  subscription_id: string | null
  subscription_status: string
  price_id: string | null
  current_period_start: number | null
  current_period_end: number | null
  cancel_at_period_end: boolean
  payment_method_brand: string | null
  payment_method_last4: string | null
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    fetchSubscription()
  }, [user])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()

      if (fetchError) {
        throw fetchError
      }

      setSubscription(data)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentPlan = () => {
    if (!subscription?.price_id) return null
    return getProductByPriceId(subscription.price_id)
  }

  const isActive = () => {
    return subscription?.subscription_status === 'active'
  }

  const isPending = () => {
    return subscription?.subscription_status === 'incomplete' || 
           subscription?.subscription_status === 'not_started'
  }

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    getCurrentPlan,
    isActive,
    isPending
  }
}