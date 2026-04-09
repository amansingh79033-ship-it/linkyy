import React, { useState, useEffect } from 'react';
import { GeneratedContent, CarouselSlide } from '../types';
import { ChevronRight, ChevronLeft, TrendingUp, Maximize2, MoreHorizontal, Globe, FileType, Loader2, Download, Type, Palette, Check, Upload, User, Circle, Square } from 'lucide-react';
import pptxgen from "pptxgenjs";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CarouselPreviewProps {
  content: GeneratedContent;
}

const FONTS = ['Inter', 'Lato', 'League Spartan', 'Montserrat', 'Playfair Display', 'Roboto'];

// --- THEME GENERATOR FOR 500+ VARIATIONS ---
const BASE_COLORS = [
    { name: 'Midnight', bg: '#0f172a', text: '#f8fafc', accent: '#38bdf8' },
    { name: 'Charcoal', bg: '#18181b', text: '#f4f4f5', accent: '#f59e0b' },
    { name: 'Forest', bg: '#052e16', text: '#f0fdf4', accent: '#4ade80' },
    { name: 'Navy', bg: '#172554', text: '#eff6ff', accent: '#60a5fa' },
    { name: 'Eggplant', bg: '#2e1065', text: '#faf5ff', accent: '#a855f7' },
    { name: 'Burgundy', bg: '#450a0a', text: '#fff1f2', accent: '#fb7185' },
    { name: 'Coffee', bg: '#271c19', text: '#f5f5f4', accent: '#d6d3d1' },
    { name: 'Slate', bg: '#020617', text: '#f8fafc', accent: '#94a3b8' },
    { name: 'Paper', bg: '#fdfbf7', text: '#292524', accent: '#ea580c' },
    { name: 'Mint', bg: '#f0fdfa', text: '#134e4a', accent: '#2dd4bf' },
    { name: 'Lavender', bg: '#fbf7ff', text: '#4c1d95', accent: '#8b5cf6' },
    { name: 'Minimal', bg: '#ffffff', text: '#000000', accent: '#000000' },
    { name: 'High-Vis', bg: '#ffff00', text: '#000000', accent: '#000000' },
    { name: 'Sunset', bg: '#4c0519', text: '#fff1f2', accent: '#fbbf24' },
    { name: 'Ocean', bg: '#083344', text: '#ecfeff', accent: '#22d3ee' },
];

const ACCENT_VARIATIONS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e', '#ffffff', '#000000'];

interface Theme {
    id: string;
    name: string;
    bgColor: string;
    textColor: string;
    accentColor: string;
    titleFont: string;
    bodyFont: string;
    portraitPosition: 'top-right' | 'bottom-left' | 'bottom-right';
}

const generateThemes = (): Theme[] => {
    let themes: Theme[] = [];
    let count = 0;
    
    BASE_COLORS.forEach((base, i) => {
        ACCENT_VARIATIONS.forEach((acc, j) => {
             // Avoid invisible accents
             if (acc === base.bg) return;
             
             // Distribute portrait positions to be "smart"
             // e.g., Dark themes get top-right often, Light themes might vary
             const positions: ('top-right' | 'bottom-left' | 'bottom-right')[] = ['top-right', 'bottom-left', 'bottom-right'];
             const smartPos = positions[(i + j) % 3];

             // Create variations with different font pairings
             themes.push({
                 id: `theme-${count++}`,
                 name: `${base.name} • ${acc === '#ffffff' ? 'White' : acc === '#000000' ? 'Black' : 'Color'} Pop`,
                 bgColor: base.bg,
                 textColor: base.text,
                 accentColor: acc,
                 titleFont: 'League Spartan',
                 bodyFont: 'Montserrat',
                 portraitPosition: smartPos
             });
             
             themes.push({
                 id: `theme-${count++}`,
                 name: `${base.name} • Serif Elegant`,
                 bgColor: base.bg,
                 textColor: base.text,
                 accentColor: acc,
                 titleFont: 'Playfair Display',
                 bodyFont: 'Lato',
                 portraitPosition: smartPos === 'top-right' ? 'bottom-right' : 'top-right' // Alternate
             });
        });
    });
    return themes;
};

const ALL_THEMES = generateThemes();

const CarouselPreview: React.FC<CarouselPreviewProps> = ({ content }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [slides, setSlides] = useState<CarouselSlide[]>(content.slides || []);
  
  // UI Panels
  const [showTypography, setShowTypography] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Selection State
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [activeThemeData, setActiveThemeData] = useState<Theme | null>(null);

  // Portrait State
  const [portraitImage, setPortraitImage] = useState<string | null>(null);
  const [portraitShape, setPortraitShape] = useState<'circle' | 'square' | 'rounded'>('circle');

  useEffect(() => {
    setSlides(prev => {
        if (content.slides && content.slides.length > 0 && (!prev.length || prev[0].title !== content.slides[0].title)) {
            return content.slides;
        }
        return prev;
    });
  }, [content.id, content.slides]);

  const updateSlideStyle = (index: number, key: keyof CarouselSlide, value: string) => {
      const newSlides = [...slides];
      newSlides[index] = { ...newSlides[index], [key]: value };
      setSlides(newSlides);
  };

  const applyThemeToAll = (theme: Theme) => {
      const newSlides = slides.map(slide => ({
          ...slide,
          bgColor: theme.bgColor,
          textColor: theme.textColor,
          accentColor: theme.accentColor,
          titleFont: theme.titleFont,
          bodyFont: theme.bodyFont
      }));
      setSlides(newSlides);
      setSelectedThemeId(theme.id);
      setActiveThemeData(theme);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortraitImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  const getPortraitStyle = (position?: string) => {
      const base = "absolute z-20 transition-all duration-300 ";
      const shapeClass = portraitShape === 'circle' ? 'rounded-full' : portraitShape === 'rounded' ? 'rounded-xl' : 'rounded-none';
      
      switch (position) {
          case 'top-right': return `${base} top-8 right-8 w-20 h-20 ${shapeClass}`;
          case 'bottom-right': return `${base} bottom-24 right-8 w-16 h-16 ${shapeClass}`;
          case 'bottom-left': return `${base} bottom-24 left-8 w-16 h-16 ${shapeClass}`;
          default: return `${base} top-8 right-8 w-20 h-20 ${shapeClass}`; // Default fallback
      }
  };

  const handleExportPPTX = async () => {
    setIsExporting(true);
    try {
        const pptx = new pptxgen();
        pptx.defineLayout({ name:'LINKEDIN_CAROUSEL', width: 10.8, height: 13.5 });
        pptx.layout = 'LINKEDIN_CAROUSEL';

        slides.forEach((slide) => {
            const slidePage = pptx.addSlide();
            
            // Background
            slidePage.background = { color: slide.bgColor?.replace('#', '') || 'FFFFFF' };

            // Accents
            slidePage.addShape(pptx.ShapeType.rect, { 
                x: 8.8, y: 0, w: 2, h: 2, 
                fill: { color: slide.accentColor?.replace('#', '') || '000000', transparency: 80 } 
            });
            slidePage.addShape(pptx.ShapeType.rect, { 
                x: 0, y: 11.5, w: 2, h: 2, 
                fill: { color: slide.accentColor?.replace('#', '') || '000000', transparency: 80 } 
            });

            // Portrait Image (if exists)
            if (portraitImage) {
                let x = 8.8, y = 0.5, w = 1.5, h = 1.5;
                const pos = activeThemeData?.portraitPosition || 'top-right';
                
                if (pos === 'top-right') { x = 8.8; y = 0.5; }
                else if (pos === 'bottom-right') { x = 8.8; y = 10.5; }
                else if (pos === 'bottom-left') { x = 0.5; y = 10.5; }

                // PPTX doesn't support complex CSS rounded shapes natively on images easily without masking, 
                // so we usually export as square or basic crop. 
                // We'll pass the base64 data.
                slidePage.addImage({ 
                    data: portraitImage, 
                    x, y, w, h, 
                    sizing: { type: "contain", w, h } 
                });
            }

            // Title
            const titleWeight = parseInt(slide.titleWeight || '700');
            slidePage.addText(slide.title, {
                x: 1, y: 1.5, w: '80%', h: 3,
                fontSize: 48,
                fontFace: slide.titleFont || 'Arial',
                bold: titleWeight >= 700,
                color: slide.textColor?.replace('#', '') || '000000',
                valign: 'bottom'
            });

            // Divider
            slidePage.addShape(pptx.ShapeType.rect, {
                x: 1, y: 5, w: 1.5, h: 0.1,
                fill: { color: slide.accentColor?.replace('#', '') || '000000' }
            });

            // Body
            const bodyWeight = parseInt(slide.bodyWeight || '400');
            slidePage.addText(slide.content, {
                x: 1, y: 5.5, w: '80%', h: 5,
                fontSize: 24,
                fontFace: slide.bodyFont || 'Arial',
                bold: bodyWeight >= 700,
                color: slide.textColor?.replace('#', '') || '000000',
                valign: 'top'
            });

            // Footer
            slidePage.addText(slide.footer, {
                x: 1, y: 12.5, w: '50%', h: 0.5,
                fontSize: 14,
                color: slide.textColor?.replace('#', '') || '000000'
            });
        });

        await pptx.writeFile({ fileName: `Linkyy-Carousel-${Date.now()}.pptx` });
    } catch (e) {
        console.error("PPTX Generation Error", e);
        alert("Failed to generate PPTX");
    } finally {
        setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [1080, 1350] 
        });

        const printableArea = document.getElementById('printable-area');
        if (!printableArea) return;

        const originalStyle = printableArea.style.display;
        printableArea.style.display = 'block';
        printableArea.style.position = 'absolute';
        printableArea.style.top = '-9999px';

        const slideElements = printableArea.querySelectorAll('.slide-page');
        
        for (let i = 0; i < slideElements.length; i++) {
            if (i > 0) doc.addPage([1080, 1350]);
            
            const slideContent = slideElements[i].firstElementChild as HTMLElement;
            
            const canvas = await html2canvas(slideContent, {
                scale: 2, 
                useCORS: true,
                backgroundColor: null
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            doc.addImage(imgData, 'JPEG', 0, 0, 1080, 1350);
        }

        printableArea.style.display = originalStyle;
        doc.save(`Linkyy-Carousel-${Date.now()}.pdf`);

    } catch (e) {
        console.error("PDF Generation Error", e);
        alert("Failed to generate PDF");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-2">
       
       {/* Toolbar - Mobile Optimized */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-neutral-900/50 p-3 sm:p-4 rounded-xl border border-neutral-800">
        <div className="flex items-center space-x-2 sm:space-x-3 text-white">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-semibold text-sm sm:text-base">Score: {content.dwellScore}/100</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center export-buttons">
             <button
                onClick={() => { setShowProfile(!showProfile); setShowThemes(false); setShowTypography(false); }}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium touch-target ${showProfile ? 'bg-sky-400 text-black' : 'bg-neutral-800 text-neutral-400 hover:text-sky-400'}`}
                title="Profile & Branding"
            >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Profile</span>
            </button>
             <button
                onClick={() => { setShowThemes(!showThemes); setShowTypography(false); setShowProfile(false); }}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium touch-target ${showThemes ? 'bg-sky-400 text-black' : 'bg-neutral-800 text-neutral-400 hover:text-sky-400'}`}
                title="Theme Library"
            >
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Themes</span>
            </button>
            <button
                onClick={() => { setShowTypography(!showTypography); setShowThemes(false); setShowProfile(false); }}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors text-xs sm:text-sm font-medium touch-target ${showTypography ? 'bg-sky-400 text-black' : 'bg-neutral-800 text-neutral-400 hover:text-sky-400'}`}
                title="Typography Settings"
            >
                <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="w-px h-5 sm:h-6 bg-neutral-700 mx-1.5 sm:mx-2 hidden sm:block"></div>
            <button
                onClick={handleExportPPTX}
                disabled={isExporting}
                className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-neutral-800 hover:bg-sky-400/20 hover:text-sky-400 border border-neutral-700 hover:border-sky-400/50 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 touch-target"
            >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin"/> : <FileType className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                <span className="text-xs sm:text-sm">PPTX</span>
            </button>
            <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-sky-400 hover:bg-sky-300 text-black rounded-lg transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 shadow-lg shadow-sky-400/20 touch-target"
            >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin"/> : <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                <span className="text-xs sm:text-sm">PDF</span>
            </button>
        </div>
      </div>

      {/* Profile / Portrait Settings Panel - Mobile Optimized */}
      {showProfile && (
          <div className="bg-neutral-900 p-3 sm:p-4 rounded-xl border border-neutral-800 animate-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-full sm:w-auto">
                      <label className="block text-[10px] sm:text-xs text-neutral-400 mb-2 uppercase tracking-wider font-semibold">Portrait Image</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-neutral-800 border-2 border-dashed border-neutral-700 rounded-lg flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors touch-target">
                              {portraitImage ? (
                                  <img src={portraitImage} alt="Portrait" className="w-full h-full object-cover" />
                              ) : (
                                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-500" />
                              )}
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                          </div>
                          <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-white font-medium">Upload Photo</p>
                              <p className="text-[10px] sm:text-xs text-neutral-500">Supports JPG, PNG</p>
                          </div>
                      </div>
                  </div>
      
                  <div className="flex-1 border-t sm:border-t-0 sm:border-l border-neutral-800 pt-4 sm:pt-0 sm:pl-6">
                      <label className="block text-[10px] sm:text-xs text-neutral-400 mb-2 uppercase tracking-wider font-semibold">Shape</label>
                      <div className="flex gap-2 sm:gap-3">
                          <button 
                            onClick={() => setPortraitShape('circle')}
                            className={`p-1.5 sm:p-2 rounded-lg border flex flex-col items-center gap-1 w-16 sm:w-20 transition-all touch-target ${portraitShape === 'circle' ? 'bg-sky-400 border-sky-400 text-black' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-sky-400'}`}
                          >
                             <Circle className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                             <span className="text-[8px] sm:text-[10px]">Circle</span>
                          </button>
                          <button 
                            onClick={() => setPortraitShape('square')}
                            className={`p-1.5 sm:p-2 rounded-lg border flex flex-col items-center gap-1 w-16 sm:w-20 transition-all touch-target ${portraitShape === 'square' ? 'bg-sky-400 border-sky-400 text-black' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-sky-400'}`}
                          >
                             <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                             <span className="text-[8px] sm:text-[10px]">Square</span>
                          </button>
                          <button 
                            onClick={() => setPortraitShape('rounded')}
                            className={`p-1.5 sm:p-2 rounded-lg border flex flex-col items-center gap-1 w-16 sm:w-20 transition-all touch-target ${portraitShape === 'rounded' ? 'bg-sky-400 border-sky-400 text-black' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-sky-400'}`}
                          >
                             <Square className="w-4 h-4 sm:w-5 sm:h-5 rounded-md fill-current" />
                             <span className="text-[8px] sm:text-[10px]">Rounded</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Theme Library Panel - Mobile Optimized */}
      {showThemes && (
          <div className="bg-neutral-900 p-3 sm:p-4 rounded-xl border border-neutral-800 animate-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                  <h3 className="text-white font-semibold text-sm">Theme Library ({ALL_THEMES.length}+)</h3>
                  <span className="text-[10px] sm:text-xs text-neutral-500">Elegant • Professional • Modern</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 theme-selector-grid">
                  {ALL_THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => applyThemeToAll(theme)}
                        className={`relative group rounded-lg overflow-hidden border transition-all touch-target ${selectedThemeId === theme.id ? 'border-white ring-2 ring-blue-500' : 'border-neutral-700 hover:border-neutral-500'}`}
                      >
                          <div className="h-12 sm:h-16 w-full flex flex-col p-1.5 sm:p-2" style={{ backgroundColor: theme.bgColor }}>
                              <div className="w-6 sm:w-8 h-1.5 sm:h-2 mb-1 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                              <div className="w-full h-1 sm:h-1.5 mb-1 rounded-full opacity-50" style={{ backgroundColor: theme.textColor }}></div>
                              <div className="w-2/3 h-1 sm:h-1.5 rounded-full opacity-30" style={{ backgroundColor: theme.textColor }}></div>
                          </div>
                          <div className="px-1.5 sm:px-2 py-1 bg-neutral-800 text-[8px] sm:text-[10px] text-neutral-300 truncate">
                              {theme.name.split('•')[0]}
                          </div>
                          {selectedThemeId === theme.id && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <div className="bg-sky-400 rounded-full p-1">
                                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" />
                                  </div>
                              </div>
                          )}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Typography Editor Panel - Mobile Optimized */}
      {showTypography && slides[currentSlide] && (
          <div className="bg-neutral-900 p-3 sm:p-4 rounded-xl border border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-in slide-in-from-top-2">
              <div>
                  <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Title Font</label>
                  <select 
                    value={slides[currentSlide].titleFont || 'League Spartan'}
                    onChange={(e) => updateSlideStyle(currentSlide, 'titleFont', e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-xs sm:text-sm text-white touch-target"
                  >
                      {FONTS.map(font => <option key={font} value={font}>{font}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Title Weight</label>
                  <select 
                    value={slides[currentSlide].titleWeight || '700'}
                    onChange={(e) => updateSlideStyle(currentSlide, 'titleWeight', e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-xs sm:text-sm text-white touch-target"
                  >
                      <option value="300">Light (300)</option>
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">SemiBold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">ExtraBold (800)</option>
                      <option value="900">Black (900)</option>
                  </select>
              </div>
              <div>
                  <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Body Font</label>
                  <select 
                    value={slides[currentSlide].bodyFont || 'Montserrat'}
                    onChange={(e) => updateSlideStyle(currentSlide, 'bodyFont', e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-xs sm:text-sm text-white touch-target"
                  >
                      {FONTS.map(font => <option key={font} value={font}>{font}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Body Weight</label>
                  <select 
                    value={slides[currentSlide].bodyWeight || '400'}
                    onChange={(e) => updateSlideStyle(currentSlide, 'bodyWeight', e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-xs sm:text-sm text-white touch-target"
                  >
                      <option value="300">Light (300)</option>
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">SemiBold (600)</option>
                      <option value="700">Bold (700)</option>
                  </select>
              </div>
          </div>
      )}

      {/* LinkedIn Post Wrapper for Carousel - Mobile Optimized */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden text-black font-sans">
        
        {/* User Header */}
        <div className="p-2.5 sm:p-3 pb-2 flex space-x-2.5 sm:space-x-3">
             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
                 {portraitImage ? (
                    <img src={portraitImage} alt="User" className="w-full h-full object-cover" />
                 ) : (
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Linkyy" alt="User" className="w-full h-full object-cover" />
                 )}
             </div>
             <div className="flex-1 min-w-0">
                 <div className="flex items-center justify-between">
                     <h3 className="font-semibold text-sm text-gray-900 truncate">Linkyy Creator</h3>
                     <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                 </div>
                 <p className="text-xs text-gray-500 truncate">Viral Content Architect</p>
                 <div className="flex items-center text-xs text-gray-500 space-x-1">
                     <span>2h</span>
                     <span className="text-[10px]">•</span>
                     <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                 </div>
             </div>
        </div>

        <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 mb-2">
            🔥 Just dropped this new carousel about {slides[0]?.title || 'Viral Growth'}.<br/><br/>
            Swipe through to see the breakdown ➡️
        </div>

        {/* Carousel PDF Viewer Look - Mobile Optimized */}
        <div className="bg-gray-100 aspect-[4/5] relative group select-none">
            {/* Slide */}
            <div className="w-full h-full flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden">
                {slides[currentSlide] && (
                    <div className="w-full h-full flex flex-col p-4 sm:p-8 md:p-12 relative shadow-lg" 
                         style={{ 
                             backgroundColor: slides[currentSlide].bgColor || '#ffffff', 
                             color: slides[currentSlide].textColor || '#000000' 
                         }}>
                        
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 rounded-bl-full opacity-20" style={{ backgroundColor: slides[currentSlide].accentColor }}></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 rounded-tr-full opacity-20" style={{ backgroundColor: slides[currentSlide].accentColor }}></div>

                        {/* Portrait Image (Smartly Positioned) */}
                        {portraitImage && (
                            <div className={getPortraitStyle(activeThemeData?.portraitPosition || 'top-right')}>
                                <img 
                                    src={portraitImage} 
                                    alt="Portrait" 
                                    className={`w-full h-full object-cover border-2 sm:border-4 border-white shadow-lg ${portraitShape === 'circle' ? 'rounded-full' : portraitShape === 'rounded' ? 'rounded-xl' : 'rounded-none'}`}
                                    style={{ borderColor: slides[currentSlide].bgColor }}
                                />
                            </div>
                        )}

                        {/* Slide Number / Brand Indicator */}
                        <div className="absolute top-4 sm:top-8 left-4 sm:left-8 flex items-center space-x-1.5 sm:space-x-2">
                             <div className="w-1.5 sm:w-2 h-6 sm:h-8" style={{ backgroundColor: slides[currentSlide].accentColor }}></div>
                             <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase opacity-60">
                                {currentSlide === 0 ? 'INTRO' : currentSlide === slides.length - 1 ? 'SUMMARY' : `0${currentSlide}`}
                             </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center relative z-10 px-2">
                            <h2 
                                className="text-2xl sm:text-3xl md:text-5xl mb-4 sm:mb-8 leading-tight tracking-tight"
                                style={{ 
                                    fontFamily: slides[currentSlide].titleFont || 'League Spartan',
                                    fontWeight: slides[currentSlide].titleWeight || '700'
                                }}
                            >
                                {slides[currentSlide].title}
                            </h2>
                            <div className="w-12 h-1.5 sm:w-16 sm:h-2 mb-4 sm:mb-8" style={{ backgroundColor: slides[currentSlide].accentColor }}></div>
                            <p 
                                className="text-base sm:text-xl md:text-2xl leading-relaxed opacity-90"
                                style={{ 
                                    fontFamily: slides[currentSlide].bodyFont || 'Montserrat',
                                    fontWeight: slides[currentSlide].bodyWeight || '400'
                                }}
                            >
                                {slides[currentSlide].content}
                            </p>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-auto pt-4 sm:pt-6 flex justify-between items-center border-t border-current border-opacity-20 relative z-10 px-2">
                             <div className="flex items-center space-x-1.5 sm:space-x-2">
                                <span className="text-[10px] sm:text-xs md:text-sm font-semibold opacity-70 tracking-wide" style={{ fontFamily: slides[currentSlide].bodyFont }}>
                                    {slides[currentSlide].footer || 'LINKYY'}
                                </span>
                             </div>
                             <div className="flex items-center space-x-1">
                                {slides.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`h-1 rounded-full transition-all ${idx === currentSlide ? 'w-4 sm:w-6' : 'w-1.5 opacity-40'}`}
                                        style={{ backgroundColor: idx === currentSlide ? slides[currentSlide].accentColor : 'currentColor' }}
                                    ></div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlays - Mobile Optimized */}
            <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 bg-black/50 backdrop-blur-sm flex items-center justify-between px-3 sm:px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                 <span className="text-white text-[10px] sm:text-xs font-medium truncate max-w-[120px] sm:max-w-none">{slides[0]?.title}</span>
                 <div className="flex items-center text-white space-x-2 sm:space-x-3">
                     <span className="text-[10px] sm:text-xs">{currentSlide + 1} of {slides.length}</span>
                     <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer" />
                 </div>
            </div>

             {/* Navigation Overlay Buttons - Mobile Optimized */}
             {currentSlide > 0 && (
                <button 
                    onClick={prevSlide}
                    className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/10 hover:bg-sky-400/20 hover:text-sky-400 backdrop-blur-sm flex items-center justify-center text-white transition z-20 touch-target"
                >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
             )}
             {currentSlide < slides.length - 1 && (
                <button 
                    onClick={nextSlide}
                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/10 hover:bg-sky-400/20 hover:text-sky-400 backdrop-blur-sm flex items-center justify-center text-white transition z-20 touch-target"
                >
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
             )}
        </div>
        
        {/* PDF Viewer Footer (LinkedIn style gray bar under docs) - Mobile Optimized */}
        <div className="bg-gray-100 px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between border-t border-gray-200">
             <span className="text-[10px] sm:text-xs text-gray-600 font-medium truncate">{slides[0]?.title || 'Document'} • {slides.length} pages</span>
        </div>

      </div>

      {/* Hidden Printable Area - Optimized for HTML2Canvas & Print */}
      <div id="printable-area" className="fixed left-[9999px] top-0">
        {slides.map((slide, index) => (
            <div key={index} className="slide-page" style={{ 
                width: '1080px', 
                height: '1350px', 
                backgroundColor: slide.bgColor || '#fff', 
                color: slide.textColor || '#000',
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
            }}>
                 {/* Print Decor */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', borderBottomLeftRadius: '100%', opacity: 0.2, backgroundColor: slide.accentColor }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '150px', height: '150px', borderTopRightRadius: '100%', opacity: 0.2, backgroundColor: slide.accentColor }}></div>

                {/* Print Portrait */}
                {portraitImage && (
                    <div style={{ 
                        position: 'absolute', 
                        zIndex: 15,
                        top: activeThemeData?.portraitPosition === 'top-right' ? '50px' : 'auto',
                        bottom: activeThemeData?.portraitPosition === 'bottom-right' || activeThemeData?.portraitPosition === 'bottom-left' ? '180px' : 'auto',
                        right: activeThemeData?.portraitPosition === 'top-right' || activeThemeData?.portraitPosition === 'bottom-right' ? '50px' : 'auto',
                        left: activeThemeData?.portraitPosition === 'bottom-left' ? '50px' : 'auto',
                    }}>
                        <img 
                            src={portraitImage} 
                            style={{ 
                                width: '150px', 
                                height: '150px', 
                                objectFit: 'cover',
                                borderRadius: portraitShape === 'circle' ? '50%' : portraitShape === 'rounded' ? '20px' : '0',
                                border: `5px solid ${slide.bgColor}`,
                            }} 
                        />
                    </div>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', position: 'relative', zIndex: 10 }}>
                     <h1 style={{ 
                         fontFamily: slide.titleFont || 'League Spartan', 
                         fontWeight: slide.titleWeight || '700',
                         fontSize: '80px', 
                         marginBottom: '40px', 
                         lineHeight: 1.1 
                     }}>{slide.title}</h1>
                     <div style={{ width: '100px', height: '10px', backgroundColor: slide.accentColor, marginBottom: '40px' }}></div>
                     <p style={{ 
                         fontFamily: slide.bodyFont || 'Montserrat', 
                         fontWeight: slide.bodyWeight || '400',
                         fontSize: '42px', 
                         lineHeight: '1.4' 
                     }}>{slide.content}</p>
                </div>
                
                <div style={{ 
                    borderTop: '2px solid rgba(0,0,0,0.1)', 
                    padding: '30px 80px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <span style={{ fontFamily: slide.bodyFont, fontSize: '24px', fontWeight: 'bold' }}>{slide.footer}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                         {slides.map((_, i) => (
                             <div key={i} style={{ width: i === index ? '40px' : '15px', height: '15px', borderRadius: '10px', backgroundColor: i === index ? slide.accentColor : '#ccc' }}></div>
                         ))}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselPreview;