import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MapPin, Plus, X, AlertCircle, Check } from 'lucide-react';

interface Neighborhood {
  id: string;
  neighborhood: string;
  city: string;
  state: string;
  specialty: string;
  created_at: string;
}

interface Props {
  professionalId: string;
  specialty: string;
  city: string;
  state: string;
  isPremium: boolean;
}

export function PremiumNeighborhoods({ professionalId, specialty, city, state, isPremium }: Props) {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isPremium) {
      loadNeighborhoods();
    }
  }, [isPremium, professionalId]);

  async function loadNeighborhoods() {
    try {
      const { data, error } = await supabase
        .from('premium_exclusive_neighborhoods')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNeighborhoods(data || []);
    } catch (err: any) {
      console.error('Error loading neighborhoods:', err);
    }
  }

  async function addNeighborhood() {
    if (!newNeighborhood.trim()) {
      setError('Digite o nome do bairro');
      return;
    }

    if (neighborhoods.length >= 3) {
      setError('Você já atingiu o limite de 3 bairros exclusivos.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase
        .from('premium_exclusive_neighborhoods')
        .insert({
          professional_id: professionalId,
          neighborhood: newNeighborhood.trim(),
          city,
          state,
          specialty,
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('já possui um especialista Premium')) {
          setError('Este bairro já possui um especialista Premium. Escolha outro.');
        } else if (error.message.includes('limite de 3 bairros')) {
          setError('Você já atingiu o limite de 3 bairros exclusivos.');
        } else {
          throw error;
        }
        return;
      }

      setNeighborhoods([data, ...neighborhoods]);
      setNewNeighborhood('');
      setShowAddForm(false);
      setSuccess('Bairro exclusivo adicionado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error adding neighborhood:', err);
      setError(err.message || 'Erro ao adicionar bairro');
    } finally {
      setLoading(false);
    }
  }

  async function removeNeighborhood(id: string) {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('premium_exclusive_neighborhoods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNeighborhoods(neighborhoods.filter(n => n.id !== id));
      setSuccess('Bairro removido com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error removing neighborhood:', err);
      setError('Erro ao remover bairro');
    } finally {
      setLoading(false);
    }
  }

  if (!isPremium) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
        <div className="text-center py-6">
          <MapPin className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-purple-900 mb-2">
            Exclusividade de Bairros
          </h3>
          <p className="text-purple-700 mb-4">
            Disponível apenas para assinantes Premium
          </p>
          <Button
            className="bg-gradient-to-r from-purple-600 to-purple-400"
            onClick={() => window.location.href = '/planos'}
          >
            Upgrade para Premium
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-purple-600" />
            Bairros Exclusivos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Você pode escolher até 3 bairros onde será o único {specialty} Premium
          </p>
        </div>
        {neighborhoods.length < 3 && !showAddForm && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-400"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {showAddForm && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Bairro
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newNeighborhood}
              onChange={(e) => setNewNeighborhood(e.target.value)}
              placeholder="Ex: Centro, Jardins, Vila Nova..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && addNeighborhood()}
            />
            <Button
              onClick={addNeighborhood}
              disabled={loading}
              className="bg-purple-600"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewNeighborhood('');
                setError('');
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Este bairro será exclusivo para você. Nenhum outro {specialty} Premium poderá escolhê-lo.
          </p>
        </div>
      )}

      {neighborhoods.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            Você ainda não possui bairros exclusivos
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Adicione até 3 bairros para ter exclusividade total
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {neighborhoods.map((neighborhood) => (
            <div
              key={neighborhood.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-200"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{neighborhood.neighborhood}</p>
                  <p className="text-sm text-gray-600">
                    {neighborhood.city}, {neighborhood.state}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeNeighborhood(neighborhood.id)}
                disabled={loading}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                title="Remover bairro"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
              </button>
            </div>
          ))}

          {neighborhoods.length < 3 && (
            <div className="text-center py-3 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
              <p className="text-sm text-purple-700 font-medium">
                Você pode adicionar mais {3 - neighborhoods.length} bairro{3 - neighborhoods.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Como funciona a exclusividade?</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Você será o ÚNICO {specialty} Premium nesses bairros</li>
              <li>A IA sempre recomendará você primeiro nessas regiões</li>
              <li>Nenhum outro Premium pode competir com você</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
