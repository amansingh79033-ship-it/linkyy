/**
 * AI Service — powered by SambaNova (Meta-Llama-3.3-70B-Instruct)
 * Calls /api/ai which proxies to SambaNova server-side (avoids CORS).
 */
import { ContentType, GeneratedContent } from "../types";

/**
 * Core call — goes through our backend proxy at /api/ai
 */
async function callSambaNova(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content ?? '';
}

/**
 * Extracts a JSON block from raw LLM text (handles ```json ... ``` wrapping).
 */
function extractJson(text: string): any {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = match ? match[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}

// ─────────────────────────────────────────────
// generateLinkedInPost
// ─────────────────────────────────────────────
export const generateLinkedInPost = async (
  topic: string,
  tone: string
): Promise<GeneratedContent> => {
  const system = `You are a LinkedIn Dwell Time Algorithm expert for Linkyy.
You MUST respond ONLY with valid JSON — no prose, no markdown outside the JSON block.`;

  const user = `Write a viral LinkedIn post about "${topic}". Tone: ${tone}.

Rules for High Dwell Time:
1. Hook: First 2 lines must force a "See more" click (contrarian statement or massive value promise).
2. Structure: Short sentences (Bro-etry style). Lots of white space and line breaks.
3. Content: Actionable advice or deep insight.
4. Engagement: End with a specific question to drive comments.

Return ONLY this JSON (no extra text):
{
  "textRaw": "<full post text with emojis and newlines>",
  "dwellScore": <number 1-100>,
  "viralTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "hashtags": ["<tag1>", "<tag2>", "<tag3>", "<tag4>", "<tag5>"]
}`;

  const raw = await callSambaNova(system, user);
  const result = extractJson(raw);

  return {
    id: Date.now().toString(),
    type: ContentType.POST,
    textRaw: result.textRaw,
    dwellScore: result.dwellScore,
    viralTips: result.viralTips,
    hashtags: result.hashtags,
    createdAt: Date.now(),
  };
};

// ─────────────────────────────────────────────
// generateLinkedInCarousel
// ─────────────────────────────────────────────
export const generateLinkedInCarousel = async (
  topic: string,
  slideCount: number
): Promise<GeneratedContent> => {
  const system = `You are a LinkedIn Carousel designer & Dwell Time Algorithm expert for Linkyy.
You MUST respond ONLY with valid JSON — no prose, no markdown outside the JSON block.`;

  const user = `Create a ${slideCount}-slide LinkedIn Carousel about "${topic}".
Optimize for Dwell Time (swipes) and visual aesthetics.

Design Rules:
1. Color palette: high-contrast (dark mode or bright minimalist). Use an accentColor for emphasis.
2. Typography: "League Spartan" or "Montserrat" for headlines; "Roboto", "Lato", or "Inter" for body.
3. Content:
   - Slide 1: Hook/Title (big promise).
   - Middle Slides: Step-by-step value, concise text.
   - Last Slide: CTA / Summary.

Return ONLY this JSON (no extra text):
{
  "slides": [
    {
      "title": "string",
      "content": "string",
      "footer": "string",
      "bgColor": "#hex",
      "textColor": "#hex",
      "accentColor": "#hex",
      "titleFont": "League Spartan",
      "bodyFont": "Inter"
    }
  ],
  "dwellScore": <number 1-100>,
  "viralTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "hashtags": ["<tag1>", "<tag2>", "<tag3>", "<tag4>", "<tag5>"]
}`;

  const raw = await callSambaNova(system, user);
  const result = extractJson(raw);

  return {
    id: Date.now().toString(),
    type: ContentType.CAROUSEL,
    slides: result.slides,
    dwellScore: result.dwellScore,
    viralTips: result.viralTips,
    hashtags: result.hashtags,
    createdAt: Date.now(),
  };
};