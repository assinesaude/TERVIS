import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BularioVetRequest {
  query: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query }: BularioVetRequest = await req.json();

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

    let agrofitData = null;
    let agrofitError = null;

    try {
      const agrofitResponse = await fetch(
        `https://dados.agricultura.gov.br/agrofit/api/defensivos?nome_comercial=${encodeURIComponent(query)}`
      );

      if (agrofitResponse.ok) {
        agrofitData = await agrofitResponse.json();
      } else {
        agrofitError = `Erro ao consultar AGROFIT: ${agrofitResponse.status}`;
      }
    } catch (error) {
      agrofitError = `Erro ao conectar com AGROFIT: ${error.message}`;
      console.error("Erro AGROFIT:", error);
    }

    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!deepseekKey && !geminiKey) {
      return new Response(
        JSON.stringify({
          agrofitData: agrofitData || { error: agrofitError },
          aiExplanation: "API keys não configuradas. Configure DEEPSEEK_API_KEY ou GEMINI_API_KEY.",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prompt = `Você é o TERVIS.AI, especializado em saúde veterinária.

Gere informações veterinárias claras e seguras sobre o medicamento: "${query}"

Formato estruturado:

📋 **Indicações:**
[Descreva para quais condições é indicado]

🐾 **Espécies animais:**
[Liste as espécies para as quais é aprovado]

⚠️ **Contraindicações:**
[Liste situações em que não deve ser usado]

💊 **Efeitos adversos:**
[Possíveis reações adversas]

📊 **Posologia (genérica):**
[Orientações gerais de dosagem - sem especificar doses exatas]

⏱️ **Tempo de carência:**
[Período de carência para produtos de origem animal]

🔔 **Advertências:**
[Cuidados especiais no manuseio e aplicação]

📌 **Observações finais:**
[Informações adicionais relevantes]

IMPORTANTE:
- Baseie-se em padrões oficiais do MAPA
- Não invente posologia específica
- Seja claro e objetivo
- Use linguagem técnica mas acessível

Finalize SEMPRE com:

⚕️ **Atenção:** Para diagnósticos, tratamentos e prescrições específicas, consulte um Médico Veterinário registrado no CRMV.`;

    let aiExplanation = "";

    if (deepseekKey) {
      try {
        const deepseekResponse = await fetch(
          "https://api.deepseek.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${deepseekKey}`,
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          }
        );

        if (deepseekResponse.ok) {
          const deepseekData = await deepseekResponse.json();
          aiExplanation = deepseekData.choices[0].message.content;
        } else {
          console.error("DeepSeek error:", await deepseekResponse.text());
        }
      } catch (error) {
        console.error("Erro DeepSeek:", error);
      }
    }

    if (!aiExplanation && geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          aiExplanation = geminiData.candidates[0].content.parts[0].text;
        } else {
          console.error("Gemini error:", await geminiResponse.text());
        }
      } catch (error) {
        console.error("Erro Gemini:", error);
      }
    }

    if (!aiExplanation) {
      aiExplanation = "Não foi possível gerar explicação. Verifique as configurações de API.";
    }

    return new Response(
      JSON.stringify({
        agrofitData: agrofitData || { error: agrofitError },
        aiExplanation,
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
      JSON.stringify({ error: "Erro interno do servidor" }),
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
