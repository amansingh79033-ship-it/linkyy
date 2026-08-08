import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import HeroVisual from '../HeroVisual';

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 sm:pt-28 pb-16 sm:pb-20 overflow-hidden bg-white">

      {/* Hero content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-12 items-center">

        {/* LEFT COLUMN: Hero Copy & Actions */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-5 sm:space-y-8 text-left">

          {/* Status Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>The AI Engine for LinkedIn Creators</span>
              <span className="text-gray-300">•</span>
              <span className="text-emerald-600 font-semibold">Free</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.05]"
          >
            Turn drafts into{' '}
            <span className="text-[#0A66C2]">
              viral LinkedIn
            </span>{' '}
            posts.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-xl leading-relaxed"
          >
            Engineered hooks, strategic fold placement, and carousel slides — powered by AI in seconds.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-4 pt-2"
          >
            <Button
              onClick={onStart}
              size="lg"
              className="bg-[#0A66C2] hover:bg-[#004182]
                text-white rounded-full px-8 h-12 text-base font-semibold tracking-wide
                transition-all duration-200 hover:scale-[1.02] active:scale-95 relative overflow-hidden group"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start for Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Interactive Hero Visual Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="lg:col-span-5 w-full px-2 sm:px-0"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
