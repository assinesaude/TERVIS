/*
  # TERVIS.AI - Estrutura Principal do Banco de Dados
  
  ## Tabelas Criadas
  
  ### 1. users
  - Extensão da tabela auth.users do Supabase
  - Campos: id, email, full_name, user_type, created_at, updated_at
  - user_type: 'patient' ou 'professional'
  
  ### 2. professionals
  - Perfil completo dos profissionais de saúde
  - Campos: id, user_id, profession, specialty, city, state, verification_status, plan_type
  - Status de verificação: 'pending', 'verified', 'rejected'
  - Tipos de plano: 'none', 'starter', 'pro', 'premium'
  
  ### 3. professional_documents
  - Documentos enviados para verificação (CRP, CRM, CRO, etc)
  - Campos: id, professional_id, document_type, file_path, status
  
  ### 4. professional_services
  - Serviços oferecidos pelo profissional
  - Campos: id, professional_id, service_name, description, price, duration
  
  ### 5. professional_schedules
  - Horários de atendimento disponíveis
  - Campos: id, professional_id, day_of_week, start_time, end_time, is_active
  
  ### 6. appointments
  - Agendamentos entre pacientes e profissionais
  - Campos: id, professional_id, patient_id, service_id, appointment_date, status, payment_status
  
  ### 7. subscriptions
  - Assinaturas dos profissionais (Stripe)
  - Campos: id, professional_id, plan_type, stripe_subscription_id, status, current_period_end
  
  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas restritivas por padrão
  - Acesso baseado em autenticação e ownership
*/

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: users (complemento do auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  user_type text NOT NULL CHECK (user_type IN ('patient', 'professional')),
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Tabela: professionals
CREATE TABLE IF NOT EXISTS public.professionals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  profession text NOT NULL,
  specialty text,
  registration_number text,
  city text NOT NULL,
  state text NOT NULL,
  bio text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  plan_type text DEFAULT 'none' CHECK (plan_type IN ('none', 'starter', 'pro', 'premium')),
  accepts_online boolean DEFAULT false,
  accepts_in_person boolean DEFAULT false,
  custom_url text UNIQUE,
  rating numeric(3, 2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified professionals"
  ON public.professionals FOR SELECT
  TO authenticated, anon
  USING (verification_status = 'verified');

CREATE POLICY "Professionals can view own profile"
  ON public.professionals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Professionals can update own profile"
  ON public.professionals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can insert own profile"
  ON public.professionals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Tabela: professional_documents
CREATE TABLE IF NOT EXISTS public.professional_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  uploaded_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.professional_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own documents"
  ON public.professional_documents FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own documents"
  ON public.professional_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own documents"
  ON public.professional_documents FOR DELETE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

-- Tabela: professional_services
CREATE TABLE IF NOT EXISTS public.professional_services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  service_name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL,
  duration_minutes integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services of verified professionals"
  ON public.professional_services FOR SELECT
  TO authenticated, anon
  USING (
    is_active = true AND
    professional_id IN (
      SELECT id FROM public.professionals WHERE verification_status = 'verified'
    )
  );

CREATE POLICY "Professionals can manage own services"
  ON public.professional_services FOR ALL
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

-- Tabela: professional_schedules
CREATE TABLE IF NOT EXISTS public.professional_schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.professional_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schedules of verified professionals"
  ON public.professional_schedules FOR SELECT
  TO authenticated, anon
  USING (
    is_active = true AND
    professional_id IN (
      SELECT id FROM public.professionals WHERE verification_status = 'verified'
    )
  );

CREATE POLICY "Professionals can manage own schedules"
  ON public.professional_schedules FOR ALL
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

-- Tabela: appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES public.professional_services(id) ON DELETE SET NULL,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_intent_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Professionals can view their appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Professionals can update their appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

-- Tabela: subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('starter', 'pro', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own subscription"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own subscription"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_professionals_city ON public.professionals(city);
CREATE INDEX IF NOT EXISTS idx_professionals_specialty ON public.professionals(specialty);
CREATE INDEX IF NOT EXISTS idx_professionals_verification ON public.professionals(verification_status);
CREATE INDEX IF NOT EXISTS idx_professionals_plan ON public.professionals(plan_type);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON public.appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);