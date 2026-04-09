import React, { useState, useEffect } from 'react';
import { 
  Zap, ArrowRight, Layers, TrendingUp, Download, ShieldCheck, 
  PenTool, X, Code, Copy, Check, Clock, FileText, Database, Info, Link as LinkIcon,
  Shield
} from 'lucide-react';
import { getHistory } from '../services/storageService';
import { GeneratedContent, ContentType } from '../types';
import CreatorCard from './CreatorCard';

interface LandingPageProps {
  onLaunch: () => void;
  onAdminAccess: () => void;
}

const DWELL_ALGO_CODE = `class DwellTimeAlgorithm {
  calculateScore(userInteraction: SessionData): number {
    const { 
      timeSpentMs, 
      contentLengthMs, 
      didScrollToBottom 
    } = userInteraction;

    // 1. Completion Rate (Weighted 60%)
    const completionRatio = Math.min(timeSpentMs / contentLengthMs, 1.2);
    
    // 2. Velocity Trap (Weighted 20%)
    // Did they stop scrolling to read specific segments?
    const velocityScore = this.analyzeScrollVelocity(userInteraction);

    // 3. Engagement Probability (Weighted 20%)
    const interactionBonus = didScrollToBottom ? 15 : 0;

    return (completionRatio * 60) + (velocityScore * 20) + interactionBonus;
  }
}`;

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onAdminAccess }) => {
  const [activeModal, setActiveModal] = useState<'features' | 'dwell' | 'export' | null>(null);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load history when component mounts for the Export modal
    setHistory(getHistory());

    // Scroll Animation Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(DWELL_ALGO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Modal Content Components ---

  const ModalHeader = ({ title, subtitle, icon: Icon }: any) => (
    <div className="mb-8 border-b border-neutral-800 pb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-sky-400 rounded-lg text-black">
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-sky-400">{title}</h2>
      </div>
      <p className="text-neutral-400 text-lg ml-14">{subtitle}</p>
    </div>
  );

  const DwellTimeModal = () => (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
      <ModalHeader 
        title="The Dwell Time Algorithm" 
        subtitle="Why 'Time Spent' is the only metric that matters in 2024." 
        icon={Clock} 
      />
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
            <h3 className="text-xl font-bold mb-3 text-white">What is it?</h3>
            <p className="text-neutral-400 leading-relaxed">
              Platforms no longer prioritize likes or shares primarily. They prioritize 
              <span className="text-white font-semibold"> retention</span>. 
              The longer a user lingers on your post (reading, swiping, or re-reading), 
              the wider the distribution.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Used By Giants</h3>
            <div className="grid grid-cols-2 gap-4">
              {['LinkedIn', 'TikTok', 'Instagram', 'Twitter / X'].map(platform => (
                <div key={platform} className="flex items-center gap-2 text-white p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   {platform}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-neutral-700 to-neutral-900 rounded-xl blur opacity-25"></div>
           <div className="relative bg-[#0d1117] rounded-xl border border-neutral-800 p-4 font-mono text-xs md:text-sm text-neutral-300 overflow-hidden">
              <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                <span className="text-neutral-500">algorithm.ts</span>
                <button 
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto">
                <code className="language-typescript text-blue-300">
                  {DWELL_ALGO_CODE}
                </code>
              </pre>
           </div>
        </div>
      </div>
    </div>
  );

  const FeaturesModal = () => (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
      <ModalHeader 
        title="Platform Features" 
        subtitle="A suite of tools designed to hack attention spans." 
        icon={Zap} 
      />
      
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: PenTool, title: 'Viral Hooks', desc: 'AI generation of "Bro-etry" style openers that force the "See more" click.' },
          { icon: Layers, title: 'Carousel Engine', desc: 'Text-to-Carousel formatting. Auto-paginated, visually balanced slides.' },
          { icon: TrendingUp, title: 'Dwell Score', desc: 'Predictive analytics that rate your content from 0-100 before you publish.' },
          { icon: Download, title: 'Export PDF/PPTX', desc: 'High-res exports ready for LinkedIn upload or further editing in PowerPoint.' },
          { icon: FileText, title: 'Unicode Styling', desc: 'Native support for Bold, Italic, and Script fonts within LinkedIn text.' },
          { icon: ShieldCheck, title: 'Private Workroom', desc: 'Personal secure space with 4-digit passcode protection. Your data stays on your device.' }
        ].map((feature, i) => (
          <div key={i} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-neutral-600 transition-all hover:-translate-y-1">
            <feature.icon className="w-8 h-8 text-white mb-4" />
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const ExportHistoryModal = () => (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
      <ModalHeader 
        title="Export History" 
        subtitle="Track your previously generated viral assets. Data is persisted locally." 
        icon={Database} 
      />

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex justify-between items-center">
            <span className="text-sm font-semibold text-neutral-400">Recent Activity</span>
            <span className="text-xs text-neutral-600 flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" />
               Locally Encrypted
            </span>
        </div>
        
        {history.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-500">
               <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-white font-semibold mb-2">No history found</h3>
            <p className="text-neutral-500 text-sm mb-6">Start generating content to see your export lineage here.</p>
            <button onClick={() => { setActiveModal(null); onLaunch(); }} className="text-sm bg-sky-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-sky-300 transition-colors">
              Create First Post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800 max-h-[400px] overflow-y-auto custom-scrollbar">
            {history.map((item) => (
              <div key={item.id} className="p-4 hover:bg-neutral-800/50 transition-colors group flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === ContentType.POST ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                       {item.type === ContentType.POST ? <FileText className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                    </div>
                    <div>
                       <h4 className="text-sm font-semibold text-white line-clamp-1 max-w-[200px] md:max-w-md">
                          {item.type === ContentType.POST ? item.textRaw?.slice(0, 40) : item.slides?.[0]?.title}
                       </h4>
                       <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="relative group/tooltip">
                    <div className="px-3 py-1 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-neutral-300">
                       Score: {item.dwellScore}
                    </div>
                    {/* Smart Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white text-black p-3 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 text-xs">
                       <div className="font-bold mb-1 flex items-center gap-1">
                         <Info className="w-3 h-3" /> Analysis
                       </div>
                       <p className="leading-tight mb-2">Predicted to perform in top {Math.max(0, 100 - (item.dwellScore || 0))}% of posts.</p>
                       <div className="flex gap-1 flex-wrap">
                          {item.viralTips?.slice(0,1).map(t => <span key={t} className="bg-neutral-100 px-1 rounded">{t.slice(0,20)}...</span>)}
                       </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neutral-900 selection:text-white overflow-hidden font-sans relative">
      
      {/* --- Full Screen Modal Overlay --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl overflow-y-auto">
           <div className="min-h-screen p-6 md:p-12">
              <div className="max-w-6xl mx-auto relative">
                 <button 
                   onClick={() => setActiveModal(null)}
                   className="absolute top-0 right-0 p-2 bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors border border-neutral-800"
                 >
                    <X className="w-6 h-6" />
                 </button>
                 
                 <div className="mt-12">
                    {activeModal === 'dwell' && <DwellTimeModal />}
                    {activeModal === 'features' && <FeaturesModal />}
                    {activeModal === 'export' && <ExportHistoryModal />}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Axio-style Navbar - Mobile Optimized */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-neutral-900 transition-all duration-300 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="bg-sky-400 p-1.5 rounded-lg shadow-lg shadow-sky-400/20">
                <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent leading-none">Linkyy</span>
              <span className="text-[8px] sm:text-[10px] font-medium text-sky-400/60 tracking-wider uppercase mt-0.5">A q-re-us-minds Dev</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-neutral-400">
            <button onClick={() => setActiveModal('features')} className="hover:text-sky-400 transition-colors">Features</button>
            <button onClick={() => setActiveModal('dwell')} className="hover:text-sky-400 transition-colors flex items-center gap-1">
                Dwell Time <span className="px-1.5 py-0.5 bg-sky-900/30 rounded text-[10px] text-sky-400 border border-sky-400/20">New</span>
            </button>
            <button onClick={() => setActiveModal('export')} className="hover:text-sky-400 transition-colors">Export History</button>
            <div className="h-4 w-px bg-neutral-700"></div>
            <button 
              onClick={onAdminAccess}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium transition-colors touch-target"
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onAdminAccess}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium transition-colors touch-target"
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
            <button 
              onClick={onLaunch}
              className="group flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-sky-400 text-black rounded-full font-semibold text-sm hover:bg-sky-300 transition-colors touch-target"
            >
              <span className="hidden xs:inline">Launch</span>
              <span className="xs:hidden">Go</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - BLACK - Mobile Optimized */}
      <section className="relative pt-24 pb-16 sm:pt-32 md:pt-48 md:pb-32 px-4 sm:px-6 overflow-hidden bg-black">
        {/* Subtle monochrome glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_60%)] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] sm:text-xs font-semibold mb-4 sm:mb-6 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="text-[10px] sm:text-xs">New Gen Algorithm</span>
          </div>
          
          <h1 className="reveal stagger-1 text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 sm:mb-8 leading-[1.1]">
            Architect <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">Viral Growth</span><br />
            on LinkedIn.
          </h1>
          
          <p className="reveal stagger-2 text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Linkyy leverages advanced AI to optimize your content for the Dwell Time algorithm. Create posts and carousels in your <span className="text-sky-400 font-semibold">Private Workroom</span>.
          </p>

          <div className="reveal stagger-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
            <button 
              onClick={onLaunch}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-sky-400 hover:bg-sky-300 text-black rounded-full font-bold text-base sm:text-lg transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] touch-target"
            >
              Start Creating Free
            </button>
            <button 
              onClick={() => setActiveModal('features')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-black hover:bg-neutral-900 border border-neutral-800 hover:border-sky-400/50 hover:text-sky-400 text-white rounded-full font-bold text-base sm:text-lg transition-all touch-target"
            >
              View Features
            </button>
          </div>
        </div>

        {/* Abstract Floating UI Elements - Monochrome */}
        <div className="hidden md:block absolute top-1/3 left-10 w-64 h-80 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 transform -rotate-6 animate-[pulse_6s_ease-in-out_infinite] -z-10">
            <div className="h-4 w-1/3 bg-neutral-800 rounded mb-4"></div>
            <div className="h-2 w-full bg-neutral-800 rounded mb-2"></div>
            <div className="h-2 w-5/6 bg-neutral-800 rounded mb-2"></div>
            <div className="h-2 w-4/6 bg-neutral-800 rounded"></div>
        </div>
        <div className="hidden md:block absolute bottom-10 right-10 w-72 h-64 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 transform rotate-3 -z-10">
             <div className="flex gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-neutral-800"></div>
                <div className="flex-1">
                    <div className="h-3 w-24 bg-neutral-800 rounded mb-1"></div>
                    <div className="h-2 w-16 bg-neutral-800 rounded"></div>
                </div>
             </div>
             <div className="aspect-video bg-neutral-800/50 rounded-lg"></div>
        </div>
      </section>

      {/* Offerings / Features Grid - WHITE (CONTRAST) - Mobile Optimized */}
      <section className="py-16 sm:py-24 bg-white relative border-t border-neutral-200 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="reveal text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-black">Engineered for Engagement</h2>
            <p className="reveal stagger-1 text-neutral-600 text-sm sm:text-base px-4">Everything you need to dominate the LinkedIn feed.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="reveal stagger-1 bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-neutral-200 hover:border-black/20 transition-all duration-300 group hover:shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-200 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-300 text-black">
                <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Viral Hooks</h3>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                AI generates "bro-etry" style hooks and formatting designed to trigger the "See more" click, boosting dwell time instantly.
              </p>
            </div>

            <div className="reveal stagger-2 bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-neutral-200 hover:border-black/20 transition-all duration-300 group hover:shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-200 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-300 text-black">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Carousel Engine</h3>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                Turn a simple topic into a 10-slide visual masterpiece. Auto-formatted with League Spartan typography and brand colors.
              </p>
            </div>

            <div className="reveal stagger-3 bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-neutral-200 hover:border-black/20 transition-all duration-300 group hover:shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-200 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-300 text-black">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Predictive Scoring</h3>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                Get a Dwell Score (0-100) before you post. Our algorithm analyzes readability, structure, and psychological triggers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Section: Carousel - BLACK - Mobile Optimized */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-black text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 sm:gap-12 md:gap-16">
          <div className="flex-1 reveal w-full">
             <div className="inline-block px-3 py-1 rounded-full bg-neutral-900 text-neutral-300 text-[10px] sm:text-xs font-semibold mb-4 sm:mb-6">
                CONTENT ENGINE
             </div>
             <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6">
                Carousels that <span className="text-neutral-400">Convert</span>.
             </h2>
             <p className="text-neutral-400 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                Forget Canva. Describe your topic, and <span className="text-sky-400 font-semibold">Linkyy</span> builds the entire slide deck structure, visual hierarchy, and footer branding.
             </p>
             <ul className="space-y-3 sm:space-y-4">
                {['Automatic Pagination', 'High-contrast Typography', 'Visual Flow Optimization'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 sm:gap-3 text-neutral-300 text-sm sm:text-base">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-400"></div>
                        </div>
                        <span>{item}</span>
                    </li>
                ))}
             </ul>
          </div>
          <div className="flex-1 reveal stagger-1 w-full">
             <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Abstract Carousel Representation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-800 to-black rounded-2xl opacity-20 blur-2xl"></div>
                <div className="relative w-full h-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-8 flex flex-col shadow-2xl">
                    <div className="w-full h-3/4 bg-neutral-800 rounded-lg mb-4 flex items-center justify-center text-neutral-600">
                        <Layers className="w-12 h-12 sm:w-16 sm:h-16 opacity-50" />
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="w-1/3 h-2 bg-neutral-800 rounded"></div>
                        <div className="w-1/4 h-2 bg-neutral-700 rounded"></div>
                    </div>
                </div>
                {/* Floating Card */}
                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-2/3 p-3 sm:p-4 bg-white text-black rounded-xl shadow-xl border border-neutral-200">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                        <span className="font-bold text-xs sm:text-sm">Dwell Score: 98</span>
                    </div>
                    <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full w-[98%] bg-black"></div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Persistence / Trust - BLACK */}
      <section className="py-24 px-6 text-center bg-black text-white border-t border-neutral-900">
         <div className="max-w-3xl mx-auto">
             <ShieldCheck className="w-12 h-12 text-white mx-auto mb-6" />
             <h2 className="reveal text-3xl font-bold mb-4">Your creativity, saved.</h2>
             <p className="reveal stagger-1 text-neutral-400 mb-8">
                 Linkyy automatically persists your generation history locally. Never lose a viral hook or a carousel draft again.
             </p>
             <button onClick={() => setActiveModal('export')} className="reveal stagger-2 text-sky-400 hover:text-sky-300 font-semibold flex items-center justify-center gap-2 mx-auto transition-colors">
                 Check History <ArrowRight className="w-4 h-4" />
             </button>
         </div>
      </section>

      {/* Creator Card Section - BLACK */}
      <section className="bg-black pt-4 pb-12 sm:pb-16 border-t border-neutral-900">
         <div className="max-w-5xl mx-auto">
             <CreatorCard />
         </div>
      </section>

      {/* CTA Footer - WHITE - Mobile Optimized */}
      <footer className="py-12 sm:py-20 px-4 sm:px-6 border-t border-neutral-200 bg-white text-black">
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="reveal text-3xl sm:text-4xl md:text-6xl font-bold mb-6 sm:mb-8">
                Ready to go <span className="text-neutral-400">Viral</span>?
            </h2>
            <p className="reveal stagger-1 text-lg sm:text-xl text-neutral-500 mb-8 sm:mb-10 px-4">
                Join thousands of creators mastering the algorithm today.
            </p>
            <button 
              onClick={onLaunch}
              className="reveal stagger-2 px-8 sm:px-10 py-4 sm:py-5 bg-sky-400 text-black rounded-full font-bold text-lg sm:text-xl hover:bg-sky-300 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(56,189,248,0.3)] touch-target"
            >
              Launch Workspace
            </button>
            <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center text-neutral-500 text-sm gap-4">
                <div className="text-center md:text-left">&copy; 2024 <span className="font-semibold text-sky-400">Linkyy</span> Inc. Made with pride in Bihar 🙏</div>
                <div className="flex gap-4 sm:gap-6">
                    <a href="#" className="hover:text-black transition-colors">Privacy</a>
                    <a href="#" className="hover:text-black transition-colors">Terms</a>
                    <a href="#" className="hover:text-black transition-colors">Twitter</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;