import * as Sentry from "@sentry/react";

// ============================================================================
// MONITORING DASHBOARD API INTEGRATION
// ============================================================================
// This service demonstrates how to replace mock data with real API calls
// to monitoring dashboards (Sentry, Vercel Analytics, PostHog, etc.)
// ============================================================================

export interface VelocityMetrics {
  velocityScore: number;
  postsLast24h: number;
  postsLast7d: number;
  totalOptimizations: number;
  avgEngagementScore: number;
  lastActiveTimestamp: number | null;
}

export interface AppMetrics {
  totalUsers: number;
  activeUsers: number;
  apiCallsToday: number;
  successRate: number;
  avgResponseTime: number;
  errorRate: number;
}

// ── Option 1: Calculate Real Metrics from Local Data (No Backend Required) ──

/**
 * Calculate real velocity score from actual app history
 * Replaces: Math.random() based mock calculation
 */
export function calculateVelocityFromHistory(appHistory: any[]): VelocityMetrics {
  const now = Date.now();
  const last24Hours = appHistory.filter(item => now - item.timestamp < 24 * 60 * 60 * 1000);
  const last7Days = appHistory.filter(item => now - item.timestamp < 7 * 24 * 60 * 60 * 1000);
  
  // Calculate real velocity based on actual usage patterns
  const postsLast24h = last24Hours.filter(item => item.type === 'post').length;
  const postsLast7d = last7Days.filter(item => item.type === 'post').length;
  const totalOptimizations = appHistory.length;
  
  // Velocity formula: weighted by recency and frequency
  // Recent activity (last 24h) weighted heaviest
  const velocityScore = Math.round(
    (postsLast24h * 50) +    // High weight for recent activity
    (postsLast7d * 10) +     // Medium weight for weekly activity
    (totalOptimizations * 2) // Base weight for total usage
  );

  // Calculate average engagement score from real AI responses
  const engagementScores = appHistory
    .filter(item => item.data?.engagement_blueprint)
    .map(item => item.data.engagement_blueprint.velocity_score || 0);
  
  const avgEngagementScore = engagementScores.length > 0
    ? Math.round(engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length)
    : 0;

  const lastActiveTimestamp = appHistory.length > 0 ? appHistory[0].timestamp : null;

  return {
    velocityScore: Math.max(0, velocityScore), // Ensure non-negative
    postsLast24h,
    postsLast7d,
    totalOptimizations,
    avgEngagementScore,
    lastActiveTimestamp,
  };
}

// ── Option 2: Query Sentry Metrics API (Real Monitoring Dashboard) ──

/**
 * Fetch real metrics from Sentry's Metrics API
 * Requires: VITE_SENTRY_AUTH_TOKEN in .env
 * Docs: https://docs.sentry.io/api/metrics/
 */
export async function fetchSentryMetrics(
  orgSlug: string,
  projectSlug: string,
  timeWindow: string = "24h"
): Promise<AppMetrics | null> {
  const authToken = (import.meta as any).env?.VITE_SENTRY_AUTH_TOKEN;
  
  if (!authToken) {
    console.warn("[Monitoring] Sentry auth token not configured");
    return null;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const statsPeriod = timeWindow === "24h" ? "24h" : "7d";
    
    // Query Sentry Metrics for API call counts
    const metricsQuery = {
      query: "sum(sentry.api.call)",
      start: now - (timeWindow === "24h" ? 86400 : 604800),
      end: now,
      interval: "1h",
      field: ["sum(sentry.api.call)"],
    };

    // Note: This is a simplified example. In production, you'd need
    // to proxy this through your backend to avoid exposing the auth token
    const response = await fetch(
      `https://sentry.io/api/0/organizations/${orgSlug}/metrics/data/`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metricsQuery),
      }
    );

    if (!response.ok) {
      throw new Error(`Sentry API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse real metrics from Sentry response
    const apiCallsToday = data?.data?.[0]?.totals?.sum || 0;
    
    return {
      totalUsers: 1, // Would come from your auth system
      activeUsers: 1,
      apiCallsToday,
      successRate: 95, // Would calculate from error metrics
      avgResponseTime: 2500, // Would calculate from distribution metrics
      errorRate: 5,
    };
  } catch (error) {
    console.error("[Monitoring] Failed to fetch Sentry metrics:", error);
    return null;
  }
}

// ── Option 3: Vercel Analytics API Integration ──

/**
 * Fetch analytics data from Vercel Analytics API
 * Requires: VERCEL_ANALYTICS_ID and proper API setup
 * Docs: https://vercel.com/docs/analytics/rest-api
 */
export async function fetchVercelAnalytics(
  teamId: string,
  siteId: string
): Promise<AppMetrics | null> {
  const apiToken = (import.meta as any).env?.VITE_VERCEL_API_TOKEN;
  
  if (!apiToken) {
    console.warn("[Monitoring] Vercel API token not configured");
    return null;
  }

  try {
    // Query Vercel Analytics for page views and performance
    const response = await fetch(
      `https://api.vercel.com/v1/analytics/metrics?teamId=${teamId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Vercel Analytics API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      totalUsers: data?.pageViews?.total || 0,
      activeUsers: data?.pageViews?.unique || 0,
      apiCallsToday: 0, // Would need custom tracking
      successRate: 98,
      avgResponseTime: data?.webVitals?.avgLoadTime || 0,
      errorRate: 2,
    };
  } catch (error) {
    console.error("[Monitoring] Failed to fetch Vercel analytics:", error);
    return null;
  }
}

// ── Option 4: PostHog Analytics Integration (Recommended for Product Analytics) ──

/**
 * Initialize PostHog for comprehensive product analytics
 * Install: npm install posthog-js
 * Docs: https://posthog.com/docs/libraries/js
 */
export function initPostHog(apiKey: string) {
  if (typeof window === 'undefined') return;
  
  // Dynamic import to avoid breaking if PostHog not installed
  import('posthog-js').then((posthog) => {
    posthog.default.init(apiKey, {
      api_host: 'https://app.posthog.com',
      capture_pageview: true,
      persistence: 'localStorage',
    });
    
    console.log("[Monitoring] PostHog initialized");
  }).catch(() => {
    console.warn("[Monitoring] PostHog not installed. Run: npm install posthog-js");
  });
}

/**
 * Track custom event in PostHog
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  import('posthog-js').then((posthog) => {
    posthog.default.capture(eventName, properties);
  }).catch(() => {
    // Fallback to Sentry if PostHog not available
    Sentry.logger.info(`Event: ${eventName}`, properties);
  });
}

// ── Option 5: Custom Dashboard API Endpoint ──

/**
 * Example: Fetch metrics from your own backend API
 * This is what most monitoring dashboards expect
 */
export async function fetchDashboardMetrics(
  apiEndpoint: string
): Promise<VelocityMetrics | null> {
  try {
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add auth token if required
        // "Authorization": `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Dashboard API error: ${response.status}`);
    }

    const data = await response.json();
    return data as VelocityMetrics;
  } catch (error) {
    console.error("[Monitoring] Failed to fetch dashboard metrics:", error);
    return null;
  }
}

// ── Helper: Send Real Metrics to Monitoring Service ──

/**
 * Push custom metrics to your monitoring dashboard
 * This is how you replace rnd() calls with real tracked data
 */
export function reportVelocityMetric(velocityScore: number) {
  // 1. Track in Sentry Metrics (already set up in your app)
  Sentry.metrics.distribution('app.velocity_score', velocityScore);
  Sentry.metrics.gauge('app.current_velocity', velocityScore);
  
  // 2. Track in Vercel Analytics (custom event)
  if (typeof window !== 'undefined') {
    // Vercel Analytics automatically tracks pageviews
    // For custom events, use Sentry or PostHog
  }
  
  // 3. Track in PostHog (if installed)
  trackEvent('velocity_score_calculated', {
    score: velocityScore,
    timestamp: Date.now(),
  });
  
  // 4. Log for debugging
  Sentry.logger.info('Velocity score calculated', {
    velocity_score: velocityScore,
    calculated_at: new Date().toISOString(),
  });
}

// ── Usage Example: How to Replace Mock Data ──

/**
 * BEFORE (Mock Data with rnd()):
 * const velocityScore = appHistory.length * 10 + Math.floor(Math.random() * 5);
 * 
 * AFTER (Real API Integration):
 * 
 * // Option 1: Local calculation (no external API needed)
 * const metrics = calculateVelocityFromHistory(appHistory);
 * const velocityScore = metrics.velocityScore;
 * 
 * // Option 2: Sentry Metrics API
 * const sentryMetrics = await fetchSentryMetrics('your-org', 'linkyy');
 * const velocityScore = sentryMetrics?.apiCallsToday || 0;
 * 
 * // Option 3: Custom Dashboard API
 * const dashboardMetrics = await fetchDashboardMetrics('/api/velocity');
 * const velocityScore = dashboardMetrics?.velocityScore || 0;
 * 
 * // Track the real metric
 * reportVelocityMetric(velocityScore);
 */
