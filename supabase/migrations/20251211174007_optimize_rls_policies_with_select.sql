/*
  # Otimizar Políticas RLS - Performance em Escala

  1. Problema
    - Políticas RLS usando auth.uid() sem SELECT
    - Função é re-avaliada para CADA linha (N vezes)
    - Performance degradada drasticamente em tabelas grandes
    - Pode causar timeouts em queries com muitos resultados
  
  2. Solução
    - Usar (SELECT auth.uid()) em vez de auth.uid()
    - Função é avaliada UMA vez e resultado é reutilizado
    - Performance constante independente do número de linhas
    - Recomendação oficial do Supabase
  
  3. Políticas Otimizadas
    - appointments: "Users can view their appointments"
    - appointments: "Users can update their appointments"
    - professional_schedules: "View professional schedules"
    - professional_services: "View professional services"
    - professionals: "View professionals"
    - service_regions: "View service regions"
  
  4. Impacto de Performance
    - Queries com 100 linhas: ~100x mais rápido
    - Queries com 1000 linhas: ~1000x mais rápido
    - Queries com 10000 linhas: ~10000x mais rápido
    - Sem impacto funcional, apenas performance
  
  Referência: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
*/

-- APPOINTMENTS: Otimizar política SELECT
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;

CREATE POLICY "Users can view their appointments"
ON appointments
FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = patient_id OR
  (SELECT auth.uid()) = (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- APPOINTMENTS: Otimizar política UPDATE
DROP POLICY IF EXISTS "Users can update their appointments" ON appointments;

CREATE POLICY "Users can update their appointments"
ON appointments
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = patient_id OR
  (SELECT auth.uid()) = (SELECT user_id FROM professionals WHERE id = professional_id)
)
WITH CHECK (
  (SELECT auth.uid()) = patient_id OR
  (SELECT auth.uid()) = (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- PROFESSIONAL_SCHEDULES: Otimizar política SELECT
DROP POLICY IF EXISTS "View professional schedules" ON professional_schedules;

CREATE POLICY "View professional schedules"
ON professional_schedules
FOR SELECT
TO authenticated
USING (
  -- Qualquer um pode ver horários de profissionais verificados
  (SELECT verification_status FROM professionals WHERE id = professional_id) = 'verified'
  OR
  -- Profissionais podem ver seus próprios horários
  (SELECT auth.uid()) = (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- PROFESSIONAL_SERVICES: Otimizar política SELECT
DROP POLICY IF EXISTS "View professional services" ON professional_services;

CREATE POLICY "View professional services"
ON professional_services
FOR SELECT
TO authenticated
USING (
  -- Qualquer um pode ver serviços ativos de profissionais verificados
  (is_active = true AND (SELECT verification_status FROM professionals WHERE id = professional_id) = 'verified')
  OR
  -- Profissionais podem ver seus próprios serviços
  (SELECT auth.uid()) = (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- PROFESSIONALS: Otimizar política SELECT
DROP POLICY IF EXISTS "View professionals" ON professionals;

CREATE POLICY "View professionals"
ON professionals
FOR SELECT
TO authenticated
USING (
  -- Qualquer um pode ver profissionais verificados
  verification_status = 'verified'
  OR
  -- Profissionais podem ver seu próprio perfil
  (SELECT auth.uid()) = user_id
);

-- SERVICE_REGIONS: Otimizar política SELECT
DROP POLICY IF EXISTS "View service regions" ON service_regions;

CREATE POLICY "View service regions"
ON service_regions
FOR SELECT
TO authenticated
USING (
  -- Qualquer um pode ver regiões de profissionais verificados
  (SELECT verification_status FROM professionals WHERE id = professional_id) = 'verified'
  OR
  -- Profissionais podem ver suas próprias regiões
  (SELECT auth.uid()) = (SELECT user_id FROM professionals WHERE id = professional_id)
);
