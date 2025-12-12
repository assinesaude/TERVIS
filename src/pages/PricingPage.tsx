import React from 'react'
import { Header } from '../components/layout/Header'
import { PricingSection } from '../components/pricing/PricingSection'

export function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PricingSection />
      </main>
    </div>
  )
}