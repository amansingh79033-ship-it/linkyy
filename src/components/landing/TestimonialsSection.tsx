import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Founder @ GrowthLab',
    handle: '@sarahjenkins_growth',
    avatar: 'SJ',
    metric: '+142k Impressions',
    content: 'Linkyy completely revolutionized our LinkedIn content strategy. Our dwell time jumped 3.4x in the first 2 weeks, and our carousel slides get 5x more saves than static images.',
    rating: 5,
  },
  {
    name: 'Marcus Vance',
    role: 'Head of Product Marketing',
    handle: '@marcusvance_pm',
    avatar: 'MV',
    metric: '10× Dwell Boost',
    content: 'The Line 3 fold placement & broetry formatting is pure genius. SambaNova gemma-4-31B-it generates optimized hooks instantly. Linkyy is my secret weapon for organic growth.',
    rating: 5,
  },
  {
    name: 'Elena Rostova',
    role: 'LinkedIn Top Voice 2026',
    handle: '@elena_rostova',
    avatar: 'ER',
    metric: '4.8k PPTX Downloads',
    content: 'I used to spend 4 hours in Figma creating carousels. With Linkyy’s drag & drop editor, I generate beautiful carousels and export to PPTX in less than 3 minutes!',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#07070c]">
      {/* Glow background */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[400px] bg-gradient-to-tr from-[#0A66C2]/10 to-purple-600/10 blur-[160px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" /> Wall of Love
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Loved by{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-300 to-purple-400">
              10,000+ creators &amp; founders.
            </span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-sans">
            See how top LinkedIn creators use Linkyy to dominate the feed.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="bg-[#0d0d15]/90 border border-white/10 hover:border-white/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-xl hover:shadow-2xl hover:shadow-[#0A66C2]/10 transition-all duration-300"
            >
              {/* Header: Stars & Metric Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Badge className="bg-[#0A66C2]/15 text-[#70B5F9] border border-[#0A66C2]/30 text-[11px] font-semibold">
                  <TrendingUp className="w-3 h-3 mr-1" /> {item.metric}
                </Badge>
              </div>

              {/* Quote Content */}
              <p className="text-gray-300 text-sm leading-relaxed font-sans italic">
                "{item.content}"
              </p>

              {/* Creator Profile */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0A66C2] via-indigo-600 to-purple-600 p-0.5 shrink-0">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                    {item.avatar}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-sm font-bold">{item.name}</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0A66C2] text-white text-[9px] flex items-center justify-center font-bold">✓</span>
                  </div>
                  <span className="text-gray-400 text-xs">{item.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
