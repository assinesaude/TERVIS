import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Upload, CheckCircle, Briefcase, FileText, CreditCard, MapPin, Phone } from 'lucide-react';

const professions = [
  'Psicólogo(a)', 'Médico(a)', 'Dentista', 'Fisioterapeuta',
  'Nutricionista', 'Enfermeiro(a)', 'Fonoaudiólogo(a)',
  'Terapeuta Ocupacional', 'Psiquiatra', 'Outro'
];

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const plans = [
  {
    type: 'essential',
    name: 'Essencial',
    price: 'R$ 199/mês',
    features: [
      'Perfil verificado na plataforma',
      'Listagem nas buscas',
      'Sistema de agendamento',
      'Suporte básico'
    ]
  },
  {
    type: 'professional',
    name: 'Profissional',
    price: 'R$ 399/mês',
    features: [
      'Tudo do Essencial',
      'Destaque na busca',
      'Prioridade nas recomendações da IA',
      'Analytics avançado',
      'Suporte prioritário'
    ],
    recommended: true
  },
  {
    type: 'premium',
    name: 'Premium',
    price: 'R$ 799/mês',
    features: [
      'Tudo do Profissional',
      'Exclusividade em até 3 bairros',
      'Primeira recomendação da IA',
      'URL personalizada',
      'Suporte VIP 24/7'
    ]
  }
];

interface FormData {
  profession: string;
  specialty: string;
  registrationNumber: string;
  city: string;
  state: string;
  phone: string;
  bio: string;
  acceptsOnline: boolean;
  acceptsInPerson: boolean;
  selectedPlan: string;
}

export function CompleteProfilePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documents, setDocuments] = useState<{ [key: string]: File }>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    profession: '',
    specialty: '',
    registrationNumber: '',
    city: '',
    state: '',
    phone: '',
    bio: '',
    acceptsOnline: false,
    acceptsInPerson: false,
    selectedPlan: 'professional'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  function handleChange(field: keyof FormData, value: string | boolean) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleFileChange(docType: string, file: File | null) {
    if (file) {
      setDocuments(prev => ({ ...prev, [docType]: file }));
    } else {
      const newDocs = { ...documents };
      delete newDocs[docType];
      setDocuments(newDocs);
    }
  }

  async function uploadDocument(professionalId: string, docType: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${professionalId}/${docType}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('professional-documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase
      .from('professional_documents')
      .insert({
        professional_id: professionalId,
        document_type: docType,
        file_path: filePath,
        file_name: file.name,
        status: 'pending'
      });

    if (dbError) throw dbError;
  }

  async function handleSubmit() {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .insert({
          user_id: user.id,
          profession: formData.profession,
          specialty: formData.specialty || null,
          registration_number: formData.registrationNumber || null,
          city: formData.city,
          state: formData.state,
          bio: formData.bio || null,
          accepts_online: formData.acceptsOnline,
          accepts_in_person: formData.acceptsInPerson,
          plan_type: formData.selectedPlan,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (profError) throw profError;

      for (const [docType, file] of Object.entries(documents)) {
        await uploadDocument(professional.id, docType, file);
      }

      await supabase
        .from('users')
        .update({ phone: formData.phone })
        .eq('id', user.id);

      setSuccess('Cadastro enviado com sucesso! Aguarde a verificação.');

      setTimeout(() => {
        navigate('/professional/verification');
      }, 2000);
    } catch (err: any) {
      console.error('Error completing profile:', err);
      setError(err.message || 'Erro ao completar cadastro');
    } finally {
      setLoading(false);
    }
  }

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-tervis-blue/5 via-white to-tervis-green/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Complete seu Perfil Profissional</h1>
            <p className="text-center text-gray-600 mb-6">
              Preencha os dados para começar a receber pacientes
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-tervis h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Etapa {step} de {totalSteps}
            </p>
          </div>

          {error && <Alert variant="error" className="mb-6">{error}</Alert>}
          {success && <Alert variant="success" className="mb-6">{success}</Alert>}

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Briefcase className="w-6 h-6 text-tervis-blue mr-3" />
                <h2 className="text-xl font-bold">Informações Profissionais</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissão *
                </label>
                <select
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  required
                >
                  <option value="">Selecione sua profissão</option>
                  {professions.map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidade
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => handleChange('specialty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  placeholder="Ex: Psicologia Clínica, Cardiologia..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Registro (CRM, CRP, CRO, etc.)
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  placeholder="Ex: CRM 12345/SP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografia Profissional
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  rows={4}
                  placeholder="Conte um pouco sobre sua formação, experiência e abordagem..."
                />
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => setStep(2)}
                disabled={!formData.profession}
              >
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-tervis-blue mr-3" />
                <h2 className="text-xl font-bold">Localização e Contato</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                    placeholder="Sua cidade"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                    required
                  >
                    <option value="">UF</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Atendimento *
                </label>
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.acceptsOnline}
                    onChange={(e) => handleChange('acceptsOnline', e.target.checked)}
                    className="w-5 h-5 text-tervis-blue focus:ring-tervis-blue border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700">Aceito consultas online (telemedicina)</span>
                </label>
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.acceptsInPerson}
                    onChange={(e) => handleChange('acceptsInPerson', e.target.checked)}
                    className="w-5 h-5 text-tervis-blue focus:ring-tervis-blue border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700">Aceito consultas presenciais</span>
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </Button>
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => setStep(3)}
                  disabled={!formData.city || !formData.state || !formData.phone || (!formData.acceptsOnline && !formData.acceptsInPerson)}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-tervis-blue mr-3" />
                <h2 className="text-xl font-bold">Documentos de Verificação</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Envie os documentos necessários para verificação do seu perfil profissional.
                    Todos os documentos são confidenciais e usados apenas para verificação.
                  </p>
                </div>

                {['diploma', 'registro_profissional', 'documento_identidade'].map((docType) => (
                  <div key={docType} className="border border-gray-300 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {docType === 'diploma' && 'Diploma ou Certificado'}
                      {docType === 'registro_profissional' && 'Registro Profissional (CRM, CRP, etc.)'}
                      {docType === 'documento_identidade' && 'Documento de Identidade (RG ou CNH)'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(docType, e.target.files?.[0] || null)}
                        className="flex-1"
                        id={`file-${docType}`}
                      />
                      {documents[docType] && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {documents[docType] && (
                      <p className="text-sm text-green-600 mt-1">
                        {documents[docType].name}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={() => setStep(2)}
                >
                  Voltar
                </Button>
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => setStep(4)}
                  disabled={Object.keys(documents).length < 3}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-6 h-6 text-tervis-blue mr-3" />
                <h2 className="text-xl font-bold">Escolha seu Plano</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.type}
                    className={`relative cursor-pointer transition-all ${
                      formData.selectedPlan === plan.type
                        ? 'ring-2 ring-tervis-blue shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleChange('selectedPlan', plan.type)}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold rounded-full">
                        RECOMENDADO
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-2xl font-bold text-tervis-blue mb-4">{plan.price}</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Você poderá alterar ou cancelar seu plano a qualquer momento.
                  O pagamento será processado após a aprovação do seu cadastro.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={() => setStep(3)}
                >
                  Voltar
                </Button>
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Finalizar Cadastro'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
