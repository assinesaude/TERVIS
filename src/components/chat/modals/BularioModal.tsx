import { useState } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface BularioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BularioModal({ isOpen, onClose }: BularioModalProps) {
  const { user } = useAuth();
  const [medicamento, setMedicamento] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleConsultar() {
    if (!medicamento.trim()) return;

    setLoading(true);
    setResultado('');
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bulario-anvisa`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            query: medicamento,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (!data.informacoes) {
        setError('Não foram encontradas informações para este medicamento');
        return;
      }

      const anvisaLink = `https://consultas.anvisa.gov.br/#/bulario/q/${encodeURIComponent(medicamento)}`;

      setResultado(
        data.informacoes +
        `\n\n📋 **Consulte a bula oficial na ANVISA:** ${anvisaLink}`
      );
    } catch (err: any) {
      console.error('Erro ao consultar bulário:', err);
      setError(err.message || 'Erro ao consultar informações. Tente novamente.');
    } finally {
      setLoading(false);
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
          Bulário Eletrônico ANVISA
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Consulte informações sobre medicamentos registrados pela ANVISA
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={medicamento}
            onChange={(e) => setMedicamento(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConsultar()}
            placeholder="Digite o nome do medicamento..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] transition-colors"
          />

          <button
            onClick={handleConsultar}
            disabled={loading || !medicamento.trim()}
            className="w-full py-3 bg-gradient-to-r from-[#0EA5E9] to-[#22C55E] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Consultando...
              </>
            ) : (
              'Consultar'
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {resultado && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                {resultado}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
