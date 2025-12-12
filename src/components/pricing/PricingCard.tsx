import React from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { StripeProduct, formatPrice } from '../../stripe-config'

interface PricingCardProps {
  product: StripeProduct
  onSelect: (product: StripeProduct) => void
  loading?: boolean
  popular?: boolean
}

export function PricingCard({ product, onSelect, loading = false, popular = false }: PricingCardProps) {
  const isAnnual = product.interval === 'year'
  
  return (
    <div className={`relative rounded-2xl border-2 p-8 ${
      popular 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 bg-white'
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Mais Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-6">
          {product.description}
        </p>
        
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="text-gray-600 ml-2">
            {product.mode === 'subscription' ? '/mês' : isAnnual ? '/ano' : ''}
          </span>
        </div>
        
        <Button
          onClick={() => onSelect(product)}
          loading={loading}
          variant={popular ? 'primary' : 'outline'}
          className="w-full mb-6"
        >
          {product.mode === 'subscription' ? 'Assinar agora' : 'Comprar agora'}
        </Button>
      </div>
      
      <ul className="space-y-3">
        {product.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}