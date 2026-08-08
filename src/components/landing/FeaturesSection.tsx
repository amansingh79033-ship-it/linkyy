import { useState } from 'react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Layers, BarChart3, LayoutTemplate, ImageIcon, CheckCircle2, ArrowRight, Eye, RefreshCw, Cpu, Rocket, AlertTriangle } from 'lucide-react';

export default function FeaturesSection() {
  const [activeBeforeAfter, setActiveBeforeAfter] = useState<'after' | 'before'>('after');
  const [selectedTheme, setSelectedTheme] = useState('indigo');

  return (
    <section id="features" className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#07070c]">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-r from-[#0A66C2]/10 via-purple-600/10 to-transparent blur-[160px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-[#70B5F9]">
            <Sparkles className="w-3.5 h-3.5" /> Core Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Engineered specifically for the{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#70B5F9] via-blue-400 to-purple-400">
              LinkedIn Algorithm.
            </span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-sans">
            Every feature in Linkyy is built to maximize Dwell Time, drive comments, and convert swipes into growth.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BENTO TILE 1: Large 8-Col Span - Dwell Time Engine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 bg-[#0d0d15]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden group hover:border-[#0A66C2]/40 transition-all shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0A66C2]/20 border border-[#0A66C2]/40 flex items-center justify-center text-[#70B5F9]">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Dwell-Time Engine</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Restructures raw text into vertical broetry lines that force readers to stop scrolling.
                </p>
              </div>

              {/* Before vs After Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.05] border border-white/10 shrink-0">
                <button
                  onClick={() => setActiveBeforeAfter('before')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeBeforeAfter === 'before' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-gray-400'
                  }`}
                >
                  Unoptimized Draft
                </button>
                <button
                  onClick={() => setActiveBeforeAfter('after')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeBeforeAfter === 'after' ? 'bg-[#0A66C2] text-white shadow-lg' : 'text-gray-400'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Engineered Post
                </button>
              </div>
            </div>

            {/* Interactive Preview Box */}
            <div className="bg-[#050508] border border-white/10 rounded-2xl p-5 text-xs text-gray-300 space-y-3 font-sans relative">
              {activeBeforeAfter === 'after' ? (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="p-2.5 rounded-xl bg-[#0A66C2]/15 border border-[#0A66C2]/30 flex items-center justify-between">
                    <span className="text-white font-bold text-xs flex items-center gap-1.5"><Rocket className="w-3 h-3 text-[#70B5F9] hover:scale-125 hover:-rotate-12 transition-transform duration-200" /> Hook (Pattern Interrupt):</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">99/100 Hook Rating</Badge>
                  </div>
                  <p className="text-white font-bold text-sm">90% of LinkedIn creators write posts that get zero reach.</p>
                  <p className="text-gray-300">Here is the 3-step dwell-time framework top voices use instead:</p>
                  <div className="flex items-center justify-between text-[11px] text-[#70B5F9] pt-1 font-semibold border-t border-white/10">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Strategic Curiosity Fold Interrupt</span>
                    <span className="text-gray-500 cursor-pointer">...see more</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 opacity-60 animate-in fade-in duration-300">
                  <p className="text-gray-400 leading-relaxed">
                    Most creators on LinkedIn write really long paragraphs of unformatted text without any spacing or clear hooks, which means people just scroll right past them without clicking see more or reading through the post properly...
                  </p>
                  <div className="text-[11px] text-red-400 font-semibold pt-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 hover:scale-110 transition-transform duration-200" /> Low Dwell Time Risk: Readers bounce in &lt;1.2 seconds.
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* BENTO TILE 2: 4-Col Span - SambaNova Engine Speed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-4 bg-[#0d0d15]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-2xl"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">SambaNova AI Speed</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Powered by enterprise SambaNova <code className="text-purple-300">gemma-4-31B-it</code> silicon for instantaneous generation.
              </p>
            </div>

            <div className="bg-[#050508] border border-white/10 rounded-2xl p-4 mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Response Latency</span>
                <span className="text-emerald-400 font-bold font-mono">&lt; 0.148s</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full w-[94%]" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                <span>Linkyy SambaNova</span>
                <span>Standard LLM (3.8s)</span>
              </div>
            </div>
          </motion.div>

          {/* BENTO TILE 3: 6-Col Span - Drag & Drop Carousel Studio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-6 bg-[#0d0d15]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl hover:border-blue-500/40 transition-all shadow-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[#70B5F9] mb-4">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Carousel Studio & PPTX Export</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-6">
              Convert posts into swipeable LinkedIn carousels with 54+ themes, drag-and-drop slide elements, and 1-click PPTX downloads.
            </p>

            {/* Theme Swatch Selector */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-400">Themes:</span>
              {[
                { id: 'indigo', name: 'Indigo Glow', bg: 'bg-[#0A66C2]' },
                { id: 'purple', name: 'Cyberpunk', bg: 'bg-purple-600' },
                { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-600' },
                { id: 'slate', name: 'Slate Dark', bg: 'bg-slate-800' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`w-6 h-6 rounded-full ${t.bg} border-2 transition-transform ${
                    selectedTheme === t.id ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  title={t.name}
                />
              ))}
            </div>

            {/* Simulated Slide Canvas */}
            <div className={`aspect-[16/9] rounded-2xl p-4 flex flex-col justify-between border border-white/20 transition-colors ${
              selectedTheme === 'indigo' ? 'bg-gradient-to-br from-[#0A66C2] to-indigo-950' :
              selectedTheme === 'purple' ? 'bg-gradient-to-br from-purple-700 to-slate-950' :
              selectedTheme === 'emerald' ? 'bg-gradient-to-br from-emerald-700 to-slate-950' :
              'bg-gradient-to-br from-slate-800 to-black'
            }`}>
              <div className="flex justify-between items-center text-[10px] text-white/70">
                <span>SLIDE 01 / 05</span>
                <span>LINKYY STUDIO</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-black text-sm sm:text-base">How to Engineer 10x Reach</h4>
                <p className="text-white/80 text-xs">Swipe to unlock the dwell-time algorithm blueprint →</p>
              </div>
              <div className="flex justify-end text-[10px] text-white/60">
                <span>PPTX Ready</span>
              </div>
            </div>
          </motion.div>

          {/* BENTO TILE 4: 6-Col Span - Engagement Velocity Blueprint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-6 bg-[#0d0d15]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl hover:border-emerald-500/40 transition-all shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Question-Reply Loop Blueprint</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-6">
                Appends targeted CTA questions at the end of every post to drive first-hour comment velocity.
              </p>
            </div>

            <div className="bg-[#050508] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Algorithm Engagement Multiplier</span>
                <span className="text-emerald-400">4.2× Velocity</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[10px] text-gray-400 block">First 60 Mins</span>
                  <span className="text-white font-bold text-sm">+84 Comments</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[10px] text-gray-400 block">Impression Multiplier</span>
                  <span className="text-emerald-400 font-bold text-sm">Top 1% Post</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
