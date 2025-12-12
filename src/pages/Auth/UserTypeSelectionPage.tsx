import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Stethoscope, ArrowRight } from 'lucide-react';

export function UserTypeSelectionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleUserTypeSelection(userType: 'patient' | 'professional') {
    if (!user) {
      setError('Você precisa estar logado para continuar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_type: userType })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (userType === 'professional') {
        navigate('/professional/signup');
      } else {
        navigate('/search');
      }
    } catch (err: any) {
      console.error('Error updating user type:', err);
      setError(err.message || 'Erro ao atualizar tipo de usuário');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tervis-blue/5 via-white to-tervis-green/5 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bem-vindo ao TERVIS.AI</h1>
          <p className="text-lg text-gray-600">Como você gostaria de usar nossa plataforma?</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="relative hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => !loading && handleUserTypeSelection('patient')}>
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-blue rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Sou Paciente</h2>
              <p className="text-gray-600 mb-6">
                Buscar profissionais de saúde verificados e conversar com a IA de saúde
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-tervis-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Chat com IA especializada em saúde</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-tervis-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Busca de profissionais verificados</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-tervis-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Agendamento online de consultas</span>
                </li>
              </ul>
              <Button
                fullWidth
                size="lg"
                disabled={loading}
                className="group-hover:bg-tervis-blue group-hover:text-white"
              >
                {loading ? 'Processando...' : 'Continuar como Paciente'}
              </Button>
            </div>
          </Card>

          <Card className="relative hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => !loading && handleUserTypeSelection('professional')}>
            <div className="absolute -top-3 -right-3 px-4 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold rounded-full">
              PARA PROFISSIONAIS
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-tervis rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Sou Profissional de Saúde</h2>
              <p className="text-gray-600 mb-6">
                Cadastrar-me como profissional e ter acesso à IA clínica avançada
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">IA com análise técnica e científica</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Perfil verificado na plataforma</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Gestão de agenda e consultas</span>
                </li>
              </ul>
              <Button
                fullWidth
                size="lg"
                disabled={loading}
                className="bg-gradient-tervis text-white group-hover:shadow-lg"
              >
                {loading ? 'Processando...' : 'Continuar como Profissional'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Você poderá alterar essa configuração depois nas configurações da sua conta
          </p>
        </div>
      </div>
    </div>
  );
}
