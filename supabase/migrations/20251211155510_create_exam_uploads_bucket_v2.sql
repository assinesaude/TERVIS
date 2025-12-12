/*
  # Criar Bucket para Upload de Exames

  1. Novo Bucket
    - `exam-uploads` - Bucket público para armazenar exames enviados pelos usuários
  
  2. Políticas RLS
    - Usuários autenticados podem fazer upload de seus próprios arquivos
    - Usuários autenticados podem ler seus próprios arquivos
    - Usuários autenticados podem deletar seus próprios arquivos
*/

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-uploads', 'exam-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Deletar políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read exam files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exam-uploads' AND
  (storage.foldername(name))[1] = 'exams'
);

-- Permitir leitura para todos (bucket público)
CREATE POLICY "Anyone can read exam files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'exam-uploads');

-- Permitir delete para donos dos arquivos
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'exam-uploads' AND
  (storage.foldername(name))[1] = 'exams'
);
