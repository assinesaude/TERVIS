import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Plus, Edit, Trash2, ExternalLink, Eye } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Site {
  id: string;
  site_name: string;
  subdomain: string;
  custom_domain: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function SitesDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.user_type !== 'professional') {
      navigate('/');
      return;
    }

    fetchProfessionalData();
  }, [user, navigate]);

  async function fetchProfessionalData() {
    try {
      const { data: profData, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profError) throw profError;

      if (profData) {
        setProfessionalId(profData.id);
        fetchSites(profData.id);
      }
    } catch (error) {
      console.error('Error fetching professional data:', error);
      setLoading(false);
    }
  }

  async function fetchSites(profId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('professional_id', profId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSites(data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSite(siteId: string) {
    if (!confirm('Tem certeza que deseja excluir este site?')) return;

    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);

      if (error) throw error;

      setSites(sites.filter(s => s.id !== siteId));
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Erro ao excluir site. Tente novamente.');
    }
  }

  function handleCreateNewSite() {
    navigate('/sites/editor');
  }

  function handleEditSite(siteId: string) {
    navigate(`/sites/editor?id=${siteId}`);
  }

  function handleManageDomain(siteId: string) {
    navigate(`/sites/domain?id=${siteId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onLoginClick={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-82px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando seus sites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLoginClick={() => {}} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Globe className="w-8 h-8 text-blue-600" />
                Meus Sites
              </h1>
              <p className="mt-2 text-gray-600">
                Gerencie seus sites profissionais criados com IA
              </p>
            </div>
            <button
              onClick={handleCreateNewSite}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Criar Novo Site
            </button>
          </div>
        </div>

        {sites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum site criado ainda
            </h2>
            <p className="text-gray-600 mb-6">
              Crie seu primeiro site profissional usando nossa IA conversacional
            </p>
            <button
              onClick={handleCreateNewSite}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Criar Meu Primeiro Site
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {site.site_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {site.custom_domain || `${site.subdomain}.tervis.ai`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {site.is_published ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        <Eye className="w-3 h-3" />
                        Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                        Rascunho
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>
                    Criado em {new Date(site.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditSite(site.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleManageDomain(site.id)}
                    className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
