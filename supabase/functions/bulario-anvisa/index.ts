import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BularioRequest {
  query: string;
}

async function buscarInformacoesMedicamento(nomeMedicamento: string): Promise<string> {
  const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  const prompt = `Você é um assistente especializado em informações de medicamentos registrados pela ANVISA no Brasil.

Forneça informações PRECISAS e BASEADAS EM DADOS REAIS sobre o medicamento: "${nomeMedicamento}"

Formato obrigatório:

📋 **NOME DO MEDICAMENTO**
[Nome comercial comum]

🧪 **PRINCÍPIO ATIVO**
[Substância ativa principal]

💊 **PARA QUE SERVE**
[Indicações terapêuticas principais - seja específico]

⚠️ **CONTRAINDICAÇÕES**
[Quando NÃO deve ser usado - liste as principais]

📊 **CLASSE TERAPÊUTICA**
[Classificação farmacológica]

⚡ **REAÇÕES ADVERSAS COMUNS**
[Efeitos colaterais mais frequentes]

🔔 **ADVERTÊNCIAS IMPORTANTES**
[Cuidados especiais e precauções]

💬 **INTERAÇÕES MEDICAMENTOSAS**
[Principais interações conhecidas]

📌 **OBSERVAÇÕES**
[Informações complementares relevantes]

REGRAS OBRIGATÓRIAS:
- Use APENAS informações baseadas em conhecimento médico estabelecido
- NÃO invente dados ou estatísticas
- Se não souber alguma informação específica, indique "Consulte a bula oficial"
- Seja preciso e técnico, mas use linguagem acessível
- NÃO forneça dosagens específicas

Finalize com:
⚕️ **ATENÇÃO:** Estas são informações gerais. Para diagnóstico, tratamento e prescrição, consulte sempre um Médico (CRM) ou Farmacêutico (CRF).`;

  if (deepseekKey) {
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error("Erro DeepSeek:", error);
    }
  }

  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2000,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }
    } catch (error) {
      console.error("Erro Gemini:", error);
    }
  }

  throw new Error("Nenhuma API de IA disponível");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query }: BularioRequest = await req.json();

    if (!query || !query.trim()) {
      return new Response(
        JSON.stringify({ error: "Nome do medicamento é obrigatório" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const informacoes = await buscarInformacoesMedicamento(query);

    return new Response(
      JSON.stringify({
        medicamento: query,
        informacoes: informacoes,
        fonte: "Base de conhecimento médico",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erro geral:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao buscar informações. Verifique se as APIs estão configuradas.",
        detalhes: error.message
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