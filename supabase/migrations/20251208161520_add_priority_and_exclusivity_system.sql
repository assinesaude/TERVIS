/*
  # Sistema de Prioridade e Exclusividade Tervis.AI

  ## Mudanças Implementadas

  ### 1. Atualização da Tabela Professionals
    - Atualizado `plan_type` para incluir novos valores: 'none', 'essential', 'professional', 'premium'
    - Adicionado campo `priority_level` (integer) para ordenação de recomendações da IA
    - Adicionado campo `is_exclusive` (boolean) para identificar profissionais Premium exclusivos

  ### 2. Nova Tabela: premium_exclusive_neighborhoods
    - Gerencia os bairros exclusivos de profissionais Premium
    - Campos: id, professional_id, neighborhood, city, state, created_at
    - Limite: 3 bairros por profissional Premium
    - Constraint: Apenas 1 Premium por especialidade por bairro

  ### 3. Sistema de Prioridade
    - Premium: priority_level = 3 (prioridade máxima)
    - Professional: priority_level = 2 (prioridade média)
    - Essential: priority_level = 1 (prioridade baixa)
    - None: priority_level = 0 (sem prioridade)

  ### 4. Segurança
    - RLS habilitado na nova tabela
    - Políticas para visualização e gerenciamento de bairros exclusivos
    - Verificação de exclusividade antes de inserção

  ### 5. Índices
    - Índice composto para verificação rápida de exclusividade
    - Índice em priority_level para ordenação eficiente
*/

-- Atualizar plan_type na tabela professionals para incluir novos valores
DO $$
BEGIN
  -- Drop constraint antiga se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'professionals_plan_type_check' 
    AND table_name = 'professionals'
  ) THEN
    ALTER TABLE public.professionals DROP CONSTRAINT professionals_plan_type_check;
  END IF;

  -- Adicionar nova constraint com os novos valores
  ALTER TABLE public.professionals 
    ADD CONSTRAINT professionals_plan_type_check 
    CHECK (plan_type IN ('none', 'essential', 'professional', 'premium'));
END $$;

-- Atualizar valores antigos para novos (se existirem)
UPDATE public.professionals 
SET plan_type = 'essential' 
WHERE plan_type = 'starter';

UPDATE public.professionals 
SET plan_type = 'professional' 
WHERE plan_type = 'pro';

-- Adicionar campo priority_level se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' AND column_name = 'priority_level'
  ) THEN
    ALTER TABLE public.professionals 
      ADD COLUMN priority_level integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Adicionar campo is_exclusive se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' AND column_name = 'is_exclusive'
  ) THEN
    ALTER TABLE public.professionals 
      ADD COLUMN is_exclusive boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Atualizar priority_level baseado no plan_type existente
UPDATE public.professionals 
SET priority_level = CASE 
  WHEN plan_type = 'premium' THEN 3
  WHEN plan_type = 'professional' THEN 2
  WHEN plan_type = 'essential' THEN 1
  ELSE 0
END;

-- Criar tabela para bairros exclusivos Premium
CREATE TABLE IF NOT EXISTS public.premium_exclusive_neighborhoods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  neighborhood text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  specialty text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(specialty, neighborhood, city, state)
);

ALTER TABLE public.premium_exclusive_neighborhoods ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para premium_exclusive_neighborhoods
CREATE POLICY "Anyone can view exclusive neighborhoods"
  ON public.premium_exclusive_neighborhoods FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Premium professionals can insert own exclusive neighborhoods"
  ON public.premium_exclusive_neighborhoods FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals 
      WHERE user_id = auth.uid() 
      AND plan_type = 'premium'
    )
    AND (
      SELECT COUNT(*) 
      FROM public.premium_exclusive_neighborhoods 
      WHERE professional_id = premium_exclusive_neighborhoods.professional_id
    ) < 3
  );

CREATE POLICY "Premium professionals can delete own exclusive neighborhoods"
  ON public.premium_exclusive_neighborhoods FOR DELETE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

-- Atualizar subscriptions para usar novos plan_types
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'subscriptions_plan_type_check' 
    AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_plan_type_check;
  END IF;

  ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_plan_type_check 
    CHECK (plan_type IN ('essential', 'professional', 'premium'));
END $$;

UPDATE public.subscriptions 
SET plan_type = 'essential' 
WHERE plan_type = 'starter';

UPDATE public.subscriptions 
SET plan_type = 'professional' 
WHERE plan_type = 'pro';

-- Função para verificar exclusividade antes de inserir
CREATE OR REPLACE FUNCTION check_premium_exclusivity()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se já existe um Premium na mesma especialidade e bairro
  IF EXISTS (
    SELECT 1 
    FROM public.premium_exclusive_neighborhoods 
    WHERE specialty = NEW.specialty 
    AND neighborhood = NEW.neighborhood 
    AND city = NEW.city 
    AND state = NEW.state
    AND professional_id != NEW.professional_id
  ) THEN
    RAISE EXCEPTION 'Este bairro já possui um especialista Premium. Escolha outro.';
  END IF;

  -- Verificar se o profissional já tem 3 bairros
  IF (
    SELECT COUNT(*) 
    FROM public.premium_exclusive_neighborhoods 
    WHERE professional_id = NEW.professional_id
  ) >= 3 THEN
    RAISE EXCEPTION 'Você já atingiu o limite de 3 bairros exclusivos.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar exclusividade
DROP TRIGGER IF EXISTS trigger_check_premium_exclusivity ON public.premium_exclusive_neighborhoods;
CREATE TRIGGER trigger_check_premium_exclusivity
  BEFORE INSERT ON public.premium_exclusive_neighborhoods
  FOR EACH ROW
  EXECUTE FUNCTION check_premium_exclusivity();

-- Função para atualizar priority_level quando plan_type muda
CREATE OR REPLACE FUNCTION update_priority_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.priority_level = CASE 
    WHEN NEW.plan_type = 'premium' THEN 3
    WHEN NEW.plan_type = 'professional' THEN 2
    WHEN NEW.plan_type = 'essential' THEN 1
    ELSE 0
  END;

  NEW.is_exclusive = (NEW.plan_type = 'premium');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar priority_level automaticamente
DROP TRIGGER IF EXISTS trigger_update_priority_level ON public.professionals;
CREATE TRIGGER trigger_update_priority_level
  BEFORE INSERT OR UPDATE OF plan_type ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_priority_level();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_professionals_priority_level 
  ON public.professionals(priority_level DESC);

CREATE INDEX IF NOT EXISTS idx_premium_neighborhoods_specialty_city 
  ON public.premium_exclusive_neighborhoods(specialty, city, state);

CREATE INDEX IF NOT EXISTS idx_premium_neighborhoods_professional 
  ON public.premium_exclusive_neighborhoods(professional_id);

-- Comentários para documentação
COMMENT ON COLUMN public.professionals.priority_level IS 'Nível de prioridade nas recomendações da IA: 3=Premium, 2=Professional, 1=Essential, 0=None';
COMMENT ON COLUMN public.professionals.is_exclusive IS 'Indica se o profissional Premium tem exclusividade em bairros';
COMMENT ON TABLE public.premium_exclusive_neighborhoods IS 'Bairros exclusivos para profissionais Premium (máximo 3 por profissional, 1 Premium por especialidade por bairro)';
