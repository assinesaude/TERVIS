/*
  # Correção de Problemas de Segurança e Performance

  ## Problemas Resolvidos
  
  ### 1. Foreign Keys Sem Índices
  - Adiciona índice para `sites.palette_id`
  - Adiciona índice para `sites.template_id`
  
  ### 2. Otimização de Políticas RLS
  Melhora performance substituindo `auth.uid()` por `(select auth.uid())` em:
  - `professional_pending_verification` (3 políticas)
  - `usage_tokens` (1 política)
  - `token_usage_logs` (1 política)
  - `sites` (4 políticas)
  - `domains` (4 políticas)
  - `site_images` (3 políticas)
  
  ### 3. Função com Search Path Seguro
  - Corrige `update_usage_tokens_updated_at` para usar search_path imutável
  
  ## Notas
  - Índices não utilizados foram mantidos (boas práticas para futuro)
  - Múltiplas políticas permissivas são intencionais (diferentes condições de acesso)
*/

-- =========================================
-- 1. ADICIONAR ÍNDICES PARA FOREIGN KEYS
-- =========================================

-- Índice para sites.palette_id
CREATE INDEX IF NOT EXISTS idx_sites_palette_id ON public.sites(palette_id);

-- Índice para sites.template_id
CREATE INDEX IF NOT EXISTS idx_sites_template_id ON public.sites(template_id);

-- =========================================
-- 2. OTIMIZAR POLÍTICAS RLS
-- =========================================

-- professional_pending_verification
DROP POLICY IF EXISTS "Users can create own verification request" ON public.professional_pending_verification;
DROP POLICY IF EXISTS "Users can view own verification request" ON public.professional_pending_verification;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.professional_pending_verification;

CREATE POLICY "Users can create own verification request"
  ON public.professional_pending_verification
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own verification request"
  ON public.professional_pending_verification
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own pending request"
  ON public.professional_pending_verification
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- usage_tokens
DROP POLICY IF EXISTS "Users can read own usage data" ON public.usage_tokens;

CREATE POLICY "Users can read own usage data"
  ON public.usage_tokens
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- token_usage_logs
DROP POLICY IF EXISTS "Users can read own logs" ON public.token_usage_logs;

CREATE POLICY "Users can read own logs"
  ON public.token_usage_logs
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- sites
DROP POLICY IF EXISTS "Professionals can view own sites" ON public.sites;
DROP POLICY IF EXISTS "Professionals can create own sites" ON public.sites;
DROP POLICY IF EXISTS "Professionals can update own sites" ON public.sites;
DROP POLICY IF EXISTS "Professionals can delete own sites" ON public.sites;

CREATE POLICY "Professionals can view own sites"
  ON public.sites
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.user_id = (select auth.uid())
      AND professionals.id = sites.professional_id
    )
  );

CREATE POLICY "Professionals can create own sites"
  ON public.sites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.user_id = (select auth.uid())
      AND professionals.id = sites.professional_id
    )
  );

CREATE POLICY "Professionals can update own sites"
  ON public.sites
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.user_id = (select auth.uid())
      AND professionals.id = sites.professional_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.user_id = (select auth.uid())
      AND professionals.id = sites.professional_id
    )
  );

CREATE POLICY "Professionals can delete own sites"
  ON public.sites
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.user_id = (select auth.uid())
      AND professionals.id = sites.professional_id
    )
  );

-- domains
DROP POLICY IF EXISTS "Professionals can view own domains" ON public.domains;
DROP POLICY IF EXISTS "Professionals can create domains for own sites" ON public.domains;
DROP POLICY IF EXISTS "Professionals can update own domains" ON public.domains;
DROP POLICY IF EXISTS "Professionals can delete own domains" ON public.domains;

CREATE POLICY "Professionals can view own domains"
  ON public.domains
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      JOIN public.professionals ON professionals.id = sites.professional_id
      WHERE professionals.user_id = (select auth.uid())
      AND sites.id = domains.site_id
    )
  );

CREATE POLICY "Professionals can create domains for own sites"
  ON public.domains
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      JOIN public.professionals ON professionals.id = sites.professional_id
      WHERE professionals.user_id = (select auth.uid())
      AND sites.id = domains.site_id
    )
  );

CREATE POLICY "Professionals can update own domains"
  ON public.domains
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      JOIN public.professionals ON professionals.id = sites.professional_id
      WHERE professionals.user_id = (select auth.uid())
      AND sites.id = domains.site_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      JOIN public.professionals ON professionals.id = sites.professional_id
      WHERE professionals.user_id = (select auth.uid())
      AND sites.id = domains.site_id
    )
  );

CREATE POLICY "Professionals can delete own domains"
  ON public.domains
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      JOIN public.professionals ON professionals.id = sites.professional_id
      WHERE professionals.user_id = (select auth.uid())
      AND sites.id = domains.site_id
    )
  );

-- site_images
DROP POLICY IF EXISTS "Professionals can view own site images" ON public.site_images;
DROP POLICY IF EXISTS "Professionals can upload images to own sites" ON public.site_images;
DROP POLICY IF EXISTS "Professionals can delete own site images" ON public.site_images;

CREATE POLICY "Professionals can view own site images"
  ON public.site_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      JOIN public.professionals ON professionals.id = sites.professional_id
      WHERE professionals.user_id = (select auth.uid())
      AND sites.id = site_images.site_id
    )
  );

CREATE POLICY "Professionals can upload images to own sites"
  ON public.site_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      JOIN public.professionals ON professionals.id = sites.professional_id
      WHERE professionals.user_id = (select auth.uid())
      AND sites.id = site_images.site_id
    )
  );

CREATE POLICY "Professionals can delete own site images"
  ON public.site_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      JOIN public.professionals ON professionals.id = sites.professional_id
      WHERE professionals.user_id = (select auth.uid())
      AND sites.id = site_images.site_id
    )
  );

-- =========================================
-- 3. CORRIGIR FUNÇÃO COM SEARCH_PATH SEGURO
-- =========================================

-- Dropar trigger primeiro, depois a função
DROP TRIGGER IF EXISTS update_usage_tokens_updated_at_trigger ON public.usage_tokens;
DROP TRIGGER IF EXISTS update_usage_tokens_updated_at ON public.usage_tokens;
DROP FUNCTION IF EXISTS public.update_usage_tokens_updated_at() CASCADE;

-- Recriar a função com SECURITY DEFINER e search_path fixo
CREATE OR REPLACE FUNCTION public.update_usage_tokens_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar o trigger com nome correto
CREATE TRIGGER update_usage_tokens_updated_at_trigger
  BEFORE UPDATE ON public.usage_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_usage_tokens_updated_at();
