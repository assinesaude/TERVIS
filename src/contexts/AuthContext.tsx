import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, User } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface SignupSimpleForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface BecomeProfessionalPayload {
  full_name: string;
  cpf: string;
  specialty: string;
  document_url?: string;
}

interface Subscription {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

interface UserProfile extends User {
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  subscription: Subscription | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string, userType: 'patient' | 'professional') => Promise<void>;
  signUpSimple: (form: SignupSimpleForm) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  becomeProfessional: (payload: BecomeProfessionalPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      let userData = data;

      if (!data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fullName = user.user_metadata?.full_name ||
                          user.user_metadata?.name ||
                          user.email?.split('@')[0] ||
                          'Usuário';

          const avatarUrl = user.user_metadata?.avatar_url ||
                           user.user_metadata?.picture ||
                           null;

          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: fullName,
              user_type: 'patient',
              avatar_url: avatarUrl,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          userData = newUser;
        }
      }

      if (userData) {
        const userProfile: UserProfile = {
          ...userData,
          name: userData.full_name || userData.email.split('@')[0],
          avatar: userData.avatar_url || undefined,
        };
        setUser(userProfile);

        const { data: subData } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .eq('customer_id', userId)
          .maybeSingle();

        if (subData) {
          setSubscription({
            subscription_id: subData.subscription_id,
            subscription_status: subData.subscription_status,
            price_id: subData.price_id,
            current_period_end: subData.current_period_end,
            cancel_at_period_end: subData.cancel_at_period_end,
          });
        } else {
          setSubscription(null);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }

  async function signInWithFacebook() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signUpWithEmail(
    email: string,
    password: string,
    fullName: string,
    userType: 'patient' | 'professional'
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          user_type: userType,
        });

      if (profileError) throw profileError;
    }
  }

  async function signUpSimple(form: SignupSimpleForm) {
    const fullName = `${form.firstName} ${form.lastName}`;

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: fullName,
          phone: form.phone,
          user_type: 'patient',
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          phone: form.phone,
          user_type: 'patient',
        });

      if (profileError) throw profileError;
    }
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  }

  async function becomeProfessional(payload: BecomeProfessionalPayload) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('professional_pending_verification')
      .insert({
        user_id: user.id,
        full_name: payload.full_name,
        cpf: payload.cpf,
        specialty: payload.specialty,
        document_url: payload.document_url,
      });

    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }

  const value = {
    session,
    user,
    subscription,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    signUpSimple,
    resetPassword,
    becomeProfessional,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}