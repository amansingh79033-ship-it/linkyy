import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  Layers, 
  Zap, 
  Linkedin, 
  Loader2, 
  LayoutTemplate,
  Sparkles,
  Clock,
  Link as LinkIcon
} from 'lucide-react';
import { generateLinkedInPost, generateLinkedInCarousel } from './services/geminiService';
import { getHistory, addToHistory, clearHistory } from './services/storageService';
import { initSessionTracking, endSessionTracking, recordUserActivity } from './services/analyticsService';
import { GeneratedContent, ContentType } from './types';
import PostPreview from './components/PostPreview';
import CarouselPreview from './components/CarouselPreview';
import HistorySidebar from './components/HistorySidebar';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import LinkPreview from './components/LinkPreview';
import AuthModal from './components/AuthModal';
import { Shield, X, CheckCircle, ExternalLink, AlertCircle, Lock, BellRing, Settings, User } from 'lucide-react';
import { getLinkedInAuthUrl } from './services/linkedinConfig';
import { exchangeCodeForToken, getMemberUrn, pushToLinkedInRecord } from './services/linkedinService';
import { updateUserTone } from './services/authService';

const App = () => {
  // View State: 'landing' | 'workspace' | 'admin-login' | 'admin-dashboard'
  const [view, setView] = useState<'landing' | 'workspace' | 'admin-login' | 'admin-dashboard'>(() => {
    // Check for persistent admin session on initial load
    if (typeof window !== 'undefined' && localStorage.getItem('admin_authenticated') === 'true') {
      return 'admin-dashboard';
    }
    // If already has a workroom/login session, go straight to workspace
    if (typeof window !== 'undefined' && localStorage.getItem('linky_workroom_name')) {
      return 'workspace';
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<ContentType>(ContentType.POST);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional but provocative');
  const [slideCount, setSlideCount] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Link Preview State
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  
  // Security State
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [newCodename, setNewCodename] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [lnkdToken, setLnkdToken] = useState<string | null>(localStorage.getItem('linky_lnkd_token'));
  const [memberUrn, setMemberUrn] = useState<string | null>(localStorage.getItem('linky_member_urn'));
  const [isToneUpdating, setIsToneUpdating] = useState(false);

  // Global Admin Overrides
  const [isFrozen, setIsFrozen] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [codename, setCodename] = useState<string | null>(localStorage.getItem('linky_workroom_name'));
  
  // Navigation scroll state for notch effect
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    
    const savedTone = localStorage.getItem('linky_tone');
    if (savedTone) setTone(savedTone);

    // Handle LinkedIn OAuth Callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !lnkdToken) {
      const handleAuth = async () => {
        setPushStatus("Finalizing LinkedIn connection...");
        try {
          const authData = await exchangeCodeForToken(code);
          const token = authData.access_token;
          const urn = await getMemberUrn(token);
          
          localStorage.setItem('linky_lnkd_token', token);
          localStorage.setItem('linky_member_urn', urn);
          setLnkdToken(token);
          setMemberUrn(urn);
          setPushStatus("Successfully connected to LinkedIn!");
          
          // Clear query params from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => setPushStatus(null), 3000);
        } catch (err) {
          console.error(err);
          setError("Failed to connect with LinkedIn. Please check your credentials.");
          setPushStatus(null);
        }
      };
      handleAuth();
    }

    // Scroll listener for notch navigation effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Poll for admin remote commands / messages
  useEffect(() => {
    if (view !== 'workspace') return;
    const codename = localStorage.getItem('linky_workroom_name');
    if (!codename) return;

    let seenMessages = new Set<number>();

    const pollAdminInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin-messages?codename=${encodeURIComponent(codename)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.frozen !== isFrozen) {
            setIsFrozen(data.frozen);
          }
          
          if (data.messages && data.messages.length > 0) {
            const latestMsg = data.messages[0];
            if (!seenMessages.has(latestMsg.id)) {
              seenMessages.add(latestMsg.id);
              setGlobalMessage(latestMsg.message_text);
              setTimeout(() => setGlobalMessage(null), 5000); // Admin message duration
            }
          }
        }
      } catch (err) { }
    }, 3000);

    return () => clearInterval(pollAdminInterval);
  }, [view, isFrozen]);

  const handleGenerate = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    setError(null);
    setContent(null);

    try {
      let result;
      if (activeTab === ContentType.POST) {
        result = await generateLinkedInPost(topic, tone);
      } else {
        result = await generateLinkedInCarousel(topic, slideCount);
      }
      setContent(result);
      addToHistory(result);
      setHistory(getHistory()); // Refresh history
      
      // Record analytics
      const codename = localStorage.getItem('linky_workroom_name') || 'anonymous';
      recordUserActivity(
        codename, 
        activeTab === ContentType.POST ? 'generate_post' : 'generate_carousel',
        result.dwellScore
      );
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate content. Please try again or check your API key.");
      
      // Record error
      const codename = localStorage.getItem('linky_workroom_name') || 'anonymous';
      recordUserActivity(codename, 'generate_error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistory = (item: GeneratedContent) => {
    setContent(item);
    setActiveTab(item.type);
    if (item.type === ContentType.CAROUSEL && item.slides) {
        setSlideCount(item.slides.length);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleToneToggle = async (newTone: string) => {
    setTone(newTone);
    const codename = localStorage.getItem('linky_workroom_name');
    if (codename) {
      setIsToneUpdating(true);
      await updateUserTone(codename, newTone);
      setIsToneUpdating(false);
    }
  };

  const handleChangeSecurity = () => {
    if (newCodename.trim() && newPasscode.length >= 4) {
      localStorage.setItem('linky_workroom_name', newCodename);
      localStorage.setItem('linky_passcode', newPasscode);
      setSecuritySuccess(true);
      setTimeout(() => {
        setSecuritySuccess(false);
        setIsSecurityOpen(false);
      }, 2000);
    }
  };

  // Detect URL in topic text and show preview
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = topic.match(urlRegex);
    
    if (match && match.length > 0) {
      const firstUrl = match[0];
      // Only update if URL changed
      if (firstUrl !== previewUrl) {
        setPreviewUrl(firstUrl);
        setShowLinkPreview(true);
      }
    } else {
      setShowLinkPreview(false);
      setPreviewUrl('');
    }
  }, [topic]);

  const handlePushToLinkedIn = async () => {
    if (!content) return;

    if (!lnkdToken || !memberUrn) {
      setPushStatus("Redirecting to LinkedIn for authorization...");
      window.location.href = getLinkedInAuthUrl();
      return;
    }

    setIsPushing(true);
    setPushStatus("Preparing your post...");
    
    try {
      await pushToLinkedInRecord(lnkdToken, memberUrn, content);
      setPushStatus("Success! Your content is live on LinkedIn.");
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('expired') || err.message.includes('401')) {
        setPushStatus("Session expired. Reconnecting...");
        localStorage.removeItem('linky_lnkd_token');
        setLnkdToken(null);
        window.location.href = getLinkedInAuthUrl();
      } else {
        setPushStatus(`Post failed: ${err.message}`);
      }
    } finally {
      setIsPushing(false);
      setTimeout(() => setPushStatus(null), 5000);
    }
  };

  // If view is landing, show landing page
  if (view === 'landing') {
    return (
      <>
        <LandingPage onLaunch={() => setIsAuthModalOpen(true)} onAdminAccess={() => setView('admin-login')} />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onAuthSuccess={(name) => {
            setCodename(name);
            setView('workspace'); // Directly enter app after auth
          }} 
        />
      </>
    );
  }

  // Account Frozen Override Screen
  if (isFrozen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-inter">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Locked</h2>
          <p className="text-neutral-400 mb-6">
            Access to Linkyy has been frozen by an Administrator. Contact support for investigation.
          </p>
          <button onClick={() => setView('landing')} className="text-sm text-sky-400 hover:text-sky-300">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // If view is admin login, show admin login page
  if (view === 'admin-login') {
    return (
      <AdminLogin 
        onLoginSuccess={() => setView('admin-dashboard')} 
        onBack={() => setView('landing')} 
      />
    );
  }

  // If view is admin dashboard, show admin dashboard
  if (view === 'admin-dashboard') {
    return (
      <AdminDashboard 
        onLogout={() => {
          // End session tracking
          const codename = localStorage.getItem('linky_workroom_name') || 'admin';
          endSessionTracking(codename);
          localStorage.removeItem('admin_authenticated');
          setView('landing');
        }} 
      />
    );
  }

  // Otherwise show the Workspace (Existing App Logic) - Mobile Optimized
  return (
    <div className="min-h-screen bg-black text-neutral-100 selection:bg-neutral-800 selection:text-white relative font-inter">
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
      />

      {/* Navigation (Workspace Mode) - iPhone Notch Style */}
      <nav className={`relative border-b border-sky-500/20 bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-50 safe-area-top notch-nav thin-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" 
              onClick={() => setView('landing')}
            >
              <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-1.5 sm:p-2 rounded-lg shadow-lg shadow-sky-500/30">
                 <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                  Linkyy
                </span>
                <span className="text-[8px] sm:text-[10px] font-medium text-sky-400/60 tracking-wider uppercase mt-0.5">
                  A q-re-us-minds Dev
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => {
                  setNewCodename(localStorage.getItem('linky_workroom_name') || '');
                  setNewPasscode(localStorage.getItem('linky_passcode') || '');
                  setIsSecurityOpen(true);
                }}
                className="text-neutral-400 hover:text-sky-400 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-sky-400/10 touch-target"
                title="Security Settings"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="text-neutral-400 hover:text-sky-400 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-sky-400/10 touch-target"
                title="History"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={() => setView('landing')}
                className="hidden xs:inline text-xs sm:text-sm text-neutral-400 hover:text-sky-400 touch-target"
              >
                Home
              </button>
              <div className="flex flex-col items-center">
                {codename ? (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white border border-sky-400/30 shadow-lg shadow-sky-500/20 mb-1">
                    {codename.slice(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-sky-400 transition-colors"
                  >
                    JOIN
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* iPhone Notch - Tone Toggle Integrated */}
        <div className="notch-island flex items-center justify-center px-4">
           {/* Minimalist Tone Toggle */}
           <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/5 space-x-1">
              {['Professional', 'Vulnerable', 'Hot Take', 'Analytical'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleToneToggle(t)}
                  className={`px-3 py-1 rounded-full text-[8px] font-black transition-all ${tone.includes(t) ? 'bg-sky-400 text-black' : 'text-neutral-500 hover:text-white'}`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
           </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 tracking-tight px-2">
            Master the <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">Dwell Time</span> Algorithm
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto px-4">
            Create high-retention LinkedIn posts and carousels in seconds. 
            Engineered to stop the scroll and trigger viral loops.
          </p>
        </div>

        {/* Content Generator Interface - Mobile Optimized */}
        <div className="max-w-4xl mx-auto px-2">
          {/* Tabs */}
          <div className="flex p-1 bg-neutral-900 rounded-xl mb-6 sm:mb-8 border border-neutral-800">
            <button
              onClick={() => { setActiveTab(ContentType.POST); setContent(null); }}
              className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg text-xs sm:text-sm font-medium transition-all touch-target ${
                activeTab === ContentType.POST 
                  ? 'bg-sky-400 text-black shadow-lg shadow-sky-400/20' 
                  : 'text-neutral-400 hover:text-sky-400'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Viral Post</span>
              <span className="xs:hidden">Post</span>
            </button>
            <button
              onClick={() => { setActiveTab(ContentType.CAROUSEL); setContent(null); }}
              className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg text-xs sm:text-sm font-medium transition-all touch-target ${
                activeTab === ContentType.CAROUSEL 
                  ? 'bg-sky-400 text-black shadow-lg shadow-sky-400/20' 
                  : 'text-neutral-400 hover:text-sky-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Carousel Deck</span>
              <span className="xs:hidden">Carousel</span>
            </button>
          </div>

          {/* Input Form - Mobile Optimized */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                What do you want to post about?
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 3 mistakes Junior Developers make when learning React... or paste a link https://example.com/article"
                className="w-full bg-black border border-neutral-700 rounded-xl p-3 sm:p-4 text-white placeholder-neutral-500 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all resize-none h-28 sm:h-32 touch-target"
              />
              {/* Link Preview - Shows when URL detected */}
              {showLinkPreview && previewUrl && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <LinkPreview 
                    url={previewUrl} 
                    onClose={() => {
                      setShowLinkPreview(false);
                      setPreviewUrl('');
                    }}
                    codename={localStorage.getItem('linky_workroom_name') || undefined}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:gap-6">
              {activeTab === ContentType.POST ? (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">Tone & Style</label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-lg p-2.5 sm:p-3 text-white focus:ring-2 focus:ring-white outline-none touch-target"
                  >
                    <option>Professional but provocative</option>
                    <option>Story-driven & Vulnerable</option>
                    <option>Contrarian / Hot Take</option>
                    <option>Analytical & Data-heavy</option>
                    <option>Motivational / Bro-etry</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">Number of Slides</label>
                   <div className="flex items-center space-x-3 sm:space-x-4">
                      <input 
                        type="range" 
                        min="5" 
                        max="15" 
                        value={slideCount} 
                        onChange={(e) => setSlideCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white touch-target"
                      />
                      <span className="text-white font-mono font-bold w-6 sm:w-8 text-sm sm:text-base">{slideCount}</span>
                   </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="flex-[2] bg-white hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-3 sm:py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 group touch-target"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-sm sm:text-base">Curating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm sm:text-base">Generate Content</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePushToLinkedIn}
                disabled={!content || isPushing}
                className="flex-1 bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 group touch-target"
              >
                {isPushing ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="text-sm sm:text-base">PUSH to LNKDN</span>
              </button>
            </div>

            {pushStatus && (
              <div className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2 ${pushStatus.includes('Success') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : (pushStatus.includes('failed') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-sky-500/10 border-sky-500/30 text-sky-400')}`}>
                {pushStatus.includes('Success') ? <CheckCircle className="w-4 h-4" /> : (pushStatus.includes('failed') ? <AlertCircle className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />)}
                <span className="font-medium">{pushStatus}</span>
              </div>
            )}

            {error && (
              <div className="p-3 sm:p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs sm:text-sm text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Section - Mobile Optimized */}
        {content && (
          <div className="mt-12 sm:mt-16 animate-fade-in px-2">
             <div className="flex items-center justify-center mb-6 sm:mb-8 space-x-2">
                <div className="h-px bg-neutral-800 w-full max-w-[100px] sm:max-w-xs"></div>
                <span className="text-neutral-500 text-xs sm:text-sm uppercase tracking-widest font-semibold">Preview</span>
                <div className="h-px bg-neutral-800 w-full max-w-[100px] sm:max-w-xs"></div>
             </div>

             {content.type === ContentType.POST ? (
               <PostPreview content={content} />
             ) : (
               <CarouselPreview content={content} />
             )}
          </div>
        )}

        <SecurityModal 
          isOpen={isSecurityOpen}
          onClose={() => setIsSecurityOpen(false)}
          codename={newCodename}
          passcode={newPasscode}
          setCodename={setNewCodename}
          setPasscode={setNewPasscode}
          onUpdate={handleChangeSecurity}
          isSuccess={securitySuccess}
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onAuthSuccess={(name) => setCodename(name)} 
        />
      </main>
      
      {/* Footer - Mobile Optimized */}
      <footer className="border-t border-sky-500/10 mt-16 sm:mt-20 py-6 sm:py-8 bg-gradient-to-b from-black to-neutral-900">
        <div className="max-w-7xl mx-auto px-4 text-center text-neutral-500 text-xs sm:text-sm">
          <div className="flex justify-center space-x-4 sm:space-x-6 mb-3 sm:mb-4">
             <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 hover:text-sky-400 cursor-pointer transition-colors touch-target" />
             <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5 hover:text-sky-400 cursor-pointer transition-colors touch-target" />
          </div>
          <p className="font-medium">&copy; {new Date().getFullYear()} Linkyy. Made with pride in Bihar 🙏</p>
          <p className="text-[10px] mt-1 text-neutral-600">A q-re-us-minds creation</p>
        </div>
      </footer>

      {/* Real-Time Admin Broadcast Modal */}
      {globalMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 font-inter">
          <div className="bg-[#0a0a0a] border-2 border-sky-500 shadow-[0_0_100px_-20px_rgba(56,189,248,0.5)] rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 pointer-events-auto flex items-start gap-4">
            <div className="w-12 h-12 bg-sky-500/20 rounded-full flex-shrink-0 flex items-center justify-center">
              <BellRing className="w-6 h-6 text-sky-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Incoming Broadcast</h3>
              <p className="text-neutral-300 text-sm">{globalMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SecurityModal = ({ isOpen, onClose, codename, passcode, onUpdate, setCodename, setPasscode, isSuccess }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111] border border-neutral-800 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 bg-sky-400 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-black text-white">Workroom Security</h2>
          <p className="text-neutral-500 text-sm mt-1">Update your private access credentials.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest">New Codename</label>
            <input 
              type="text" 
              value={codename}
              onChange={(e) => setCodename(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-sky-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest">New Passcode</label>
            <input 
              type="password" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
              placeholder="Min 4 digits"
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-sky-400 outline-none transition-all tracking-[0.3em]"
            />
          </div>

          {isSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">Security Updated</span>
            </div>
          ) : (
            <button 
              onClick={onUpdate}
              disabled={!codename.trim() || passcode.length < 4}
              className="w-full py-4 bg-white hover:bg-neutral-200 disabled:opacity-20 text-black font-black rounded-xl transition-all"
            >
              Update Credentials
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;