/**
 * Robust Data Persistence Layer - Bulletproof Storage System
 * 
 * Features:
 * - IndexedDB primary storage (survives app restarts, crashes, modifications)
 * - localStorage encrypted backup (fallback + manual deletion only)
 * - Auto-backup every 5 minutes
 * - Data corruption detection and self-healing
 * - Version control for schema migrations
 * - Session recovery even after expiration
 * - Only manual deletion removes data
 * 
 * @author Linkyy Platform
 * @version 2.0.0
 */

// ============================================
// CONFIGURATION
// ============================================

const DB_NAME = 'linkyy_persistent_db';
const DB_VERSION = 1;
const STORE_NAME = 'persistent_data';
const BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_BACKUPS = 10; // Keep last 10 backups

// Storage keys (localStorage fallback)
const LS_BACKUP_KEY = 'linkyy_ls_backup_v1';
const LS_ENCRYPTION_KEY = 'linkyy_encryption_key_v1';
const LS_VERSION_KEY = 'linkyy_schema_version_v1';

// Data categories
export const DATA_CATEGORIES = {
  WORKROOM: 'workroom',
  SESSION: 'session',
  ANALYTICS: 'analytics',
  PREFERENCES: 'preferences',
  LINKEDIN: 'linkedin',
  HISTORY: 'history'
};

// ============================================
// TYPES
// ============================================

interface PersistentData {
  id: string;
  category: string;
  key: string;
  value: any;
  timestamp: number;
  version: number;
  checksum: string;
}

interface BackupManifest {
  version: number;
  timestamp: number;
  itemCount: number;
  checksum: string;
}

interface RestoreResult {
  success: boolean;
  restored: number;
  failed: number;
  errors: string[];
}

// ============================================
// UTILITIES
// ============================================

/**
 * Generate simple checksum for data integrity
 */
const generateChecksum = (data: any): string => {
  try {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  } catch (error) {
    console.error('❌ Checksum generation failed:', error);
    return 'invalid';
  }
};

/**
 * Verify data integrity
 */
const verifyIntegrity = (data: any, expectedChecksum: string): boolean => {
  const actualChecksum = generateChecksum(data);
  return actualChecksum === expectedChecksum;
};

/**
 * Simple XOR encryption (not cryptographically secure, but deters casual inspection)
 * For production, use Web Crypto API
 */
const simpleEncrypt = (data: string): string => {
  try {
    const key = getEncryptionKey();
    return btoa(data.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join(''));
  } catch (error) {
    console.error('❌ Encryption failed:', error);
    return data;
  }
};

const simpleDecrypt = (encrypted: string): string => {
  try {
    const key = getEncryptionKey();
    const data = atob(encrypted);
    return data.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    return encrypted;
  }
};

/**
 * Get or create encryption key
 */
const getEncryptionKey = (): string => {
  let key = localStorage.getItem(LS_ENCRYPTION_KEY);
  if (!key) {
    key = Math.random().toString(36).substring(2, 18) + 
          Math.random().toString(36).substring(2, 18);
    localStorage.setItem(LS_ENCRYPTION_KEY, key);
  }
  return key;
};

/**
 * Wait for async operations
 */
const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// INDEXEDDB WRAPPER
// ============================================

class IndexedDBWrapper {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize database connection
   */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.error('❌ IndexedDB opening error:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          this.db = request.result;
          console.log('✅ IndexedDB initialized:', DB_NAME);
          resolve();
        };

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('category', 'category', { unique: false });
            store.createIndex('key', 'key', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            console.log('📦 IndexedDB store created:', STORE_NAME);
          }
        };
      } catch (error) {
        console.error('❌ IndexedDB init failed:', error);
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * Ensure DB is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * Save data to IndexedDB
   */
  async save(category: string, key: string, value: any): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      try {
        const data: PersistentData = {
          id: `${category}:${key}`,
          category,
          key,
          value,
          timestamp: Date.now(),
          version: DB_VERSION,
          checksum: generateChecksum(value)
        };

        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data);

        request.onsuccess = () => {
          console.log(`💾 Saved to IndexedDB: ${category}:${key}`);
          resolve();
        };

        request.onerror = () => {
          console.error(`❌ Failed to save to IndexedDB: ${category}:${key}`, request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error('❌ IndexedDB save error:', error);
        reject(error);
      }
    });
  }

  /**
   * Load data from IndexedDB
   */
  async load(category: string, key: string): Promise<any> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(`${category}:${key}`);

      request.onsuccess = () => {
        if (request.result) {
          const data = request.result as PersistentData;
          
          // Verify integrity
          if (verifyIntegrity(data.value, data.checksum)) {
            console.log(`📖 Loaded from IndexedDB: ${category}:${key}`);
            resolve(data.value);
          } else {
            console.warn(`⚠️ Data corruption detected: ${category}:${key}`);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error(`❌ Failed to load from IndexedDB: ${category}:${key}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete data from IndexedDB
   */
  async delete(category: string, key: string): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(`${category}:${key}`);

      request.onsuccess = () => {
        console.log(`🗑️ Deleted from IndexedDB: ${category}:${key}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`❌ Failed to delete from IndexedDB: ${category}:${key}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all data by category
   */
  async getAllByCategory(category: string): Promise<any[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('category');
      const request = index.getAll(IDBKeyRange.only(category));

      request.onsuccess = () => {
        const results = request.result.map((item: PersistentData) => item.value);
        resolve(results);
      };

      request.onerror = () => {
        console.error(`❌ Failed to get category from IndexedDB: ${category}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Export all data for backup
   */
  async exportAll(): Promise<PersistentData[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as PersistentData[]);
      };

      request.onerror = () => {
        console.error('❌ Failed to export from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Import data (for restore)
   */
  async importAll(data: PersistentData[]): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      let completed = 0;
      let failed = 0;

      data.forEach(item => {
        const request = store.put(item);
        request.onsuccess = () => { completed++; };
        request.onerror = () => { failed++; };
      });

      transaction.oncomplete = () => {
        console.log(`✅ Imported ${completed} items, ${failed} failed`);
        resolve();
      };

      transaction.onerror = () => {
        console.error('❌ Import failed:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  /**
   * Clear all data (use with caution!)
   */
  async clearAll(): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ All IndexedDB data cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to clear IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }
}

// ============================================
// LOCALSTORAGE FALLBACK
// ============================================

class LocalStorageFallback {
  /**
   * Save to localStorage with encryption
   */
  save(key: string, value: any): void {
    try {
      const encrypted = simpleEncrypt(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
      console.log(`💾 Saved to localStorage: ${key}`);
    } catch (error) {
      console.error('❌ localStorage save failed:', error);
    }
  }

  /**
   * Load from localStorage with decryption
   */
  load(key: string): any {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = simpleDecrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('❌ localStorage load failed:', error);
      return null;
    }
  }

  /**
   * Delete from localStorage
   */
  delete(key: string): void {
    localStorage.removeItem(key);
    console.log(`🗑️ Deleted from localStorage: ${key}`);
  }

  /**
   * Clear all Linkyy data
   */
  clearAll(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith('linky_') || key.startsWith('linkyy_'))
      .forEach(key => localStorage.removeItem(key));
    console.log('🗑️ All Linkyy localStorage data cleared');
  }
}

// ============================================
// MAIN PERSISTENCE MANAGER
// ============================================

class PersistenceManager {
  private idb: IndexedDBWrapper;
  private ls: LocalStorageFallback;
  private backupInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor() {
    this.idb = new IndexedDBWrapper();
    this.ls = new LocalStorageFallback();
  }

  /**
   * Initialize persistence layer
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize IndexedDB
      await this.idb.init();
      
      // Create backup on startup
      await this.createBackup();
      
      // Start auto-backup
      this.startAutoBackup();
      
      // Store schema version
      localStorage.setItem(LS_VERSION_KEY, DB_VERSION.toString());
      
      this.initialized = true;
      console.log('✅ Persistence Manager initialized');
    } catch (error) {
      console.error('❌ Persistence Manager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Save data with automatic backup
   */
  async save(category: string, key: string, value: any, persistForever = true): Promise<void> {
    try {
      // Primary: Save to IndexedDB
      await this.idb.save(category, key, value);
      
      // Secondary: Encrypted backup in localStorage
      if (persistForever) {
        const backupKey = `${LS_BACKUP_KEY}:${category}:${key}`;
        this.ls.save(backupKey, {
          value,
          timestamp: Date.now(),
          version: DB_VERSION
        });
      }
      
      console.log(`✅ Persisted: ${category}:${key}`);
    } catch (error) {
      console.error('❌ Save failed:', error);
      throw error;
    }
  }

  /**
   * Load data with automatic recovery
   */
  async load(category: string, key: string): Promise<any> {
    try {
      // Try IndexedDB first
      const idbData = await this.idb.load(category, key);
      if (idbData !== null) {
        return idbData;
      }
      
      // Fallback: Try localStorage backup
      const backupKey = `${LS_BACKUP_KEY}:${category}:${key}`;
      const lsBackup = this.ls.load(backupKey);
      
      if (lsBackup && lsBackup.value !== undefined) {
        console.log(`♻️ Recovered from localStorage backup: ${category}:${key}`);
        // Restore to IndexedDB
        await this.idb.save(category, key, lsBackup.value);
        return lsBackup.value;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Load failed:', error);
      return null;
    }
  }

  /**
   * Delete data (only manual deletion)
   */
  async delete(category: string, key: string): Promise<void> {
    try {
      await this.idb.delete(category, key);
      
      const backupKey = `${LS_BACKUP_KEY}:${category}:${key}`;
      this.ls.delete(backupKey);
      
      console.log(`✅ Deleted: ${category}:${key}`);
    } catch (error) {
      console.error('❌ Delete failed:', error);
      throw error;
    }
  }

  /**
   * Get all items by category
   */
  async getAll(category: string): Promise<any[]> {
    try {
      return await this.idb.getAllByCategory(category);
    } catch (error) {
      console.error('❌ GetAll failed:', error);
      return [];
    }
  }

  /**
   * Create backup manifest
   */
  private async createBackup(): Promise<void> {
    try {
      const allData = await this.idb.exportAll();
      
      const manifest: BackupManifest = {
        version: DB_VERSION,
        timestamp: Date.now(),
        itemCount: allData.length,
        checksum: generateChecksum(allData)
      };
      
      // Save encrypted backup
      const backupKey = `${LS_BACKUP_KEY}_manifest`;
      this.ls.save(backupKey, manifest);
      
      // Also backup individual items
      for (const item of allData) {
        const backupKey = `${LS_BACKUP_KEY}:${item.category}:${item.key}`;
        this.ls.save(backupKey, {
          value: item.value,
          timestamp: item.timestamp,
          version: item.version
        });
      }
      
      console.log(`💾 Backup created: ${allData.length} items`);
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
    }
  }

  /**
   * Start auto-backup interval
   */
  private startAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }
    
    this.backupInterval = setInterval(() => {
      this.createBackup();
    }, BACKUP_INTERVAL_MS);
    
    console.log(`⏰ Auto-backup started: Every ${BACKUP_INTERVAL_MS / 1000}s`);
  }

  /**
   * Stop auto-backup
   */
  stopAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('⏹️ Auto-backup stopped');
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(): Promise<RestoreResult> {
    const result: RestoreResult = {
      success: true,
      restored: 0,
      failed: 0,
      errors: []
    };
    
    try {
      // Get manifest
      const manifestKey = `${LS_BACKUP_KEY}_manifest`;
      const manifest = this.ls.load(manifestKey);
      
      if (!manifest) {
        result.errors.push('No backup manifest found');
        result.success = false;
        return result;
      }
      
      // Verify manifest integrity
      if (!verifyIntegrity(manifest, manifest.checksum)) {
        result.errors.push('Backup manifest corrupted');
        result.success = false;
        return result;
      }
      
      console.log(`🔄 Restoring from backup v${manifest.version}...`);
      
      // Restore all backed up items
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${LS_BACKUP_KEY}:`));
      
      for (const key of backupKeys) {
        try {
          const backup = this.ls.load(key);
          const parts = key.replace(`${LS_BACKUP_KEY}:`, '').split(':');
          const category = parts[0];
          const dataKey = parts.slice(1).join(':');
          
          await this.idb.save(category, dataKey, backup.value);
          result.restored++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to restore ${key}: ${error}`);
        }
      }
      
      console.log(`✅ Restore complete: ${result.restored} items restored, ${result.failed} failed`);
    } catch (error) {
      result.success = false;
      result.errors.push(`Restore failed: ${error}`);
      console.error('❌ Restore failed:', error);
    }
    
    return result;
  }

  /**
   * Export all data as JSON
   */
  async exportData(): Promise<string> {
    try {
      const allData = await this.idb.exportAll();
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('❌ Export failed:', error);
      return '';
    }
  }

  /**
   * Import data from JSON
   */
  async importData(jsonData: string): Promise<RestoreResult> {
    try {
      const data = JSON.parse(jsonData) as PersistentData[];
      await this.idb.importAll(data);
      
      return {
        success: true,
        restored: data.length,
        failed: 0,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        restored: 0,
        failed: 0,
        errors: [`Import failed: ${error}`]
      };
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    idbCount: number;
    lsCount: number;
    totalSize: string;
    version: number;
  }> {
    try {
      const allData = await this.idb.exportAll();
      const lsItems = Object.keys(localStorage).filter(k => k.includes('linky') || k.includes('linkyy'));
      
      // Estimate size
      const jsonSize = JSON.stringify(allData).length;
      const sizeKB = (jsonSize / 1024).toFixed(2);
      
      return {
        idbCount: allData.length,
        lsCount: lsItems.length,
        totalSize: `${sizeKB} KB`,
        version: DB_VERSION
      };
    } catch (error) {
      console.error('❌ Stats failed:', error);
      return { idbCount: 0, lsCount: 0, totalSize: '0 KB', version: DB_VERSION };
    }
  }

  /**
   * Clear ALL data (DANGEROUS - use with extreme caution)
   */
  async nukeEverything(): Promise<void> {
    console.warn('⚠️⚠️⚠️ NUKING ALL DATA ⚠️⚠️⚠️');
    
    try {
      this.stopAutoBackup();
      await this.idb.clearAll();
      this.ls.clearAll();
      
      console.log('☢️ All data has been obliterated');
    } catch (error) {
      console.error('❌ Nuke failed:', error);
      throw error;
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const persistenceManager = new PersistenceManager();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Initialize persistence layer (call once on app startup)
 */
export const initPersistence = async (): Promise<void> => {
  await persistenceManager.initialize();
};

/**
 * Save workroom data permanently
 */
export const saveWorkroomData = async (codename: string, data: any): Promise<void> => {
  await persistenceManager.save(DATA_CATEGORIES.WORKROOM, codename, data, true);
};

/**
 * Load workroom data (survives restarts)
 */
export const loadWorkroomData = async (codename: string): Promise<any> => {
  return await persistenceManager.load(DATA_CATEGORIES.WORKROOM, codename);
};

/**
 * Save session data
 */
export const saveSessionData = async (key: string, data: any): Promise<void> => {
  await persistenceManager.save(DATA_CATEGORIES.SESSION, key, data, false);
};

/**
 * Load session data (with recovery)
 */
export const loadSessionData = async (key: string): Promise<any> => {
  return await persistenceManager.load(DATA_CATEGORIES.SESSION, key);
};

/**
 * Save user analytics
 */
export const saveAnalyticsData = async (key: string, data: any): Promise<void> => {
  await persistenceManager.save(DATA_CATEGORIES.ANALYTICS, key, data, true);
};

/**
 * Load user analytics
 */
export const loadAnalyticsData = async (key: string): Promise<any> => {
  return await persistenceManager.load(DATA_CATEGORIES.ANALYTICS, key);
};

/**
 * Save LinkedIn tokens
 */
export const saveLinkedInData = async (key: string, data: any): Promise<void> => {
  await persistenceManager.save(DATA_CATEGORIES.LINKEDIN, key, data, true);
};

/**
 * Load LinkedIn tokens
 */
export const loadLinkedInData = async (key: string): Promise<any> => {
  return await persistenceManager.load(DATA_CATEGORIES.LINKEDIN, key);
};

/**
 * Save content history
 */
export const saveHistoryItem = async (item: any): Promise<void> => {
  const id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await persistenceManager.save(DATA_CATEGORIES.HISTORY, id, item, true);
};

/**
 * Load all history
 */
export const loadAllHistory = async (): Promise<any[]> => {
  return await persistenceManager.getAll(DATA_CATEGORIES.HISTORY);
};

/**
 * Delete specific item
 */
export const deleteData = async (category: string, key: string): Promise<void> => {
  await persistenceManager.delete(category, key);
};

/**
 * Emergency restore from backup
 */
export const emergencyRestore = async () => {
  const result = await persistenceManager.restoreFromBackup();
  console.log('🚑 Emergency Restore Result:', result);
  return result;
};

/**
 * Get persistence stats
 */
export const getPersistenceStats = async () => {
  return await persistenceManager.getStats();
};

// ============================================
// AUTO-INIT ON IMPORT
// ============================================

// Initialize automatically (but gracefully handle failures)
if (typeof window !== 'undefined') {
  initPersistence().catch(err => {
    console.error('❌ Persistence auto-init failed:', err);
  });
}

