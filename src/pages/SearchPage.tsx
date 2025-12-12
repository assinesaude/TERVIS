import { useState, useEffect } from 'react';
import { supabase, Professional } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AIChat } from '../components/chat/AIChat';
import { Search, MapPin, Star, Shield, Video, Users, MessageSquare, List } from 'lucide-react';

export function SearchPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    loadProfessionals();
  }, []);

  async function loadProfessionals() {
    try {
      let query = supabase
        .from('professionals')
        .select('*')
        .eq('verification_status', 'verified');

      if (selectedCity) {
        query = query.ilike('city', `%${selectedCity}%`);
      }

      if (selectedSpecialty) {
        query = query.ilike('specialty', `%${selectedSpecialty}%`);
      }

      if (searchTerm) {
        query = query.or(`profession.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    loadProfessionals();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-tervis text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">
            {activeTab === 'chat' ? 'Converse com TERVIS.AI' : 'Encontre Profissionais de Saúde'}
          </h1>
          <p className="text-xl text-center mb-8 opacity-90">
            {activeTab === 'chat'
              ? 'Assistente inteligente de saúde disponível 24/7'
              : 'Milhares de profissionais verificados prontos para atender você'}
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white border-2 border-white hover:bg-white/20'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Chat com IA
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white border-2 border-white hover:bg-white/20'
              }`}
            >
              <List className="w-5 h-5" />
              Buscar Profissionais
            </button>
          </div>

          {activeTab === 'search' && (
            <Card className="max-w-4xl mx-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Buscar por profissão ou especialidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <Button fullWidth size="lg" onClick={handleSearch}>
                    <Search className="w-5 h-5 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <AIChat />
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            {loading ? 'Carregando...' : `${professionals.length} profissionais encontrados`}
          </h2>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent">
            <option>Ordenar por: Relevância</option>
            <option>Melhor Avaliação</option>
            <option>Menor Preço</option>
            <option>Maior Preço</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <Card className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nenhum profissional encontrado</h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou buscar por outros termos
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCity('');
              setSelectedSpecialty('');
              loadProfessionals();
            }}>
              Limpar Filtros
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((prof) => (
              <Card key={prof.id} hover className="relative">
                {prof.plan_type === 'premium' && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold rounded-full">
                    PREMIUM
                  </div>
                )}

                <div className="flex items-start mb-4">
                  <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white font-bold text-xl">
                      {prof.profession.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h3 className="font-bold text-lg truncate mr-2">
                        {prof.profession}
                      </h3>
                      {prof.verification_status === 'verified' && (
                        <Shield className="w-4 h-4 text-tervis-blue flex-shrink-0" />
                      )}
                    </div>
                    {prof.specialty && (
                      <p className="text-sm text-gray-600 mb-2">{prof.specialty}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {prof.city}, {prof.state}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-sm font-medium mr-2">
                        {prof.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({prof.total_reviews} avaliações)
                      </span>
                    </div>
                  </div>
                </div>

                {prof.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {prof.bio}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  {prof.accepts_online && (
                    <span className="flex items-center px-2 py-1 bg-tervis-blue/10 text-tervis-blue rounded text-xs">
                      <Video className="w-3 h-3 mr-1" />
                      Online
                    </span>
                  )}
                  {prof.accepts_in_person && (
                    <span className="flex items-center px-2 py-1 bg-tervis-green/10 text-tervis-green rounded text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Presencial
                    </span>
                  )}
                </div>

                <Button fullWidth>
                  Ver Perfil e Agendar
                </Button>
              </Card>
            ))}
          </div>
        )}
        </div>
      )}
    </div>
  );
}