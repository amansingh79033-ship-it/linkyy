import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Zap, Download, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Paste Raw Ideas',
    desc: 'Paste any unformatted draft, brain dump, or existing post into Linkyy’s editor.',
    icon: FileText,
    gradient: 'from-[#0A66C2] to-blue-600',
  },
  {
    step: '02',
    title: 'AI Dwell-Time Optimization',
    desc: 'SambaNova gemma-4-31B-it formats line 1 hooks, line 3 folds, and vertical spacing in <0.15s.',
    icon: Zap,
    gradient: 'from-purple-600 to-indigo-600',
  },
  {
    step: '03',
    title: 'Design & PPTX Export',
    desc: 'Auto-generate carousel slides, pick from 54+ themes, drag & drop elements, and export to PPTX.',
    icon: Download,
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#07070c]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-900/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0A66C2]/10 blur-[180px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Simple Workflow
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            From raw thoughts to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-blue-200 to-[#70B5F9]">
              viral LinkedIn post in 3 steps.
            </span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-sans">
            No design background or prompt engineering needed.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          
          {/* Connector Beam Line on desktop */}
          <div className="hidden md:block absolute top-20 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#0A66C2]/40 via-purple-500/40 to-emerald-500/40 pointer-events-none" />

          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative z-10 bg-[#0d0d15]/80 border border-white/10 hover:border-white/20 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-start space-y-6 group hover:shadow-2xl hover:shadow-[#0A66C2]/10 transition-all duration-300"
            >
              {/* Step Number & Icon Circle */}
              <div className="flex items-center justify-between w-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full bg-[#07070c] rounded-[14px] flex items-center justify-center text-white">
                    <item.icon className="w-6 h-6" />
                  </div>
                </div>
                <span className="text-3xl font-black text-white/20 font-mono group-hover:text-[#70B5F9]/40 transition-colors">
                  {item.step}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 text-left">
                <h3 className="text-xl font-bold text-white group-hover:text-[#70B5F9] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className="pt-2 text-xs font-semibold text-[#70B5F9] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Explore Step {i + 1}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
