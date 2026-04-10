import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { templateContent, promptInstructions } = await req.json();

    if (!templateContent || typeof templateContent !== "string") {
      return new Response(JSON.stringify({ error: "templateContent is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!promptInstructions || typeof promptInstructions !== "string" || !promptInstructions.trim()) {
      // No prompt instructions — return template as-is
      return new Response(JSON.stringify({ processedTemplate: templateContent }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um assistente jurídico especializado em edição de modelos de petição.
Sua ÚNICA função é aplicar as instruções do usuário ao texto do modelo fornecido.

Regras OBRIGATÓRIAS:
1. PRESERVE todos os termos entre parênteses () e colchetes [] exatamente como estão — eles são placeholders para dados.
2. Aplique APENAS as modificações solicitadas nas instruções do usuário (adicionar cláusulas, remover seções, alterar texto).
3. NÃO preencha os parênteses () nem colchetes [] com dados reais — mantenha-os como estão.
4. NÃO adicione comentários, explicações ou notas — retorne APENAS o texto do modelo modificado.
5. Mantenha a formatação e estrutura original do modelo.
6. Se a instrução pedir para remover algo, remova completamente.
7. Se a instrução pedir para adicionar algo, adicione no local mais apropriado.
8. Retorne o modelo completo modificado, não apenas as partes alteradas.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `MODELO ORIGINAL:\n\n${templateContent}\n\n---\n\nINSTRUÇÕES DO USUÁRIO:\n${promptInstructions}\n\n---\n\nAplique as instruções acima ao modelo e retorne o modelo completo modificado. Mantenha todos os placeholders em () e [] intactos.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos na sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao processar o modelo com IA." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const processedTemplate = data.choices?.[0]?.message?.content?.trim() || templateContent;

    return new Response(JSON.stringify({ processedTemplate }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-template error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
