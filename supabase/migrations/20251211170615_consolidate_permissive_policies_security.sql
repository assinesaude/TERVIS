/*
  # Consolidar Políticas RLS Permissivas - Segurança

  1. Problema
    - Múltiplas políticas permissivas para mesma ação podem criar confusão
    - Dificulta auditoria de segurança
    - Pode causar acesso não intencional
  
  2. Solução
    - Consolidar múltiplas políticas em uma única política com OR logic explícito
    - Mais fácil de auditar e manter
    - Performance equivalente ou melhor
  
  3. Tabelas Afetadas
    - appointments (SELECT, UPDATE)
    - professional_schedules (SELECT)
    - professional_services (SELECT)
    - professionals (SELECT)
    - service_regions (SELECT)
*/

-- APPOINTMENTS: Consolidar políticas SELECT
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Professionals can view their appointments" ON appointments;

CREATE POLICY "Users can view their appointments"
ON appointments
FOR SELECT
TO authenticated
USING (
  auth.uid() = patient_id OR
  auth.uid() = (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- APPOINTMENTS: Consolidar políticas UPDATE
DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Professionals can update their appointments" ON appointments;

CREATE POLICY "Users can update their appointments"
ON appointments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = patient_id OR
  auth.uid() = (SELECT user_id FROM professionals WHERE id = professional_id)
)
WITH CHECK (
  auth.uid() = patient_id OR
  auth.uid() = (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- PROFESSIONAL_SCHEDULES: Consolidar políticas SELECT
DROP POLICY IF EXISTS "Anyone can view schedules of verified professionals" ON professional_schedules;
DROP POLICY IF EXISTS "Professionals can manage own schedules" ON professional_schedules;

CREATE POLICY "View professional schedules"
ON professional_schedules
FOR SELECT
TO authenticated
USING (
  -- Qualquer um pode ver horários de profissionais verificados
  (SELECT verification_status FROM professionals WHERE id = professional_id) = 'verified'
  OR
  -- Profissionais podem ver seus próprios horários
  auth.uid() = (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- PROFESSIONAL_SERVICES: Consolidar políticas SELECT
DROP POLICY IF EXISTS "Anyone can view active services of verified professionals" ON professional_services;
DROP POLICY IF EXISTS "Professionals can manage own services" ON professional_services;

CREATE POLICY "View professional services"
ON professional_services
FOR SELECT
TO authenticated
USING (
  -- Qualquer um pode ver serviços ativos de profissionais verificados
  (is_active = true AND (SELECT verification_status FROM professionals WHERE id = professional_id) = 'verified')
  OR
  -- Profissionais podem ver seus próprios serviços
  auth.uid() = (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- PROFESSIONALS: Consolidar políticas SELECT
DROP POLICY IF EXISTS "Anyone can view verified professionals" ON professionals;
DROP POLICY IF EXISTS "Professionals can view own profile" ON professionals;

CREATE POLICY "View professionals"
ON professionals
FOR SELECT
TO authenticated
USING (
  -- Qualquer um pode ver profissionais verificados
  verification_status = 'verified'
  OR
  -- Profissionais podem ver seu próprio perfil
  auth.uid() = user_id
);

-- SERVICE_REGIONS: Consolidar políticas SELECT
DROP POLICY IF EXISTS "Anyone can view service regions of verified professionals" ON service_regions;
DROP POLICY IF EXISTS "Professionals can manage own service regions" ON service_regions;

CREATE POLICY "View service regions"
ON service_regions
FOR SELECT
TO authenticated
USING (
  -- Qualquer um pode ver regiões de profissionais verificados
  (SELECT verification_status FROM professionals WHERE id = professional_id) = 'verified'
  OR
  -- Profissionais podem ver suas próprias regiões
  auth.uid() = (SELECT user_id FROM professionals WHERE id = professional_id)
);
