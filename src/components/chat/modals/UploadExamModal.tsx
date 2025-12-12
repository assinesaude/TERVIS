import { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface UploadExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadExamModal({ isOpen, onClose }: UploadExamModalProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(selectedFile.type)) {
        setError('Por favor, envie apenas arquivos JPG, PNG ou PDF');
        return;
      }

      if (selectedFile.size > maxSize) {
        setError('O arquivo deve ter no máximo 10MB');
        return;
      }

      setFile(selectedFile);
      setAnalysis('');
      setError('');
    }
  }

  async function handleAnalyze() {
    if (!file || !user) {
      setError('Você precisa estar logado para usar esta funcionalidade');
      return;
    }

    setLoading(true);
    setAnalysis('');
    setError('');

    try {
      // Upload do arquivo para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `exams/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exam-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('exam-uploads')
        .getPublicUrl(filePath);

      // Enviar para análise
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-file`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            fileUrl: publicUrl,
            userId: user.id,
            fileName: file.name,
            fileType: file.type,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setAnalysis(data.analysis || 'Análise concluída');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao analisar arquivo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setAnalysis('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-[92%] max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Anexar Exame ou Documento
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Envie seus exames e o TERVIS.AI analisa para você
        </p>

        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#0EA5E9] transition-colors"
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-[#0EA5E9]" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-12 h-12 text-gray-400" />
                <p className="text-gray-600">
                  Clique para selecionar o arquivo
                </p>
                <p className="text-sm text-gray-400">
                  Formatos: JPG, PNG, PDF (máx. 10MB)
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            className="hidden"
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {file && !analysis && (
            <div className="flex gap-2">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#22C55E] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Analisar Documento'
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          )}

          {analysis && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2">Análise:</h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {analysis}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Analisar outro documento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
