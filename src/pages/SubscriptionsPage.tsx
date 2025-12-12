import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SubscriptionsPage() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto text-center p-12">
            <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
          </Card>
        </div>
      </div>
    );
  }

  const isActive = subscription && subscription.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Central de Assinaturas</h1>

          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CreditCard className="w-6 h-6 text-gray-600 mr-3" />
                <h3 className="text-xl font-semibold">Status da Assinatura</h3>
              </div>
              {isActive ? (
                <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ativa
                </span>
              ) : (
                <span className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  <XCircle className="w-4 h-4 mr-1" />
                  Sem assinatura
                </span>
              )}
            </div>

            {isActive ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Plano Atual</p>
                  <p className="font-medium">Premium</p>
                </div>
                {subscription.current_period_end && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Próxima Cobrança</p>
                    <p className="font-medium">
                      {new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200">
                  <Button variant="outline" fullWidth>
                    Gerenciar Assinatura no Stripe
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  Você não possui uma assinatura ativa. Assine agora e tenha acesso ilimitado!
                </p>
                <Button onClick={() => navigate('/pricing')}>
                  Ver Planos Disponíveis
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Pagamentos</h3>
            <p className="text-gray-600 text-center py-8">
              Nenhum histórico de pagamento disponível
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
