import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { Analytics } from '@vercel/analytics/react';
import Lenis from 'lenis';
import App from './App.tsx';
import './index.css';
import './services/visitorTracker.js';

// ── Lenis smooth scroll ────────────────────────────────────────────
const lenis = new Lenis({
  lerp: 0.08,           // smoothness interpolation (lower = smoother)
  smoothWheel: true,
  touchMultiplier: 1.8,
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Expose lenis so Navbar can use lenis.scrollTo()
(window as any).__lenis = lenis;

// ── Sentry: error tracking + structured logs + console capture ──────────
// Set VITE_SENTRY_DSN in .env (and Vercel env vars) to enable.
// Errors are silently ignored when no DSN is configured.
const sentryDsn = (import.meta as any).env?.VITE_SENTRY_DSN;
const isProd    = ((import.meta as any).env?.MODE || 'production') === 'production';

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: (import.meta as any).env?.MODE || 'production',
    tracesSampleRate:        0.2,  // 20% of sessions sampled for performance
    replaysOnErrorSampleRate: 1.0, // full replay on every error

    // ── Logs ───────────────────────────────────────────────────────────
    enableLogs: true, // top-level flag (SDK ≥ 9.41.0)

    integrations: [
      // Auto-capture console.warn / console.error as Sentry logs
      Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
    ],

    // Drop debug-level logs in production to reduce noise
    beforeSendLog: (log) => {
      if (isProd && log.level === 'debug') return null;
      // Strip any accidental sensitive fields
      if (log.attributes?.password) delete log.attributes.password;
      if (log.attributes?.token)    delete log.attributes.token;
      return log;
    },
  });

  // ── Global scope: attached to every log automatically ───────────────
  Sentry.getGlobalScope().setAttributes({
    service: 'linkyy',
    version:  '2.0.0',
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Vercel Analytics: tracks page views and Web Vitals automatically */}
    <Analytics />
  </StrictMode>,
);
