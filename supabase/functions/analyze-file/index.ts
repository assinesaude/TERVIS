import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzeRequest {
  fileUrl: string;
  userId: string;
  fileName: string;
  fileType: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { fileUrl, userId, fileName, fileType }: AnalyzeRequest = await req.json();

    if (!fileUrl || !userId) {
      return new Response(
        JSON.stringify({ error: "fileUrl e userId são obrigatórios" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split('T')[0];
    const { data: tokenData } = await supabase
      .from('usage_tokens')
      .select('tokens_used')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    const tokensUsed = tokenData?.tokens_used || 0;
    const DAILY_LIMIT = 1000;
    const TOKENS_FOR_ANALYSIS = 50;

    if (tokensUsed + TOKENS_FOR_ANALYSIS > DAILY_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "Limite diário de tokens atingido",
          tokensUsed,
          limit: DAILY_LIMIT,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!deepseekKey && !geminiKey) {
      return new Response(
        JSON.stringify({
          error: "API keys não configuradas.",
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

    let fileContent = "";
    try {
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error("Não foi possível baixar o arquivo");
      }
      
      if (fileType?.startsWith('image/') && geminiKey) {
        const arrayBuffer = await fileResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        const prompt = `Você é o TERVIS.AI, especializado em análise de exames médicos.

Analise esta imagem de exame médico e forneça:

1. **Tipo de Exame Identificado**
2. **Principais Achados**
3. **Valores Observados** (se aplicável)
4. **Interpretação Preliminar**
5. **Pontos de Atenção**
6. **Recomendações**

IMPORTANTE: Esta é uma análise preliminar. Sempre consulte um médico para interpretação completa e diagnóstico.`;

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: fileType,
                      data: base64
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const analysis = geminiData.candidates[0].content.parts[0].text;
          
          await supabase
            .from('usage_tokens')
            .upsert({
              user_id: userId,
              date: today,
              tokens_used: tokensUsed + TOKENS_FOR_ANALYSIS,
            }, {
              onConflict: 'user_id,date'
            });

          await supabase
            .from('token_usage_logs')
            .insert({
              user_id: userId,
              tokens_consumed: TOKENS_FOR_ANALYSIS,
              category: 'exam_analysis',
              question_preview: `Análise de exame: ${fileName}`,
            });

          return new Response(
            JSON.stringify({
              success: true,
              analysis,
              tokensUsed: TOKENS_FOR_ANALYSIS,
              fileName,
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
      }
      
      fileContent = await fileResponse.text();
      if (fileContent.length > 50000) {
        fileContent = fileContent.substring(0, 50000) + "...";
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      return new Response(
        JSON.stringify({ error: "Erro ao processar arquivo" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prompt = `Você é o TERVIS.AI, especializado em análise de exames médicos.

Analise o seguinte exame e forneça:

1. **Tipo de Exame Identificado**
2. **Principais Achados**
3. **Valores Observados**
4. **Interpretação Preliminar**
5. **Pontos de Atenção**
6. **Recomendações**

Conteúdo do exame:
${fileContent}

IMPORTANTE: Esta é uma análise preliminar. Sempre consulte um médico para interpretação completa e diagnóstico.`;

    let analysis = "";

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
              temperature: 0.4,
              max_tokens: 2048,
            }),
          }
        );

        if (deepseekResponse.ok) {
          const deepseekData = await deepseekResponse.json();
          analysis = deepseekData.choices[0].message.content;
        }
      } catch (error) {
        console.error("Erro DeepSeek:", error);
      }
    }

    if (!analysis && geminiKey) {
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
                temperature: 0.4,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          analysis = geminiData.candidates[0].content.parts[0].text;
        }
      } catch (error) {
        console.error("Erro Gemini:", error);
      }
    }

    if (!analysis) {
      return new Response(
        JSON.stringify({ error: "Não foi possível gerar análise" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    await supabase
      .from('usage_tokens')
      .upsert({
        user_id: userId,
        date: today,
        tokens_used: tokensUsed + TOKENS_FOR_ANALYSIS,
      }, {
        onConflict: 'user_id,date'
      });

    await supabase
      .from('token_usage_logs')
      .insert({
        user_id: userId,
        tokens_consumed: TOKENS_FOR_ANALYSIS,
        category: 'exam_analysis',
        question_preview: `Análise de exame: ${fileName}`,
      });

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        tokensUsed: TOKENS_FOR_ANALYSIS,
        fileName,
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
