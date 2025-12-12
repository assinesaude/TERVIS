import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Professional, Appointment } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Calendar, Users, DollarSign, Clock, Settings, FileText, Star, Crown } from 'lucide-react';
import { PremiumNeighborhoods } from '../../components/professional/PremiumNeighborhoods';

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    monthlyRevenue: 0,
    rating: 0,
  });

  useEffect(() => {
    if (user) {
      loadProfessionalData();
      loadAppointments();
    }
  }, [user]);

  async function loadProfessionalData() {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setProfessional(data);
    } catch (error) {
      console.error('Error loading professional:', error);
    }
  }

  async function loadAppointments() {
    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!professional) return;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', professional.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);

      const pending = data?.filter(a => a.status === 'pending').length || 0;
      setStats({
        totalAppointments: data?.length || 0,
        pendingAppointments: pending,
        monthlyRevenue: 0,
        rating: professional ? 0 : 0,
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }

  const planBadge = {
    none: { color: 'gray', label: 'Sem Plano' },
    essential: { color: 'blue', label: 'Essencial' },
    professional: { color: 'green', label: 'Profissional' },
    premium: { color: 'purple', label: 'Premium' },
  };

  const currentPlan = professional?.plan_type || 'none';
  const badge = planBadge[currentPlan as keyof typeof planBadge] || planBadge.none;
  const isPremium = currentPlan === 'premium';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-tervis rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Painel do Profissional</h1>
                <p className="text-sm text-gray-600">{user?.full_name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {professional?.verification_status !== 'verified' && (
          <Card className="mb-8 bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-600 mr-3" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 mb-1">Perfil em Verificação</h3>
                <p className="text-yellow-800 text-sm">
                  Seu perfil está sendo analisado. Envie seus documentos para acelerar o processo.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-yellow-600 text-yellow-600"
                onClick={() => window.location.href = '/professional/verification'}
              >
                Enviar Documentos
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Agendamentos</p>
                <p className="text-3xl font-bold">{stats.totalAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-blue rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pendentes</p>
                <p className="text-3xl font-bold">{stats.pendingAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-green rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Receita Mensal</p>
                <p className="text-3xl font-bold">$ {stats.monthlyRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-blue rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avaliação</p>
                <div className="flex items-center">
                  <p className="text-3xl font-bold mr-2">{professional?.rating || '0.0'}</p>
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-green rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {professional && (
              <PremiumNeighborhoods
                professionalId={professional.id}
                specialty={professional.specialty || professional.profession}
                city={professional.city}
                state={professional.state}
                isPremium={isPremium}
              />
            )}

            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Próximos Agendamentos</h2>
                <Button variant="outline" size="sm">Ver Todos</Button>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum agendamento ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Paciente #{apt.patient_id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(apt.appointment_date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {apt.status === 'pending' ? 'Pendente' :
                         apt.status === 'confirmed' ? 'Confirmado' :
                         apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" fullWidth className="h-20">
                  <div className="text-center">
                    <Settings className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Configurar Horários</span>
                  </div>
                </Button>
                <Button variant="outline" fullWidth className="h-20">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Definir Preços</span>
                  </div>
                </Button>
                <Button variant="outline" fullWidth className="h-20">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Completar Perfil</span>
                  </div>
                </Button>
                <Button variant="outline" fullWidth className="h-20">
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Ver Perfil Público</span>
                  </div>
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={`bg-gradient-to-br ${isPremium ? 'from-purple-600 to-purple-400' : 'from-tervis-blue to-tervis-green'} text-white`}>
              <div className="flex items-center mb-4">
                <Crown className="w-8 h-8 mr-2" />
                <h3 className="text-xl font-bold">Seu Plano</h3>
              </div>
              <p className="text-2xl font-bold mb-2">{badge.label}</p>
              {currentPlan === 'none' ? (
                <>
                  <p className="text-white/90 text-sm mb-4">
                    Assine um plano para desbloquear recursos exclusivos e ser prioridade nas recomendações da IA
                  </p>
                  <Button
                    className="bg-white text-tervis-blue hover:bg-gray-100"
                    fullWidth
                    onClick={() => window.location.href = '/planos'}
                  >
                    Ver Planos
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-white/90 text-sm mb-4">
                    {isPremium
                      ? 'Você tem PRIORIDADE MÁXIMA nas recomendações da IA'
                      : `Você tem acesso a todos os recursos do plano ${badge.label}`
                    }
                  </p>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10" fullWidth>
                    Gerenciar Plano
                  </Button>
                </>
              )}
            </Card>

            <Card>
              <h3 className="font-bold mb-4">Status do Perfil</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Informações Básicas</span>
                  <span className="text-tervis-green">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documentos</span>
                  <span className={professional?.verification_status === 'verified' ? 'text-tervis-green' : 'text-yellow-600'}>
                    {professional?.verification_status === 'verified' ? '✓' : '⏱'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Horários</span>
                  <span className="text-gray-400">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Serviços</span>
                  <span className="text-gray-400">-</span>
                </div>
              </div>
              <Button variant="outline" fullWidth className="mt-4">
                Completar Perfil
              </Button>
            </Card>

            <Card>
              <h3 className="font-bold mb-4">Precisa de Ajuda?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Nossa equipe está pronta para ajudar você a começar
              </p>
              <Button variant="outline" fullWidth>
                Central de Ajuda
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
