import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_EMBEDDING_PAT = Deno.env.get("OPENAI_EMBEDDING_PAT") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch("https://models.inference.ai.azure.com/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_EMBEDDING_PAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
 model: "text-embedding-3-small",
    }),
  });
  const data = await res.json();
  return data?.data?.[0]?.embedding || [];
}

function chunkText(text: string, size = 500): string[] {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;

  for (const word of words) {
    currentChunk.push(word);
    currentLength += word.length + 1;
    if (currentLength >= size * 4) { // Rough estimation: 1 token ~ 4 chars
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
      currentLength = 0;
    }
  }
  if (currentChunk.length > 0) chunks.push(currentChunk.join(" "));
  return chunks;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { bot_id, user_id, source_type, source_name, url, file_content, file_type, text_content } = await req.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let finalContent = "";
    let metadata = {};

    if (source_type === "url") {
      const res = await fetch(url);
      const html = await res.text();
      // Simple HTML to Text (strip tags)
      finalContent = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      metadata = { url, size: `${(finalContent.length / 1024).toFixed(1)} KB` };
    } else if (source_type === "file") {
      // Decode base64
      const binary = atob(file_content);
      if (file_type === "text/plain") {
        finalContent = binary;
      } else {
        // For PDF/DOCX we'd need more complex parsing. 
        // For now, assume it's text-like or provide a placeholder.
        finalContent = binary; 
      }
      metadata = { size: `${(finalContent.length / 1024).toFixed(1)} KB` };
    } else if (source_type === "text") {
      finalContent = text_content;
      metadata = { size: `${(finalContent.length / 1024).toFixed(1)} KB` };
    }

    if (!finalContent) throw new Error("No content extracted");

    // 1. Create Knowledge Source
    const { data: source, error: sourceError } = await supabase
      .from("knowledge_sources")
      .insert({
        bot_id,
        user_id,
        source_name,
        type: source_type,
        metadata
      })
      .select()
      .single();

    if (sourceError) throw sourceError;

    // 2. Chunk and Embed
    const chunks = chunkText(finalContent);
    for (const chunk of chunks) {
      if (chunk.trim().length < 10) continue;
      const embedding = await getEmbedding(chunk);
      
      await supabase.from("knowledge_chunks").insert({
        bot_id,
        source_id: source.id,
        content: chunk,
        embedding
      });
    }

    return new Response(JSON.stringify({ success: true, source }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
