import { supabase } from "../api/supabaseClient";

export async function getChatbotResponse(userMessage) {
  // 1. Search local KB (case-insensitive)
  const { data: kbMatches, error } = await supabase
    .from("knowledge_base")
    .select("kb_id, question, answer, disabled")
    .ilike("question", `%${userMessage}%`);

  if (error) {
    console.error("KB search error:", error);
  }

  // 2. If KB found and not disabled → return KB answer
  if (kbMatches && kbMatches.length > 0) {
    const bestMatch = kbMatches[0];

    if (!bestMatch.disabled) {
      return {
        answer: bestMatch.answer,
        source: "KB",
        kb_id: bestMatch.kb_id
      };
    }
  }

  // 3. Otherwise fallback to LLM (placeholder)
  // You'll later replace this with your Gemini API
  const llmAnswer = `I don't have an exact match for that, but here’s some help: "${userMessage}" usually refers to food, hours, or locations in NAC.`;

  return {
    answer: llmAnswer,
    source: "LLM",
    kb_id: null
  };
}
