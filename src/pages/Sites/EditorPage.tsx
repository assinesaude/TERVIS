import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, Save, Eye, Code, Palette, Image as ImageIcon, Sparkles, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Palette {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
}

export function SitesEditorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('id');

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o TERVIS.AI e vou ajudá-lo a criar seu site profissional. Para começar, me conte: qual é sua especialidade e o que você gostaria de destacar no seu site?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showCode, setShowCode] = useState(false);

  const [siteName, setSiteName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);

  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

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
    fetchTemplates();
    fetchPalettes();
  }, [user, navigate]);

  useEffect(() => {
    if (siteId && professionalId) {
      loadExistingSite();
    }
  }, [siteId, professionalId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showPreview && previewRef.current) {
      updatePreview();
    }
  }, [htmlContent, cssContent, showPreview]);

  async function fetchProfessionalData() {
    try {
      const { data: profData, error: profError } = await supabase
        .from('professionals')
        .select('id, full_name, specialty')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profError) throw profError;

      if (profData) {
        setProfessionalId(profData.id);

        if (!siteId && !siteName) {
          setSiteName(`${profData.full_name} - ${profData.specialty}`);
          const generatedSubdomain = profData.full_name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20);
          setSubdomain(generatedSubdomain);
        }
      }
    } catch (error) {
      console.error('Error fetching professional data:', error);
    }
  }

  async function fetchTemplates() {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('id, name, description, category')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }

  async function fetchPalettes() {
    try {
      const { data, error } = await supabase
        .from('palettes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPalettes(data || []);
    } catch (error) {
      console.error('Error fetching palettes:', error);
    }
  }

  async function loadExistingSite() {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .eq('professional_id', professionalId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSiteName(data.site_name);
        setSubdomain(data.subdomain);
        setHtmlContent(data.html_content);
        setCssContent(data.css_content);
        setIsPublished(data.is_published);
        setSelectedTemplate(data.template_id);
        setSelectedPalette(data.palette_id);
      }
    } catch (error) {
      console.error('Error loading site:', error);
    }
  }

  function updatePreview() {
    if (!previewRef.current) return;

    const previewDoc = previewRef.current.contentDocument;
    if (!previewDoc) return;

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${siteName}</title>
        <style>
          ${cssContent}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    previewDoc.open();
    previewDoc.write(fullHtml);
    previewDoc.close();
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputMessage.trim() || loading || !user) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const { data: profData } = await supabase
        .from('professionals')
        .select('full_name, specialty, profession, bio, phone, email, address, instagram, facebook, linkedin, whatsapp')
        .eq('user_id', user.id)
        .maybeSingle();

      const selectedPaletteData = palettes.find(p => p.id === selectedPalette);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-site`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            professionalData: {
              name: profData?.full_name || siteName,
              specialty: profData?.specialty || '',
              profession: profData?.profession || '',
              about: profData?.bio || '',
              services: [],
              phone: profData?.phone || '',
              email: profData?.email || '',
              address: profData?.address || '',
              socialMedia: {
                instagram: profData?.instagram || '',
                facebook: profData?.facebook || '',
                linkedin: profData?.linkedin || '',
                whatsapp: profData?.whatsapp || ''
              }
            },
            preferences: {
              theme: 'profissional',
              colors: selectedPaletteData ? {
                primary: selectedPaletteData.primary_color,
                secondary: selectedPaletteData.secondary_color,
                accent: selectedPaletteData.accent_color
              } : undefined,
              includeAiWidget: true
            },
            modifications: htmlContent ? inputMessage : undefined,
            currentHtml: htmlContent || undefined,
            currentCss: cssContent || undefined,
            currentJs: '',
            userId: user.id
          })
        }
      );

      if (!response.ok) throw new Error('Failed to generate site');

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.success
          ? 'Site gerado com sucesso! Você pode visualizar o resultado no preview.'
          : 'Ocorreu um erro ao gerar o site.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.html) setHtmlContent(data.html);
      if (data.css) setCssContent(data.css);

    } catch (error) {
      console.error('Error generating site:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao gerar o site. Por favor, tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSite() {
    if (!professionalId || !siteName || !subdomain) {
      alert('Por favor, preencha o nome do site e o subdomínio.');
      return;
    }

    setSavingStatus('saving');

    try {
      const siteData = {
        professional_id: professionalId,
        site_name: siteName,
        subdomain: subdomain,
        html_content: htmlContent,
        css_content: cssContent,
        template_id: selectedTemplate,
        palette_id: selectedPalette,
        is_published: isPublished,
        updated_at: new Date().toISOString()
      };

      if (siteId) {
        const { error } = await supabase
          .from('sites')
          .update(siteData)
          .eq('id', siteId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('sites')
          .insert([siteData])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          navigate(`/sites/editor?id=${data.id}`, { replace: true });
        }
      }

      setSavingStatus('saved');
      setTimeout(() => setSavingStatus(null), 3000);
    } catch (error) {
      console.error('Error saving site:', error);
      setSavingStatus('error');
      alert('Erro ao salvar site. Tente novamente.');
    }
  }

  async function handleTogglePublish() {
    const newStatus = !isPublished;
    setIsPublished(newStatus);

    if (siteId) {
      try {
        const { error } = await supabase
          .from('sites')
          .update({ is_published: newStatus })
          .eq('id', siteId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating publish status:', error);
        setIsPublished(!newStatus);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLoginClick={() => {}} />

      <div className="flex h-[calc(100vh-82px)]">
        <div className="w-1/2 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => navigate('/sites/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Dashboard
            </button>

            <div className="space-y-3">
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Nome do site"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  placeholder="subdominio"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">.tervis.ai</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleSaveSite}
                disabled={savingStatus === 'saving'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingStatus === 'saving' ? 'Salvando...' : 'Salvar'}
              </button>

              <button
                onClick={handleTogglePublish}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isPublished
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
                {isPublished ? 'Publicado' : 'Publicar'}
              </button>

              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Code className="w-4 h-4" />
                Código
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">TERVIS.AI</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Gerando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Descreva como quer seu site..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        <div className="w-1/2 bg-gray-900 flex flex-col">
          <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-white font-medium">
              {showCode ? 'Código' : 'Preview'}
            </h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              {showPreview ? 'Ocultar' : 'Mostrar'} Preview
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {showCode ? (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-2">HTML</h3>
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full h-64 p-4 bg-gray-800 text-gray-100 font-mono text-sm rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">CSS</h3>
                  <textarea
                    value={cssContent}
                    onChange={(e) => setCssContent(e.target.value)}
                    className="w-full h-64 p-4 bg-gray-800 text-gray-100 font-mono text-sm rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <iframe
                ref={previewRef}
                title="Site Preview"
                className="w-full h-full bg-white"
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
