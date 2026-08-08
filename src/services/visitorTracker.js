/**
 * Visitor Tracking Utility
 * Tracks page views and sends data to the monitoring API
 */

class VisitorTracker {
  constructor(apiUrl = 'http://localhost:3001') {
    this.apiUrl = apiUrl;
    this.visitorId = null;
    this.sessionId = null;
    this.sessionStartTime = Date.now();
    this.pages = [];
    this.initialized = false;
  }

  /**
   * Initialize visitor tracking
   * Call this on page load
   */
  async init() {
    if (this.initialized) return;

    try {
      // Collect visitor data
      const visitorData = this.collectVisitorData();

      // Send to monitoring API
      const response = await fetch(`${this.apiUrl}/api/visitors/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorData),
      });

      if (response.ok) {
        const data = await response.json();
        this.visitorId = data.visitorId;
        this.initialized = true;

        console.log('[VisitorTracker] Initialized:', data);
      }
    } catch (error) {
      console.debug('[VisitorTracker] Monitoring server offline or unreachable:', error?.message || error);
    }
  }

  /**
   * Track page view
   * Call this on route changes or page navigation
   */
  async trackPageView(page, referrer = null) {
    if (!this.initialized) {
      await this.init();
    }

    this.pages.push(page);

    try {
      await fetch(`${this.apiUrl}/api/events/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorId: this.visitorId,
          sessionId: this.sessionId,
          eventType: 'page_view',
          eventData: { page, referrer },
          page,
        }),
      });
    } catch (error) {
      console.error('[VisitorTracker] Page view tracking error:', error);
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(eventType, eventData = {}) {
    if (!this.visitorId) return;

    try {
      await fetch(`${this.apiUrl}/api/events/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorId: this.visitorId,
          sessionId: this.sessionId,
          eventType,
          eventData,
          page: window.location.pathname,
        }),
      });
    } catch (error) {
      console.error('[VisitorTracker] Event tracking error:', error);
    }
  }

  /**
   * End session and calculate duration
   * Call this before page unload
   */
  async endSession() {
    if (!this.visitorId || !this.sessionId) return;

    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);

    try {
      await fetch(`${this.apiUrl}/api/sessions/${this.sessionId}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration,
          exitPage: window.location.pathname,
          pages: this.pages,
        }),
      });
    } catch (error) {
      console.error('[VisitorTracker] Session end error:', error);
    }
  }

  /**
   * Collect visitor data from browser
   */
  collectVisitorData() {
    // Get IP from a public API (you can use your own endpoint)
    const ip = this.getIPAddress();

    return {
      ip: ip || 'unknown',
      userAgent: navigator.userAgent,
      landingPage: window.location.pathname,
      referrer: document.referrer || null,
      pages: [window.location.pathname],
    };
  }

  /**
   * Get visitor IP address
   * In production, this should be done server-side for accuracy
   */
  async getIPAddress() {
    try {
      // Using a public IP API - replace with your own in production
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('[VisitorTracker] Could not fetch IP address:', error);
      return null;
    }
  }
}

// Create singleton instance
const visitorTracker = new VisitorTracker();

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    visitorTracker.init();
  });

  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    visitorTracker.endSession();
  });

  // Track page views on route changes (for SPAs)
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    visitorTracker.trackPageView(window.location.pathname, document.referrer);
  };

  window.addEventListener('popstate', () => {
    visitorTracker.trackPageView(window.location.pathname, document.referrer);
  });
}

export default visitorTracker;
