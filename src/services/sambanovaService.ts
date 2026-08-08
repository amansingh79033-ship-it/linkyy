import * as Sentry from "@sentry/react";

export interface OptimizationResult {
  engineered_post: string;
  asset_recommendation: {
    type: string;
    rationale: string;
    structure: string;
  };
  posting_schedule: {
    time: string;
    rationale: string;
  };
  engagement_blueprint: {
    question_reply_loop: string;
    velocity_score: number;
    hook_score: number;
    hook_rationale: string;
    fold_score: number;
    fold_rationale: string;
  };
  link_mitigation: {
    extracted_links: string[];
    strategy: string;
  };
  suggested_micro_icons: string[];
}

export interface SlideElement {
  id: string;
  type: 'image' | 'link' | 'icon';
  content: string;
  x: number;
  y: number;
  shape?: 'rectangle' | 'circle' | 'rounded';
  width?: number;
  height?: number;
}

export interface CarouselSlide {
  slide_number: number;
  headline: string;
  body_text: string;
  design_suggestion: string;
  elements?: SlideElement[];
}

const SAMBANOVA_API_URL = "/api/sambanova/chat/completions";
const SAMBANOVA_MODELS_URL = "/api/sambanova/models";
const SAMBANOVA_API_KEY = (import.meta as any).env?.VITE_SAMBANOVA_API_KEY || "";
const PREFERRED_MODEL = "gemma-4-31B-it";

// ── Active model (mutable — updated by the models scan) ──────────────────────
let _activeModel = PREFERRED_MODEL;

// ── Pub/sub: UI components can subscribe to model name changes ────────────────
type ModelListener = (model: string) => void;
const _modelListeners = new Set<ModelListener>();

/** Subscribe to active-model changes. Returns an unsubscribe function. */
export function subscribeToModel(cb: ModelListener): () => void {
  _modelListeners.add(cb);
  return () => _modelListeners.delete(cb);
}

/** Returns the currently selected model name. */
export function getActiveModel(): string {
  return _activeModel;
}

function _emitModel(name: string) {
  _activeModel = name;
  _modelListeners.forEach(cb => cb(name));
}

// ── Models discovery cache (TTL: 5 minutes) ───────────────────────────────────
const MODELS_CACHE_TTL = 5 * 60 * 1000;
let _modelsCache: { models: string[]; ts: number } | null = null;

async function fetchAvailableModels(): Promise<string[]> {
  const now = Date.now();
  if (_modelsCache && now - _modelsCache.ts < MODELS_CACHE_TTL) {
    return _modelsCache.models;
  }
  try {
    const res = await fetch(SAMBANOVA_MODELS_URL, {
      headers: { Authorization: `Bearer ${SAMBANOVA_API_KEY}` },
    });
    if (!res.ok) throw new Error(`Models endpoint returned ${res.status}`);
    const data = await res.json();
    const models: string[] = (data.data ?? []).map((m: any) => String(m.id)).filter(Boolean);
    if (models.length === 0) throw new Error("Empty models list");
    _modelsCache = { models, ts: now };
    Sentry.logger.info('SambaNova models refreshed', { count: models.length });
    return models;
  } catch (e) {
    Sentry.logger.warn('Could not fetch models list, using default', { error: String(e) });
    return [PREFERRED_MODEL];
  }
}

function pickModel(models: string[]): string {
  return models.includes(PREFERRED_MODEL) ? PREFERRED_MODEL : (models[0] || PREFERRED_MODEL);
}

/**
 * Fire-and-forget animation: cycles through all available model names briefly,
 * then settles on the chosen model. Runs in parallel with the actual API call.
 */
function runModelScanAnimation(models: string[], chosen: string): void {
  let cancelled = false;
  (async () => {
    // Shuffle a brief preview of all models (up to 6) so it looks like a scan
    const preview = models.slice(0, 6);
    for (const m of preview) {
      if (cancelled) return;
      _emitModel(m);
      await new Promise(r => setTimeout(r, 110));
    }
    if (!cancelled) _emitModel(chosen);
  })();
  // Self-cancelling: settled after at most preview.length * 110ms
  setTimeout(() => { cancelled = true; _emitModel(chosen); }, models.slice(0, 6).length * 110 + 50);
}

// ── In-session response cache (keyed by prompt hash) ───────────────────────
// Prevents identical requests from hitting the API twice in the same session.
const _responseCache = new Map<string, string>();

function _cacheKey(messages: Array<{ role: string; content: string }>): string {
  return messages.map(m => `${m.role}:${m.content}`).join("|||");
}

// ── Client-side rate limiter ──────────────────────────────────────────────────
// Prevents the API key from being hammered. Max 1 live request per 5 seconds.
const RATE_LIMIT_MS = 5_000;
let _lastCallTs = 0;

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const gap = RATE_LIMIT_MS - (now - _lastCallTs);
  if (gap > 0) {
    await new Promise(res => setTimeout(res, gap));
  }
  _lastCallTs = Date.now();
}

async function callSambaNovaAPI(messages: Array<{ role: string; content: string }>): Promise<string> {
  // Return cached response if this exact prompt was already called this session
  const key = _cacheKey(messages);
  if (_responseCache.has(key)) {
    Sentry.logger.debug('SambaNova cache hit', { skipped_api_call: true });
    Sentry.metrics.count('api.cache_hit', 1, { attributes: { model: _activeModel } });
    return _responseCache.get(key)!;
  }

  // Throttle live API calls to protect the API key
  const now = Date.now();
  const waitMs = Math.max(0, RATE_LIMIT_MS - (now - _lastCallTs));
  if (waitMs > 0) {
    Sentry.logger.warn('Rate limit active', {
      wait_ms:        waitMs,
      rate_limit_ms:  RATE_LIMIT_MS,
    });
    Sentry.metrics.count('api.rate_limit_triggered', 1);
    Sentry.metrics.distribution('api.rate_limit_wait', waitMs, { unit: 'millisecond' });
  }
  await enforceRateLimit();

  // ── Discover available models, run scan animation, pick best model ──────────
  const availableModels = await fetchAvailableModels();
  const chosenModel = pickModel(availableModels);
  runModelScanAnimation(availableModels, chosenModel); // fire-and-forget — visual only

  Sentry.logger.info('SambaNova API call dispatched', { model: chosenModel });
  Sentry.metrics.count('api.call', 1, { attributes: { model: chosenModel } });

  const callStart = Date.now();
  const response = await fetch(SAMBANOVA_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SAMBANOVA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stream: false,
      model: chosenModel,
      messages: messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const err = new Error(`SambaNova API error: ${response.status} - ${errorText}`);
    Sentry.logger.error('SambaNova API failed', {
      http_status:    response.status,
      error_body:     errorText.substring(0, 300),
    });
    Sentry.metrics.count('api.error', 1, { attributes: { http_status: String(response.status), model: chosenModel } });
    console.error("[Linkyy] SambaNova API request failed:", err);
    throw err;
  }

  const responseTime = Date.now() - callStart;
  Sentry.metrics.distribution('api.response_time', responseTime, { unit: 'millisecond', attributes: { model: chosenModel } });

  const rawText = await response.text();
  let result = "";

  if (rawText.includes("data: ")) {
    const lines = rawText.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content || "";
          result += delta;
        } catch (e) {
          // ignore parsing error on chunk
        }
      }
    }
  } else {
    try {
      const data = JSON.parse(rawText);
      result = data.choices?.[0]?.message?.content || data.choices?.[0]?.delta?.content || "";
    } catch (e) {
      result = rawText;
    }
  }

  Sentry.logger.info('SambaNova API response received', {
    response_length: result.length,
    model:           chosenModel,
    cached:          false,
  });
  Sentry.metrics.distribution('api.response_size', result.length, { unit: 'byte', attributes: { model: chosenModel } });
  _responseCache.set(key, result);
  return result;
}

export async function generateCarouselSlides(
  postContent: string,
  slideCount: number = 5
): Promise<CarouselSlide[]> {
  const systemPrompt = `You are a LinkedIn Carousel Expert optimizing for the "Dwell Time" algorithm.
Convert the following LinkedIn post into a highly engaging carousel (exactly ${slideCount} slides).

Rules for Dwell Time Optimization:
1. Slide 1 (Hook): Must be a pattern interrupt. Very few words, high curiosity.
2. Middle Slides: One core idea per slide. Progressive disclosure to keep them swiping.
3. Final Slide: Strong Call to Action (CTA) and a Question-Reply loop to drive comments.
4. CRITICAL: The 'body_text' for each slide MUST be exactly 2 to 3 lines long. Do not make it a single short sentence, and do not make it a massive paragraph. It should be 2-3 distinct, impactful sentences that provide real value.
5. Keep text punchy and engaging.

Return ONLY a valid JSON array of slides with this exact structure:
[
  {
    "slide_number": 1,
    "headline": "Slide headline text",
    "body_text": "2-3 lines of body text",
    "design_suggestion": "Design suggestion text"
  }
]`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Post Content:\n"""\n${postContent}\n"""` }
  ];

  const content = await callSambaNovaAPI(messages);
  
  // Extract JSON from the response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to generate carousel slides - invalid response format");
  }

  return JSON.parse(jsonMatch[0]) as CarouselSlide[];
}

export async function optimizeLinkedInPost(
  content: string,
  industry: string,
  audience: string | Record<string, string>,
  tone: string,
  timeZone: string
): Promise<OptimizationResult> {
  let audienceStr = "";
  if (typeof audience === 'object') {
    audienceStr = Object.entries(audience)
      .filter(([_, val]) => val)
      .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`)
      .join(', ');
  } else {
    audienceStr = audience;
  }

  const systemPrompt = `You are a LinkedIn Viral Engineering AI built on the Growth Architect Framework.
Your goal is to transform raw LinkedIn posts into algorithm-optimized content designed for maximum virality and Dwell Time.

Apply the Growth Architect Framework & Dwell Time Optimization:
1. Structural Engineering: Automatic hook detection, fold placement (line 3), and vertical formatting.
2. Dwell Time Formatting (CRITICAL): 
   - Use the "Broetry" style. One short, punchy sentence per line.
   - Double line breaks between distinct thoughts to force scrolling.
   - Use bullet points or numbered lists for readability.
   - Emphasize key words to make it skimmable.
   - Add relevant emojis to break up text visually.
3. Engagement Velocity: AI-powered Question-Reply Loop generation.
4. Link Mitigation: Automatic URL extraction with 60-minute delayed comment strategy.
5. Peak Time Compliment: Structure the post so it's highly readable and engaging for users scrolling during peak hours (morning commutes, lunch breaks).
6. Metadata Layer: Tiered hashtag generation (Tier 1-3 by follower count).
7. Schedule Optimization: T-0 calculation (Tue-Thu, 8-10 AM in ${timeZone || "local time"}).
8. Micro Art: Select 4-6 relevant icon names from this exact list: [Rocket, TrendingUp, Lightbulb, Target, Zap, Brain, Briefcase, Coffee, Star, Heart, Flame, CheckCircle2, Globe, Users, Shield, Award, Crown, Diamond, Magnet, Megaphone] based on the post topic.

Optimization Techniques:
1. Hook Engineering: Use Pattern Interrupt, Authority Signal, or Relatability.
2. Fold Placement: Line 3 must contain a curiosity gap, value signal, outcome promise, or contrarian view.
3. Vertical Formatting:
   - Hook (8-12 words)
   - Amplification
   - THE FOLD (Line 3)
   - Value delivery (single-sentence lines)
   - Double spacing between thoughts
   - Question-Reply Loop at the end
   - 3-5 relevant hashtags

IMPORTANT: Return the \`engineered_post\` as formatted HTML (using <p>, <br>, <strong>, <em>, <ul>, <li>, etc.) so it can be loaded directly into a rich text editor. Do NOT use markdown for the engineered_post. Use HTML tags.

Return ONLY valid JSON with this exact structure:
{
  "engineered_post": "HTML formatted post content",
  "asset_recommendation": {
    "type": "Carousel, Infographic, Text-only, or Video",
    "rationale": "Why this asset type is recommended",
    "structure": "Structure description"
  },
  "posting_schedule": {
    "time": "Suggested posting time, e.g., Tuesday at 8:30 AM EST",
    "rationale": "Why this time is optimal"
  },
  "engagement_blueprint": {
    "question_reply_loop": "Question to ask at the end to drive comments",
    "velocity_score": 85,
    "hook_score": 90,
    "hook_rationale": "Explanation of hook effectiveness",
    "fold_score": 88,
    "fold_rationale": "Explanation of fold placement"
  },
  "link_mitigation": {
    "extracted_links": ["array of URLs found"],
    "strategy": "Strategy for posting links"
  },
  "suggested_micro_icons": ["Rocket", "Lightbulb", "Target", "Zap"]
}`;

  const userPrompt = `Raw Content:
"""
${content}
"""

Context:
Industry: ${industry || "General"}
Target Audience: ${audienceStr || "Professionals"}
Tone: ${tone || "Professional and engaging"}

Analyze the content and provide the optimized output in the requested JSON format.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const responseContent = await callSambaNovaAPI(messages);
  
  // Extract JSON from the response
  const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to generate content - invalid response format");
  }

  return JSON.parse(jsonMatch[0]) as OptimizationResult;
}
