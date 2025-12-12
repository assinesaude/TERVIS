import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Globe, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Site {
  id: string;
  site_name: string;
  subdomain: string;
  custom_domain: string | null;
}

interface Domain {
  id: string;
  domain_name: string;
  verification_code: string;
  is_verified: boolean;
  dns_configured: boolean;
  ssl_status: string;
  created_at: string;
  verified_at: string | null;
}

export function SitesDomainPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('id');

  const [site, setSite] = useState<Site | null>(null);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.user_type !== 'professional') {
      navigate('/');
      return;
    }

    if (!siteId) {
      navigate('/sites/dashboard');
      return;
    }

    fetchSiteData();
  }, [user, siteId, navigate]);

  async function fetchSiteData() {
    try {
      setLoading(true);

      const { data: profData } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!profData) return;

      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .select('id, site_name, subdomain, custom_domain')
        .eq('id', siteId)
        .eq('professional_id', profData.id)
        .maybeSingle();

      if (siteError) throw siteError;

      if (siteData) {
        setSite(siteData);

        const { data: domainData } = await supabase
          .from('domains')
          .select('*')
          .eq('site_id', siteId)
          .maybeSingle();

        if (domainData) {
          setDomain(domainData);
        }
      }
    } catch (error) {
      console.error('Error fetching site data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDomain() {
    if (!newDomain.trim() || !siteId) return;

    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!domainRegex.test(newDomain.toLowerCase())) {
      alert('Por favor, insira um domínio válido (ex: seusite.com.br)');
      return;
    }

    setAdding(true);

    try {
      const { data, error } = await supabase
        .from('domains')
        .insert([{
          site_id: siteId,
          domain_name: newDomain.toLowerCase()
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setDomain(data);

        await supabase
          .from('sites')
          .update({ custom_domain: newDomain.toLowerCase() })
          .eq('id', siteId);

        setNewDomain('');
      }
    } catch (error: any) {
      console.error('Error adding domain:', error);
      if (error.code === '23505') {
        alert('Este domínio já está em uso por outro site.');
      } else {
        alert('Erro ao adicionar domínio. Tente novamente.');
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveDomain() {
    if (!domain || !confirm('Tem certeza que deseja remover este domínio?')) return;

    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domain.id);

      if (error) throw error;

      await supabase
        .from('sites')
        .update({ custom_domain: null })
        .eq('id', siteId);

      setDomain(null);
    } catch (error) {
      console.error('Error removing domain:', error);
      alert('Erro ao remover domínio. Tente novamente.');
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onLoginClick={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-82px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLoginClick={() => {}} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/sites/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            Gerenciar Domínio
          </h1>
          <p className="mt-2 text-gray-600">
            Configure um domínio personalizado para {site?.site_name}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Domínio Gratuito</h2>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {site?.subdomain}.tervis.ai
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Seu site está disponível neste endereço gratuitamente
              </p>
            </div>
            <a
              href={`https://${site?.subdomain}.tervis.ai`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Domínio Personalizado</h2>

          {!domain ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Conecte seu próprio domínio ao site (ex: www.seunome.com.br)
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="www.seusite.com.br"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={adding}
                />
                <button
                  onClick={handleAddDomain}
                  disabled={adding || !newDomain.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Requisitos:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Você deve ter acesso ao painel DNS do domínio</li>
                  <li>• O domínio deve estar registrado e ativo</li>
                  <li>• Será necessário adicionar registros DNS</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{domain.domain_name}</p>
                    <p className="text-sm text-gray-600">
                      Adicionado em {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveDomain}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Remover
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {domain.is_verified ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-600">Domínio Verificado</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-600">Aguardando Verificação</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {domain.is_verified
                      ? 'Seu domínio foi verificado com sucesso!'
                      : 'Configure os registros DNS abaixo e aguarde a propagação (até 48 horas).'}
                  </p>
                </div>

                {!domain.is_verified && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      Configuração DNS Necessária
                    </h3>

                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Tipo</p>
                            <p className="text-gray-900 font-mono">TXT</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(domain.verification_code)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Copy className="w-4 h-4" />
                            {copied ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Nome/Host</p>
                            <p className="text-gray-900 font-mono text-sm">_tervis-verification</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Valor</p>
                            <p className="text-gray-900 font-mono text-sm break-all">
                              {domain.verification_code}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Tipo</p>
                          <p className="text-gray-900 font-mono">CNAME</p>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Nome/Host</p>
                            <p className="text-gray-900 font-mono text-sm">
                              {domain.domain_name.startsWith('www.') ? 'www' : '@'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Valor</p>
                            <p className="text-gray-900 font-mono text-sm">
                              sites.tervis.ai
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Instruções:</h4>
                      <ol className="space-y-2 text-sm text-yellow-800">
                        <li>1. Acesse o painel de controle do seu provedor de domínio</li>
                        <li>2. Localize a seção de gerenciamento DNS</li>
                        <li>3. Adicione os registros TXT e CNAME acima</li>
                        <li>4. Aguarde a propagação DNS (pode levar até 48 horas)</li>
                        <li>5. Volte aqui para verificar o status</li>
                      </ol>
                    </div>
                  </div>
                )}

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {domain.ssl_status === 'active' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-600">SSL Ativo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-600">SSL Pendente</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {domain.ssl_status === 'active'
                      ? 'Certificado SSL configurado e ativo (HTTPS)'
                      : 'Certificado SSL será emitido após verificação do domínio'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
