import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Zap, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

interface FinalCTASectionProps {
  onStart: () => void;
}

export default function FinalCTASection({ onStart }: FinalCTASectionProps) {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#07070c]">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#0A66C2]/20 via-purple-600/20 to-cyan-500/15 blur-[160px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Glass Banner Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-b from-[#0d0d18] via-[#090912] to-[#05050a] border border-white/15 rounded-3xl p-8 sm:p-14 text-center backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(10,102,194,0.4)] relative overflow-hidden"
        >
          {/* Decorative Corner Orbs */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#0A66C2]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/15 text-xs font-semibold text-[#70B5F9] mb-6">
            <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
            <span>Instant Access · SambaNova AI</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Ready to engineer your next{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-[#70B5F9]">
              viral LinkedIn post?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 font-sans">
            Join thousands of creators who turned raw drafts into high-dwell posts and drag-and-drop carousels.
          </p>

          {/* Feature checklist */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-gray-300 mb-10 font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dwell-Time Broetry Formatting
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 54+ Carousel Themes &amp; PPTX Export
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Powered by gemma-4-31B-it (&lt;0.15s)
            </span>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-[#0A66C2] via-blue-600 to-indigo-600 hover:from-[#004182] hover:to-indigo-700
              text-white rounded-full px-10 h-16 text-lg font-black tracking-wide
              shadow-[0_0_50px_-5px_rgba(10,102,194,0.8)] hover:shadow-[0_0_70px_-2px_rgba(10,102,194,1)]
              transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-in-out" />
            <Sparkles className="w-5 h-5 mr-2 text-blue-200" />
            Launch Linkyy Free
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            No credit card required • Free tier available
          </p>
        </motion.div>

        {/* High-Impact Footer */}
        <footer className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight text-sm">Linkyy</span>
            <span>© 2026 Q-re-us-minds Pvt Ltd. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://cloud.sambanova.ai/" target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors">
              SambaNova AI Cloud
            </a>
            <a href="https://www.linkedin.com/company/9curiousminds" target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors">
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
