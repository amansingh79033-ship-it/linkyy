import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, TrendingUp, Heart, MessageCircle, Repeat, Send, Edit2, Save, Bold, Italic, MoreHorizontal, Globe, Underline, Strikethrough, Terminal, FileCode, ThumbsUp, Undo, Redo, Hash, Palette } from 'lucide-react';
import { GeneratedContent } from '../types';

// Unicode mappings for LinkedIn styling
const toBold = (str: string) => {
  const boldMap: { [key: string]: string } = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
  };
  return str.split('').map(char => boldMap[char] || char).join('');
};

const toItalic = (str: string) => {
  const italicMap: { [key: string]: string } = {
    'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏', 'I': '𝘐', 'J': '𝘑', 'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙', 'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟', 'Y': '𝘠', 'Z': '𝘡',
    'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩', 'i': '𝘪', 'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳', 's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻'
  };
  return str.split('').map(char => italicMap[char] || char).join('');
};

const toScript = (str: string) => {
    const map: { [key: string]: string } = {
        'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': 'ℰ', 'F': 'ℱ', 'G': '𝒢', 'H': 'ℋ', 'I': 'ℐ', 'J': '𝒥', 'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': 'ℛ', 'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵',
        'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': 'ℯ', 'f': '𝒻', 'g': 'ℊ', 'h': '𝒽', 'i': '𝒾', 'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': 'ℴ', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇', 's': '𝓈', 't': '𝓉', 'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏'
    };
    return str.split('').map(char => map[char] || char).join('');
};

const toMonospace = (str: string) => {
    const map: { [key: string]: string } = {
        'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
        'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝘧', 'g': '𝚐', 'h': '𝚑', 'i': '𝘪', 'j': '𝚓', 'k': '𝘬', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚀', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣',
        '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
    };
    return str.split('').map(char => map[char] || char).join('');
};

const toUnderline = (str: string) => {
    return str.split('').map(char => char + '\u0332').join('');
};

const toStrikethrough = (str: string) => {
    return str.split('').map(char => char + '\u0336').join('');
};

const PREVIEW_THEMES = [
  { id: 'light', name: 'Light Mode', bg: '#ffffff', text: '#000000', border: '#e5e7eb' },
  { id: 'dark', name: 'Dark Mode', bg: '#1b1f23', text: '#ffffff', border: '#333333' },
  { id: 'navy', name: 'Navy Pro', bg: '#0f172a', text: '#e2e8f0', border: '#1e293b' },
  { id: 'cream', name: 'Warm Paper', bg: '#fdfbf7', text: '#292524', border: '#e7e5e4' },
];

interface PostPreviewProps {
  content: GeneratedContent;
}

const PostPreview: React.FC<PostPreviewProps> = ({ content }) => {
  const [text, setText] = useState(content.textRaw || '');
  const [history, setHistory] = useState<string[]>([content.textRaw || '']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [activeTheme, setActiveTheme] = useState(PREVIEW_THEMES[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Interaction states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1248);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(14);
  const [commented, setCommented] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Reset if content changes completely
    if (content.textRaw && content.textRaw !== history[0] && !isEditing) {
        setText(content.textRaw);
        setHistory([content.textRaw]);
        setHistoryIndex(0);
    }
  }, [content.textRaw, content.id]);

  const updateText = (newText: string) => {
    setText(newText);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setText(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setText(history[nextIndex]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLike = () => {
      if (liked) {
          setLiked(false);
          setLikeCount(prev => prev - 1);
      } else {
          setLiked(true);
          setLikeCount(prev => prev + 1);
      }
  };

  const toggleRepost = () => {
      if (reposted) {
          setReposted(false);
          setRepostCount(prev => prev - 1);
      } else {
          setReposted(true);
          setRepostCount(prev => prev + 1);
      }
  }

  const applyFormat = (type: 'bold' | 'italic' | 'underline' | 'strike' | 'mono' | 'script') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = text.substring(start, end);
    
    if (!selectedText) return;

    let formattedText = selectedText;
    switch(type) {
        case 'bold': formattedText = toBold(selectedText); break;
        case 'italic': formattedText = toItalic(selectedText); break;
        case 'underline': formattedText = toUnderline(selectedText); break;
        case 'strike': formattedText = toStrikethrough(selectedText); break;
        case 'mono': formattedText = toMonospace(selectedText); break;
        case 'script': formattedText = toScript(selectedText); break;
    }
    
    const newText = text.substring(0, start) + formattedText + text.substring(end);
    
    updateText(newText);
    setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  // Preview logic for "See more"
  const previewText = isExpanded ? text : text.slice(0, 210);
  const showSeeMore = text.length > 210 && !isExpanded;

  return (
    <div className="w-full max-w-[555px] mx-auto space-y-4 sm:space-y-6 px-2"> {/* 555px is typical feed width */}
      
      {/* Stats Header & Theme Selector - Mobile Optimized */}
      <div className="bg-neutral-900 rounded-xl p-3 sm:p-4 border border-neutral-800 flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 text-white">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-base sm:text-lg">Dwell Score: {content.dwellScore}/100</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <div className="relative">
                 <button 
                    onClick={() => setShowThemeSelector(!showThemeSelector)} 
                    className={`text-xs sm:text-sm bg-neutral-800 hover:bg-sky-400/20 hover:text-sky-400 px-2.5 sm:px-3 py-1 rounded-lg flex items-center space-x-1.5 sm:space-x-2 transition text-neutral-200 touch-target ${showThemeSelector ? 'ring-2 ring-sky-400' : ''}`}
                    title="Change Preview Theme"
                 >
                    <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Theme</span>
                 </button>
                 {showThemeSelector && (
                    <div className="absolute right-0 top-full mt-1 sm:mt-2 bg-neutral-800 border border-neutral-700 rounded-xl p-2 shadow-xl z-20 w-40 sm:w-48 grid grid-cols-1 gap-1">
                        {PREVIEW_THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => { setActiveTheme(theme); setShowThemeSelector(false); }}
                                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-neutral-700 transition text-left touch-target"
                            >
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-neutral-600" style={{ backgroundColor: theme.bg }}></div>
                                <span className="text-xs sm:text-sm text-white">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                 )}
              </div>
              {!isEditing ? (
                   <button onClick={() => setIsEditing(true)} className="text-xs sm:text-sm bg-neutral-800 hover:bg-sky-400/20 hover:text-sky-400 px-2.5 sm:px-3 py-1 rounded-lg flex items-center space-x-1.5 sm:space-x-2 transition text-neutral-200 touch-target">
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Edit</span>
                   </button>
              ) : (
                  <button onClick={() => setIsEditing(false)} className="text-xs sm:text-sm bg-sky-400 hover:bg-sky-300 text-black px-2.5 sm:px-3 py-1 rounded-lg flex items-center space-x-1.5 sm:space-x-2 transition touch-target">
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Done</span>
                   </button>
              )}
              <button onClick={handleCopy} className="text-xs sm:text-sm bg-neutral-800 hover:bg-sky-400/20 hover:text-sky-400 text-white border border-neutral-700 px-2.5 sm:px-3 py-1 rounded-lg flex items-center space-x-1.5 sm:space-x-2 transition touch-target">
                  {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
          </div>
        </div>
      </div>

      {/* LinkedIn Post Container - Mobile Optimized */}
      <div 
        className="rounded-lg border shadow-sm overflow-hidden font-[-apple-system,system-ui,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue','Fira_Sans','Ubuntu','Oxygen','Oxygen_Sans','Cantarell','Droid_Sans','Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol','Lucida_Grande',Helvetica,Arial,sans-serif] transition-colors duration-300"
        style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border, color: activeTheme.text }}
      >
        
        {/* User Header */}
        <div className="p-2.5 sm:p-3 pb-2 flex space-x-2.5 sm:space-x-3">
             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Linkyy" alt="User" className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 min-w-0">
                 <div className="flex items-center justify-between">
                     <h3 className="font-semibold text-sm truncate" style={{ color: activeTheme.id === 'dark' || activeTheme.id === 'navy' ? '#fff' : '#111' }}>Linkyy Creator</h3>
                     <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 opacity-60 cursor-pointer" />
                 </div>
                 <p className="text-xs opacity-60 truncate">Viral Content Architect | 100M+ Views</p>
                 <div className="flex items-center text-xs opacity-60 space-x-1">
                     <span>1h</span>
                     <span className="text-[10px]">•</span>
                     <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                 </div>
             </div>
        </div>

        {/* Content Body - Mobile Optimized */}
        <div className="px-3 sm:px-4 py-2">
            {isEditing ? (
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 pb-2 border-b post-preview-toolbar" style={{ borderColor: activeTheme.border }}>
                        <span className="text-[10px] sm:text-xs opacity-60 uppercase tracking-wider font-bold mr-1.5">Style:</span>
                        <button onClick={() => applyFormat('bold')} className="p-1 hover:bg-sky-400/10 hover:text-sky-400 transition-colors rounded touch-target" title="Bold">
                            <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button onClick={() => applyFormat('italic')} className="p-1 hover:bg-sky-400/10 hover:text-sky-400 transition-colors rounded touch-target" title="Italic">
                            <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button onClick={() => applyFormat('underline')} className="p-1 hover:bg-sky-400/10 hover:text-sky-400 transition-colors rounded touch-target" title="Underline">
                            <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button onClick={() => applyFormat('strike')} className="p-1 hover:bg-sky-400/10 hover:text-sky-400 transition-colors rounded touch-target" title="Strikethrough">
                            <Strikethrough className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <div className="w-px h-3 sm:h-4 mx-1 opacity-20 bg-current"></div>
                        <button onClick={() => applyFormat('mono')} className="p-1 hover:bg-sky-400/10 hover:text-sky-400 transition-colors rounded touch-target" title="Monospace">
                            <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                         <button onClick={() => applyFormat('script')} className="p-1 hover:bg-sky-400/10 hover:text-sky-400 transition-colors rounded touch-target" title="Script">
                            <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <div className="w-px h-3 sm:h-4 mx-1 opacity-20 bg-current"></div>
                        <button 
                            onClick={handleUndo} 
                            disabled={historyIndex <= 0}
                            className="p-1 hover:bg-sky-400/10 hover:text-sky-400 transition-colors rounded disabled:opacity-30 disabled:hover:bg-transparent touch-target" 
                            title="Undo"
                        >
                            <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                            onClick={handleRedo} 
                            disabled={historyIndex >= history.length - 1}
                            className="p-1 hover:bg-sky-400/10 hover:text-sky-400 transition-colors rounded disabled:opacity-30 disabled:hover:bg-transparent touch-target" 
                            title="Redo"
                        >
                            <Redo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                    <textarea 
                        ref={textareaRef}
                        value={text} 
                        onChange={(e) => updateText(e.target.value)}
                        className="w-full h-48 sm:h-64 p-2 text-xs sm:text-sm focus:outline-none resize-none font-sans bg-transparent placeholder-opacity-50 touch-target post-preview-textarea"
                        style={{ color: activeTheme.text }}
                        placeholder="Write your viral post..."
                    />
                </div>
            ) : (
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words" dir="ltr">
                    {previewText}
                    {showSeeMore && (
                        <button 
                            onClick={() => setIsExpanded(true)}
                            className="hover:text-blue-500 hover:underline ml-1 font-medium bg-transparent opacity-60 hover:opacity-100 touch-target"
                        >
                            ...see more
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* Engagement Stats - Mobile Optimized */}
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between border-b mt-2" style={{ borderColor: activeTheme.border }}>
            <div className="flex items-center space-x-1">
                 {likeCount > 0 && (
                     <div className="flex -space-x-1">
                         <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-500 flex items-center justify-center ring-2" style={{ '--tw-ring-color': activeTheme.bg } as React.CSSProperties}>
                            <ThumbsUp className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white fill-current" />
                         </div>
                         <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 flex items-center justify-center ring-2" style={{ '--tw-ring-color': activeTheme.bg } as React.CSSProperties}>
                            <Heart className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white fill-current" />
                         </div>
                         <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-green-500 flex items-center justify-center ring-2" style={{ '--tw-ring-color': activeTheme.bg } as React.CSSProperties}>
                             <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white text-[6px] sm:text-[8px] leading-none">👏</div>
                         </div>
                     </div>
                 )}
                 <span className="text-[10px] sm:text-xs opacity-60 hover:text-blue-500 hover:underline cursor-pointer">{likeCount.toLocaleString()}</span>
            </div>
            <div className="text-[10px] sm:text-xs opacity-60 space-x-1 sm:space-x-2">
                <span className="hover:text-blue-500 hover:underline cursor-pointer">86 comments</span>
                <span>•</span>
                <span className="hover:text-blue-500 hover:underline cursor-pointer">{repostCount} reposts</span>
            </div>
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="px-1.5 sm:px-2 py-1 flex items-center justify-between">
            <button 
                onClick={toggleLike}
                className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2.5 sm:py-3 hover:bg-sky-400/10 hover:text-sky-400 rounded-lg transition font-semibold text-xs sm:text-sm touch-target ${liked ? 'text-sky-400' : 'opacity-60'}`}
            >
                <ThumbsUp className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="hidden xs:inline">Like</span>
            </button>
            <button 
                onClick={() => setCommented(!commented)}
                className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2.5 sm:py-3 hover:bg-sky-400/10 hover:text-sky-400 rounded-lg transition font-semibold text-xs sm:text-sm touch-target ${commented ? 'text-sky-400' : 'opacity-60'}`}
            >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Comment</span>
            </button>
            <button 
                onClick={toggleRepost}
                className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2.5 sm:py-3 hover:bg-sky-400/10 hover:text-sky-400 rounded-lg transition font-semibold text-xs sm:text-sm touch-target ${reposted ? 'text-emerald-500' : 'opacity-60'}`}
            >
                <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Repost</span>
            </button>
            <button 
                onClick={() => setSent(!sent)}
                className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2.5 sm:py-3 hover:bg-sky-400/10 hover:text-sky-400 rounded-lg transition font-semibold text-xs sm:text-sm touch-target ${sent ? 'text-sky-400' : 'opacity-60'}`}
            >
                <Send className={`w-4 h-4 sm:w-5 sm:h-5 ${sent ? 'fill-current' : ''}`} />
                <span className="hidden xs:inline">Send</span>
            </button>
        </div>
      </div>

      {/* Hashtag Suggestions - Mobile Optimized */}
      {content.hashtags && content.hashtags.length > 0 && (
          <div className="bg-neutral-900/50 p-3 sm:p-4 rounded-lg border border-neutral-800 animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 text-white">
                      <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                      <h4 className="font-medium text-sm">Suggested Hashtags</h4>
                  </div>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(content.hashtags?.join(' ') || '');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-[10px] sm:text-xs text-neutral-400 hover:text-white transition-colors touch-target"
                  >
                      {copied ? 'Copied!' : 'Copy All'}
                  </button>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {content.hashtags.map((tag, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                            navigator.clipboard.writeText(tag);
                            // Flash effect could go here
                        }}
                        className="px-2.5 sm:px-3 py-1 bg-neutral-800 hover:bg-sky-400/20 text-neutral-300 hover:text-sky-400 border border-neutral-700 hover:border-sky-400/50 rounded-full text-[10px] sm:text-xs transition-all active:scale-95 touch-target"
                      >
                          {tag}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Viral Tips Footer - Mobile Optimized */}
      <div className="bg-neutral-900/50 p-3 sm:p-4 rounded-lg border border-neutral-800">
        <h4 className="text-white font-medium mb-2 text-xs sm:text-sm uppercase tracking-wider">Analysis</h4>
        <ul className="space-y-1.5 sm:space-y-2">
            {content.viralTips?.map((tip, idx) => (
                <li key={idx} className="flex items-start space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-neutral-300">
                    <span className="text-white mt-0.5">•</span>
                    <span>{tip}</span>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default PostPreview;