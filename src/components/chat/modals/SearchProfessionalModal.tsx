import { useState } from 'react';
import { X, Search, MapPin, Star, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface Professional {
  id: string;
  full_name: string;
  specialty: string;
  subscription_plan: string;
  neighborhood?: string;
  rating?: number;
}

interface SearchProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchProfessionalModal({ isOpen, onClose }: SearchProfessionalModalProps) {
  const { user } = useAuth();
  const [specialty, setSpecialty] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [loading, setLoading] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const isProfessional = user?.user_type === 'professional';

  async function handleSearch() {
    if (!specialty.trim() || !neighborhood.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      let query = supabase
        .from('professionals')
        .select('*')
        .ilike('specialty', `%${specialty}%`)
        .ilike('neighborhood', `%${neighborhood}%`)
        .eq('is_verified', true);

      const { data, error } = await query;

      if (error) throw error;

      const sorted = (data || []).sort((a, b) => {
        const planOrder: Record<string, number> = {
          premium: 3,
          professional: 2,
          essential: 1,
        };
        return (planOrder[b.subscription_plan] || 0) - (planOrder[a.subscription_plan] || 0);
      });

      setProfessionals(sorted);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }

  function getPlanBadge(plan: string) {
    const badges = {
      premium: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      professional: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      essential: 'bg-gray-200 text-gray-700',
    };
    return badges[plan as keyof typeof badges] || badges.essential;
  }

  function getPlanLabel(plan: string) {
    const labels = {
      premium: 'Premium',
      professional: 'Professional',
      essential: 'Essencial',
    };
    return labels[plan as keyof typeof labels] || 'Essencial';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-[92%] max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Procurar Profissional
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          O TERVIS indica profissionais qualificados verificados
        </p>

        {isProfessional && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              Profissionais de alta performance recebem maior destaque em sua região
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Qual profissional você precisa?"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] transition-colors"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Em qual bairro?"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] transition-colors"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !specialty.trim() || !neighborhood.trim()}
            className="w-full py-3 bg-gradient-to-r from-[#0EA5E9] to-[#22C55E] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Buscar Profissionais
              </>
            )}
          </button>
        </div>

        {searched && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {professionals.length} profissionais encontrados
            </h3>

            {professionals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum profissional encontrado nesta região
              </div>
            ) : (
              professionals.map((prof) => (
                <div
                  key={prof.id}
                  className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{prof.full_name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPlanBadge(
                            prof.subscription_plan
                          )}`}
                        >
                          {getPlanLabel(prof.subscription_plan)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{prof.specialty}</p>
                      {prof.neighborhood && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {prof.neighborhood}
                        </p>
                      )}
                    </div>
                    {prof.rating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{prof.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
