import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getNavigationContext, clearNavigationContext } from '../../lib/navigationContext';
import { Session } from '@supabase/supabase-js';

export function CallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function processUser(session: Session, mounted: boolean) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!existingUser) {
      const fullName = session.user.user_metadata?.full_name ||
                     session.user.user_metadata?.name ||
                     session.user.email?.split('@')[0] ||
                     'Usuário';

      const avatarUrl = session.user.user_metadata?.avatar_url ||
                       session.user.user_metadata?.picture ||
                       null;

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email!,
          full_name: fullName,
          user_type: 'patient',
          avatar_url: avatarUrl,
        });

      if (insertError && !insertError.message.includes('duplicate')) {
        throw insertError;
      }
    }

    if (!mounted) return;

    const context = getNavigationContext();
    const redirectUrl = context?.returnUrl || '/';
    clearNavigationContext();

    navigate(redirectUrl, { replace: true });
  }

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          await new Promise(resolve => setTimeout(resolve, 500));

          const { data: { session: retrySession } } = await supabase.auth.getSession();

          if (!retrySession?.user) {
            throw new Error('Não foi possível autenticar. Tente novamente.');
          }

          const finalSession = retrySession;

          await processUser(finalSession, mounted);
          return;
        }

        await processUser(session, mounted);
      } catch (err: any) {
        console.error('Error handling OAuth callback:', err);
        if (mounted) {
          setError(err.message || 'Erro ao processar autenticação');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tervis-blue/5 via-white to-tervis-green/5 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tervis-blue/5 via-white to-tervis-green/5 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tervis-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  );
}
