import { useState, useEffect } from 'react';
import { ChevronDown, LogOut, Settings, CreditCard, User as UserIcon, HelpCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserDropdownProps {
  remaining: number | null;
}

export function UserDropdown({ remaining }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const { user, subscription, signOut } = useAuth();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.('.user-dropdown')) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  if (!user) return null;

  const isSubscribed = subscription && subscription.subscription_status === 'active';
  const displayRemaining = isSubscribed ? null : remaining;

  return (
    <div className="relative user-dropdown">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="relative">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt="avatar"
            className="w-9 h-9 rounded-full border-2 border-gray-200 object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold text-gray-900">
            {user.name || user.email}
          </div>
          {!isSubscribed && displayRemaining !== null && (
            <div className="text-xs text-gray-500">
              {displayRemaining} tokens restantes
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50">
          <div className="mb-3 pb-3 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-900">
              {user.name || user.email}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
          </div>

          {!isSubscribed && displayRemaining !== null && (
            <>
              <div className="text-sm mb-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Tokens hoje</div>
                    <div className="font-bold text-lg">
                      <span className={displayRemaining < 100 ? 'text-red-600' : 'text-green-600'}>
                        {displayRemaining}
                      </span>
                      <span className="text-gray-400 text-sm">/1000</span>
                    </div>
                  </div>
                  <div>
                    <button
                      className="text-xs px-3 py-1.5 bg-gradient-to-r from-[#0EA5E9] to-[#22C55E] text-white rounded-md hover:shadow-md transition-shadow"
                      onClick={() => {
                        setOpen(false);
                        (window as any).navigateToPlans?.();
                      }}
                    >
                      Assinar
                    </button>
                  </div>
                </div>
              </div>

              <hr className="my-2" />
            </>
          )}

          <ul className="space-y-1 text-sm">
            <li>
              <button
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setOpen(false);
                  (window as any).navigateToProfile?.();
                }}
              >
                <UserIcon className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Meu Perfil</span>
              </button>
            </li>
            <li>
              <button
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setOpen(false);
                  (window as any).navigateToPlans?.();
                }}
              >
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Meu plano</span>
              </button>
            </li>
            <li>
              <button
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setOpen(false);
                  (window as any).navigateToProfessionalPanel?.();
                }}
              >
                <UserIcon className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Profissional de Saúde</span>
              </button>
            </li>
            <li>
              <button
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setOpen(false);
                  (window as any).navigateToSubscriptions?.();
                }}
              >
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Central de Assinaturas</span>
              </button>
            </li>
            <li>
              <button
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setOpen(false);
                  (window as any).navigateToSettings?.();
                }}
              >
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Configurações</span>
              </button>
            </li>

            <hr className="my-2" />

            <li>
              <div className="px-3 py-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-gray-800 mb-1">Dicas Rápidas</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Consulte bulários de medicamentos</li>
                      <li>• Busque profissionais de saúde</li>
                      <li>• Faça upload de exames</li>
                      <li>• Tire dúvidas médicas com IA</li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>

            <hr className="my-2" />

            <li>
              <button
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                }}
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium">Sair</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
