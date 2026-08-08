import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Sparkles, Zap, BarChart3, LayoutTemplate, Shield, Clock, Globe, TrendingUp } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Data with Schema.org structure & LLM citation-optimized keywords
// ─────────────────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    category: "AI Optimization",
    icon: Sparkles,
    questions: [
      {
        q: "What is Linkyy and how does it optimize LinkedIn posts for virality?",
        a: "Linkyy is an AI-powered LinkedIn content engineering tool that transforms raw drafts into algorithm-optimized posts using the Growth Architect Framework. Our Dwell-Time AI analyzes hook placement, fold optimization, vertical formatting, and engagement velocity to maximize your post's reach. Studies show that posts optimized for dwell time receive up to 10× more impressions than unoptimized content. Linkyy uses advanced natural language processing (NLP) and large language models (LLMs) via SambaNova AI to engineer hooks that create pattern interrupts, place strategic curiosity gaps at line 3 (the fold), and format content with single-sentence lines that force scrolling behavior."
      },
      {
        q: "How does Dwell-Time AI work to increase LinkedIn engagement?",
        a: "LinkedIn's algorithm prioritizes posts that keep users on the screen longer (dwell time). Linkyy's AI implements several proven techniques: (1) Hook Engineering — creates pattern interrupts, authority signals, or relatability hooks in the first 8-12 words; (2) Fold Placement — ensures line 3 contains a curiosity gap, value signal, outcome promise, or contrarian view that compels users to click 'see more'; (3) Broetry Formatting — uses one short, punchy sentence per line with double line breaks between distinct thoughts to force scrolling; (4) Question-Reply Loop — generates engaging questions at the end that drive comments within the first 60 minutes, boosting engagement velocity. These techniques are backed by social media algorithm research and growth architect frameworks used by top LinkedIn creators."
      },
      {
        q: "What AI model does Linkyy use for content optimization?",
        a: "Linkyy integrates with SambaNova AI's enterprise-grade language models, primarily using Meta-Llama-3.3-70B-Instruct for optimal performance. Our system performs real-time model discovery, automatically selecting the best available model from SambaNova's API. The AI is fine-tuned for LinkedIn content engineering, understanding platform-specific patterns like dwell time optimization, engagement velocity, and the LinkedIn algorithm's preference for native content. All API calls include structured logging, client-side rate limiting, and in-session caching to ensure fast, reliable optimization without redundant API calls."
      },
    ],
  },
  {
    category: "Carousel Creation",
    icon: LayoutTemplate,
    questions: [
      {
        q: "How does Linkyy's carousel generator convert posts into slides?",
        a: "Linkyy's carousel generator uses AI to automatically extract key insights from your optimized post and convert them into a swipeable carousel format optimized for LinkedIn's document posts. The process: (1) Content Analysis — AI identifies the core message, key points, and actionable insights; (2) Slide Structuring — creates a hook slide (pattern interrupt), value slides (progressive disclosure with 2-3 lines per slide), and a CTA slide (strong call-to-action with question-reply loop); (3) Design Application — applies one of 54 professional themes with gradient backgrounds, typography optimization, and visual hierarchy; (4) Drag & Drop Customization — allows you to add images, shapes, icons, and clickable links directly onto slides. Export to PPTX format for direct upload to LinkedIn as a PDF carousel post, which typically receives 3-5× more engagement than text-only posts."
      },
      {
        q: "Can I customize carousel designs with drag-and-drop editing?",
        a: "Yes! Linkyy includes a full drag-and-drop carousel editor with these features: (1) Element Types — add images (via URL), clickable links, shapes (rectangle, circle, rounded), and micro-art icons from a curated library; (2) Positioning — freely drag elements to custom X/Y coordinates on each slide; (3) Resizing — adjust width and height of all elements; (4) Undo/Redo — complete history state management with unlimited undo/redo; (5) Theme System — choose from 54 professionally designed carousel themes including gradients (Blue Gradient, Sunset, Neon, Midnight), minimal designs (Minimal White, Dark Mode, Clean), and branded styles (Corporate, Tech Startup, Creative Agency); (6) Export Options — download as PPTX (PowerPoint) format optimized for LinkedIn's PDF carousel upload. The editor uses React state management with past/future stacks for seamless editing."
      },
      {
        q: "How many carousel themes are available and can I create custom designs?",
        a: "Linkyy ships with 54 professionally designed carousel themes across multiple categories: Gradient themes (Blue Gradient, Sunset, Neon, Midnight, Aurora, Ocean, Purple Dream, Coral, Emerald, Fire), Minimal themes (Minimal White, Dark Mode, Clean, Monochrome, Pastel, Light Gray, Soft Blue), Professional themes (Corporate, Executive, Business Blue, Tech Startup, Consulting, Financial, Medical, Legal), Creative themes (Creative Agency, Bold Colors, Artistic, Vibrant, Playful, Modern, Geometric, Abstract), Industry-specific themes (SaaS, E-commerce, Healthcare, Education, Real Estate, Fitness, Food & Beverage), and Seasonal themes (Summer, Winter, Spring, Autumn). Each theme includes optimized color palettes, typography, background patterns, and accent colors. You can also customize any theme by adding custom elements, changing text content, and modifying the layout with drag-and-drop editing."
      },
    ],
  },
  {
    category: "LinkedIn Algorithm",
    icon: BarChart3,
    questions: [
      {
        q: "What is the LinkedIn algorithm and how does it rank posts in 2024?",
        a: "LinkedIn's algorithm ranks posts based on several key signals: (1) Dwell Time — how long users spend reading your post (most important factor in 2024); (2) Engagement Velocity — how quickly your post receives likes, comments, and shares in the first 60 minutes; (3) Relevance Score — how well your content matches the interests of your network; (4) Content Type — native content (carousels, text posts) performs better than external links; (5) Authority Signals — your profile strength, posting consistency, and historical performance; (6) Conversation Quality — meaningful comments (3+ words) boost reach more than emoji reactions. Linkyy optimizes for all these signals: dwell time through Broetry formatting, engagement velocity through Question-Reply Loops, relevance through industry-specific optimization, and authority through consistent high-quality content. External links are automatically detected and Linkyy recommends the '60-minute delayed comment strategy' to avoid reach penalties."
      },
      {
        q: "Why does Linkyy recommend delaying external links in comments?",
        a: "LinkedIn's algorithm deprioritizes posts with external links because they drive users off the platform (reducing dwell time). When Linkyy detects URLs in your post, it automatically extracts them and recommends the '60-minute delayed comment strategy': (1) Post your optimized content without links; (2) Wait 60 minutes for the algorithm to distribute your post to your network; (3) Add the link in the first comment after initial engagement velocity is established. This strategy has been validated by social media growth experts and typically results in 2-3× more reach compared to including links directly in the post. Linkyy's link mitigation system automatically detects all URLs, extracts them for you, and provides a clear strategy recommendation, so you don't lose valuable traffic while maximizing algorithmic reach."
      },
      {
        q: "What is engagement velocity and why does it matter for LinkedIn reach?",
        a: "Engagement velocity measures how quickly your post receives interactions (likes, comments, shares) in the first 60-90 minutes after publishing. LinkedIn's algorithm uses this as a quality signal: posts with high early engagement are distributed to a wider audience, while slow-engaging posts are deprioritized. Linkyy optimizes engagement velocity through: (1) Hook Engineering — compelling first lines that stop scrollers; (2) Optimal Timing — recommends posting Tuesday-Thursday, 8-10 AM in your timezone (peak LinkedIn usage); (3) Question-Reply Loop — AI-generated questions that encourage comments within the first hour; (4) Link Mitigation — removes external links that reduce initial reach; (5) Hashtag Strategy — generates tiered hashtags (Tier 1: 100K-500K followers, Tier 2: 500K-1M, Tier 3: 1M+) to maximize discoverability. Posts optimized for engagement velocity typically receive 3-5× more impressions in the first 24 hours."
      },
    ],
  },
  {
    category: "Features & Tools",
    icon: Zap,
    questions: [
      {
        q: "Does Linkyy provide analytics and performance tracking for LinkedIn posts?",
        a: "Yes! Linkyy includes comprehensive monitoring and analytics powered by our custom monitoring API: (1) Traffic Metrics — tracks total requests, success rates, error rates, latency percentiles (p50, p95, p99), and bandwidth usage; (2) Infrastructure Monitoring — real-time CPU usage, memory consumption, disk I/O, network traffic, and system uptime; (3) Cost & Efficiency Tracking — calculates real-time costs, cost per request, 30-day forecasting, and efficiency metrics; (4) User Analytics — tracks total users, active users (24h/7d/30d), live visitors, user history, and feature usage; (5) Reliability Monitoring — uptime tracking (99.9% SLA), automated health checks, incident management, MTTR/MTBF metrics. All metrics are available via REST API endpoints and real-time WebSocket connections, enabling you to build custom dashboards and track your content performance over time. We also integrate with Sentry for error tracking and Vercel Analytics for page view monitoring."
      },
      {
        q: "Is Linkyy free to use and what features are included?",
        a: "Linkyy offers a generous free tier with full access to core features: AI-powered post optimization with Dwell-Time formatting, carousel generation with drag-and-drop editor, 54 professional carousel themes, PPTX export for LinkedIn upload, rich text editor with formatting tools, post history with local storage, and real-time AI model selection. The tool is completely free to use with no hidden fees. You only need a SambaNova AI API key (free tier available) for the AI optimization features. All monitoring and analytics features are included at no additional cost. Linkyy is designed to be accessible to creators, founders, marketers, and professionals at all levels, from beginners to LinkedIn Top Voices."
      },
      {
        q: "How does Linkyy ensure data privacy and security?",
        a: "Linkyy implements enterprise-grade security measures: (1) DOMPurify Sanitization — all user-generated content is sanitized to prevent XSS attacks; (2) Client-Side Rate Limiting — prevents API key abuse with 5-second minimum intervals between requests; (3) In-Session Caching — identical prompts are cached to avoid redundant API calls; (4) Local Storage Only — your post history is stored locally in your browser (localStorage/sessionStorage), never on external servers; (5) Environment Variable Protection — API keys are stored in .env files (not committed to Git) and Vercel environment variables (encrypted at rest); (6) Sentry Integration — structured logging with automatic sensitive data stripping (passwords, tokens removed before logging); (7) CORS Protection — monitoring API includes Helmet.js security headers and CORS configuration; (8) No Third-Party Tracking — we don't use Google Analytics or Facebook Pixel, only privacy-focused Vercel Analytics and Sentry for error tracking. Your content, data, and API keys remain secure and private."
      },
    ],
  },
  {
    category: "Best Practices",
    icon: TrendingUp,
    questions: [
      {
        q: "What are the best practices for writing viral LinkedIn posts in 2024?",
        a: "Based on analysis of top-performing LinkedIn content and algorithm research: (1) Hook Formula — first 8-12 words must create a pattern interrupt, authority signal, or relatability hook; (2) Fold Strategy — line 3 should contain a curiosity gap, value signal, outcome promise, or contrarian view; (3) Broetry Formatting — one short sentence per line, double line breaks between thoughts, bullet points for readability; (4) Engagement Loop — end with a specific question that invites comments (not generic 'thoughts?'); (5) Timing — post Tuesday-Thursday, 8-10 AM in your audience's timezone; (6) Hashtags — use 3-5 hashtags: 1-2 large (1M+ followers), 1-2 medium (100K-1M), 1 niche (<100K); (7) No External Links — post native content, add links in comments after 60 minutes; (8) Carousel Posts — document posts receive 3-5× more engagement than text-only; (9) Consistency — post 3-5 times per week for algorithmic authority; (10) Reply to Comments — respond to every comment within the first 2 hours to boost engagement velocity. Linkyy automates all of these optimization techniques."
      },
      {
        q: "How often should I post on LinkedIn for maximum growth?",
        a: "For optimal LinkedIn growth in 2024: (1) Frequency — post 3-5 times per week (daily posting can lead to audience fatigue); (2) Consistency — maintain a regular schedule (e.g., Tue/Wed/Thu) to train the algorithm; (3) Timing — publish during peak hours: Tuesday-Thursday, 8-10 AM or 12-2 PM in your audience's timezone; (4) Content Mix — alternate between text posts (40%), carousels (40%), and video (20%); (5) Engagement Window — spend 30-60 minutes after posting replying to comments to boost engagement velocity; (6) Rest Periods — avoid posting within 18 hours of your previous post (algorithm needs time to distribute); (7) Quality Over Quantity — one highly optimized post per day outperforms 5 mediocre posts per week. Linkyy's optimization ensures every post is engineered for maximum reach, so even 2-3 posts per week can drive significant growth when optimized for dwell time and engagement velocity."
      },
      {
        q: "What industries and audiences does Linkyy work best for?",
        a: "Linkyy is designed for knowledge workers, creators, and professionals across all industries. It's especially effective for: (1) B2B SaaS Founders — establishing thought leadership and driving inbound leads; (2) Growth Marketers — scaling content production and optimizing engagement; (3) LinkedIn Coaches — creating educational content and building authority; (4) Tech Recruiters — attracting candidates and showcasing company culture; (5) Consultants — demonstrating expertise and generating client inquiries; (6) Product Managers — sharing insights and building professional networks; (7) Sales Professionals — creating value-driven content that attracts prospects; (8) Indie Hackers — documenting building in public and growing audience. The AI adapts to your industry (Tech, Finance, Healthcare, Education, Real Estate, E-commerce, SaaS, Marketing, etc.), target audience (executives, managers, individual contributors), and tone (professional, conversational, authoritative, inspirational). Whether you're in India, USA, Canada, UK, or anywhere globally, Linkyy's optimization techniques work across all LinkedIn markets."
      },
    ],
  },
  {
    category: "Technical Details",
    icon: Shield,
    questions: [
      {
        q: "What technology stack powers Linkyy's AI optimization engine?",
        a: "Linkyy is built with modern, production-grade technologies: (1) Frontend — React 18 with TypeScript for type-safe component architecture; (2) Build Tool — Vite for fast HMR (Hot Module Replacement) and optimized production builds; (3) Styling — Tailwind CSS with shadcn/ui component library for consistent, accessible design; (4) Animations — Framer Motion (motion/react) for smooth parallax effects and transitions; (5) AI Backend — SambaNova AI API (Meta-Llama-3.3-70B-Instruct model) for natural language processing; (6) Security — DOMPurify for XSS sanitization, Helmet.js for HTTP security headers; (7) Monitoring — Custom monitoring API with Express.js, SQLite, WebSocket for real-time metrics; (8) Analytics — Sentry for error tracking and structured logging, Vercel Analytics for page views and Web Vitals; (9) Deployment — Vercel for serverless hosting with automatic CI/CD; (10) State Management — React hooks (useState, useEffect, useMemo, useCallback) with localStorage persistence. The entire stack is open-source compatible and follows modern React best practices including proper TypeScript types, error boundaries, and performance optimization."
      },
      {
        q: "How does Linkyy handle API rate limiting and caching?",
        a: "Linkyy implements multiple layers of optimization to minimize API calls and prevent rate limiting: (1) Client-Side Rate Limiter — enforces minimum 5-second intervals between API calls to protect your SambaNova API key; (2) In-Session Response Cache — identical prompts are cached in memory using a Map keyed by prompt hash, preventing redundant API calls within the same session; (3) Model Discovery Cache — available models are fetched once and cached for 5 minutes (TTL: 300 seconds) to avoid repeated calls to the models endpoint; (4) Structured Logging — all API calls are logged with response times, error rates, and cache hit rates via Sentry metrics; (5) Error Handling — graceful degradation with user-friendly error messages if API calls fail; (6) Retry Logic — automatic retries with exponential backoff for transient failures. These optimizations ensure that even with heavy usage, you won't hit rate limits, and identical content optimizations return instantly from cache rather than consuming API quota."
      },
      {
        q: "Can I self-host Linkyy or deploy it on my own infrastructure?",
        a: "Yes! Linkyy is designed to be fully self-hostable. The frontend is a standard React + Vite application that can be deployed anywhere: (1) Vercel — recommended for zero-config deployment with automatic HTTPS and global CDN; (2) Netlify — drag-and-drop deployment or Git-based CI/CD; (3) Cloudflare Pages — free tier with unlimited requests and fast global edge network; (4) AWS S3 + CloudFront — static hosting with custom domain and SSL; (5) Docker — containerize with nginx for self-hosted deployment; (6) GitHub Pages — free hosting for open-source projects. The monitoring API can be deployed separately on: (1) AWS EC2 — full server control with CloudWatch integration; (2) Railway.app — easy deployment with free tier; (3) Render.com — free tier with automatic HTTPS; (4) DigitalOcean Droplet — $6/month VPS. All you need is a SambaNova AI API key (free tier available) and your preferred hosting platform. The codebase is production-ready with proper TypeScript types, error handling, security sanitization, and comprehensive documentation."
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Schema.org FAQPage JSON-LD Generator
// ─────────────────────────────────────────────────────────────────────────────
function generateFAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.flatMap((category) =>
      category.questions.map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a,
          "url": "https://linkyy.online#faq",
          "inLanguage": "en-US",
          "datePublished": "2026-01-01",
          "dateModified": "2026-04-13"
        },
      }))
    ),
  };

  return JSON.stringify(schema);
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual FAQ Accordion Item
// ─────────────────────────────────────────────────────────────────────────────
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#0A66C2]/40">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left group"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-white pr-4 group-hover:text-[#70B5F9] transition-colors duration-200">
          {question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[#0A66C2] transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6">
              <p className="text-gray-400 leading-relaxed text-sm">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Category Section
// ─────────────────────────────────────────────────────────────────────────────
function FAQCategory({
  category,
  icon: Icon,
  questions,
}: {
  category: string;
  icon: any;
  questions: Array<{ q: string; a: string }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#70B5F9]" />
        </div>
        <h3 className="text-xl font-bold text-white">{category}</h3>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((faq, idx) => (
          <FAQItem
            question={faq.q}
            answer={faq.a}
            isOpen={openIndex === idx}
            onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main FAQ Section Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <section className="py-32 px-4 bg-black text-white border-t border-white/10">
      {/* Inject Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateFAQSchema() }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="border-[#0A66C2]/50 text-[#70B5F9] bg-[#0A66C2]/8 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 mr-2 inline text-[#70B5F9]" />
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about Linkyy, LinkedIn optimization, and AI-powered content engineering.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === null
                ? "bg-[#0A66C2] text-white shadow-[0_0_20px_-4px_#0A66C2]"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            All
          </button>
          {FAQ_DATA.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeCategory === cat.category
                  ? "bg-[#0A66C2] text-white shadow-[0_0_20px_-4px_#0A66C2]"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.category}
            </button>
          ))}
        </motion.div>

        {/* FAQ Content */}
        <div className="space-y-12">
          {(activeCategory === null ? FAQ_DATA : FAQ_DATA.filter((cat) => cat.category === activeCategory)).map(
            (category, idx) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <FAQCategory
                  category={category.category}
                  icon={category.icon}
                  questions={category.questions}
                />
              </motion.div>
            )
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center bg-gradient-to-br from-[#0A66C2]/10 to-purple-900/10 border border-white/10 rounded-3xl p-12"
        >
          <h3 className="text-3xl font-bold mb-4">Still have questions?</h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Can't find what you're looking for? Reach out to our team or start using Linkyy for free.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.linkedin.com/company/9curiousminds"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full px-8 py-3 font-semibold transition-all hover:scale-105 shadow-[0_0_20px_-4px_#0A66C2]"
            >
              Contact Us on LinkedIn
            </a>
            <button className="bg-white/5 hover:bg-white/10 text-white rounded-full px-8 py-3 font-semibold transition-all border border-white/20">
              Read Documentation
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Simple Badge component (if not imported from shadcn)
function Badge({
  variant,
  className,
  children,
}: {
  variant?: string;
  className?: string;
  children: any;
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>{children}</span>
  );
}
