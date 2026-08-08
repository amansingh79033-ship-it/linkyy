import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageCircle, Repeat, Send } from 'lucide-react';

export default function FounderSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[600px] h-[600px] rounded-full bg-purple-900/8 blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Section header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-black text-center mb-12 tracking-tight"
        >
          The Brain Behind Linkyy
        </motion.h2>

        {/* LinkedIn-style card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/[0.03] backdrop-blur-xl rounded-2xl
            border border-white/10 overflow-hidden
            shadow-2xl shadow-black/20"
        >
          {/* Header */}
          <div className="p-6 flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0A66C2] to-purple-600
              flex items-center justify-center text-white font-bold text-lg shrink-0
              ring-2 ring-white/10">
              AK
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white text-base">Aman Kumar Singh</h3>
                <span className="text-gray-500 text-sm">• 1st</span>
              </div>
              <p className="text-gray-400 text-sm mt-0.5">Head of Research & Innovation • Q-re-us-minds Pvt Ltd</p>
              <p className="text-gray-500 text-xs mt-0.5">Creator & Architect</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 text-xs">1h</span>
                <span className="text-gray-600">•</span>
                <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                  <path d="M8 3a5 5 0 100 10A5 5 0 008 3zm0 9a4 4 0 110-8 4 4 0 010 8z"/>
                  <path d="M8 5a3 3 0 100 6 3 3 0 000-6z"/>
                </svg>
              </div>
            </div>
            <a
              href="https://www.linkedin.com/company/9curiousminds"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A66C2] font-semibold text-sm hover:text-[#70B5F9] transition-colors"
            >
              + Follow
            </a>
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <p className="text-gray-200 text-sm leading-relaxed">
              With a singular focus: giving humans back their most valuable resource, time. We have built <span className="font-semibold text-white">Linkyy</span> to eliminate the repetitive and exhausting content creation work that keeps creators and professionals away from the creative, judgment-driven work that truly matters.
            </p>
            <p className="text-gray-200 text-sm leading-relaxed mt-4">
              At <span className="font-semibold text-white">q-re-us-minds</span>, Aman leads research into intelligent tooling that augments never replaces human expertise. The philosophy is simple: <em className="text-gray-300">"Build machines that handle what machines do best, so humans can do what only humans can."</em>
            </p>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['#AI', '#MachineLearning', '#SystemsThinking', '#ProductDesign', '#DevOps', '#Research'].map((tag) => (
                <span key={tag} className="text-[#0A66C2] text-sm hover:text-[#70B5F9] cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Engagement Bar */}
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7 11l-4-4 1.5-1.5L7 8l4.5-4.5L13 5l-6 6z"/>
                  </svg>
                </div>
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1.5l2.5 5h5l-4 3.5 1.5 5.5-5-3.5-5 3.5 1.5-5.5-4-3.5h5z"/>
                  </svg>
                </div>
              </div>
              <span className="text-gray-400 text-sm ml-2">1,248</span>
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <span>142 comments</span>
              <span>88 reposts</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ThumbsUp className="w-5 h-5" />
              <span className="text-sm font-medium">Like</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Comment</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <Repeat className="w-5 h-5" />
              <span className="text-sm font-medium">Repost</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <Send className="w-5 h-5" />
              <span className="text-sm font-medium">Send</span>
            </button>
          </div>
        </motion.div>

        {/* Built with pride badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Badge className="bg-white/5 text-gray-400 border border-white/10">
            A Q-RE-US-MINDS INNOVATION • BUILT WITH PRIDE IN SAHARSA, BIHAR
            <span className="text-red-500 mx-1">♥</span>
          </Badge>
        </motion.div>
      </div>
    </section>
  );
}
