import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { Zap, LayoutDashboard, Workflow, Users, HelpCircle, ArrowRight, Sparkles, X, Menu } from 'lucide-react';

interface NavbarProps {
  onStart: () => void;
}

const NAV_LINKS = [
  { label: 'Features',    id: 'features',    Icon: Sparkles },
  { label: 'How it works', id: 'how-it-works', Icon: Workflow },
  { label: 'Wall of Love', id: 'testimonials', Icon: Users },
  { label: 'FAQ',          id: 'faq',          Icon: HelpCircle },
];

function scrollTo(id: string) {
  const lenis = (window as any).__lenis;
  const el = document.getElementById(id);
  if (!el) { window.scrollTo({ top: 0 }); return; }
  if (lenis) {
    lenis.scrollTo(el, { offset: -80, duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export default function Navbar({ onStart }: NavbarProps) {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDir, setScrollDir] = useState<'up' | 'down'>('up');
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      setScrollDir(sy > prevScrollY.current ? 'down' : 'up');
      prevScrollY.current = sy;
      setScrollY(sy);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pill merges into bg when scrolling down (opacity → 0 for bg/border)
  // Reappears when user scrolls up or hovers
  const isVisible = scrollDir === 'up' || scrollY < 60 || hovered;

  // Expanded state: show nav links
  const isExpanded = hovered || mobileOpen || scrollY < 40;

  return (
    <>
      {/* ── iPhone Dynamic Island Notch ──────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-4 pointer-events-none"
      >
        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          animate={{
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : -6,
            scale: isVisible ? 1 : 0.96,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto w-full max-w-4xl"
        >
          <motion.nav
            animate={{
              // Background: fully transparent when merged into bg, glassy when visible
              backgroundColor: isExpanded
                ? 'rgba(10, 10, 14, 0.85)'
                : 'rgba(10, 10, 14, 0.6)',
              borderColor: isExpanded
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(255, 255, 255, 0.06)',
              borderRadius: isExpanded ? '9999px' : '9999px',
              paddingLeft: isExpanded ? '1.25rem' : '1rem',
              paddingRight: isExpanded ? '1.25rem' : '1rem',
              paddingTop: isExpanded ? '0.6rem' : '0.5rem',
              paddingBottom: isExpanded ? '0.6rem' : '0.5rem',
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: isExpanded
                ? '0 8px 40px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset'
                : '0 2px 12px -4px rgba(0,0,0,0.4)',
            }}
          >
            {/* ── Logo ──────────────────────────────────────────── */}
            <button
              onClick={() => scrollTo('hero')}
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              aria-label="Back to top"
            >
              <div className="relative w-7 h-7 rounded-xl bg-[#0A66C2] flex items-center justify-center shadow-lg shadow-[#0A66C2]/40 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <motion.span
                animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden text-white font-extrabold text-sm tracking-tight whitespace-nowrap"
              >
                Linkyy
              </motion.span>
            </button>

            {/* ── Desktop Nav Links ──────────────────────────────── */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  key="nav-links"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="hidden md:flex items-center gap-1"
                >
                  {NAV_LINKS.map(({ label, id, Icon }) => (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.07] transition-all duration-200"
                    >
                      <Icon className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200" />
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Right: CTA + Mobile Menu ──────────────────────── */}
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                onClick={onStart}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full px-4 py-1.5 text-xs font-bold transition-colors duration-200 shadow-lg shadow-[#0A66C2]/30"
              >
                <Sparkles className="w-3 h-3" />
                <span>Launch App</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              {/* Mobile hamburger */}
              <button
                className="md:hidden flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-gray-300 transition-colors"
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Toggle menu"
              >
                {mobileOpen
                  ? <X className="w-3.5 h-3.5" />
                  : <Menu className="w-3.5 h-3.5" />
                }
              </button>
            </div>
          </motion.nav>

          {/* ── Mobile Dropdown ──────────────────────────────────── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="mt-2 mx-auto max-w-xs rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(10, 10, 14, 0.92)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 20px 60px -10px rgba(0,0,0,0.7)',
                }}
              >
                <div className="p-3 flex flex-col gap-1">
                  {NAV_LINKS.map(({ label, id, Icon }) => (
                    <button
                      key={id}
                      onClick={() => { scrollTo(id); setMobileOpen(false); }}
                      className="group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.07] transition-all duration-200 text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center group-hover:bg-[#0A66C2]/20 transition-colors">
                        <Icon className="w-4 h-4 group-hover:scale-110 group-hover:text-[#70B5F9] transition-all duration-200" />
                      </div>
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
