import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateSiteRequest {
  professionalData: {
    name: string;
    specialty: string;
    profession: string;
    about?: string;
    services?: string[];
    phone?: string;
    email?: string;
    address?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      whatsapp?: string;
    };
  };
  preferences?: {
    theme?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    includeAiWidget?: boolean;
  };
  modifications?: string;
  currentHtml?: string;
  currentCss?: string;
  currentJs?: string;
  userId: string;
}

interface SiteGenerationResult {
  html: string;
  css: string;
  js: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  texts: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  structure: {
    sections: string[];
    hasHeader: boolean;
    hasFooter: boolean;
    hasSocialLinks: boolean;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: GenerateSiteRequest = await req.json();
    const { professionalData, preferences, modifications, currentHtml, currentCss, currentJs, userId } = body;

    if (!userId) {
      throw new Error("userId is required");
    }

    const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");

    const systemPrompt = `Você é o TERVIS.AI, especialista em criar sites profissionais para profissionais da saúde.

Você deve criar sites COMPLETOS, MODERNOS e PROFISSIONAIS com:
- HTML5 semântico e acessível
- CSS responsivo com design premium
- JavaScript para interatividade básica
- SEO otimizado
- Widget TERVIS.AI integrado
- Rodapé obrigatório: "Site desenvolvido pelo TERVIS.AI — A Inteligência Artificial Assistente dos Profissionais da Saúde."

Cores profissionais: azul (#0EA5E9), verde (#22C55E), branco, cinza
Mobile-first e totalmente responsivo
Seções: header fixo, hero, sobre, serviços, especialidades, contato, footer

Retorne APENAS um JSON válido no seguinte formato:
{
  "html": "código HTML completo",
  "css": "código CSS completo",
  "js": "código JavaScript completo",
  "colors": {
    "primary": "#0EA5E9",
    "secondary": "#22C55E",
    "accent": "#0284C7"
  },
  "seo": {
    "title": "título para SEO",
    "description": "descrição para SEO",
    "keywords": ["palavra1", "palavra2"]
  },
  "texts": {
    "headline": "título principal",
    "subheadline": "subtítulo",
    "cta": "texto do botão de ação"
  },
  "structure": {
    "sections": ["header", "hero", "sobre", "servicos", "contato", "footer"],
    "hasHeader": true,
    "hasFooter": true,
    "hasSocialLinks": true
  }
}`;

    const userMessage = modifications
      ? `Modifique o site existente: ${modifications}\n\nHTML atual: ${currentHtml}\nCSS atual: ${currentCss}\nJS atual: ${currentJs}`
      : `Crie um site profissional para:
Nome: ${professionalData.name}
Profissão: ${professionalData.profession}
Especialidade: ${professionalData.specialty}
Sobre: ${professionalData.about || 'Profissional dedicado e experiente'}
Serviços: ${professionalData.services?.join(', ') || 'Consultas e atendimento especializado'}
Contato: ${professionalData.phone || ''}, ${professionalData.email || ''}
Endereço: ${professionalData.address || ''}
Redes Sociais: ${JSON.stringify(professionalData.socialMedia || {})}
Tema: ${preferences?.theme || 'profissional'}
Cores: ${JSON.stringify(preferences?.colors || {})}`;

    let result: SiteGenerationResult;

    if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your_claude_api_key') {
      console.log('CLAUDE_API_KEY not configured, using mock response');

      result = {
        html: generateMockHtml(professionalData),
        css: generateMockCss(),
        js: generateMockJs(),
        colors: {
          primary: preferences?.colors?.primary || '#0EA5E9',
          secondary: preferences?.colors?.secondary || '#22C55E',
          accent: preferences?.colors?.accent || '#0284C7'
        },
        seo: {
          title: `${professionalData.name} - ${professionalData.specialty}`,
          description: `${professionalData.profession} especializado em ${professionalData.specialty}. ${professionalData.about || 'Atendimento profissional e dedicado.'}`,
          keywords: [professionalData.profession, professionalData.specialty, 'saúde', professionalData.name]
        },
        texts: {
          headline: professionalData.name,
          subheadline: `${professionalData.profession} - ${professionalData.specialty}`,
          cta: 'Agende sua consulta'
        },
        structure: {
          sections: ['header', 'hero', 'sobre', 'servicos', 'contato', 'footer'],
          hasHeader: true,
          hasFooter: true,
          hasSocialLinks: true
        }
      };
    } else {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: userMessage
          }]
        })
      });

      if (!claudeResponse.ok) {
        throw new Error(`Claude API error: ${claudeResponse.statusText}`);
      }

      const data = await claudeResponse.json();
      const content = data.content[0].text;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format from Claude');
      }
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const timestamp = new Date().getTime();
    const basePath = `${userId}/${timestamp}`;

    const uploadFile = async (filename: string, content: string, contentType: string) => {
      const { error } = await supabase.storage
        .from('sites-previews')
        .upload(`${basePath}/${filename}`, content, {
          contentType,
          upsert: false
        });

      if (error) {
        console.error(`Error uploading ${filename}:`, error);
        throw error;
      }
    };

    await Promise.all([
      uploadFile('index.html', result.html, 'text/html'),
      uploadFile('styles.css', result.css, 'text/css'),
      uploadFile('script.js', result.js, 'text/javascript'),
      uploadFile('metadata.json', JSON.stringify({
        colors: result.colors,
        seo: result.seo,
        texts: result.texts,
        structure: result.structure,
        createdAt: new Date().toISOString()
      }), 'application/json')
    ]);

    const { data: { publicUrl: htmlUrl } } = supabase.storage
      .from('sites-previews')
      .getPublicUrl(`${basePath}/index.html`);

    return new Response(
      JSON.stringify({
        success: true,
        previewUrl: htmlUrl,
        basePath,
        timestamp,
        ...result
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function generateMockHtml(professionalData: any): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${professionalData.name} - ${professionalData.specialty}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="header">
    <nav class="nav">
      <div class="logo">${professionalData.name}</div>
      <ul class="nav-menu">
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#servicos">Serviços</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>
    </nav>
  </header>

  <section class="hero">
    <div class="hero-content">
      <h1>${professionalData.name}</h1>
      <p class="subtitle">${professionalData.profession} - ${professionalData.specialty}</p>
      <p class="description">${professionalData.about || 'Profissional dedicado e experiente'}</p>
      <a href="#contato" class="cta-button">Agende sua consulta</a>
    </div>
  </section>

  <section id="sobre" class="sobre">
    <div class="container">
      <h2>Sobre o Profissional</h2>
      <p>${professionalData.about || 'Profissional dedicado e experiente, comprometido com a excelência no atendimento e bem-estar dos pacientes.'}</p>
    </div>
  </section>

  <section id="servicos" class="servicos">
    <div class="container">
      <h2>Serviços</h2>
      <div class="servicos-grid">
        ${(professionalData.services || ['Consultas', 'Atendimento Especializado', 'Procedimentos', 'Acompanhamento']).map((service: string) => `
        <div class="servico-card">
          <h3>${service}</h3>
          <p>Atendimento profissional e personalizado</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section id="contato" class="contato">
    <div class="container">
      <h2>Contato</h2>
      <div class="contato-info">
        ${professionalData.phone ? `<p><strong>Telefone:</strong> ${professionalData.phone}</p>` : ''}
        ${professionalData.email ? `<p><strong>Email:</strong> ${professionalData.email}</p>` : ''}
        ${professionalData.address ? `<p><strong>Endereço:</strong> ${professionalData.address}</p>` : ''}
      </div>
      ${professionalData.socialMedia && (professionalData.socialMedia.instagram || professionalData.socialMedia.facebook || professionalData.socialMedia.whatsapp) ? `
      <div class="social-links">
        ${professionalData.socialMedia.instagram ? `<a href="${professionalData.socialMedia.instagram}" target="_blank" class="social-link">Instagram</a>` : ''}
        ${professionalData.socialMedia.facebook ? `<a href="${professionalData.socialMedia.facebook}" target="_blank" class="social-link">Facebook</a>` : ''}
        ${professionalData.socialMedia.whatsapp ? `<a href="${professionalData.socialMedia.whatsapp}" target="_blank" class="social-link">WhatsApp</a>` : ''}
      </div>
      ` : ''}
    </div>
  </section>

  <section class="noticias">
    <div class="container">
      <div class="noticias-header">
        <h2>Últimas notícias de saúde</h2>
        <span class="noticias-badge">HealthNews.Today</span>
      </div>
      <div id="news-widget" class="noticias-grid">
        <div class="loading">Carregando notícias...</div>
      </div>
      <div class="noticias-footer">
        Conteúdo atualizado automaticamente via <a href="https://www.healthnews.today" target="_blank" rel="noopener">HealthNews.Today</a>
      </div>
    </div>
  </section>

  <div id="tervis-widget"></div>

  <footer class="footer">
    <p>Site desenvolvido pelo TERVIS.AI — A Inteligência Artificial Assistente dos Profissionais da Saúde.</p>
    <p class="footer-subtitle">Powered by TERVIS.AI & HealthNews.Today</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;
}

function generateMockCss(): string {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0EA5E9;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 30px;
}

.nav-menu a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: #0EA5E9;
}

.hero {
  background: linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%);
  color: white;
  padding: 150px 20px 100px;
  text-align: center;
  margin-top: 70px;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.3rem;
  margin-bottom: 20px;
  opacity: 0.95;
}

.description {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 30px;
}

.cta-button {
  display: inline-block;
  padding: 15px 40px;
  background: white;
  color: #0EA5E9;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1.1rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.sobre, .servicos, .contato {
  padding: 80px 20px;
}

.sobre {
  background: #f8fafc;
}

h2 {
  font-size: 2.5rem;
  color: #0EA5E9;
  margin-bottom: 30px;
  text-align: center;
}

.servicos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 50px;
}

.servico-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.servico-card:hover {
  transform: translateY(-5px);
}

.servico-card h3 {
  color: #0EA5E9;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.contato-info {
  text-align: center;
  margin-bottom: 30px;
}

.contato-info p {
  margin: 10px 0;
  font-size: 1.1rem;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.social-link {
  padding: 10px 25px;
  background: #0EA5E9;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  transition: background 0.3s;
}

.social-link:hover {
  background: #0284C7;
}

.noticias {
  background: #f8fafc;
  padding: 80px 20px;
}

.noticias-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 15px;
}

.noticias-badge {
  font-size: 0.75rem;
  color: #64748b;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.noticias-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
}

.news-item {
  background: white;
  padding: 25px;
  border-radius: 15px;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  display: block;
  transition: all 0.3s;
}

.news-item:hover {
  background: #f0f9ff;
  border-color: #0EA5E9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(14,165,233,0.1);
}

.news-item h3 {
  color: #1e293b;
  margin-bottom: 10px;
  font-size: 1.1rem;
  line-height: 1.4;
}

.news-item p {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
}

.noticias-footer {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.noticias-footer a {
  color: #0EA5E9;
  text-decoration: none;
  font-weight: 500;
}

.noticias-footer a:hover {
  color: #0284C7;
}

.loading {
  text-align: center;
  color: #64748b;
  padding: 40px;
}

#tervis-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.footer {
  background: #1e293b;
  color: white;
  text-align: center;
  padding: 30px 20px;
  font-size: 0.95rem;
}

.footer-subtitle {
  margin-top: 10px;
  font-size: 0.85rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }

  .nav-menu {
    display: none;
  }

  h2 {
    font-size: 1.8rem;
  }

  .servicos-grid {
    grid-template-columns: 1fr;
  }
}`;
}

function generateMockJs(): string {
  return `document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  const widget = document.getElementById('tervis-widget');
  if (widget) {
    widget.innerHTML = 'AI';
    widget.addEventListener('click', function() {
      alert('Widget TERVIS.AI - Em breve com chat integrado!');
    });
  }

  const newsWidget = document.getElementById('news-widget');
  if (newsWidget) {
    fetch('https://kmxmgwvwwmckcgojlqrv.supabase.co/functions/v1/latest-healthnews')
      .then(response => response.json())
      .then(items => {
        if (items && items.length > 0) {
          newsWidget.innerHTML = items.map(item => \`
            <a href="\${item.link}" target="_blank" rel="noopener" class="news-item">
              <h3>\${item.title}</h3>
              <p>\${item.description}</p>
            </a>
          \`).join('');
        } else {
          newsWidget.innerHTML = '<div class="loading">Nenhuma notícia disponível no momento.</div>';
        }
      })
      .catch(() => {
        newsWidget.innerHTML = '<div class="loading">Erro ao carregar notícias.</div>';
      });
  }
});`;
}