import { hashSync, compareSync } from 'bcryptjs';
import { 
  saveWorkroomData, 
  loadWorkroomData, 
  saveSessionData, 
  loadSessionData,
  DATA_CATEGORIES
} from './persistenceService';

// In a real production environment, this would connect to a backend API
// For now, we'll use enhanced client-side storage with proper hashing
// ROBUST PERSISTENCE: Data survives app restarts, crashes, modifications, expired sessions
// Only manual deletion removes data

const WORKROOM_NAME_KEY = 'linky_workroom_name';
const WORKROOM_PASS_HASH_KEY = 'linky_passcode_hash';
const WORKROOM_CREATED_AT_KEY = 'linky_workroom_created_at';
const SESSION_TOKEN_KEY = 'linky_session_token';
const LAST_ACTIVE_KEY = 'linky_last_active';

interface WorkroomCredentials {
  codename: string;
  passcodeHash: string;
  createdAt: string;
}

interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
}

// Check if workroom exists by codename in database
export const checkWorkroomAvailability = async (codename: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/workroom?codename=${encodeURIComponent(codename.toLowerCase())}`);
    if (!res.ok) {
      console.error('Workroom availability check failed, status:', res.status);
      return false;
    }
    const data = await res.json();
    return data.exists;
  } catch (e) {
    console.error('Availability check network error:', e);
    // If network fails, assume available to let user try
    return true;
  }
};

/**
 * Creates a new workroom/account
 */
export const createWorkroom = async (codename: string, passcode: string): Promise<AuthResult> => {
  try {
    const recoveryKey = generateRecoveryKey();
    const res = await fetch('/api/workroom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'create', 
        codename: codename.trim().toLowerCase(), 
        passcode, 
        recoveryHash: recoveryKey 
      })
    });
    
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.error || 'Signup failed' };

    downloadRecoveryFile(codename, recoveryKey);
    localStorage.setItem(WORKROOM_NAME_KEY, data.codename);
    localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
    
    return { success: true, message: 'Account created', token: data.token };
  } catch (err) {
    return { success: false, message: 'Network error during signup' };
  }
};

/**
 * Authenticates existing credentials
 */
export const authenticateWorkroom = async (codename: string, passcode: string): Promise<AuthResult> => {
  try {
    const res = await fetch('/api/workroom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', codename: codename.trim().toLowerCase(), passcode })
    });

    const data = await res.json();
    if (!res.ok) return { success: false, message: data.error || 'Invalid credentials' };
    
    localStorage.setItem(WORKROOM_NAME_KEY, data.codename);
    localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
    if (data.tone) localStorage.setItem('linky_tone', data.tone);
    
    return { success: true, message: 'Welcome back!', token: data.token, tone: data.tone };
  } catch (err) {
    return { success: false, message: 'Network error during login' };
  }
};

/**
 * Checks if a workroom exists locally (for simple UI toggles)
 */
export const workroomExists = (): boolean => {
  return !!localStorage.getItem(WORKROOM_NAME_KEY);
};

/**
 * Gets current workroom information
 */
export const getCurrentWorkroom = (): WorkroomCredentials | null => {
  const name = localStorage.getItem(WORKROOM_NAME_KEY);
  const hash = localStorage.getItem(WORKROOM_PASS_HASH_KEY);
  const createdAt = localStorage.getItem(WORKROOM_CREATED_AT_KEY);
  
  if (!name || !hash || !createdAt) {
    return null;
  }
  
  return {
    codename: name,
    passcodeHash: hash,
    createdAt
  };
};

/**
 * Validates current session with ROBUST RECOVERY
 * Even if session expired, we can recover workroom data from persistent storage
 */
export const validateSession = async (): Promise<boolean> => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
  const codename = localStorage.getItem(WORKROOM_NAME_KEY);
  
  // Try to recover from persistent storage first
  if (codename) {
    try {
      const persistentData = await loadWorkroomData(codename);
      if (persistentData) {
        console.log('✅ Found persistent workroom data for:', codename);
        
        // Restore session even if expired
        if (!token || !lastActive) {
          console.log('♻️ Recovering session from persistent storage...');
          const newToken = generateSessionToken(codename);
          localStorage.setItem(SESSION_TOKEN_KEY, newToken);
          localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
          return true;
        }
      }
    } catch (error) {
      console.error('⚠️ Failed to load persistent data:', error);
    }
  }
  
  // Standard validation
  if (!token || !lastActive) {
    console.log('⚠️ No session found');
    return false;
  }
  
  // Check if session is still valid (24 hour timeout)
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) {
    console.log('⏰ Session expired (', Math.round(hoursDiff), 'hours old)');
    
    // DON'T clear session! Keep workroom credentials for recovery
    // clearSession();
    
    // Try to recover from persistent storage
    if (codename) {
      const persistentData = await loadWorkroomData(codename);
      if (persistentData) {
        console.log('♻️ Recovering expired session from persistent storage...');
        const newToken = generateSessionToken(codename);
        localStorage.setItem(SESSION_TOKEN_KEY, newToken);
        localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
        return true;
      }
    }
    
    return false;
  }
  
  console.log('✅ Session valid (', Math.round(hoursDiff), ' hours old)');
  return true;
};

/**
 * Clears current session
 */
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
};

/**
 * Logs out but PRESERVES all data (only manual deletion removes)
 */
export const logoutWorkroom = (): void => {
  // Only clear session tokens, NOT workroom credentials
  clearSession();
  console.log('👋 User logged out. Workroom data preserved for quick re-login.');
};

/**
 * PERMANENTLY DELETE WORKROOM (Manual deletion - use with caution!)
 * This is the ONLY way to completely remove data
 */
export const deleteWorkroomPermanently = async (codename: string): Promise<void> => {
  try {
    // Import delete function from persistence service
    const { deleteData } = await import('./persistenceService');
    
    await deleteData(DATA_CATEGORIES.WORKROOM, codename.toLowerCase());
    await deleteData(DATA_CATEGORIES.SESSION, `session_${codename.toLowerCase()}`);
    
    // Clear localStorage markers
    localStorage.removeItem(WORKROOM_NAME_KEY);
    localStorage.removeItem(WORKROOM_PASS_HASH_KEY);
    localStorage.removeItem(WORKROOM_CREATED_AT_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
    
    console.log('☢️ Workroom permanently deleted:', codename);
  } catch (error) {
    console.error('❌ Failed to delete workroom:', error);
    throw error;
  }
};

/**
 * Generates a secure session token
 */
const generateSessionToken = (codename: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return btoa(`${codename}:${timestamp}:${random}`).replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Gets formatted last active time
 */
export const getLastActiveFormatted = (): string => {
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
  if (!lastActive) return 'Never';
  
  const date = new Date(lastActive);
  return date.toLocaleString();
};

/**
 * Gets workroom age in days
 */
export const getWorkroomAgeDays = (): number => {
  const createdAt = localStorage.getItem(WORKROOM_CREATED_AT_KEY);
  if (!createdAt) return 0;
  
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get persistence statistics and health check
 */
export const getPersistenceHealth = async (): Promise<{
  status: 'excellent' | 'good' | 'fair' | 'poor';
  hasPersistentData: boolean;
  hasLocalStorageBackup: boolean;
  sessionStatus: 'active' | 'expired' | 'missing';
  workroomExists: boolean;
  canRecover: boolean;
  details: string[];
}> => {
  const details: string[] = [];
  const codename = localStorage.getItem(WORKROOM_NAME_KEY);
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
  
  // Check persistent storage
  let hasPersistentData = false;
  let persistentWorkroomData = null;
  
  if (codename) {
    try {
      persistentWorkroomData = await loadWorkroomData(codename);
      hasPersistentData = !!persistentWorkroomData;
      if (hasPersistentData) {
        details.push('✅ Persistent IndexedDB data found');
      }
    } catch (error) {
      details.push('⚠️ Failed to load persistent data');
    }
  }
  
  // Check localStorage backup
  const lsBackupKey = `linkyy_ls_backup_v1:workroom:${codename}`;
  const hasLocalStorageBackup = !!localStorage.getItem(lsBackupKey);
  if (hasLocalStorageBackup) {
    details.push('✅ localStorage backup found');
  } else {
    details.push('⚠️ No localStorage backup');
  }
  
  // Check session status
  let sessionStatus: 'active' | 'expired' | 'missing' = 'missing';
  
  if (token && lastActive) {
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff <= 24) {
      sessionStatus = 'active';
      details.push(`✅ Session active (${Math.round(hoursDiff)}h old)`);
    } else {
      sessionStatus = 'expired';
      details.push(`⏰ Session expired (${Math.round(hoursDiff)}h old)`);
    }
  } else {
    details.push('⚠️ No session token found');
  }
  
  // Determine if recovery is possible
  const canRecover = hasPersistentData || hasLocalStorageBackup || (sessionStatus !== 'missing');
  
  // Calculate overall status
  let status: 'excellent' | 'good' | 'fair' | 'poor';
  
  if (hasPersistentData && sessionStatus === 'active') {
    status = 'excellent';
    details.push('🎯 Perfect: Persistent data + active session');
  } else if (hasPersistentData || (sessionStatus === 'active' && hasLocalStorageBackup)) {
    status = 'good';
    details.push('✓ Data intact, full functionality available');
  } else if (canRecover) {
    status = 'fair';
    details.push('♻️ Recovery possible from backup');
  } else {
    status = 'poor';
    details.push('❌ No recoverable data found');
  }
  
  return {
    status,
    hasPersistentData,
    hasLocalStorageBackup,
    sessionStatus,
    workroomExists: !!codename,
    canRecover,
    details
  };
};

/**
 * Force restore from persistent storage (emergency recovery)
 */
export const forceRestoreSession = async (): Promise<{
  success: boolean;
  message: string;
  token?: string;
}> => {
  const codename = localStorage.getItem(WORKROOM_NAME_KEY);
  
  if (!codename) {
    return {
      success: false,
      message: 'No workroom codename found. Cannot restore.'
    };
  }
  
  try {
    // Try to load from persistent storage
    const workroomData = await loadWorkroomData(codename);
    
    if (!workroomData) {
      return {
        success: false,
        message: 'No persistent data found for this workroom.'
      };
    }
    
    // Generate new session token
    const newToken = generateSessionToken(codename);
    localStorage.setItem(SESSION_TOKEN_KEY, newToken);
    localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
    localStorage.setItem(WORKROOM_NAME_KEY, codename);
    
    console.log('♻️ Session forcefully restored from persistent storage');
    
    return {
      success: true,
      message: 'Session restored successfully! You\'re back in.',
      token: newToken
    };
  } catch (error) {
    console.error('❌ Force restore failed:', error);
    return {
      success: false,
      message: 'Failed to restore session. Please login again.'
    };
  }
};
/**
 * Generates a 2500 character alphanumeric recovery key
 */
const generateRecoveryKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 2500; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Downloads the recovery file
 */
const downloadRecoveryFile = (codename: string, key: string): void => {
  const blob = new Blob([key], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `linkyy_recovery_${codename.toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * verify recovery key and reset passcode
 */
export const resetPasscodeWithRecovery = async (codename: string, recoveryKey: string, newPasscode: string): Promise<AuthResult> => {
  try {
    const res = await fetch('/api/workroom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'reset-passcode', 
        codename: codename.trim().toLowerCase(), 
        recoveryHash: recoveryKey.trim(),
        newPasscode
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Reset failed' };
    }

    return { success: true, message: 'Passcode reset successfully' };
  } catch (error) {
    return { success: false, message: 'Network error during reset' };
  }
};

/**
 * Updates user tone
 */
export const updateUserTone = async (codename: string, tone: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/workroom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'update-tone', 
        codename: codename.trim().toLowerCase(), 
        tone 
      })
    });
    if (res.ok) {
        localStorage.setItem('linky_tone', tone);
        return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
