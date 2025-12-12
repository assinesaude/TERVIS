import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserDropdown } from './UserDropdown';
import { getRemainingTokens } from '../../lib/getRemainingTokens';

interface HeaderProps {
  onLoginClick?: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const { user, subscription } = useAuth();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTokens() {
      if (user?.id && (!subscription || subscription.subscription_status !== 'active')) {
        const tokens = await getRemainingTokens(user.id);
        if (mounted) {
          setRemaining(tokens);
        }
      } else {
        setRemaining(null);
      }
    }

    loadTokens();

    const handler = (e: CustomEvent) => {
      if (mounted) {
        setRemaining(e.detail);
      }
    };

    window.addEventListener('tervis:tokens:update', handler as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('tervis:tokens:update', handler as EventListener);
    };
  }, [user?.id, subscription?.subscription_status]);

  const isSubscribed = subscription && subscription.subscription_status === 'active';

  return (
    <header
      className="bg-white border-b border-gray-100 sticky top-0 z-50"
      style={{ height: '82px' }}
    >
      <div className="h-full px-6 md:px-12 flex items-center justify-between max-w-[1400px] mx-auto">
        <div></div>

        <nav className="flex items-center gap-4 md:gap-8">
          <Link
            to="/search"
            className="text-gray-700 hover:text-[#0EA5E9] font-medium transition-colors tracking-tight text-sm md:text-base"
          >
            Profissionais
          </Link>
          <Link
            to="/pricing"
            className="text-gray-700 hover:text-[#0EA5E9] font-medium transition-colors tracking-tight text-sm md:text-base"
          >
            Planos
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              {!isSubscribed && remaining !== null && (
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <div className="text-xs text-gray-500">Tokens</div>
                  <div className="px-3 py-1 bg-gray-100 rounded-full">
                    <span
                      className={`font-semibold ${
                        remaining < 100 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {remaining}
                    </span>
                    <span className="text-gray-400 text-xs">/1000</span>
                  </div>
                </div>
              )}

              <UserDropdown remaining={remaining} />
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-3 py-1.5 bg-gradient-to-r from-[#0EA5E9] to-[#22C55E] text-white rounded-lg font-medium hover:shadow-lg transition-all tracking-tight text-sm"
            >
              Entrar
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
