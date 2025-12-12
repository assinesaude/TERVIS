/*
  # Configuração do Storage para Documentos de Verificação
  
  ## Bucket Criado
  - documentos_verificacao: Para armazenar CRP, CRM, CRO e outros documentos profissionais
  
  ## Políticas de Segurança
  - Profissionais podem fazer upload de seus próprios documentos
  - Apenas o profissional pode visualizar seus documentos
  - Profissionais podem deletar seus documentos
  
  ## Configurações
  - Público: false (documentos privados)
  - Tipos de arquivo permitidos: PDF, JPG, JPEG, PNG
  - Tamanho máximo: 5MB por arquivo
*/

-- Criar bucket para documentos de verificação
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_verificacao',
  'documentos_verificacao',
  false,
  5242880,
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Política: Profissionais podem fazer upload de documentos
CREATE POLICY "Professionals can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos_verificacao' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Profissionais podem visualizar seus próprios documentos
CREATE POLICY "Professionals can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos_verificacao' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Profissionais podem deletar seus próprios documentos
CREATE POLICY "Professionals can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos_verificacao' AND
  (storage.foldername(name))[1] = auth.uid()::text
);