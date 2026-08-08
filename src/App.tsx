import { useState, useCallback, useMemo, useRef, startTransition } from "react";
import DOMPurify from "dompurify";
import * as Sentry from "@sentry/react";
import { Loader2, Sparkles, Send, Clock, Link as LinkIcon, BarChart3, Image as ImageIcon, Copy, CheckCircle2, LayoutTemplate, Download, Trash2, Rocket, TrendingUp, Lightbulb, Target, Zap, Brain, Briefcase, Coffee, Star, Heart, Flame, Globe, Users, Shield, Award, Crown, Diamond, Magnet, Megaphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { optimizeLinkedInPost, OptimizationResult, generateCarouselSlides, CarouselSlide, SlideElement, subscribeToModel, getActiveModel } from "@/src/services/sambanovaService";
import pptxgen from "pptxgenjs";
import { motion, AnimatePresence } from "motion/react";

// Landing page components
import Navbar from "./components/landing/Navbar";
import HeroSection from "./components/landing/HeroSection";
import FeaturesSection from "./components/landing/FeaturesSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import TestimonialsSection from "./components/landing/TestimonialsSection";
import FAQSection from "./components/FAQSection";
import FounderSection from "./components/landing/FounderSection";
import FinalCTASection from "./components/landing/FinalCTASection";

import React from "react";

const IconMap: Record<string, any> = {
  Rocket, TrendingUp, Lightbulb, Target, Zap, Brain, Briefcase, Coffee, Star, Heart, Flame, CheckCircle2, Globe, Users, Shield, Award, Crown, Diamond, Magnet, Megaphone
};

const EmojiMap: Record<string, string> = {
  Rocket: '🚀', TrendingUp: '📈', Lightbulb: '💡', Target: '🎯', Zap: '⚡', Brain: '🧠', Briefcase: '💼', Coffee: '☕', Star: '⭐', Heart: '❤️', Flame: '🔥', CheckCircle2: '✅', Globe: '🌍', Users: '👥', Shield: '🛡️', Award: '🏆', Crown: '👑', Diamond: '💎', Magnet: '🧲', Megaphone: '📢'
};

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = DOMPurify.sanitize(value);
    }
  }, [value]);

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-2 items-center">
        <Select onValueChange={(val: string) => exec('fontName', val)}>
          <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs bg-white"><SelectValue placeholder="Font" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
          <input type="color" onChange={(e) => exec('foreColor', e.target.value)} className="w-7 h-7 p-0 border-0 rounded cursor-pointer bg-transparent" title="Text Color" />
        </div>
        <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 font-bold" onClick={() => exec('bold')} title="Bold">B</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 italic font-serif" onClick={() => exec('italic')} title="Italic">I</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 underline" onClick={() => exec('underline')} title="Underline">U</Button>
        </div>
        <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
          <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => {
            const url = prompt('Enter link URL:');
            if (url) exec('createLink', url);
          }} title="Add Link"><LinkIcon className="w-3 h-3 sm:mr-1"/><span className="hidden sm:inline ml-1">Link</span></Button>
        </div>
      </div>
      <ScrollArea className="flex-1 bg-white h-[350px] sm:h-[400px] md:h-[450px]">
        <div
          ref={editorRef}
          className="p-4 sm:p-6 focus:outline-none min-h-[300px] sm:min-h-[400px] text-[14px] sm:text-[15px] leading-relaxed text-slate-800"
          contentEditable
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        />
      </ScrollArea>
    </div>
  );
};

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#0A66C2]/30 selection:text-white font-sans overflow-x-hidden">
      <Navbar onStart={onStart} />
      <HeroSection onStart={onStart} />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <FounderSection />
      <FinalCTASection onStart={onStart} />
    </div>
  );
}

export default function App() {
  const [isAppStarted, setIsAppStarted] = useState(false);
  const [content, setContent] = useState("");
  const [industry, setIndustry] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [rememberTone, setRememberTone] = useState(false);
  const [showAdvancedAudience, setShowAdvancedAudience] = useState(false);
  const [audienceDetails, setAudienceDetails] = useState({
    age: "", jobRole: "", gender: "", seniority: "", brand: "", businessType: ""
  });
  const [authorName, setAuthorName] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [editedPost, setEditedPost] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Active AI model (updates live as the service scans available models) ───
  const [activeModel, setActiveModel] = useState<string>(getActiveModel);
  React.useEffect(() => subscribeToModel(setActiveModel), []);

  // Primary: localStorage (survives restarts)
  // Backup:  sessionStorage (survives refreshes within same session)
  // Both are written on every save, recovery picks whichever is valid & newer.
  // ─────────────────────────────────────────────────────────────────────
  const HISTORY_KEY = "linkyy_history";
  const HISTORY_TS_KEY = "linkyy_history_ts";

  /** Validate that a parsed value is a non-empty array of history objects */
  const isValidHistory = (v: unknown): v is any[] =>
    Array.isArray(v) && v.every(i => i && typeof i === "object" && "id" in i && "type" in i);

  // ── Safe storage helpers (guards against SecurityError on the property itself) ──
  // `window.localStorage` can throw SecurityError before .getItem() is even called.
  // Always access localStorage/sessionStorage through these getters.
  const _getLS  = (): Storage | null => { try { return window.localStorage;   } catch { return null; } };
  const _getSS  = (): Storage | null => { try { return window.sessionStorage;  } catch { return null; } };

  const safeStorageGet = (getter: () => Storage | null, key: string): string | null => {
    try { return getter()?.getItem(key) ?? null; } catch { return null; }
  };
  const safeStorageSet = (getter: () => Storage | null, key: string, value: string): void => {
    try { getter()?.setItem(key, value); } catch { /* quota or SecurityError */ }
  };
  const safeStorageRemove = (getter: () => Storage | null, key: string): void => {
    try { getter()?.removeItem(key); } catch { /* SecurityError */ }
  };

  /** Write to both stores atomically (catches QuotaExceededError + SecurityError) */
  const persistHistory = (data: any[]) => {
    try {
      const serialised = JSON.stringify(data);
      const ts = Date.now().toString();
      safeStorageSet(_getLS,  HISTORY_KEY,    serialised);
      safeStorageSet(_getLS,  HISTORY_TS_KEY, ts);
      safeStorageSet(_getSS, HISTORY_KEY,    serialised);
      safeStorageSet(_getSS, HISTORY_TS_KEY, ts);
    } catch { /* serialisation or unexpected error */ }
  };

  /** Read with fallback: prefer the store whose timestamp is newer */
  const readHistory = (): any[] => {
    try {
      const tryParse = (raw: string | null) => { try { return raw ? JSON.parse(raw) : null; } catch { return null; } };
      const ls   = tryParse(safeStorageGet(_getLS,  HISTORY_KEY));
      const ss   = tryParse(safeStorageGet(_getSS, HISTORY_KEY));
      const lsTs = Number(safeStorageGet(_getLS,  HISTORY_TS_KEY) || 0);
      const ssTs = Number(safeStorageGet(_getSS, HISTORY_TS_KEY) || 0);

      // pick the store with the more recent timestamp that is also valid
      const candidates: [any[] | null, number][] = [[ls, lsTs], [ss, ssTs]];
      const [best] = candidates
        .filter(([v]) => isValidHistory(v))
        .sort(([, a], [, b]) => b - a);

      if (best) return best[0] as any[];
      if (Array.isArray(ls)) return ls;
      if (Array.isArray(ss)) return ss;
    } catch (e) {
      console.warn('[Linkyy] Storage unavailable, starting with empty history:', e);
    }
    return [];
  };

  // History & Velocity State
  const [appHistory, setAppHistory] = useState<any[]>(readHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [showVelocity, setShowVelocity] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  
  // Undo/Redo State for Carousel
  const [pastSlides, setPastSlides] = useState<CarouselSlide[][]>([]);
  const [futureSlides, setFutureSlides] = useState<CarouselSlide[][]>([]);

  // ── O(1) history cache: Map keyed by item id ────────────────────────────
  const historyCache = useRef<Map<string, any>>(new Map());
  /** Ref to the right-column results panel — used to scroll into view on mobile. */
  const resultRef = useRef<HTMLDivElement>(null);
  /** Only auto-scroll on non-desktop viewports (< 1024 px = Tailwind `lg`). */
  const scrollToResult = () => {
    if (window.innerWidth < 1024) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  };

  // Keep cache in sync and persist to both stores on every change
  React.useEffect(() => {
    appHistory.forEach(item => {
      if (!historyCache.current.has(item.id)) {
        historyCache.current.set(item.id, item);
      }
    });
    persistHistory(appHistory);
  }, [appHistory]);

  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null);

  // ── loadHistoryItem must live here (before the early return) to satisfy Rules of Hooks
  const loadHistoryItem = useCallback((item: any) => {
    setActiveHistoryId(item.id);
    setLoadingHistoryId(item.id);
    setShowHistory(false);
    const cached = historyCache.current.get(item.id) ?? item;
    const source = historyCache.current.has(item.id) ? 'cache' : 'state';
    Sentry.logger.debug('History item loaded', {
      item_id:   item.id,
      item_type: item.type,
      source,
    });
    Sentry.metrics.count('history.loaded', 1, { attributes: { item_type: item.type, source } });
    startTransition(() => {
      if (cached.type === 'post') {
        setResult(cached.data);
        setEditedPost(cached.data.engineered_post);
      } else if (cached.type === 'carousel') {
        setCarouselSlides(cached.data);
      }
      setLoadingHistoryId(null);
      // Clear active state after a delay
      setTimeout(() => setActiveHistoryId(null), 300);
    });
  }, []);

  const velocityScore = appHistory.length * 10 + Math.floor(Math.random() * 5);

  const saveHistoryState = (current: CarouselSlide[]) => {
    setPastSlides(prev => [...prev, JSON.parse(JSON.stringify(current))]);
    setFutureSlides([]);
  };

  const handleUndo = () => {
    if (pastSlides.length === 0) return;
    const previous = pastSlides[pastSlides.length - 1];
    setFutureSlides(prev => [JSON.parse(JSON.stringify(carouselSlides)), ...prev]);
    setPastSlides(prev => prev.slice(0, -1));
    setCarouselSlides(previous);
  };

  const handleRedo = () => {
    if (futureSlides.length === 0) return;
    const next = futureSlides[0];
    setPastSlides(prev => [...prev, JSON.parse(JSON.stringify(carouselSlides))]);
    setFutureSlides(prev => prev.slice(1));
    setCarouselSlides(next);
  };

  const [timeZone, setTimeZone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return "UTC";
    }
  });
  const [rememberTimeZone, setRememberTimeZone] = useState(false);
  const [customBgColor, setCustomBgColor] = useState("");
  const [customTextColor, setCustomTextColor] = useState("");

  React.useEffect(() => {
    const savedTone     = safeStorageGet(_getLS, "linkyy_tone");
    const savedRemember = safeStorageGet(_getLS, "linkyy_remember_tone") === "true";
    if (savedRemember && savedTone) {
      setTone(savedTone);
      setRememberTone(true);
    }

    const savedTZ         = safeStorageGet(_getLS, "linkyy_timezone");
    const savedRememberTZ = safeStorageGet(_getLS, "linkyy_remember_timezone") === "true";
    if (savedRememberTZ && savedTZ) {
      setTimeZone(savedTZ);
      setRememberTimeZone(true);
    }
  }, []);

  React.useEffect(() => {
    if (rememberTone) {
      safeStorageSet(_getLS, "linkyy_tone",          tone);
      safeStorageSet(_getLS, "linkyy_remember_tone", "true");
    } else {
      safeStorageRemove(_getLS, "linkyy_tone");
      safeStorageSet(_getLS,    "linkyy_remember_tone", "false");
    }
  }, [tone, rememberTone]);

  React.useEffect(() => {
    if (rememberTimeZone) {
      safeStorageSet(_getLS, "linkyy_timezone",           timeZone);
      safeStorageSet(_getLS, "linkyy_remember_timezone",  "true");
    } else {
      safeStorageRemove(_getLS, "linkyy_timezone");
      safeStorageSet(_getLS,    "linkyy_remember_timezone", "false");
    }
  }, [timeZone, rememberTimeZone]);

  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
  const [carouselTheme, setCarouselTheme] = useState("minimal");
  const [carouselError, setCarouselError] = useState("");
  const [selectedElement, setSelectedElement] = useState<{ slideIdx: number, elId: string } | null>(null);
  const [slideCount, setSlideCount] = useState(5);
  const [titleFont, setTitleFont] = useState("Inter");
  const [bodyFont, setBodyFont] = useState("Inter");
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInModalStep, setLinkedInModalStep] = useState<'choose' | 'generating'>('choose');
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [showCarouselPreview, setShowCarouselPreview] = useState(false);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [includeCarouselInPreview, setIncludeCarouselInPreview] = useState(true);

  const FONTS = [
    "Arial", "Helvetica", "Times New Roman", "Courier New", "Verdana", 
    "Georgia", "Palatino", "Garamond", "Bookman", "Tahoma", 
    "Trebuchet MS", "Arial Black", "Impact", "Comic Sans MS", "Century Gothic", 
    "Lucida Sans", "Arial Narrow", "Optima", "Calibri", "Cambria", 
    "Candara", "Franklin Gothic Medium", "Futura", "Geneva", "Segoe UI", "Inter"
  ];

  const themeClasses: Record<string, string> = {
    minimal: "bg-white text-slate-900 border-slate-200",
    dark: "bg-slate-900 text-white border-slate-700",
    blue: "bg-blue-600 text-white border-blue-400",
    neon: "bg-black text-green-400 border-green-500 font-mono",
    sunset: "bg-gradient-to-br from-orange-400 to-pink-500 text-white border-orange-300",
    forest: "bg-green-900 text-green-50 border-green-700",
    ocean: "bg-cyan-900 text-cyan-50 border-cyan-700",
    cyberpunk: "bg-purple-900 text-yellow-300 border-pink-500 font-mono",
    monochrome: "bg-gray-200 text-gray-900 border-gray-400",
    pastel: "bg-pink-100 text-pink-900 border-pink-200",
    retro: "bg-[#F4E1C1] text-[#D95D39] border-[#D95D39]",
    lavender: "bg-purple-100 text-purple-900 border-purple-300",
    midnight: "bg-[#0B1021] text-blue-100 border-blue-900",
    coral: "bg-rose-500 text-white border-rose-400",
    mint: "bg-emerald-100 text-emerald-900 border-emerald-300",
    coffee: "bg-[#3C2F2F] text-[#FFF4E6] border-[#8B5A2B]",
    berry: "bg-rose-900 text-rose-100 border-rose-700",
    sunshine: "bg-yellow-400 text-black border-yellow-500",
    slate: "bg-slate-800 text-slate-100 border-slate-600",
    // 15 New Themes
    hacker: "bg-black text-green-500 border-green-800 font-mono",
    valentine: "bg-red-50 text-red-900 border-red-200",
    aqua: "bg-cyan-100 text-cyan-900 border-cyan-300",
    mustard: "bg-yellow-500 text-yellow-950 border-yellow-600",
    plum: "bg-fuchsia-900 text-fuchsia-100 border-fuchsia-700",
    nord: "bg-[#2E3440] text-[#ECEFF4] border-[#4C566A]",
    dracula: "bg-[#282A36] text-[#F8F8F2] border-[#6272A4]",
    solarizedLight: "bg-[#FDF6E3] text-[#657B83] border-[#EEE8D5]",
    solarizedDark: "bg-[#002B36] text-[#839496] border-[#073642]",
    gruvbox: "bg-[#282828] text-[#EBDBB2] border-[#3C3836]",
    synthwave: "bg-[#2B213A] text-[#F97E72] border-[#241B2F]",
    outrun: "bg-[#14081C] text-[#FF00FF] border-[#00FFFF]",
    corporate: "bg-slate-100 text-slate-800 border-blue-600 border-4",
    elegant: "bg-[#FAF9F6] text-[#2C3E50] border-[#D4AF37]",
    neonBlue: "bg-black text-blue-400 border-blue-500",
    // 20 More Themes
    aurora: "bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-700 text-white border-teal-400",
    cherry: "bg-[#1a0a0a] text-[#FF6B6B] border-[#CC2936]",
    space: "bg-[#05050f] text-[#A8DADC] border-[#2D3A5C]",
    golden: "bg-[#1C1505] text-[#FFD700] border-[#B8860B]",
    toxic: "bg-[#0a1a00] text-[#ADFF2F] border-[#7CFC00]",
    brutalist: "bg-white text-black border-black border-8 font-mono",
    newspaper: "bg-[#F5F0E8] text-[#2C1810] border-[#8B7355] font-serif",
    neonPink: "bg-black text-[#FF00FF] border-[#FF00FF]",
    sage: "bg-[#B2C9B2] text-[#2D4A2D] border-[#6B8F6B]",
    terracotta: "bg-[#E2725B] text-white border-[#C4523B]",
    arctic: "bg-[#E8F4FD] text-[#1A3A5C] border-[#90CAF9]",
    wine: "bg-[#4A0E1A] text-[#F4C2C2] border-[#8B1A2D]",
    bubblegum: "bg-[#FFB3DE] text-[#5C0040] border-[#FF69B4]",
    deepSea: "bg-[#001B33] text-[#40E0D0] border-[#006994]",
    autumn: "bg-[#8B1A1A] text-[#FFD18C] border-[#D2691E]",
    ink: "bg-[#FAFAFA] text-[#0A0A0A] border-[#0A0A0A] border-2 font-serif",
    matrix: "bg-[#000500] text-[#00FF41] border-[#003B00] font-mono",
    holographic: "bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 text-white border-pink-400",
    lemon: "bg-[#FFFACD] text-[#4A3800] border-[#FFD700]",
  };

  const themeColors: Record<string, { bg: string, text: string }> = {
    minimal: { bg: "FFFFFF", text: "0F172A" },
    dark: { bg: "0F172A", text: "FFFFFF" },
    blue: { bg: "2563EB", text: "FFFFFF" },
    neon: { bg: "000000", text: "4ADE80" },
    sunset: { bg: "F97316", text: "FFFFFF" },
    forest: { bg: "14532D", text: "F0FDF4" },
    ocean: { bg: "164E63", text: "ECFEFF" },
    cyberpunk: { bg: "581C87", text: "FDE047" },
    monochrome: { bg: "E5E7EB", text: "111827" },
    pastel: { bg: "FCE7F3", text: "831843" },
    retro: { bg: "F4E1C1", text: "D95D39" },
    lavender: { bg: "F3E8FF", text: "581C87" },
    midnight: { bg: "0B1021", text: "DBEAFE" },
    coral: { bg: "F43F5E", text: "FFFFFF" },
    mint: { bg: "D1FAE5", text: "064E3B" },
    coffee: { bg: "3C2F2F", text: "FFF4E6" },
    berry: { bg: "881337", text: "FFE4E6" },
    sunshine: { bg: "FACC15", text: "000000" },
    slate: { bg: "1E293B", text: "F1F5F9" },
    // 15 New Themes
    hacker: { bg: "000000", text: "22C55E" },
    valentine: { bg: "FEF2F2", text: "7F1D1D" },
    aqua: { bg: "CFFAFE", text: "164E63" },
    mustard: { bg: "EAB308", text: "422006" },
    plum: { bg: "701A75", text: "FAE8FF" },
    nord: { bg: "2E3440", text: "ECEFF4" },
    dracula: { bg: "282A36", text: "F8F8F2" },
    solarizedLight: { bg: "FDF6E3", text: "657B83" },
    solarizedDark: { bg: "002B36", text: "839496" },
    gruvbox: { bg: "282828", text: "EBDBB2" },
    synthwave: { bg: "2B213A", text: "F97E72" },
    outrun: { bg: "14081C", text: "FF00FF" },
    corporate: { bg: "F1F5F9", text: "1E293B" },
    elegant: { bg: "FAF9F6", text: "2C3E50" },
    neonBlue: { bg: "000000", text: "60A5FA" },
    // 20 More Themes
    aurora: { bg: "0F2944", text: "FFFFFF" },
    cherry: { bg: "1a0a0a", text: "FF6B6B" },
    space: { bg: "05050f", text: "A8DADC" },
    golden: { bg: "1C1505", text: "FFD700" },
    toxic: { bg: "0a1a00", text: "ADFF2F" },
    brutalist: { bg: "FFFFFF", text: "000000" },
    newspaper: { bg: "F5F0E8", text: "2C1810" },
    neonPink: { bg: "000000", text: "FF00FF" },
    sage: { bg: "B2C9B2", text: "2D4A2D" },
    terracotta: { bg: "E2725B", text: "FFFFFF" },
    arctic: { bg: "E8F4FD", text: "1A3A5C" },
    wine: { bg: "4A0E1A", text: "F4C2C2" },
    bubblegum: { bg: "FFB3DE", text: "5C0040" },
    deepSea: { bg: "001B33", text: "40E0D0" },
    autumn: { bg: "8B1A1A", text: "FFD18C" },
    ink: { bg: "FAFAFA", text: "0A0A0A" },
    matrix: { bg: "000500", text: "00FF41" },
    holographic: { bg: "2D0A4E", text: "FFFFFF" },
    lemon: { bg: "FFFACD", text: "4A3800" },
  };

  if (!isAppStarted) {
    return <LandingPage onStart={() => setIsAppStarted(true)} />;
  }

  const handleOptimize = async () => {
    if (!content.trim()) {
      setError("Please enter some content to optimize.");
      return;
    }
    setError("");
    setIsOptimizing(true);
    Sentry.logger.info('Post optimization started', {
      industry: industry || 'General',
      tone:     tone     || 'default',
    });
    try {
      const res = await optimizeLinkedInPost(
        content, 
        industry, 
        showAdvancedAudience ? audienceDetails : audience,
        tone,
        timeZone
      );
      setResult(res);
      setEditedPost(res.engineered_post);
      setCarouselSlides([]);
      setCarouselError("");
      setSelectedElement(null);
      scrollToResult();
      Sentry.logger.info('Post optimization succeeded', {
        hook_score:     res.engagement_blueprint?.hook_score,
        fold_score:     res.engagement_blueprint?.fold_score,
        velocity_score: res.engagement_blueprint?.velocity_score,
        asset_type:     res.asset_recommendation?.type,
        schedule_time:  res.posting_schedule?.time,
        links_found:    res.link_mitigation?.extracted_links?.length ?? 0,
      });
      // ── Metrics: quality scores + usage ────────────────────────────────
      Sentry.metrics.count('post.optimized', 1, { attributes: { industry: industry || 'General', tone: tone || 'default' } });
      if (res.engagement_blueprint?.hook_score)     Sentry.metrics.distribution('post.hook_score',     res.engagement_blueprint.hook_score);
      if (res.engagement_blueprint?.fold_score)     Sentry.metrics.distribution('post.fold_score',     res.engagement_blueprint.fold_score);
      if (res.engagement_blueprint?.velocity_score) Sentry.metrics.distribution('post.velocity_score', res.engagement_blueprint.velocity_score);
      Sentry.metrics.gauge('post.links_found', res.link_mitigation?.extracted_links?.length ?? 0);
      
      // Save to history
      setAppHistory(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        type: 'post',
        content: content.substring(0, 50) + '...',
        data: res
      }, ...prev]);
    } catch (err: any) {
      Sentry.logger.error('Post optimization failed', {
        error_message: err.message,
        industry:      industry || 'General',
        tone:          tone     || 'default',
      });
      Sentry.metrics.count('post.optimization_error', 1, { attributes: { industry: industry || 'General' } });
      console.error("[Linkyy] Post optimization failed:", err);
      setError(err.message || "An error occurred during optimization.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateCarousel = async () => {
    if (!editedPost) return;
    setCarouselError("");
    setIsGeneratingCarousel(true);
    setSelectedElement(null);
    Sentry.logger.info('Carousel generation started', {
      slide_count: slideCount,
    });
    try {
      // Use the edited post content (stripped of HTML for the AI prompt)
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = DOMPurify.sanitize(editedPost);
      const plainTextPost = tempDiv.innerText;
      
      const slides = await generateCarouselSlides(plainTextPost, slideCount);
      const newSlides = slides.map(s => ({ ...s, elements: [] }));
      setCarouselSlides(newSlides);
      scrollToResult();
      Sentry.logger.info('Carousel generation succeeded', {
        slides_generated: newSlides.length,
        slide_count_requested: slideCount,
      });
      // ── Metrics: carousel usage ─────────────────────────────────────────
      Sentry.metrics.count('carousel.generated', 1, { attributes: { slide_count: String(slideCount) } });
      Sentry.metrics.distribution('carousel.slides_generated', newSlides.length);
      
      // Save to history
      setAppHistory(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        type: 'carousel',
        content: `Carousel (${slideCount} slides)`,
        data: newSlides
      }, ...prev]);
    } catch (err: any) {
      Sentry.logger.error('Carousel generation failed', {
        error_message: err.message,
        slide_count:   slideCount,
      });
      Sentry.metrics.count('carousel.error', 1, { attributes: { slide_count: String(slideCount) } });
      console.error("[Linkyy] Carousel generation failed:", err);
      setCarouselError(err.message || "Failed to generate carousel.");
    } finally {
      setIsGeneratingCarousel(false);
    }
  };

  const updateSlide = (index: number, field: keyof CarouselSlide, value: string) => {
    saveHistoryState(carouselSlides);
    const newSlides = [...carouselSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setCarouselSlides(newSlides);
  };

  const addElement = (slideIdx: number, type: 'image' | 'link' | 'icon', content?: string, x: number = 50, y: number = 50) => {
    saveHistoryState(carouselSlides);
    const newElement: SlideElement = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      content: content || (type === 'image' ? 'https://picsum.photos/100' : type === 'icon' ? 'Star' : 'https://example.com'),
      x,
      y,
      shape: 'rectangle',
      width: 100,
      height: type === 'image' ? 100 : 30
    };
    const newSlides = [...carouselSlides];
    if (!newSlides[slideIdx].elements) newSlides[slideIdx].elements = [];
    newSlides[slideIdx].elements.push(newElement);
    setCarouselSlides(newSlides);
    setSelectedElement({ slideIdx, elId: newElement.id });
  };

  const handleDrop = (e: React.DragEvent, slideIdx: number) => {
    e.preventDefault();
    const iconName = e.dataTransfer.getData('iconName');
    if (iconName) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addElement(slideIdx, 'icon', iconName, x, y);
    }
  };

  const updateElementPosition = (slideIdx: number, elId: string, offset: { x: number, y: number }) => {
    saveHistoryState(carouselSlides);
    const newSlides = [...carouselSlides];
    const el = newSlides[slideIdx].elements?.find(e => e.id === elId);
    if (el) {
      el.x += offset.x;
      el.y += offset.y;
      setCarouselSlides(newSlides);
    }
  };

  const updateElementContent = (slideIdx: number, elId: string, content: string, shape?: string) => {
    saveHistoryState(carouselSlides);
    const newSlides = [...carouselSlides];
    const el = newSlides[slideIdx].elements?.find(e => e.id === elId);
    if (el) {
      el.content = content;
      if (shape) el.shape = shape as any;
      setCarouselSlides(newSlides);
    }
  };

  const deleteElement = (slideIdx: number, elId: string) => {
    saveHistoryState(carouselSlides);
    const newSlides = [...carouselSlides];
    if (newSlides[slideIdx].elements) {
      newSlides[slideIdx].elements = newSlides[slideIdx].elements.filter(e => e.id !== elId);
      setCarouselSlides(newSlides);
      setSelectedElement(null);
    }
  };

  const exportToPPTX = () => {
    const pres = new pptxgen();
    pres.author = "Linkyy Viral Engine";
    pres.company = "Linkyy";
    pres.title = "LinkedIn Carousel";

    // ─ 4:5 portrait layout to exactly match the on-screen preview ─
    pres.defineLayout({ name: 'PORTRAIT45', width: 6, height: 7.5 });
    pres.layout = 'PORTRAIT45';

    // Resolve colours: custom overrides → theme map → minimal fallback
    const currentTheme = themeColors[carouselTheme] || themeColors.minimal;
    const bgHex  = customBgColor  ? customBgColor.replace('#', '')  : currentTheme.bg;
    const txtHex = customTextColor ? customTextColor.replace('#', '') : currentTheme.text;

    // Accent colours (border colour used in the preview)
    const accentMap: Record<string, string> = {
      minimal:'CBD5E1', dark:'475569', blue:'93C5FD', neon:'4ADE80',
      sunset:'FED7AA', forest:'4ADE80', ocean:'22D3EE', cyberpunk:'F0ABFC',
      monochrome:'9CA3AF', pastel:'F9A8D4', retro:'D95D39', lavender:'C4B5FD',
      midnight:'1E40AF', coral:'FDA4AF', mint:'6EE7B7', coffee:'8B5A2B',
      berry:'FDA4AF', sunshine:'F59E0B', slate:'94A3B8', hacker:'166534',
      valentine:'FCA5A5', aqua:'67E8F9', mustard:'CA8A04', plum:'D946EF',
      nord:'4C566A', dracula:'6272A4', solarizedLight:'EEE8D5', solarizedDark:'073642',
      gruvbox:'3C3836', synthwave:'241B2F', outrun:'00FFFF', corporate:'2563EB',
      elegant:'D4AF37', neonBlue:'3B82F6', aurora:'2DD4BF', cherry:'CC2936',
      space:'2D3A5C', golden:'B8860B', toxic:'7CFC00', brutalist:'000000',
      newspaper:'8B7355', neonPink:'FF00FF', sage:'6B8F6B', terracotta:'C4523B',
      arctic:'90CAF9', wine:'8B1A2D', bubblegum:'FF69B4', deepSea:'006994',
      autumn:'D2691E', ink:'0A0A0A', matrix:'003B00', holographic:'F0ABFC',
      lemon:'FFD700',
    };
    const accHex = customTextColor
      ? customTextColor.replace('#', '') + '40'
      : (accentMap[carouselTheme] || txtHex);

    // Slide dimensions (inches)
    const W = 6, H = 7.5;
    const PAD = 0.45;         // left/right padding
    const CONTENT_W = W - PAD * 2;

    carouselSlides.forEach((slide, idx) => {
      const pptSlide = pres.addSlide();
      pptSlide.background = { color: bgHex };

      // ─ Top row: "SLIDE X" label left, counter right ─
      pptSlide.addText(`SLIDE ${slide.slide_number}`, {
        x: PAD, y: 0.35, w: CONTENT_W * 0.6, h: 0.28,
        fontSize: 8, color: txtHex, bold: true,
        charSpacing: 3, transparency: 50,
      });
      pptSlide.addText(`${idx + 1}/${carouselSlides.length}`, {
        x: PAD + CONTENT_W * 0.6, y: 0.35, w: CONTENT_W * 0.4, h: 0.28,
        fontSize: 8, color: txtHex, align: 'right', transparency: 50,
      });

      // ─ Headline ─
      pptSlide.addText(slide.headline, {
        x: PAD, y: 0.85, w: CONTENT_W, h: 2.4,
        fontSize: 28, color: txtHex, bold: true, valign: 'top',
        fontFace: titleFont, wrap: true,
      });

      // ─ Body text ─
      pptSlide.addText(slide.body_text, {
        x: PAD, y: 3.35, w: CONTENT_W, h: 2.8,
        fontSize: 16, color: txtHex, valign: 'top',
        fontFace: bodyFont, wrap: true, transparency: 15,
      });

      // ─ Bottom divider line ─
      pptSlide.addShape('rect', {
        x: PAD, y: H - 0.85, w: CONTENT_W, h: 0.02,
        fill: { color: accHex }, line: { color: accHex, width: 0 },
      } as any);

      // ─ Author name bottom-left ─
      if (authorName) {
        pptSlide.addText(authorName.toUpperCase(), {
          x: PAD, y: H - 0.75, w: CONTENT_W * 0.65, h: 0.3,
          fontSize: 9, color: txtHex, bold: true, valign: 'middle',
        });
      }

      // ─ Dot indicators bottom-right ─
      const dotSpacing = 0.13;
      const dotsW = carouselSlides.length * dotSpacing;
      const dotsStartX = W - PAD - dotsW;
      carouselSlides.forEach((_, di) => {
        const isActive = di === idx;
        pptSlide.addShape('ellipse', {
          x: dotsStartX + di * dotSpacing,
          y: H - 0.60,
          w: isActive ? 0.22 : 0.08,
          h: 0.08,
          fill: { color: txtHex },
          line: { color: txtHex, width: 0 },
          transparency: isActive ? 0 : 60,
        } as any);
      });

      // ─ Drag-and-drop elements (images, icons, links) ─
      slide.elements?.forEach(el => {
        const xIn = (el.x / 288) * W;
        const yIn = (el.y / 400) * H;
        if (el.type === 'image') {
          pptSlide.addImage({
            path: el.content, x: xIn, y: yIn, w: W * 0.25, h: H * 0.25,
            rounding: el.shape === 'circle',
          });
        } else if (el.type === 'link') {
          pptSlide.addText(el.content, {
            x: xIn, y: yIn, hyperlink: { url: el.content },
            color: '2563EB', underline: { style: 'sng' }, fontSize: 11,
          });
        } else if (el.type === 'icon') {
          pptSlide.addText(EmojiMap[el.content] || '⭐', {
            x: xIn, y: yIn, fontSize: 20,
          });
        }
      });
    });

    pres.writeFile({ fileName: "Linkyy_Carousel.pptx" });
  };

  const copyToClipboard = () => {
    if (editedPost) {
      const sanitizedHTML = DOMPurify.sanitize(editedPost);
      
      // Convert HTML to Unicode formatted text for LinkedIn compatibility
      const convertHTMLToUnicode = (html: string): string => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Process all elements
        const processNode = (node: Node): string => {
          if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || '';
          }
          
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tagName = element.tagName.toLowerCase();
            const innerContent = Array.from(node.childNodes).map(processNode).join('');
            
            // Convert bold to Unicode bold characters
            if (tagName === 'strong' || tagName === 'b') {
              return toUnicodeBold(innerContent);
            }
            // Convert italic to Unicode italic characters
            if (tagName === 'em' || tagName === 'i') {
              return toUnicodeItalic(innerContent);
            }
            // Convert underline to Unicode style (no direct equivalent, keep as is)
            if (tagName === 'u') {
              return innerContent;
            }
            // Handle line breaks
            if (tagName === 'br') {
              return '\n';
            }
            // Handle paragraphs
            if (tagName === 'p') {
              return innerContent + '\n';
            }
            // Handle lists
            if (tagName === 'li') {
              return '• ' + innerContent + '\n';
            }
            // Handle other block elements
            if (['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol'].includes(tagName)) {
              return innerContent + '\n';
            }
            
            return innerContent;
          }
          
          return '';
        };
        
        const result = Array.from(tempDiv.childNodes).map(processNode).join('');
        // Clean up multiple line breaks
        return result.replace(/\n{3,}/g, '\n\n').trim();
      };
      
      // Convert text to Unicode bold
      const toUnicodeBold = (text: string): string => {
        const boldMap: { [key: string]: string } = {
          'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈',
          'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑',
          'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
          'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢',
          'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫',
          's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
          '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
        };
        
        return text.split('').map(char => boldMap[char] || char).join('');
      };
      
      // Convert text to Unicode italic
      const toUnicodeItalic = (text: string): string => {
        const italicMap: { [key: string]: string } = {
          'A': '𝐴', 'B': '𝐵', 'C': '𝐶', 'D': '𝐷', 'E': '𝐸', 'F': '𝐹', 'G': '𝐺', 'H': '𝐻', 'I': '𝐼',
          'J': '𝐽', 'K': '𝐾', 'L': '𝐿', 'M': '𝑀', 'N': '𝑁', 'O': '𝑂', 'P': '𝑃', 'Q': '𝑄', 'R': '𝑅',
          'S': '𝑆', 'T': '𝑇', 'U': '𝑈', 'V': '𝑉', 'W': '𝑊', 'X': '𝑋', 'Y': '𝑌', 'Z': '𝑍',
          'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑', 'e': '𝑒', 'f': '𝑓', 'g': '𝑔', 'h': 'ℎ', 'i': '𝑖',
          'j': '𝑗', 'k': '𝑘', 'l': '𝑙', 'm': '𝑚', 'n': '𝑛', 'o': '𝑜', 'p': '𝑝', 'q': '𝑞', 'r': '𝑟',
          's': '𝑠', 't': '𝑡', 'u': '𝑢', 'v': '𝑣', 'w': '𝑤', 'x': '𝑥', 'y': '𝑦', 'z': '𝑧',
          '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
        };
        
        return text.split('').map(char => italicMap[char] || char).join('');
      };
      
      // Create formatted text with Unicode characters
      const unicodeText = convertHTMLToUnicode(sanitizedHTML);
      
      // Also keep plain text version (without formatting)
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = sanitizedHTML;
      const plainText = tempDiv.innerText;
      
      // Copy with Unicode formatting that LinkedIn will preserve
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        // For LinkedIn: plain text with Unicode bold/italic characters
        const textBlob = new Blob([unicodeText], { type: 'text/plain' });
        
        const clipboardItem = new ClipboardItem({
          'text/plain': textBlob,
        });
        
        navigator.clipboard.write([clipboardItem]).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch((err) => {
          console.warn('Clipboard write failed:', err);
          // Fallback
          navigator.clipboard.writeText(unicodeText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      } else {
        // Fallback for older browsers
        navigator.clipboard.writeText(unicodeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handlePostToLinkedIn = () => {
    setLinkedInModalStep('choose');
    setShowLinkedInModal(true);
  };

  const handlePostTextOnly = () => {
    copyToClipboard();
    setShowLinkedInModal(false);
    window.open("https://www.linkedin.com/feed/", "_blank");
  };

  const handlePostWithCarousel = async () => {
    if (carouselSlides.length === 0) {
      setLinkedInModalStep('generating');
      await handleGenerateCarousel();
      setLinkedInModalStep('choose');
      return;
    }
    exportToPPTX();
    copyToClipboard();
    setShowLinkedInModal(false);
    window.open("https://www.linkedin.com/feed/", "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* iPhone 17+ Notch Navbar */}
      <div className="fixed top-2 md:top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] px-4 py-2 md:px-6 md:py-3 w-[95%] md:w-auto min-w-[300px] transition-all duration-500 hover:shadow-blue-500/20">
        {/* Creative Logo */}
        <div
          className="group flex items-center gap-2 cursor-pointer"
          onClick={() => { setIsAppStarted(false); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50); }}
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 overflow-hidden transition-transform duration-500 group-hover:rotate-[360deg]">
            <div className="absolute inset-[2px] bg-black rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white transition-transform duration-500 group-hover:scale-125" />
            </div>
          </div>
          <span className="text-white font-extrabold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-500">
            Linkyy
          </span>
        </div>

        {/* ─ Active AI Model Indicator ──────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 mx-3">
          <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <div className="overflow-hidden h-[14px] flex items-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeModel}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="block text-[10px] font-mono text-emerald-400/90 tracking-wider whitespace-nowrap leading-none"
              >
                {activeModel}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4 ml-4 md:ml-8">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Velocity</span>
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">{velocityScore}</span>
          </div>
          <div className="w-px h-6 bg-white/20 hidden md:block"></div>
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="text-white hover:bg-white/20 rounded-full px-3 py-2 min-h-[40px]">
            <Clock className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">History</span>
          </Button>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Activity History & Rankings
              </h2>
              <Button variant="ghost" onClick={() => setShowHistory(false)} className="rounded-full w-8 h-8 p-0 hover:bg-slate-200">✕</Button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-8">
              {/* History List */}
              <div className="flex-1 space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Your Past Activities</h3>
                {appHistory.length === 0 ? (
                  <p className="text-slate-400 text-sm">No history yet. Start optimizing!</p>
                ) : (
                  appHistory.map((item, i) => {
                    const isActive = activeHistoryId === item.id;
                    const isLoading = loadingHistoryId === item.id;
                    
                    return (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isActive ? 1.02 : 1,
                          zIndex: isActive ? 10 : 1
                        }}
                        transition={{ 
                          duration: 0.2,
                          layout: { duration: 0.3 }
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer bg-white group relative ${
                          isLoading
                            ? 'border-blue-400 bg-blue-50 shadow-lg'
                            : isActive
                            ? 'border-blue-500 bg-blue-50 shadow-xl ring-2 ring-blue-300'
                            : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                        }`} 
                        onClick={() => loadHistoryItem(item)}
                        style={{ zIndex: isActive ? 10 : 1 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className={item.type === 'post' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}>
                            {item.type === 'post' ? 'Post Optimization' : 'Carousel Generation'}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {isLoading && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                            )}
                            <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 group-hover:text-slate-900">{item.content}</p>
                      </motion.div>
                    );
                  })
                )}
              </div>
              {/* Velocity Leaderboard */}
              <div className="w-full md:w-72 bg-slate-50 rounded-2xl p-5 border border-slate-200 h-fit">
                <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" /> Velocity Rankings
                </h3>
                <p className="text-xs text-slate-500 mb-4">Authentic Users Leaderboard</p>
                <div className="space-y-3">
                  {[
                    { name: "Alex Hormozi", score: 9850 },
                    { name: "Justin Welsh", score: 8420 },
                    { name: "You", score: velocityScore, isUser: true },
                    { name: "Sahil Bloom", score: 710 },
                    { name: "Codie Sanchez", score: 450 },
                  ].sort((a, b) => b.score - a.score).map((user, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${user.isUser ? 'bg-blue-100 border border-blue-200' : 'bg-white border border-slate-100'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-4">{i + 1}.</span>
                        <span className={`text-sm ${user.isUser ? 'font-bold text-blue-700' : 'font-medium text-slate-700'}`}>{user.name}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{user.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Velocity Modal */}
      {showVelocity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" /> Velocity Score
              </h2>
              <Button variant="ghost" onClick={() => setShowVelocity(false)} className="rounded-full w-8 h-8 p-0 hover:bg-slate-200">✕</Button>
            </div>
            <div className="p-6">
              <div className="text-center mb-8">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {velocityScore}
                </div>
                <p className="text-slate-500 text-sm">Your average activity velocity</p>
              </div>
              
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Global Rankings
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Alex Hormozi", score: 9850 },
                  { name: "Justin Welsh", score: 8420 },
                  { name: "You", score: velocityScore, isUser: true },
                  { name: "Sahil Bloom", score: 710 },
                  { name: "Codie Sanchez", score: 450 },
                ].sort((a, b) => b.score - a.score).map((user, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${user.isUser ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'bg-white border border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <span className={`text-sm ${user.isUser ? 'font-bold text-blue-700' : 'font-medium text-slate-700'}`}>{user.name}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{user.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Post Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-[#0A66C2]/10 to-blue-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 fill-[#0A66C2]" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Post to LinkedIn
              </h2>
              <Button variant="ghost" onClick={() => setShowLinkedInModal(false)} className="rounded-full w-8 h-8 p-0 hover:bg-slate-200">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              {linkedInModalStep === 'generating' ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                  <p className="text-slate-600 font-medium">Generating your carousel...</p>
                  <p className="text-slate-400 text-sm">This takes a few seconds.</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 text-sm">Your post is copied to clipboard. Choose how you want to publish on LinkedIn:</p>
                  {/* Option 1: Text only */}
                  <button
                    onClick={handlePostTextOnly}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-start gap-4 text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center shrink-0">
                      <Send className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 mb-1">Text Post Only</div>
                      <div className="text-xs text-slate-500">Copy text to clipboard and open LinkedIn feed. Paste directly.</div>
                    </div>
                  </button>
                  {/* Option 2: With Carousel */}
                  <button
                    onClick={handlePostWithCarousel}
                    disabled={isGeneratingCarousel}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-start gap-4 text-left group disabled:opacity-60"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center shrink-0">
                      <LayoutTemplate className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                        Post with Carousel
                        {carouselSlides.length > 0 && (
                          <Badge variant="outline" className="text-[10px] text-green-700 bg-green-50 border-green-200 py-0">{carouselSlides.length} slides ready</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {carouselSlides.length > 0
                          ? "Download carousel as PPTX, upload as PDF to LinkedIn alongside your text."
                          : "Generate a carousel first, then download and attach to LinkedIn as a PDF."}
                      </div>
                    </div>
                    {carouselSlides.length === 0 && (
                      <div className="shrink-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">Auto-Generate</div>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center pt-2">💡 LinkedIn tip: Upload the PPTX as a PDF document post for full carousel experience.</p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
           POST PREVIEW MODAL — LinkedIn-style
      ═══════════════════════════════════════════ */}
      {showPostPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#1B1F23] rounded-2xl shadow-2xl w-full max-w-xl my-4 sm:my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {authorName ? authorName.charAt(0).toUpperCase() : 'Y'}
                </div>
                <span className="text-white font-semibold text-sm">LinkedIn Post Preview</span>
              </div>
              <div className="flex items-center gap-3">
                {carouselSlides.length > 0 && (
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                    <div
                      onClick={() => setIncludeCarouselInPreview(v => !v)}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                        includeCarouselInPreview ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        includeCarouselInPreview ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </div>
                    Include Carousel
                  </label>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowPostPreview(false)} className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0">✕</Button>
              </div>
            </div>

            {/* Simulated LinkedIn Post */}
            <div className="p-5">
              {/* Profile Row */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {authorName ? authorName.charAt(0).toUpperCase() : 'Y'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white text-sm">{authorName || 'Your Name'}</span>
                    <span className="text-gray-500 text-xs">&bull; 1st</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">Your Headline &bull; Your Company</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">Just now &bull;</p>
                </div>
                <button className="text-[#70B5F9] text-sm font-semibold hover:text-blue-300 transition-colors">+ Follow</button>
              </div>

              {/* Post Content */}
              <div
                className="text-[#E7E7E7] text-sm leading-relaxed mb-4 max-h-64 overflow-y-auto [&_p]:mb-2 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_li]:mb-1"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editedPost) }}
              />

              {/* Carousel Preview Strip */}
              {includeCarouselInPreview && carouselSlides.length > 0 && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                  {/* Carousel navigation header */}
                  <div className="flex items-center justify-between bg-white/5 px-3 py-2">
                    <span className="text-gray-400 text-xs">Carousel &bull; {carouselSlides.length} slides</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewSlideIndex(i => Math.max(0, i - 1))}
                        disabled={previewSlideIndex === 0}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-colors"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                      </button>
                      <span className="text-gray-400 text-xs">{previewSlideIndex + 1} / {carouselSlides.length}</span>
                      <button
                        onClick={() => setPreviewSlideIndex(i => Math.min(carouselSlides.length - 1, i + 1))}
                        disabled={previewSlideIndex === carouselSlides.length - 1}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-colors"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                  {/* Active slide display */}
                  <motion.div
                    key={previewSlideIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`w-full aspect-[4/3] p-6 flex flex-col justify-between ${(!customBgColor && !customTextColor) ? themeClasses[carouselTheme] : ''}`}
                    style={{ backgroundColor: customBgColor || undefined, color: customTextColor || undefined }}
                  >
                    <div>
                      <div className="text-[10px] opacity-40 font-bold tracking-widest uppercase mb-3">Slide {carouselSlides[previewSlideIndex].slide_number}</div>
                      <h3 className="text-2xl font-bold leading-tight mb-3" style={{ fontFamily: titleFont }}>
                        {carouselSlides[previewSlideIndex].headline}
                      </h3>
                      <p className="text-sm opacity-90 leading-relaxed" style={{ fontFamily: bodyFont }}>
                        {carouselSlides[previewSlideIndex].body_text}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-current/10 pt-3 mt-3">
                      <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">{authorName || 'Your Name'}</span>
                      <div className="flex gap-1">
                        {carouselSlides.map((_, i) => (
                          <button key={i} onClick={() => setPreviewSlideIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${ i === previewSlideIndex ? 'bg-current scale-125' : 'bg-current opacity-30'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Reactions row */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border border-[#1B1F23] flex items-center justify-center text-[8px]">👍</div>
                    <div className="w-4 h-4 rounded-full bg-red-500 border border-[#1B1F23] flex items-center justify-center text-[8px]">❤️</div>
                  </div>
                  <span className="text-gray-500 text-xs ml-1">Be the first to react</span>
                </div>
                <div className="flex gap-4 text-gray-500 text-xs">
                  <span>0 comments</span>
                  <span>0 reposts</span>
                </div>
              </div>
              {/* Action buttons */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
                {[['👍', 'Like'], ['💬', 'Comment'], ['🔁', 'Repost'], ['✈️', 'Send']].map(([icon, label]) => (
                  <button key={label} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-medium py-1.5 px-3 rounded-md hover:bg-white/5">
                    <span>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
           CAROUSEL FULL-SCREEN PREVIEW MODAL
      ═══════════════════════════════════════════ */}
      {showCarouselPreview && carouselSlides.length > 0 && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4">
          {/* Close */}
          <button
            onClick={() => setShowCarouselPreview(false)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-colors"
          >
            ✕
          </button>

          {/* Slide counter top */}
          <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-1.5 flex items-center gap-3">
              <span className="text-white text-xs sm:text-sm font-semibold">{previewSlideIndex + 1}</span>
              <span className="text-gray-500 text-xs sm:text-sm">/</span>
              <span className="text-gray-400 text-xs sm:text-sm">{carouselSlides.length}</span>
            </div>
          </div>

          {/* Prev arrow */}
          <button
            onClick={() => setPreviewSlideIndex(i => Math.max(0, i - 1))}
            disabled={previewSlideIndex === 0}
            className="absolute left-2 sm:left-4 md:left-8 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white disabled:opacity-20 transition-all"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>

          {/* Slide — fills viewport between controls and thumbnail strip */}
          <div className="absolute inset-x-12 sm:inset-x-14 md:inset-x-20 top-12 sm:top-14 bottom-24 sm:bottom-28 flex items-center justify-center">
            <motion.div
              key={previewSlideIndex}
              initial={{ opacity: 0, scale: 0.94, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.94, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`relative h-full aspect-[4/5] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col p-4 sm:p-6 md:p-8 border-2 ${(!customBgColor && !customTextColor) ? themeClasses[carouselTheme] : ''}`}
              style={{ backgroundColor: customBgColor || undefined, color: customTextColor || undefined, borderColor: customTextColor ? `${customTextColor}40` : undefined }}
            >
              {/* Slide content */}
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase opacity-40">Slide {carouselSlides[previewSlideIndex].slide_number}</span>
                <span className="text-[10px] sm:text-xs opacity-40">{previewSlideIndex + 1}/{carouselSlides.length}</span>
              </div>
              <div className="flex-1 flex flex-col gap-3 sm:gap-5">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: titleFont }}>
                  {carouselSlides[previewSlideIndex].headline}
                </h2>
                <p className="text-lg md:text-xl opacity-85 leading-relaxed" style={{ fontFamily: bodyFont }}>
                  {carouselSlides[previewSlideIndex].body_text}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-current/10 pt-4 mt-4">
                <span className="text-xs font-bold tracking-wider uppercase opacity-70">{authorName || 'Your Name'}</span>
                {/* Dot indicators */}
                <div className="flex gap-1.5">
                  {carouselSlides.map((_, i) => (
                    <button key={i} onClick={() => setPreviewSlideIndex(i)}
                      className={`rounded-full transition-all ${ i === previewSlideIndex ? 'w-4 h-1.5 bg-current' : 'w-1.5 h-1.5 bg-current opacity-30'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Next arrow */}
          <button
            onClick={() => setPreviewSlideIndex(i => Math.min(carouselSlides.length - 1, i + 1))}
            disabled={previewSlideIndex === carouselSlides.length - 1}
            className="absolute right-4 md:right-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white disabled:opacity-20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>

          {/* Thumbnail strip bottom */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="flex gap-2 overflow-x-auto max-w-[90vw] px-4">
              {carouselSlides.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewSlideIndex(i)}
                  className={`shrink-0 w-14 h-14 rounded-xl border-2 transition-all overflow-hidden flex flex-col items-start p-1.5 ${
                    i === previewSlideIndex ? 'border-white scale-110' : 'border-white/20 opacity-50 hover:opacity-80'
                  } ${(!customBgColor && !customTextColor) ? themeClasses[carouselTheme] : ''}`}
                  style={{ backgroundColor: customBgColor || undefined, color: customTextColor || undefined }}
                >
                  <div className="text-[6px] opacity-40 font-bold">{i + 1}</div>
                  <div className="text-[6px] font-bold leading-tight line-clamp-2 opacity-90" style={{ fontFamily: titleFont }}>{slide.headline}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-gray-600 text-xs hidden md:block">
            Use ← → arrow buttons or click thumbnails to navigate
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6 relative">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Raw Content</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Paste your draft post, ideas, or brain dump here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="I spent 5 years building SaaS products and made every mistake possible..."
                    className="min-h-[200px] sm:min-h-[280px] resize-none text-sm sm:text-base leading-relaxed focus-visible:ring-blue-500"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry (Optional)</Label>
                    <Input 
                      id="industry" 
                      placeholder="e.g. SaaS, Tech" 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audience" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audience</Label>
                      <button
                        onClick={() => setShowAdvancedAudience(!showAdvancedAudience)}
                        className="text-xs text-blue-600 hover:underline py-1 px-1"
                      >
                        {showAdvancedAudience ? "Simple Mode" : "Advanced Mode"}
                      </button>
                    </div>
                    {!showAdvancedAudience ? (
                      <Input 
                        id="audience" 
                        placeholder="e.g. Founders" 
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        className="focus-visible:ring-blue-500"
                      />
                    ) : (
                      <div className="w-full p-3 bg-slate-50 rounded-md border border-slate-200 shadow-sm grid grid-cols-2 gap-2">
                        <Input placeholder="Role (CEO)" value={audienceDetails.jobRole} onChange={e => setAudienceDetails({...audienceDetails, jobRole: e.target.value})} className="h-9 text-xs"/>
                        <Input placeholder="Seniority" value={audienceDetails.seniority} onChange={e => setAudienceDetails({...audienceDetails, seniority: e.target.value})} className="h-9 text-xs"/>
                        <Input placeholder="Age (25-35)" value={audienceDetails.age} onChange={e => setAudienceDetails({...audienceDetails, age: e.target.value})} className="h-9 text-xs"/>
                        <Input placeholder="Gender" value={audienceDetails.gender} onChange={e => setAudienceDetails({...audienceDetails, gender: e.target.value})} className="h-9 text-xs"/>
                        <Input placeholder="Business Type" value={audienceDetails.businessType} onChange={e => setAudienceDetails({...audienceDetails, businessType: e.target.value})} className="h-9 text-xs"/>
                        <Input placeholder="Brand Affinity" value={audienceDetails.brand} onChange={e => setAudienceDetails({...audienceDetails, brand: e.target.value})} className="h-9 text-xs"/>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Voice & Tone</Label>
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer hover:text-slate-700">
                        <input 
                          type="checkbox" 
                          checked={rememberTone} 
                          onChange={(e) => setRememberTone(e.target.checked)} 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" 
                        />
                        Remember
                      </label>
                    </div>
                    <Input 
                      id="tone" 
                      placeholder="e.g. Authoritative, Humorous" 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="timezone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Zone (Blueprint)</Label>
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer hover:text-slate-700">
                        <input 
                          type="checkbox" 
                          checked={rememberTimeZone} 
                          onChange={(e) => setRememberTimeZone(e.target.checked)} 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" 
                        />
                        Remember
                      </label>
                    </div>
                    <Input 
                      id="timezone" 
                      placeholder="e.g. EST, Asia/Kolkata" 
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="authorName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Author Name (Signature)</Label>
                  <Input 
                    id="authorName" 
                    placeholder="e.g. Jane Doe" 
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="focus-visible:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-slate-100 rounded-b-xl pt-4">
                <Button 
                  onClick={handleOptimize} 
                  disabled={isOptimizing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 sm:py-6 text-sm sm:text-base transition-all shadow-sm hover:shadow-md"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Engineering Virality...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Optimize Content
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Framework Info */}
            <Card className="border-slate-200 bg-slate-50/50 shadow-none">
              <CardContent className="p-4 sm:p-5">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  The Growth Architect Logic
                </h3>
                <ul className="text-xs sm:text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span><strong>Hook Engineering:</strong> Pattern interrupts & authority signals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span><strong>Fold Placement:</strong> Line 3 curiosity gap to drive "See More" clicks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span><strong>Vertical Formatting:</strong> Single-sentence lines for mobile readability.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 scroll-mt-24" ref={resultRef}>
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Tabs defaultValue="post" className="w-full">
                  <TabsList className="flex w-full overflow-x-auto gap-1 p-1 bg-slate-100/80 rounded-lg [&::-webkit-scrollbar]:hidden">
                    <TabsTrigger value="post" className="shrink-0 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Engineered Post</TabsTrigger>
                    <TabsTrigger value="carousel" className="shrink-0 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Carousel</TabsTrigger>
                    <TabsTrigger value="blueprint" className="shrink-0 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Blueprint</TabsTrigger>
                    <TabsTrigger value="assets" className="shrink-0 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Schedule</TabsTrigger>
                    <TabsTrigger value="links" className="shrink-0 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Links</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-6">
                    <TabsContent value="post" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                      <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col h-[450px] sm:h-[500px] md:h-[550px]">
                        <div className="bg-slate-50 border-b border-slate-100 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 shrink-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Send className="w-4 h-4 text-blue-600" />
                            Ready to Publish
                          </div>
                          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                            <Button variant="outline" size="sm" onClick={() => setShowPostPreview(true)} className="h-8 text-xs font-medium bg-white flex-1 sm:flex-initial">
                              <svg className="w-3.5 h-3.5 sm:mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                              <span className="hidden sm:inline">Preview</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-8 text-xs font-medium bg-white flex-1 sm:flex-initial">
                              {copied ? <CheckCircle2 className="w-3.5 h-3.5 sm:mr-1.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 sm:mr-1.5 text-slate-500" />}
                              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                            </Button>
                            <Button variant="default" size="sm" onClick={handlePostToLinkedIn} className="h-8 text-xs font-medium bg-[#0A66C2] hover:bg-[#004182] text-white border-transparent flex-1 sm:flex-initial">
                              <svg className="w-3.5 h-3.5 sm:mr-1.5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                              <span className="hidden sm:inline">Post to LinkedIn</span>
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-0 flex-1 overflow-hidden">
                          <RichTextEditor value={editedPost} onChange={setEditedPost} />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="carousel" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                      <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <LayoutTemplate className="w-4 h-4 text-blue-600" />
                            Carousel Builder
                          </div>
                          {carouselSlides.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => { setPreviewSlideIndex(0); setShowCarouselPreview(true); }} className="h-8 text-xs font-medium bg-white">
                              <svg className="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                              Full Preview
                            </Button>
                          )}
                        </div>
                        <CardContent className="p-6">
                          {carouselSlides.length === 0 ? (
                            <div className="text-center py-10 space-y-6">
                              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                                <LayoutTemplate className="w-8 h-8 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-slate-700 font-semibold mb-1">Generate a Swipeable Carousel</p>
                                <p className="text-slate-400 text-sm">Based on your optimized post</p>
                              </div>
                              {/* Slide count before generate */}
                              <div className="flex items-center justify-center gap-3">
                                <Label className="text-sm font-semibold text-slate-600">Number of Slides:</Label>
                                <Select value={slideCount.toString()} onValueChange={(v) => setSlideCount(parseInt(v))}>
                                  <SelectTrigger className="w-[80px] h-9 bg-white border-slate-300"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {Array.from({length: 18}, (_, i) => i + 3).map(n => (
                                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button 
                                onClick={handleGenerateCarousel} 
                                disabled={isGeneratingCarousel}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                              >
                                {isGeneratingCarousel ? (
                                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Slides...</>
                                ) : (
                                  <><LayoutTemplate className="mr-2 h-4 w-4" /> Generate {slideCount} Slides</>
                                )}
                              </Button>
                              {carouselError && <p className="text-red-500 text-sm mt-2">{carouselError}</p>}
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-slate-600">
                                    {carouselSlides.length} slides generated
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleUndo} disabled={pastSlides.length === 0} className="h-8 px-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleRedo} disabled={futureSlides.length === 0} className="h-8 px-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={exportToPPTX} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                      <Download className="mr-2 h-4 w-4" />
                                      Export PPTX
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleGenerateCarousel} disabled={isGeneratingCarousel}>
                                      {isGeneratingCarousel ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                      Regenerate
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex gap-2 items-center flex-wrap bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs font-semibold">Slides:</Label>
                                    <Select value={slideCount.toString()} onValueChange={(v) => setSlideCount(parseInt(v))}>
                                      <SelectTrigger className="w-[70px] h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {Array.from({length: 18}, (_, i) => i + 3).map(n => (
                                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Label className="text-xs font-semibold">Theme:</Label>
                                    <Select value={carouselTheme} onValueChange={setCarouselTheme}>
                                      <SelectTrigger className="w-[120px] h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {Object.keys(themeClasses).map(t => (
                                          <SelectItem key={t} value={t} className="capitalize">{t.replace(/([A-Z])/g, ' $1').trim()}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Label className="text-xs font-semibold">Title Font:</Label>
                                    <Select value={titleFont} onValueChange={setTitleFont}>
                                      <SelectTrigger className="w-[120px] h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Label className="text-xs font-semibold">Body Font:</Label>
                                    <Select value={bodyFont} onValueChange={setBodyFont}>
                                      <SelectTrigger className="w-[120px] h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Label className="text-xs font-semibold">Custom BG:</Label>
                                    <input type="color" value={customBgColor || "#ffffff"} onChange={e => setCustomBgColor(e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" />
                                    {customBgColor && <button onClick={() => setCustomBgColor("")} className="text-[10px] text-red-500 hover:underline">Clear</button>}
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Label className="text-xs font-semibold">Custom Text:</Label>
                                    <input type="color" value={customTextColor || "#000000"} onChange={e => setCustomTextColor(e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" />
                                    {customTextColor && <button onClick={() => setCustomTextColor("")} className="text-[10px] text-red-500 hover:underline">Clear</button>}
                                  </div>
                                  <div className="w-full mt-2 pt-2 border-t border-slate-200">
                                    <p className="text-[10px] text-slate-400 italic flex items-center gap-1"><Sparkles className="w-3 h-3" /> Changes apply instantly to all slides</p>
                                  </div>
                                </div>
                              </div>

                              {/* Micro Art Panel */}
                              {result.suggested_micro_icons && result.suggested_micro_icons.length > 0 && (
                                <div className="p-4 bg-gradient-to-br from-slate-100 to-white rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-500" />
                                    Suggested Micro Art (Drag & Drop onto slides)
                                  </h4>
                                  <div className="flex gap-4 flex-wrap">
                                    {result.suggested_micro_icons.map(iconName => {
                                      const IconCmp = IconMap[iconName];
                                      if (!IconCmp) return null;
                                      return (
                                        <motion.div
                                          key={iconName}
                                          draggable
                                          onDragStart={(e: any) => e.dataTransfer.setData('iconName', iconName)}
                                          whileHover={{ scale: 1.2, rotate: 5 }}
                                          animate={{ y: [0, -4, 0] }}
                                          transition={{ repeat: Infinity, duration: 2 + Math.random(), ease: "easeInOut" }}
                                          className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center cursor-grab active:cursor-grabbing text-blue-600"
                                        >
                                          <IconCmp className="w-5 h-5" />
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pt-2">
                                  {carouselSlides.map((slide, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`relative w-full aspect-[4/5] p-5 rounded-2xl border-2 flex flex-col shadow-md transition-all overflow-hidden ${(!customBgColor && !customTextColor) ? themeClasses[carouselTheme] : ''}`}
                                      style={{
                                        backgroundColor: customBgColor || undefined,
                                        color: customTextColor || undefined,
                                        borderColor: customTextColor ? `${customTextColor}40` : undefined
                                      }}
                                      onClick={() => setSelectedElement(null)}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) => handleDrop(e, idx)}
                                    >
                                      <div className="flex justify-between items-center mb-4 relative z-10 pointer-events-none">
                                        <div className="text-xs opacity-50 font-bold tracking-widest uppercase">Slide {slide.slide_number}</div>
                                        <div className="text-xs opacity-50 font-medium">{idx + 1}/{carouselSlides.length}</div>
                                      </div>
                                      
                                      <div className="flex-1 flex flex-col gap-3 relative z-10">
                                        <Textarea 
                                          value={slide.headline}
                                          onChange={(e) => updateSlide(idx, "headline", e.target.value)}
                                          className={`text-xl font-bold leading-tight resize-none border-transparent hover:border-current/20 focus-visible:border-current/50 focus-visible:ring-0 p-1 -mx-1 bg-transparent ${(!customBgColor && !customTextColor) ? themeClasses[carouselTheme] : ''}`}
                                          rows={3}
                                          style={{ fontFamily: titleFont, color: customTextColor || undefined }}
                                        />
                                        <Textarea 
                                          value={slide.body_text}
                                          onChange={(e) => updateSlide(idx, "body_text", e.target.value)}
                                          className={`text-sm opacity-90 leading-relaxed resize-none border-transparent hover:border-current/20 focus-visible:border-current/50 focus-visible:ring-0 p-1 -mx-1 flex-1 bg-transparent ${(!customBgColor && !customTextColor) ? themeClasses[carouselTheme] : ''}`}
                                          style={{ fontFamily: bodyFont, color: customTextColor || undefined }}
                                        />
                                      </div>

                                      <div className="mt-4 pt-4 flex items-center justify-between border-t border-current/10 relative z-10 pointer-events-none">
                                        <div className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                                          {authorName || "Your Name"}
                                        </div>
                                        <div className="text-[10px] opacity-40 italic">
                                          {slide.design_suggestion}
                                        </div>
                                      </div>

                                      {/* Draggable Elements */}
                                      {slide.elements?.map((el) => {
                                        const RenderIcon = el.type === 'icon' ? (IconMap[el.content] || Star) : null;
                                        return (
                                          <motion.div
                                            key={el.id}
                                            drag
                                            dragMomentum={false}
                                            onDragEnd={(e, info) => updateElementPosition(idx, el.id, info.offset)}
                                            onClick={(e) => { e.stopPropagation(); setSelectedElement({ slideIdx: idx, elId: el.id }); }}
                                            animate={{ x: el.x, y: el.y }}
                                            style={{ position: 'absolute', top: 0, left: 0, zIndex: 20 }}
                                            className={`cursor-move ${selectedElement?.elId === el.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent rounded-sm' : ''}`}
                                          >
                                            {el.type === 'image' ? (
                                              <img 
                                                src={el.content} 
                                                alt="User added" 
                                                className={`w-24 h-24 object-cover pointer-events-none ${el.shape === 'circle' ? 'rounded-full' : el.shape === 'rounded' ? 'rounded-xl' : ''}`}
                                              />
                                            ) : el.type === 'link' ? (
                                              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm pointer-events-none flex items-center gap-1">
                                                <LinkIcon className="w-3 h-3" />
                                                {el.content.replace(/^https?:\/\//, '')}
                                              </div>
                                            ) : el.type === 'icon' && RenderIcon ? (
                                              <div className="text-current drop-shadow-md pointer-events-none">
                                                <RenderIcon className="w-8 h-8" />
                                              </div>
                                            ) : null}
                                          </motion.div>
                                        );
                                      })}

                                      {/* Toolbar for this slide */}
                                      <div className="absolute bottom-2 right-2 flex gap-1 z-30">
                                        <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full shadow-md bg-white/80 hover:bg-white text-slate-900" onClick={(e) => { e.stopPropagation(); addElement(idx, 'image'); }}>
                                          <ImageIcon className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full shadow-md bg-white/80 hover:bg-white text-slate-900" onClick={(e) => { e.stopPropagation(); addElement(idx, 'link'); }}>
                                          <LinkIcon className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                              {/* Element Editor Panel */}
                              {selectedElement && (
                                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 flex items-end gap-4 animate-in fade-in slide-in-from-bottom-2">
                                  <div className="flex-1 space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase">
                                      {carouselSlides[selectedElement.slideIdx].elements?.find(e => e.id === selectedElement.elId)?.type === 'image' ? 'Image URL' : 'Link URL'}
                                    </Label>
                                    <Input 
                                      value={carouselSlides[selectedElement.slideIdx].elements?.find(e => e.id === selectedElement.elId)?.content || ''}
                                      onChange={(e) => updateElementContent(selectedElement.slideIdx, selectedElement.elId, e.target.value)}
                                      className="bg-white"
                                    />
                                  </div>
                                  {carouselSlides[selectedElement.slideIdx].elements?.find(e => e.id === selectedElement.elId)?.type === 'image' && (
                                    <div className="space-y-2">
                                      <Label className="text-xs font-semibold text-slate-500 uppercase">Shape</Label>
                                      <Select 
                                        value={carouselSlides[selectedElement.slideIdx].elements?.find(e => e.id === selectedElement.elId)?.shape || 'rectangle'}
                                        onValueChange={(val) => updateElementContent(selectedElement.slideIdx, selectedElement.elId, carouselSlides[selectedElement.slideIdx].elements?.find(e => e.id === selectedElement.elId)?.content || '', val)}
                                      >
                                        <SelectTrigger className="w-[120px] bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="rectangle">Rectangle</SelectItem>
                                          <SelectItem value="rounded">Rounded</SelectItem>
                                          <SelectItem value="circle">Circle</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                  <Button variant="destructive" size="icon" onClick={() => deleteElement(selectedElement.slideIdx, selectedElement.elId)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="blueprint" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="border-slate-200 shadow-sm sm:col-span-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-blue-600" />
                              Velocity Score
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-end gap-4">
                              <div className="text-5xl font-bold tracking-tighter text-slate-900">
                                {result.engagement_blueprint.velocity_score}
                                <span className="text-2xl text-slate-400 font-normal">/100</span>
                              </div>
                              <div className="pb-1.5">
                                <Badge variant={result.engagement_blueprint.velocity_score >= 80 ? "default" : "secondary"} className={result.engagement_blueprint.velocity_score >= 80 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                                  {result.engagement_blueprint.velocity_score >= 80 ? "High Virality Potential" : "Moderate Potential"}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Hook Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold mb-2">{result.engagement_blueprint.hook_score}<span className="text-sm text-slate-400 font-normal">/100</span></div>
                            <p className="text-sm text-slate-600 leading-relaxed">{result.engagement_blueprint.hook_rationale}</p>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Fold Placement</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold mb-2">{result.engagement_blueprint.fold_score}<span className="text-sm text-slate-400 font-normal">/100</span></div>
                            <p className="text-sm text-slate-600 leading-relaxed">{result.engagement_blueprint.fold_rationale}</p>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm sm:col-span-2 bg-blue-50/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-blue-800 uppercase tracking-wider font-semibold">Question-Reply Loop</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-base font-medium text-slate-900 italic">"{result.engagement_blueprint.question_reply_loop}"</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="assets" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                      <div className="grid gap-6">
                        <Card className="border-slate-200 shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-blue-600" />
                              Asset Recommendation
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Format</div>
                              <Badge variant="outline" className="text-sm px-3 py-1 bg-slate-50">{result.asset_recommendation.type}</Badge>
                            </div>
                            <Separator />
                            <div>
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Rationale</div>
                              <p className="text-sm text-slate-700">{result.asset_recommendation.rationale}</p>
                            </div>
                            <Separator />
                            <div>
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Structure</div>
                              <p className="text-sm text-slate-700">{result.asset_recommendation.structure}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              Posting Schedule
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Optimal Window</div>
                              <div className="text-lg font-medium text-slate-900">{result.posting_schedule.time}</div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Rationale</div>
                              <p className="text-sm text-slate-700">{result.posting_schedule.rationale}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="links" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                      <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-blue-600" />
                            Link Mitigation Strategy
                          </CardTitle>
                          <CardDescription>
                            LinkedIn penalizes posts with external links. We use a delayed comment strategy.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Extracted Links</div>
                            {result.link_mitigation.extracted_links.length > 0 ? (
                              <ul className="space-y-2">
                                {result.link_mitigation.extracted_links.map((link, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded-md border border-slate-100">
                                    <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                      {link}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-slate-500 italic">No links found in the content.</p>
                            )}
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Execution Plan</div>
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                              <p className="text-sm text-amber-900 leading-relaxed">
                                {result.link_mitigation.strategy}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            ) : isOptimizing ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                >
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </motion.div>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Engineering Virality…</h3>
                <p className="text-blue-400/80 max-w-sm text-sm">
                  Analyzing hooks, fold placement, and engagement velocity for your post.
                </p>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Awaiting Content</h3>
                <p className="text-slate-500 max-w-sm">
                  Paste your raw post on the left and click Optimize to generate a viral-engineered LinkedIn post.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
