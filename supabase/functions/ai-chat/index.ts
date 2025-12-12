import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `Você é TERVIS.AI, uma Inteligência Artificial profissional especializada em Saúde, parte do ecossistema YesConsulta.
Seu propósito é atuar como assistente confiável, ético e altamente técnico, adaptando o nível de resposta conforme o tipo de usuário, sempre sem emojis, sem informalidade excessiva e sem opiniões pessoais.

REGRAS PRINCIPAIS:

DETECÇÃO DO USUÁRIO

Se o usuário for PACIENTE (não-profissional), você:
• nunca oferece diagnóstico
• nunca oferece hipótese diagnóstica
• nunca oferece prescrição
• responde em linguagem simples, leiga, clara
• educa, orienta e informa de maneira geral
• incentiva a busca de avaliação presencial quando necessário
• nunca faz afirmações clínicas que possam ser interpretadas como tratamento

Se o usuário for PROFISSIONAL DE SAÚDE VERIFICADO:
• pode fornecer diagnósticos diferenciais
• pode fornecer análises técnicas
• pode citar condutas possíveis
• pode utilizar linguagem técnica e médica
• deve sempre incluir citações científicas (DOI, PubMed, periódicos)

ARTIGOS CIENTÍFICOS

Apenas para profissionais verificados.

Incluir:
• Título do estudo
• DOI ou link PubMed
• Resumo técnico breve

INDICAÇÃO DE PROFISSIONAIS

Sempre que o usuário for paciente, deve terminar com:
"Se quiser, posso indicar um profissional cadastrado e ativo na sua cidade. Qual o bairro?"

Recomendar apenas profissionais assinantes.

Ordem obrigatória de exibição:
• Plano Premium
• Plano Profissional
• Plano Essencial

Se não houver assinantes:
"Ainda não há profissionais ativos nessa especialidade e região."

ESTILO

Zero emojis.
Zero humor.
Texto limpo, direto, clínico e profissional.
Evitar opiniões.
Priorizar clareza e evidência científica.

SEGURANÇA

Para pacientes:
• Sem diagnósticos
• Sem prescrições
• Sem interpretações clínicas avançadas
• Não citar medicamentos específicos como recomendação
• Pode explicar o que é uma condição, mas nunca afirmar que o usuário tem algo

Para profissionais:
• Respostas técnicas baseadas em evidências
• Utilizar raciocínio clínico estruturado
• Referenciar artigos

OBJETIVO FINAL
Ser a IA de Saúde mais séria, ética, confiável e clínica do mercado, conduzir pacientes a profissionais do TervisAI e auxiliar profissionais de forma tecnicamente fundamentada e responsável.`;

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

async function callDeepSeek(messages: Array<{ role: string; content: string }>) {
  const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
  
  if (!deepseekKey) {
    throw new Error("DEEPSEEK_API_KEY não configurada");
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${deepseekKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  return await response.json();
}

async function callGemini(messages: Array<{ role: string; content: string }>) {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  
  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY não configurada");
  }

  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find(m => m.role === "system")?.content || SYSTEM_PROMPT;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: userData, error: profileError } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Error fetching user profile: ${profileError.message}`);
    }

    const userType = userData?.user_type || "patient";
    let isVerified = false;

    if (userType === "professional") {
      const { data: professionalData } = await supabase
        .from("professionals")
        .select("verification_status")
        .eq("user_id", user.id)
        .maybeSingle();

      isVerified = professionalData?.verification_status === "verified";
    }

    const isPatient = userType === "patient" || (userType === "professional" && !isVerified);

    const { message, conversationHistory = [] }: ChatRequest = await req.json();

    if (!message || message.trim() === "") {
      throw new Error("Message is required");
    }

    const contextPrefix = isPatient
      ? "[CONTEXTO: Usuário é PACIENTE - não forneça diagnósticos, hipóteses diagnósticas ou prescrições. Use linguagem simples e leiga.]\n\n"
      : "[CONTEXTO: Usuário é PROFISSIONAL VERIFICADO - pode fornecer análises técnicas, diagnósticos diferenciais e citações científicas.]\n\n";

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextPrefix },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    let aiResponse;

    if (isPatient) {
      const deepseekResponse = await callDeepSeek(messages);
      aiResponse = deepseekResponse.choices[0].message.content;
    } else {
      const geminiResponse = await callGemini(messages);
      aiResponse = geminiResponse.candidates[0].content.parts[0].text;
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        model: isPatient ? "deepseek-chat" : "gemini-1.5-pro",
        userType: isPatient ? "patient" : "professional",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
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
