import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, User, Briefcase, MapPin } from 'lucide-react';

const professions = [
  'Psicólogo(a)',
  'Médico(a)',
  'Dentista',
  'Fisioterapeuta',
  'Nutricionista',
  'Enfermeiro(a)',
  'Fonoaudiólogo(a)',
  'Terapeuta Ocupacional',
  'Psiquiatra',
  'Outro',
];

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export function ProfessionalSignupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUpWithEmail } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    profession: '',
    specialty: '',
    city: '',
    state: '',
  });

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUpWithEmail(
        formData.email,
        formData.password,
        formData.fullName,
        'professional'
      );

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error: profError } = await supabase
          .from('professionals')
          .insert({
            user_id: user.id,
            profession: formData.profession,
            specialty: formData.specialty || null,
            city: formData.city,
            state: formData.state,
          });

        if (profError) throw profError;

        window.location.href = '/profissional/verificacao';
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profissional/cadastro/completar`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar com Google');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tervis-blue/5 via-white to-tervis-green/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="inline-flex items-center text-tervis-blue hover:text-tervis-blue/80 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </a>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-green rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Cadastro de Profissional</h1>
            <p className="text-gray-600">Junte-se aos milhares de profissionais verificados</p>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-tervis-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <div className={`w-20 h-1 ${step >= 2 ? 'bg-tervis-blue' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-tervis-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3 mb-6">
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Cadastrar com Google
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou preencha os dados</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => setStep(2)}
                disabled={!formData.fullName || !formData.email || !formData.password}
              >
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissão
                </label>
                <select
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  required
                >
                  <option value="">Selecione sua profissão</option>
                  {professions.map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidade (opcional)
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => handleChange('specialty', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  placeholder="Ex: Psicologia Clínica, Cardiologia..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                    placeholder="Sua cidade"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                    required
                  >
                    <option value="">UF</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={loading || !formData.profession || !formData.city || !formData.state}
                >
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <a href="/login" className="text-tervis-blue hover:text-tervis-blue/80 font-medium">
              Fazer login
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}