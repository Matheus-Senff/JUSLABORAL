import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { documentText, placeholders } = body;
    console.log("[extract-document-data] Received request. Text length:", documentText?.length, "Placeholders:", placeholders?.length);
    if (!documentText || typeof documentText !== "string") {
      return new Response(JSON.stringify({ error: "documentText is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!placeholders || !Array.isArray(placeholders) || placeholders.length === 0) {
      return new Response(JSON.stringify({ error: "placeholders array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const placeholderList = placeholders.map((p: string, i: number) => `${i + 1}. "${p}"`).join("\n");

    const systemPrompt = `Você é um assistente especializado em extrair dados de documentos jurídicos brasileiros escaneados via OCR.

Sua tarefa é analisar o texto do documento e extrair os valores corretos para cada campo solicitado.

REGRAS OBRIGATÓRIAS:
1. Analise TODO o texto do documento com atenção — o OCR pode ter misturado a ordem das informações.
2. Para cada campo, procure o VALOR REAL no documento, não o rótulo.
3. CPF tem formato: 000.000.000-00 ou 00000000000 (11 dígitos)
4. RG/Identidade tem formato: 00.000.000-0 ou similar
5. CEP tem formato: 00000-000
6. Datas têm formato: DD/MM/AAAA
7. Valores monetários começam com R$
8. Nomes de pessoas são em MAIÚSCULAS geralmente
9. Se o campo pedir "NOME COMPLETO DO AUTOR" ou "NOME DA PARTE", busque o nome da pessoa principal (outorgante/requerente)
10. Se o campo pedir "ESTADO EMISSOR" ou "SSP", retorne apenas a sigla do estado (ex: SP, RJ)
11. Se o campo pedir "CIDADE/UF", retorne no formato "Cidade/UF" (ex: "Campo Limpo Paulista/SP")
12. Se não encontrar um valor, retorne string vazia ""
13. NUNCA invente dados — retorne apenas o que está no documento
14. Endereço: separe logradouro, número, bairro, cidade se o campo pedir separadamente
15. Se o texto do OCR misturou valores (ex: "CPF nº: Endereço. 369261478/09"), identifique pelo FORMATO do dado, não pela posição`;

    const userPrompt = `TEXTO DOS DOCUMENTOS ESCANEADOS (OCR):

${documentText.slice(0, 12000)}

---

CAMPOS A EXTRAIR (retorne um JSON com cada campo como chave e o valor encontrado):

${placeholderList}

---

Retorne APENAS um objeto JSON válido onde cada chave é exatamente o texto do campo (como listado acima) e o valor é o dado extraído do documento. Exemplo:
{"NOME COMPLETO DO AUTOR": "MARIA SILVA", "NÚMERO DO CPF": "123.456.789-00", "CEP": "01234-567"}

Se não encontrar o valor para um campo, use string vazia "".`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_fields",
              description: "Extract field values from document text",
              parameters: {
                type: "object",
                properties: Object.fromEntries(
                  placeholders.map((p: string) => [p, { type: "string", description: `Value for field: ${p}` }])
                ),
                required: placeholders,
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_fields" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI extraction failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    // Try tool call response first
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const extracted = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({ extractedFields: extracted }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    // Fallback: try to parse content as JSON
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify({ extractedFields: extracted }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      console.error("Failed to parse AI content as JSON");
    }

    return new Response(JSON.stringify({ extractedFields: {}, error: "Could not parse AI response" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-document-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
