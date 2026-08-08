import { useState, useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { Sparkles, Check, ArrowRight, TrendingUp, Zap, Layers, RefreshCw, Eye, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'post' | 'carousel'>('post');
  const [activeSlide, setActiveSlide] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hookScore, setHookScore] = useState(98);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(useTransform(rawX, [-1, 1], [-12, 12]), { stiffness: 100, damping: 25 });
  const springY = useSpring(useTransform(rawY, [-1, 1], [-8, 8]), { stiffness: 100, damping: 25 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const triggerOptimizeAnimation = () => {
    setIsSimulating(true);
    setHookScore(82);
    setTimeout(() => {
      setHookScore(99);
      setIsSimulating(false);
    }, 900);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[480px] sm:min-h-[540px] lg:min-h-[620px] flex items-center justify-center p-1 sm:p-4 select-none"
    >
      {/* Ambient background mesh glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#0A66C2]/15 via-purple-600/10 to-cyan-500/10 blur-[90px] pointer-events-none" />

      {/* Grid line pattern */}
      <div
        className="absolute inset-0 rounded-3xl opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #0A66C2 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <motion.div
        style={{ x: springX, y: springY }}
        className="relative z-10 w-full max-w-xl grid grid-cols-1 gap-3 sm:gap-4"
      >
        {/* Main Product Card */}
        <div className="bg-[#0f0f17]/90 backdrop-blur-2xl border border-white/15 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(10,102,194,0.3)]">
          {/* Card Header bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 sm:pb-4 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#0A66C2]/20 border border-[#0A66C2]/40 rounded-full px-3 py-1 text-xs font-semibold text-[#70B5F9]">
                <Zap className="w-3.5 h-3.5 text-[#70B5F9]" />
                Live Dwell-Time AI Engine
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hidden xs:inline-flex sm:inline-flex">
                gemma-4-31B-it · &lt;0.15s
              </Badge>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.05] border border-white/10">
              <button
                onClick={() => setActiveTab('post')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'post'
                    ? 'bg-[#0A66C2] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Post
              </button>
              <button
                onClick={() => setActiveTab('carousel')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'carousel'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Carousel
              </button>
            </div>
          </div>

          {/* TAB 1: LinkedIn Engineered Post Card */}
          {activeTab === 'post' ? (
            <motion.div
              key="post-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Profile Bar */}
              <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0A66C2] to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                      AS
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-xs font-bold">Aman Singh</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#0A66C2] text-white text-[9px] flex items-center justify-center font-bold">✓</span>
                    </div>
                    <span className="text-gray-400 text-[11px]">LinkedIn Top Voice · Content Architect</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400">Hook Score</span>
                    <span className="text-xs font-extrabold text-emerald-400">{hookScore}/100</span>
                  </div>
                  <button
                    onClick={triggerOptimizeAnimation}
                    disabled={isSimulating}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
                    title="Re-optimize Post"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-[#70B5F9]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Engineered Content Block */}
              <div className="bg-[#0a0a0f] rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs text-gray-200 leading-relaxed font-sans">
                <div className="p-2 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/30 flex items-start gap-2">
                  <span className="text-sm">🎯</span>
                  <div>
                    <span className="font-bold text-[#70B5F9] text-[11px] block">Pattern Interrupt Hook (Line 1):</span>
                    <p className="text-white font-medium text-xs">Most founders write LinkedIn posts that get ignored.</p>
                  </div>
                </div>

                <p className="text-gray-300">Here is the 3-step dwell-time framework we used to 10× our reach:</p>
                
                <div className="space-y-1 text-gray-300 pl-1 border-l-2 border-purple-500/50">
                  <p className="text-white font-semibold">1. Single-sentence line breaks for mobile readers</p>
                  <p className="text-white font-semibold">2. Strategic Fold interrupt at line 3</p>
                </div>

                {/* Line 3 Fold Interrupt Indicator */}
                <div className="flex items-center justify-between text-[11px] text-[#0A66C2] font-semibold pt-1">
                  <span className="flex items-center gap-1 text-purple-300">
                    <Eye className="w-3 h-3" /> Strategic Fold Placement
                  </span>
                  <span className="cursor-pointer hover:underline text-gray-400">...see more</span>
                </div>
              </div>

              {/* Engagement Bar Simulation */}
              <div className="flex items-center justify-between text-gray-400 text-[11px] pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-blue-400 font-semibold">
                    <ThumbsUp className="w-3.5 h-3.5" /> 1,420 Likes
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <MessageSquare className="w-3.5 h-3.5" /> 284 Comments
                  </span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  +340% Dwell Time
                </Badge>
              </div>
            </motion.div>
          ) : (
            /* TAB 2: Carousel Studio Preview */
            <motion.div
              key="carousel-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Slide Preview Box */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden p-6 flex flex-col justify-between border border-white/15 bg-gradient-to-br from-[#0A66C2] via-indigo-900 to-[#0a0a0f] text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
                    Slide {activeSlide} of 3
                  </span>
                  <Badge className="bg-white/10 text-white border-white/20 text-[10px]">
                    {activeSlide === 1 ? 'Pattern Hook' : activeSlide === 2 ? 'Core Framework' : 'CTA & Loop'}
                  </Badge>
                </div>

                <div className="space-y-2 my-auto">
                  <h4 className="text-lg sm:text-xl font-black text-white leading-snug">
                    {activeSlide === 1 && "How the Top 1% Engineers Dwell Time"}
                    {activeSlide === 2 && "Step 2: Place curiosity gaps before line 3"}
                    {activeSlide === 3 && "Want the full template? Comment 'GROWTH' below"}
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-sm">
                    {activeSlide === 1 && "Posts formatted for vertical scrolling keep readers 3.2x longer."}
                    {activeSlide === 2 && "Readers swipe through carousel slides when each slide ends on an open loop."}
                    {activeSlide === 3 && "Drop your thoughts in the comments to receive the free PPTX slide pack."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-blue-200/60 pt-2 border-t border-white/10">
                  <span>Created with Linkyy Studio</span>
                  <span>Swipe →</span>
                </div>
              </div>

              {/* Slide Thumbnail Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setActiveSlide(num)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeSlide === num
                        ? 'bg-[#0A66C2]/20 border-[#0A66C2] text-white'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold block text-[#70B5F9]">Slide {num}</span>
                    <span className="text-[11px] font-medium truncate block">
                      {num === 1 ? 'Hook' : num === 2 ? 'Framework' : 'CTA'}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating Stat Badges around main card */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-[#11111b]/90 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs sm:text-sm shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-white text-[11px] sm:text-xs font-bold">&lt; 0.15s AI Response</div>
              <div className="text-gray-400 text-[10px]">SambaNova Engine</div>
            </div>
          </div>

          <div className="bg-[#11111b]/90 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs sm:text-sm shrink-0">
              📊
            </div>
            <div>
              <div className="text-white text-[11px] sm:text-xs font-bold">10× Dwell Boost</div>
              <div className="text-gray-400 text-[10px]">Algorithm Verified</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
