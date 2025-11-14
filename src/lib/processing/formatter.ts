import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Uses LLM to format text: add punctuation, capitalization, apply dictionary entries.
// Input: mergedText: string, dictionary: [{phrase,replacement}, ...]
export async function formatText(mergedText: string, dict: { phrase: string; replacement: string }[]) {
  // If text is empty, return early
  if (!mergedText || mergedText.trim().length === 0) {
    return mergedText;
  }

  // First, apply dictionary replacements directly (case-insensitive)
  let processedText = mergedText;
  for (const entry of dict) {
    // Use case-insensitive replacement with word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${entry.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    processedText = processedText.replace(regex, entry.replacement);
  }

  // Build dictionary instruction for LLM (in case direct replacement missed some)
  const dictInstruction = dict.length
    ? `\n\nIMPORTANT: Apply these exact word/phrase replacements (case-insensitive):\n${dict.map(d => `- "${d.phrase}" should always be written as "${d.replacement}"`).join("\n")}\n`
    : "";

  const system = `You are a careful text formatter. Your job is to:
1. Add proper punctuation (periods, commas, question marks, exclamation marks)
2. Fix capitalization (start of sentences, proper nouns)
3. Add appropriate spacing
4. Fix obvious grammar errors
5. Apply dictionary replacements exactly as specified

CRITICAL RULES:
- Do NOT change the meaning or content
- Do NOT add new information
- Do NOT remove information
- Do NOT rewrite sentences - only format them
- Preserve all technical terms, names, and specific words
- Output ONLY the formatted text, no explanations or comments`;

  const prompt = `Format the following transcribed text with proper punctuation, capitalization, and spacing.${dictInstruction}\n\nText to format:\n${processedText}\n\nReturn only the formatted text:`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 2000,
    });

    const formatted = completion.choices?.[0]?.message?.content?.trim() ?? processedText;
    return formatted;
  } catch (error: any) {
    console.error("Error formatting text:", error);
    
    // If it's a quota/billing error, log it but still return processed text
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      console.error("OpenAI quota exceeded during formatting. Returning text without GPT formatting.");
    }
    
    // Return processed text (with dictionary replacements) if formatting fails
    return processedText;
  }
}

