export async function deepseekPatientQuery(message: string): Promise<string> {
  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Você é a IA TERVIS.AI para pacientes. Forneça informações gerais sobre saúde e bem-estar. IMPORTANTE: Não diagnostique doenças, não prescreva medicamentos. Ao final de cada resposta, sempre pergunte: 'Quer que eu indique um profissional de saúde no seu bairro?'"
          },
          { role: "user", content: message }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`DeepSeek API error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao consultar DeepSeek:", error);
    return "Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente.";
  }
}
