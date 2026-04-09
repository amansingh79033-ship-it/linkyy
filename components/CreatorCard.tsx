import React, { useState } from 'react';
import { Globe, Heart, MessageCircle, Share2, Send, ThumbsUp } from 'lucide-react';

const ProfileImage = () => (
  <div className="min-w-[48px] w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
    <span className="text-white font-bold text-lg">AK</span>
  </div>
);

const CreatorCard = () => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 mt-8 mb-8 sm:mt-12 sm:mb-12">
      {/* LinkedIn Post Style Card */}
      <div className="bg-[#1b1f23] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden transition-all hover:border-neutral-700">
        
        {/* Header */}
        <div className="p-4 sm:p-5 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <ProfileImage />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-white font-semibold text-base leading-none hover:text-blue-400 hover:underline cursor-pointer">Aman Kumar Singh</h3>
                  <span className="text-neutral-500 text-sm leading-none">• 1st</span>
                </div>
                <p className="text-neutral-400 text-xs sm:text-sm mt-1 leading-snug">
                  Head of Research & Innovation • Q-re-us-minds Pvt Ltd <br />
                  Creator & Architect
                </p>
                <div className="flex items-center gap-1 text-neutral-500 text-xs mt-1">
                  <span>1h</span>
                  <span>•</span>
                  <Globe className="w-3 h-3" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="https://www.linkedin.com/company/9curiousminds/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 font-semibold text-[15px] hover:bg-blue-400/10 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 no-underline"
              >
                <span className="text-xl leading-none font-medium mb-0.5">+</span> Follow
              </a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-5 pb-4">
          <div className="text-neutral-200 text-[15px] leading-relaxed space-y-4">
            <p>
              With a singular focus: giving humans back their most valuable resource, time. We have built <strong className="text-white">Linkyy</strong> to eliminate the repetitive and exhausting content creation work that keeps creators and professionals away from the creative, judgment-driven work that truly matters.
            </p>
            <p>
              At <strong className="text-white">q-re-us-minds</strong>, Aman leads research into intelligent tooling that augments never replaces human expertise. The philosophy is simple: <em className="text-neutral-300">"Build machines that handle what machines do best, so humans can do what only humans can."</em>
            </p>
            <p className="text-blue-400 break-words pt-1 font-medium">
              <span className="hover:underline cursor-pointer">#AI</span>{' '}
              <span className="hover:underline cursor-pointer">#MachineLearning</span>{' '}
              <span className="hover:underline cursor-pointer">#SystemsThinking</span>{' '}
              <span className="hover:underline cursor-pointer">#ProductDesign</span>{' '}
              <span className="hover:underline cursor-pointer">#DevOps</span>{' '}
              <span className="hover:underline cursor-pointer">#Research</span>
            </p>
          </div>
        </div>

        {/* Custom Footer inside the post to match the requested design */}
        <div className="px-4 py-3 bg-neutral-900/50 border-y border-neutral-800 text-center flex flex-col items-center justify-center gap-1.5">
          <p className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold flex items-center justify-center flex-wrap gap-2">
            <span>A Q-Re-Us-Minds Innovation</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-neutral-600"></span>
            <span className="flex items-center gap-1">
              Built with pride in Saharsa, Bihar <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            </span>
          </p>
        </div>

        {/* Engagement Stats mini-bar */}
        <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-neutral-500 text-xs">
           <div className="flex items-center gap-1">
             <div className="flex items-center">
               <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center z-10 border border-[#1b1f23]">
                 <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
               </span>
               <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center -ml-1 border border-[#1b1f23] p-0.5">
                  <Heart className="w-2.5 h-2.5 text-white fill-white" />
               </span>
             </div>
             <span className="ml-1 hover:text-blue-400 hover:underline cursor-pointer">1,248</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="hover:text-blue-400 hover:underline cursor-pointer">142 comments</span>
             <span className="hover:text-blue-400 hover:underline cursor-pointer">88 reposts</span>
           </div>
        </div>

        {/* LinkedIn Engagement Actions Bar */}
        <div className="px-2 sm:px-4 py-1.5 flex justify-between items-center pb-2">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`flex-1 flex items-center justify-center gap-2 px-2 py-3 sm:py-2.5 rounded-lg transition-all text-sm font-semibold 
              ${isLiked ? 'text-blue-400 hover:bg-blue-400/10' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'}`}
          >
            <ThumbsUp className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] ${isLiked ? 'fill-blue-400' : ''}`} />
            <span className="">Like</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 px-2 py-3 sm:py-2.5 rounded-lg transition-all text-sm font-semibold">
            <MessageCircle className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            <span className="">Comment</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 px-2 py-3 sm:py-2.5 rounded-lg transition-all text-sm font-semibold">
            <Share2 className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            <span className="">Repost</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 px-2 py-3 sm:py-2.5 rounded-lg transition-all text-sm font-semibold">
            <Send className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            <span className="">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
