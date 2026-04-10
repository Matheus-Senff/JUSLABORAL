import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { imageBase64, mimeType, placeholders } = body;
    console.log("[extract-document-vision] Received. Base64 length:", imageBase64?.length, "MimeType:", mimeType, "Placeholders:", placeholders?.length);
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const placeholderList = placeholders && Array.isArray(placeholders) && placeholders.length > 0
      ? placeholders.map((p: string, i: number) => `${i + 1}. "${p}"`).join("\n")
      : null;

    const extractionPrompt = placeholderList
      ? `Analise este documento e extraia os valores para CADA um destes campos específicos:\n\n${placeholderList}\n\nRetorne APENAS um objeto JSON válido onde cada chave é exatamente o texto do campo (como listado acima) e o valor é o dado extraído do documento.\nSe não encontrar o valor para um campo, use string vazia "".\nExemplo: {"NOME COMPLETO DO AUTOR": "MARIA SILVA", "NÚMERO DO CPF": "123.456.789-00"}`
      : `Analise este documento e extraia os dados necessários para preencher um modelo jurídico. Responda APENAS em formato JSON, onde as chaves são os nomes dos campos (ex: nome, cpf, rg, endereco, estado_civil, profissao, nacionalidade, bairro, cidade, uf, cep, numero_rg, orgao_emissor, data_nascimento, email, telefone, valor_causa) e os valores são os dados encontrados. Se o campo não existir no documento, retorne null.`;

    const systemPrompt = `Você é um assistente especializado em extrair dados de documentos jurídicos brasileiros.

REGRAS OBRIGATÓRIAS:
1. Analise a imagem do documento com atenção total.
2. CPF tem formato: 000.000.000-00 ou 00000000000 (11 dígitos)
3. RG/Identidade tem formato: 00.000.000-0 ou similar
4. CEP tem formato: 00000-000
5. Datas têm formato: DD/MM/AAAA
6. Valores monetários começam com R$
7. Nomes de pessoas são em MAIÚSCULAS geralmente
8. Se o campo pedir "ESTADO EMISSOR" ou "SSP", retorne apenas a sigla do estado (ex: SP, RJ)
9. Se o campo pedir "CIDADE/UF", retorne no formato "Cidade/UF"
10. NUNCA invente dados — retorne apenas o que está no documento
11. Separe logradouro, número, bairro, cidade se possível`;

    const imageMime = mimeType || "image/jpeg";

    // Build messages with vision content
    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${imageMime};base64,${imageBase64}` },
          },
          { type: "text", text: extractionPrompt },
        ],
      },
    ];

    // If we have specific placeholders, use tool calling for structured output
    const body: Record<string, unknown> = {
      model: "google/gemini-2.5-flash",
      messages,
    };

    if (placeholderList && placeholders.length > 0) {
      body.tools = [
        {
          type: "function",
          function: {
            name: "extract_fields",
            description: "Extract field values from document image",
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
      ];
      body.tool_choice = { type: "function", function: { name: "extract_fields" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI vision extraction failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    // Try tool call response first
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const extracted = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({ extractedFields: extracted }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    // Fallback: parse content as JSON
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify({ extractedFields: extracted }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      console.error("Failed to parse AI content as JSON");
    }

    return new Response(JSON.stringify({ extractedFields: {}, error: "Could not parse AI response" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-document-vision error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
