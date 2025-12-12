import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { QuickActions } from '../components/chat/QuickActions';
import { BularioModal } from '../components/chat/modals/BularioModal';
import { BularioVetModal } from '../components/chat/modals/BularioVetModal';
import { SearchProfessionalModal } from '../components/chat/modals/SearchProfessionalModal';
import { UploadExamModal } from '../components/chat/modals/UploadExamModal';
import LoginModal from '../components/auth/LoginModal';
import SignupSimple from '../components/auth/SignupSimple';
import RecoverPasswordModal from '../components/auth/RecoverPasswordModal';
import HeygenAvatar from '../components/chat/HeygenAvatar';
import NewsWidget from '../components/NewsWidget';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { saveNavigationContext } from '../lib/navigationContext';

export function HomePage() {
  const { user, loading } = useAuth();
  const { getCurrentPlan } = useSubscription();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);

  const [showBularioModal, setShowBularioModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBularioVetModal, setShowBularioVetModal] = useState(false);

  const isProfessional = user?.user_type === 'professional';
  const isPatient = user?.user_type === 'patient';

  function handleQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    if (!user) {
      saveNavigationContext({
        returnUrl: `/search?q=${encodeURIComponent(question)}`,
        searchQuery: question,
      });
      setShowLoginModal(true);
      return;
    }

    navigate(`/search?q=${encodeURIComponent(question)}`);
  }

  function handleSearchProfessional() {
    if (!user) {
      saveNavigationContext({
        returnUrl: '/',
      });
      setShowLoginModal(true);
      return;
    }
    setShowSearchModal(true);
  }

  function handleCreateSite() {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!isProfessional) {
      alert('Apenas profissionais verificados podem criar sites.');
      return;
    }

    const currentPlan = getCurrentPlan();
    if (!currentPlan || currentPlan.name !== 'PROFESSIONAL') {
      alert('Para criar um site profissional, você precisa do plano PROFESSIONAL. Acesse a página de planos para fazer upgrade.');
      navigate('/plans');
      return;
    }

    navigate('/sites/dashboard');
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onLoginClick={() => setShowLoginModal(true)} />

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-82px)] px-4 pt-2 pb-12">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="space-y-6">
            <div className="flex justify-center mb-2">
              <img
                src="/tervisaibonito.png"
                alt="TERVIS.AI"
                className="h-32 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-blue-700 tracking-tight leading-tight">
              A Inteligência Artificial assistente dos profissionais de saúde humana e animal.
            </h1>

            <div className="space-y-4 text-lg text-gray-600 leading-relaxed font-light max-w-3xl mx-auto">
              <p className="text-xs">
                Profissionais com apoio da Inteligência Artificial no suporte a diagnósticos e prescrições.
              </p>
              <p className="text-xs">
                Pacientes com a tranquilidade de saber que seu profissional está atualizado com as melhores tecnologias.
              </p>
            </div>
          </div>

          {isProfessional && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl max-w-2xl mx-auto">
                <p className="text-sm text-gray-700">
                  Profissionais verificados recebem prioridade em recomendações locais
                </p>
              </div>

              <button
                onClick={handleCreateSite}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg mx-auto font-medium"
              >
                <Globe className="w-5 h-5" />
                Criar Site Profissional
              </button>
            </div>
          )}

          {isPatient && (
            <div className="text-gray-600 font-light">
              A sua saúde merece precisão. Pergunte ao TERVIS.AI.
            </div>
          )}

          <form onSubmit={handleQuestionSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Digite sua dúvida de saúde..."
                className="w-full px-8 py-6 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#0EA5E9] transition-all shadow-sm hover:shadow-md font-light tracking-tight"
              />
            </div>
          </form>

          <QuickActions
            onBularioClick={() => setShowBularioModal(true)}
            onSearchProfessionalClick={handleSearchProfessional}
            onUploadExamClick={() => setShowUploadModal(true)}
            onBularioVetClick={() => setShowBularioVetModal(true)}
            onCreateSiteClick={handleCreateSite}
          />

          <NewsWidget />
        </div>
      </main>

      <HeygenAvatar />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
        onOpenRecover={() => {
          setShowLoginModal(false);
          setShowRecoverModal(true);
        }}
      />

      <SignupSimple
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />

      <RecoverPasswordModal
        isOpen={showRecoverModal}
        onClose={() => setShowRecoverModal(false)}
      />

      <BularioModal
        isOpen={showBularioModal}
        onClose={() => setShowBularioModal(false)}
      />

      <SearchProfessionalModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <UploadExamModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      <BularioVetModal
        isOpen={showBularioVetModal}
        onClose={() => setShowBularioVetModal(false)}
      />
    </div>
  );
}
