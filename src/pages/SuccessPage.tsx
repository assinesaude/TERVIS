import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { useSubscription } from '../hooks/useSubscription'

export function SuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { refetch } = useSubscription()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Refetch subscription data after successful payment
    const timer = setTimeout(async () => {
      await refetch()
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [refetch])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pagamento realizado com sucesso!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Obrigado por escolher a Tervis.AI. Seu plano foi ativado e você já pode aproveitar todos os benefícios.
          </p>

          {loading && (
            <Alert type="info" className="mb-6">
              Atualizando informações da sua assinatura...
            </Alert>
          )}

          {sessionId && (
            <div className="bg-white rounded-lg p-6 mb-8 border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Detalhes da transação
              </h3>
              <p className="text-sm text-gray-600">
                ID da sessão: <code className="bg-gray-100 px-2 py-1 rounded">{sessionId}</code>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = '/'}
              size="lg"
            >
              Ir para o início
            </Button>
            
            <div>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
              >
                Acessar painel
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}