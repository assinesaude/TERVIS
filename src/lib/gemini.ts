export async function geminiProQuery(message: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY não configurada");
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Você é a IA TERVIS.AI para profissionais de saúde. Sua função é auxiliar profissionais com informações técnicas baseadas em evidências científicas.

SEMPRE cite fontes confiáveis (estudos, papers, ensaios clínicos, guidelines).
PERMITIDO: Auxiliar em diagnósticos diferenciais, discutir condutas clínicas, sugerir protocolos baseados em evidências.
OBRIGATÓRIO: Incluir referências científicas em todas as respostas.

Pergunta do profissional: ${message}`
            }]
          }]
        })
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao processar resposta.";
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente.";
  }
}
