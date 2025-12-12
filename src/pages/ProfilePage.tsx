import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Phone } from 'lucide-react';

export function ProfilePage() {
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
          <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

          <Card className="p-6">
            <div className="flex items-center mb-6">
              <img
                src={user.avatar || '/default-avatar.png'}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
              />
              <div className="ml-4">
                <h2 className="text-xl font-bold">{user.name || user.email}</h2>
                <p className="text-gray-600 capitalize">{user.user_type}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Nome Completo</p>
                  <p className="font-medium">{user.full_name || 'Não informado'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button variant="outline" fullWidth>
                Editar Perfil
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
