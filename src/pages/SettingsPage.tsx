import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings, Bell, Lock, Globe } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Configurações</h1>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold">Notificações</h3>
              </div>
              <p className="text-gray-600 mb-4">Gerencie suas preferências de notificação</p>
              <Button variant="outline">Configurar</Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Lock className="w-5 h-5 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold">Segurança e Privacidade</h3>
              </div>
              <p className="text-gray-600 mb-4">Altere sua senha e configure a segurança da conta</p>
              <Button variant="outline">Configurar</Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold">Idioma e Região</h3>
              </div>
              <p className="text-gray-600 mb-4">Português (Brasil)</p>
              <Button variant="outline">Alterar</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
