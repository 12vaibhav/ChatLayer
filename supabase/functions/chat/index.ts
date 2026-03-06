import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_CHAT_PAT = Deno.env.get("OPENAI_CHAT_PAT") || "";
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

async function getChatResponse(systemPrompt: string, history: any[], userMessage: string, context: string) {
  const messages = [
    { role: "system", content: `${systemPrompt}\n\nContext from Knowledge Base:\n${context}\n\nStrict Rule: If you cannot find the answer in the provided context, politely say you don't know or ask them to talk to a human.` },
    ...history.map(h => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
    { role: "user", content: userMessage }
  ];

  const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_CHAT_PAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { bot_id, conversation_id: p_conversation_id, message } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let conversation_id = p_conversation_id;

    // 1. Get Bot Config
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("*")
      .eq("id", bot_id)
      .single();
    if (botError) throw botError;

    // 2. Create conversation if not exists
    if (!conversation_id) {
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({ bot_id, status: 'active' })
        .select()
        .single();
      if (convError) throw convError;
      conversation_id = conv.id;
    }

    // 3. Store user message
    await supabase.from("messages").insert({ conversation_id, sender: 'user', text: message });

    // 4. Check if human agent is already joined
    const { data: currentConv } = await supabase
      .from("conversations")
      .select("status")
      .eq("id", conversation_id)
      .single();

    if (currentConv?.status === 'joined') {
      return new Response(JSON.stringify({ conversation_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. RAG: Search knowledge chunks
    const embedding = await getEmbedding(message);
    const { data: chunks } = await supabase.rpc("match_knowledge_chunks", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5,
      p_bot_id: bot_id
    });
    const context = chunks?.map((c: any) => c.content).join("\n\n") || "No specific context found.";

    // 6. Get History
    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: false })
      .limit(10);
    
    // Reverse to get chronological order
    const sortedHistory = (history || []).reverse();

    // 7. Get AI Response
    const systemPrompt = `You are ${bot.name}. ${bot.description || ''}\nYour vibe is ${bot.vibe || 'friendly'}.\nCustom Instructions: ${bot.custom_prompt || ''}`;
    const reply = await getChatResponse(systemPrompt, sortedHistory, message, context);

    // 8. Store bot response
    await supabase.from("messages").insert({ conversation_id, sender: 'bot', text: reply });

    // 9. Simple Handoff Logic
    const handoffRequested = /human|agent|person|help|support|talk to someone/i.test(message) || /human|agent|person/i.test(reply);
    
    if (handoffRequested && currentConv?.status !== 'handoff') {
      await supabase.from("conversations").update({ status: 'handoff' }).eq("id", conversation_id);
      
      // Also increment total chats for the bot
      await supabase.rpc('increment_bot_chats', { bot_id_param: bot_id });

      return new Response(JSON.stringify({ conversation_id, reply, handoff: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment total chats
    await supabase.rpc('increment_bot_chats', { bot_id_param: bot_id });

    return new Response(JSON.stringify({ conversation_id, reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
