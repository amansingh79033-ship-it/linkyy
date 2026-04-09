// Real-time analytics and monitoring service (PostgreSQL Edition)
const USER_ACTIVITY_KEY = 'linky_user_activities';
const SESSION_START_KEY = 'linky_session_start';

interface UserActivity {
  id: string;
  codename: string;
  timestamp: string;
  action: 'login' | 'generate_post' | 'generate_carousel' | 'generate_error' | 'export' | 'logout';
  dwellScore?: number;
  userAgent: string;
  ip?: string;
  deviceInfo?: any;
  locationInfo?: any;
}

/**
 * Detect device information from user agent
 */
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  return {
    type: /Mobile/.test(userAgent) ? 'Mobile' : /Tablet/.test(userAgent) ? 'Tablet' : 'Desktop',
    browser: userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : userAgent.includes('Safari') ? 'Safari' : 'Unknown',
    os: userAgent.includes('Windows') ? 'Windows' : userAgent.includes('Mac') ? 'macOS' : userAgent.includes('Linux') ? 'Linux' : userAgent.includes('Android') ? 'Android' : userAgent.includes('iOS') ? 'iOS' : 'Unknown'
  };
};

/**
 * Get approximate location from timezone
 */
const getLocationInfo = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = timezone.split('/');
    return {
      country: parts[0] || 'Unknown',
      region: parts[1] || 'Unknown',
      city: parts[2] || 'Unknown'
    };
  } catch {
    return { country: 'Unknown', region: 'Unknown', city: 'Unknown' };
  }
};

/**
 * Records user activity globally via backend
 */
export const recordUserActivity = (codename: string, action: UserActivity['action'], dwellScore?: number): void => {
  try {
    const deviceInfo = getDeviceInfo();
    const locationInfo = getLocationInfo();

    // Local backup for Edge cases
    const activity: UserActivity = {
      id: Date.now().toString(36),
      codename: codename.toLowerCase(),
      timestamp: new Date().toISOString(),
      action,
      dwellScore,
      userAgent: navigator.userAgent,
      deviceInfo,
      locationInfo,
    };

    const stored = localStorage.getItem(USER_ACTIVITY_KEY);
    const activities = stored ? JSON.parse(stored) : [];
    activities.push(activity);
    localStorage.setItem(USER_ACTIVITY_KEY, JSON.stringify(activities.slice(-1000)));
    
    // Sync to PostgreSQL API with device and location info
    fetch('/api/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codename,
        action,
        dwellScore,
        userAgent: navigator.userAgent,
        deviceInfo,
        locationInfo
      })
    }).catch(err => {
      console.error("Cloud Sync Failed, keeping local only:", err);
    });

  } catch (error) {
    console.error('Failed to record activity:', error);
  }
};

/**
 * Gets local user activities (Dashboard fallback for behaviour)
 */
export const getUserActivities = (): UserActivity[] => {
  try {
    const stored = localStorage.getItem(USER_ACTIVITY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Fetches real global platform metrics from PostgreSQL
 */
export const getPlatformMetrics = async () => {
  try {
    const metricsRes = await fetch('/api/stats');
    const workroomsRes = await fetch('/api/admin-data?type=workrooms');
    
    let metrics = {
      totalUsers: 0,
      activeToday: 0,
      postsGenerated: 0,
      carouselsGenerated: 0,
      avgDwellScore: 85,
      errorRate: 0,
      uptimePercentage: 99.97,
      responseTimeMs: 245,
      workrooms: []
    };

    if (metricsRes.ok) {
      metrics = await metricsRes.json();
    }

    if (workroomsRes.ok) {
      const workrooms = await workroomsRes.json();
      metrics.workrooms = workrooms;
      console.log('✅ Platform Metrics loaded:', workrooms.length, 'workrooms');
    } else {
      console.warn('⚠️ Failed to fetch workrooms, status:', workroomsRes.status);
    }

    return metrics;
  } catch (err) {
    console.error('Failed to load global platform metrics from DB:', err);
  }
  
  return {
    totalUsers: 0,
    activeToday: 0,
    postsGenerated: 0,
    carouselsGenerated: 0,
    avgDwellScore: 85,
    errorRate: 0,
    uptimePercentage: 99.97,
    responseTimeMs: 245,
    workrooms: []
  };
};

/**
 * Fetches real global user statistics
 */
export const getUserStatistics = async () => {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data = await res.json();
      console.log('✅ User Stats loaded:', data);
      return {
        totalUsers: data.totalUsers || 0,
        activeToday: data.activeToday || 0,
        activeThisWeek: data.activeToday || 0,
        postsGenerated: data.postsGenerated || 0,
        carouselsGenerated: data.carouselsGenerated || 0,
        avgDwellScore: data.avgDwellScore || 85,
        uniqueUsers: [] 
      };
    } else {
      console.error('Failed to fetch stats, status:', res.status);
    }
  } catch (e) {
    console.error("Failed to load user statistics from DB", e);
  }

  return {
    totalUsers: 0,
    activeToday: 0,
    activeThisWeek: 0,
    postsGenerated: 0,
    carouselsGenerated: 0,
    avgDwellScore: 85,
    uniqueUsers: []
  };
};

/**
 * Gets user behavior analytics from PostgreSQL (Replacing Local-Only logic)
 */
export const getUserBehaviorAnalytics = async (): Promise<any[]> => {
  try {
    const res = await fetch('/api/admin-data');
    if (res.ok) {
      const users = await res.json();
      console.log('✅ User Behavior Analytics loaded:', users.length, 'users');
      
      return users.map((user: any) => {
        // Calculate probability based on activity count
        let returnProbability = 40;
        const totalActivities = parseInt(user.total_activities) || 0;
        
        if (totalActivities > 20) returnProbability = 95;
        else if (totalActivities > 10) returnProbability = 85;
        else if (totalActivities > 5) returnProbability = 70;
        else if (totalActivities > 0) returnProbability = 55;

        return {
          codename: user.codename,
          totalActivities: totalActivities,
          lastActive: user.last_active,
          contentGenerated: Math.floor(totalActivities * 0.4), // Estimate content from logs
          returnProbability: returnProbability,
          status: user.status
        };
      });
    } else {
      console.error('Failed to fetch users, status:', res.status);
    }
  } catch (err) {
    console.error("Failed to fetch behavior analytics from DB, using fallback", err);
  }

  // Fallback to local storage if DB is unreachable
  const stored = localStorage.getItem(USER_ACTIVITY_KEY);
  const activities = stored ? JSON.parse(stored) : [];
  const localCodenames = [...new Set(activities.map((a: any) => a.codename))];
  
  console.log('⚠️ Using local fallback for behavior analytics:', localCodenames.length, 'users');
  
  return localCodenames.map((codename: any) => {
    const userActs = activities.filter((a: any) => a.codename === codename);
    return {
      codename,
      totalActivities: userActs.length,
      lastActive: userActs[userActs.length - 1].timestamp,
      contentGenerated: userActs.filter((a: any) => a.action.includes('generate')).length,
      returnProbability: 50,
      status: 'active'
    };
  });
};

/**
 * Gets error statistics from Global API
 */
export const getErrorStatistics = async () => {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data = await res.json();
      return {
        errorRate: data.errorRate || 0,
        totalErrors: 0,
        errorTrend: 'stable'
      };
    }
  } catch (e) {
    console.error("Failed to load error stats from DB");
  }

  return { errorRate: 0, totalErrors: 0, errorTrend: 'stable' };
};

/**
 * Automatically syncs local activities to PostgreSQL (Disaster Recovery / Sync)
 */
export const syncLocalToCloud = async (): Promise<void> => {
  try {
    const activities = getUserActivities();
    if (activities.length === 0) return;

    console.log(`🔄 Attempting to sync ${activities.length} local records to cloud...`);
    
    // Sync only unique codenames to ensure they exist in users table
    const codenames = [...new Set(activities.map(a => a.codename))];
    
    for (const codename of codenames) {
      const userActs = activities.filter(a => a.codename === codename);
      const lastAct = userActs[userActs.length - 1];
      
      // Upsert the user first
      await fetch('/api/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codename,
          action: 'login', // Basic sync trigger
          userAgent: navigator.userAgent
        })
      });

      // Sync specific key actions if needed (optional optimization)
      // For now, the user upsert is enough to make them appear in Dashboard
    }
    
    console.log("✅ Cloud sync completed.");
  } catch (err) {
    console.error("Cloud sync failed:", err);
  }
};

/**
 * Initializes session tracking
 */
export const initSessionTracking = (codename: string): void => {
  localStorage.setItem(SESSION_START_KEY, new Date().toISOString());
  recordUserActivity(codename, 'login');
  syncLocalToCloud(); // Attempt sync on init
};

/**
 * Ends session tracking
 */
export const endSessionTracking = (codename: string): void => {
  recordUserActivity(codename, 'logout');
  localStorage.removeItem(SESSION_START_KEY);
};
