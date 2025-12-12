/*
  # Fix Performance and Security Issues

  1. Performance Improvements
    - Add missing indexes on foreign keys for:
      - appointments.service_id
      - professional_documents.professional_id
      - professional_schedules.professional_id
      - professional_services.professional_id
    
  2. RLS Policy Optimization
    - Replace auth.uid() with (select auth.uid()) in all policies
    - This prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale
    
  3. Function Security
    - Fix search_path for check_premium_exclusivity function
    - Fix search_path for update_priority_level function
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_appointments_service_id 
  ON public.appointments(service_id);

CREATE INDEX IF NOT EXISTS idx_professional_documents_professional_id 
  ON public.professional_documents(professional_id);

CREATE INDEX IF NOT EXISTS idx_professional_schedules_professional_id 
  ON public.professional_schedules(professional_id);

CREATE INDEX IF NOT EXISTS idx_professional_services_professional_id 
  ON public.professional_services(professional_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - USERS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - PROFESSIONALS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Professionals can view own profile" ON public.professionals;
CREATE POLICY "Professionals can view own profile"
  ON public.professionals FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Professionals can insert own profile" ON public.professionals;
CREATE POLICY "Professionals can insert own profile"
  ON public.professionals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Professionals can update own profile" ON public.professionals;
CREATE POLICY "Professionals can update own profile"
  ON public.professionals FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - PROFESSIONAL_DOCUMENTS
-- =====================================================

DROP POLICY IF EXISTS "Professionals can view own documents" ON public.professional_documents;
CREATE POLICY "Professionals can view own documents"
  ON public.professional_documents FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Professionals can insert own documents" ON public.professional_documents;
CREATE POLICY "Professionals can insert own documents"
  ON public.professional_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Professionals can delete own documents" ON public.professional_documents;
CREATE POLICY "Professionals can delete own documents"
  ON public.professional_documents FOR DELETE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - PROFESSIONAL_SERVICES
-- =====================================================

DROP POLICY IF EXISTS "Professionals can manage own services" ON public.professional_services;
CREATE POLICY "Professionals can manage own services"
  ON public.professional_services FOR ALL
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - PROFESSIONAL_SCHEDULES
-- =====================================================

DROP POLICY IF EXISTS "Professionals can manage own schedules" ON public.professional_schedules;
CREATE POLICY "Professionals can manage own schedules"
  ON public.professional_schedules FOR ALL
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - APPOINTMENTS
-- =====================================================

DROP POLICY IF EXISTS "Patients can view own appointments" ON public.appointments;
CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (patient_id = (select auth.uid()));

DROP POLICY IF EXISTS "Patients can create appointments" ON public.appointments;
CREATE POLICY "Patients can create appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = (select auth.uid()));

DROP POLICY IF EXISTS "Patients can update own appointments" ON public.appointments;
CREATE POLICY "Patients can update own appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (patient_id = (select auth.uid()))
  WITH CHECK (patient_id = (select auth.uid()));

DROP POLICY IF EXISTS "Professionals can view their appointments" ON public.appointments;
CREATE POLICY "Professionals can view their appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Professionals can update their appointments" ON public.appointments;
CREATE POLICY "Professionals can update their appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES - SUBSCRIPTIONS
-- =====================================================

DROP POLICY IF EXISTS "Professionals can view own subscription" ON public.subscriptions;
CREATE POLICY "Professionals can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (professional_id = (select auth.uid()));

DROP POLICY IF EXISTS "Professionals can insert own subscription" ON public.subscriptions;
CREATE POLICY "Professionals can insert own subscription"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (professional_id = (select auth.uid()));

DROP POLICY IF EXISTS "Professionals can update own subscription" ON public.subscriptions;
CREATE POLICY "Professionals can update own subscription"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (professional_id = (select auth.uid()))
  WITH CHECK (professional_id = (select auth.uid()));

-- =====================================================
-- 9. OPTIMIZE RLS POLICIES - AUDIT_LOGS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 10. OPTIMIZE RLS POLICIES - SERVICE_REGIONS
-- =====================================================

DROP POLICY IF EXISTS "Professionals can manage own service regions" ON public.service_regions;
CREATE POLICY "Professionals can manage own service regions"
  ON public.service_regions FOR ALL
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 11. OPTIMIZE RLS POLICIES - CHAT_MESSAGES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own chat messages" ON public.chat_messages;
CREATE POLICY "Users can delete own chat messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 12. OPTIMIZE RLS POLICIES - PREMIUM_EXCLUSIVE_NEIGHBORHOODS
-- =====================================================

DROP POLICY IF EXISTS "Premium professionals can insert own exclusive neighborhoods" ON public.premium_exclusive_neighborhoods;
CREATE POLICY "Premium professionals can insert own exclusive neighborhoods"
  ON public.premium_exclusive_neighborhoods FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Premium professionals can delete own exclusive neighborhoods" ON public.premium_exclusive_neighborhoods;
CREATE POLICY "Premium professionals can delete own exclusive neighborhoods"
  ON public.premium_exclusive_neighborhoods FOR DELETE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 13. OPTIMIZE RLS POLICIES - STRIPE TABLES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON public.stripe_customers FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON public.stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view their own order data" ON public.stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON public.stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 14. FIX FUNCTION SEARCH_PATH
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_premium_exclusivity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM premium_exclusive_neighborhoods 
    WHERE specialty = NEW.specialty 
      AND city = NEW.city 
      AND neighborhood = NEW.neighborhood 
      AND professional_id != NEW.professional_id
  ) THEN
    RAISE EXCEPTION 'Este bairro já possui exclusividade para outro profissional desta especialidade';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_priority_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE professionals
  SET priority_level = 
    CASE NEW.plan_type
      WHEN 'premium' THEN 1
      WHEN 'professional' THEN 2
      WHEN 'essential' THEN 3
      ELSE 4
    END
  WHERE id = NEW.professional_id;
  
  RETURN NEW;
END;
$$;
