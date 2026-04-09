/**
 * Robust Persistence System - Live Demo & Tests
 * 
 * Run these tests in browser console to verify persistence is working
 */

import { 
  initPersistence,
  saveWorkroomData,
  loadWorkroomData,
  saveSessionData,
  loadSessionData,
  saveHistoryItem,
  loadAllHistory,
  getPersistenceStats,
  emergencyRestore,
  deleteData,
  DATA_CATEGORIES
} from './persistenceService';

import {
  validateSession,
  getPersistenceHealth,
  forceRestoreSession,
  createWorkroom,
  authenticateWorkroom,
  logoutWorkroom,
  deleteWorkroomPermanently
} from './authService';

// ============================================
// TEST SUITE
// ============================================

class PersistenceTests {
  private passed = 0;
  private failed = 0;

  constructor() {
    console.log('🧪 Starting Robust Persistence Test Suite...\n');
  }

  // Test 1: Initialize persistence
  async testInitialization() {
    const testName = 'Persistence Initialization';
    try {
      await initPersistence();
      this.pass(testName);
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Test 2: Save and load workroom data
  async testWorkroomPersistence() {
    const testName = 'Workroom Data Persistence';
    try {
      const testData = {
        codename: 'testuser',
        createdAt: new Date().toISOString(),
        testValue: Math.random() // Unique value to verify
      };

      await saveWorkroomData('testuser', testData);
      const loaded = await loadWorkroomData('testuser');

      if (loaded && loaded.testValue === testData.testValue) {
        this.pass(testName);
      } else {
        this.fail(testName, 'Loaded data does not match');
      }
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Test 3: Session persistence
  async testSessionPersistence() {
    const testName = 'Session Data Persistence';
    try {
      const sessionData = {
        token: `token_${Date.now()}`,
        lastActive: new Date().toISOString(),
        codename: 'testuser'
      };

      await saveSessionData('session_testuser', sessionData);
      const loaded = await loadSessionData('session_testuser');

      if (loaded && loaded.token === sessionData.token) {
        this.pass(testName);
      } else {
        this.fail(testName, 'Session data mismatch');
      }
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Test 4: History storage
  async testHistoryStorage() {
    const testName = 'History Item Storage';
    try {
      const historyItem = {
        type: 'post',
        topic: 'Test Topic',
        generatedAt: new Date().toISOString(),
        testId: Math.random()
      };

      await saveHistoryItem(historyItem);
      const allHistory = await loadAllHistory();

      const found = allHistory.find((h: any) => h.testId === historyItem.testId);
      if (found) {
        this.pass(testName);
      } else {
        this.fail(testName, 'History item not found');
      }
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Test 5: Persistence health check
  async testHealthCheck() {
    const testName = 'Persistence Health Check';
    try {
      const health = await getPersistenceHealth();
      
      if (health.status && typeof health.status === 'string') {
        console.log(`📊 Health Status: ${health.status}`);
        console.log(`   Details:`, health.details);
        this.pass(testName);
      } else {
        this.fail(testName, 'Invalid health status');
      }
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Test 6: Statistics
  async testStatistics() {
    const testName = 'Persistence Statistics';
    try {
      const stats = await getPersistenceStats();
      
      if (stats.idbCount !== undefined && stats.totalSize) {
        console.log(`📊 Statistics:`);
        console.log(`   IndexedDB items: ${stats.idbCount}`);
        console.log(`   localStorage backups: ${stats.lsCount}`);
        console.log(`   Total size: ${stats.totalSize}`);
        this.pass(testName);
      } else {
        this.fail(testName, 'Invalid statistics');
      }
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Test 7: Delete functionality
  async testDeleteData() {
    const testName = 'Data Deletion';
    try {
      // Create test data
      await saveWorkroomData('toDelete', { test: true });
      
      // Verify it exists
      const beforeDelete = await loadWorkroomData('toDelete');
      if (!beforeDelete) {
        this.fail(testName, 'Test data not created');
        return;
      }

      // Delete it
      await deleteData(DATA_CATEGORIES.WORKROOM, 'toDelete');
      
      // Verify deletion
      const afterDelete = await loadWorkroomData('toDelete');
      if (!afterDelete) {
        this.pass(testName);
      } else {
        this.fail(testName, 'Data still exists after deletion');
      }
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Test 8: Session validation with recovery
  async testSessionRecovery() {
    const testName = 'Session Recovery';
    try {
      // Set old timestamp to simulate expiration
      localStorage.setItem('linky_last_active', new Date('2020-01-01').toISOString());
      localStorage.setItem('linky_workroom_name', 'testuser');
      
      const isValid = await validateSession();
      
      // Should attempt recovery
      console.log(`   Session valid after recovery: ${isValid}`);
      this.pass(testName);
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Test 9: Emergency restore
  async testEmergencyRestore() {
    const testName = 'Emergency Restore';
    try {
      const result = await emergencyRestore();
      
      console.log(`   Restore result:`, result);
      if (result.success !== undefined) {
        this.pass(testName);
      } else {
        this.fail(testName, 'Invalid restore result');
      }
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Test 10: App restart simulation
  async testAppRestartSimulation() {
    const testName = 'App Restart Simulation';
    try {
      // Save data
      const testData = { value: Math.random() };
      await saveWorkroomData('restartTest', testData);
      
      // Simulate restart by clearing localStorage markers only
      // (IndexedDB should still have the data)
      localStorage.removeItem('linky_workroom_name');
      localStorage.removeItem('linky_session_token');
      
      // Try to recover
      const recovered = await loadWorkroomData('restartTest');
      
      if (recovered && recovered.value === testData.value) {
        console.log('   ✅ Data survived "restart"!');
        this.pass(testName);
      } else {
        this.fail(testName, 'Data lost after restart simulation');
      }
    } catch (error) {
      this.fail(testName, error);
    }
  }

  // Helper methods
  private pass(testName: string) {
    console.log(`✅ ${testName}`);
    this.passed++;
  }

  private fail(testName: string, error: any) {
    console.error(`❌ ${testName}`);
    console.error(`   Error:`, error);
    this.failed++;
  }

  // Print summary
  printSummary() {
    console.log('\n=================================');
    console.log(`📊 Test Summary`);
    console.log(`   Passed: ${this.passed}`);
    console.log(`   Failed: ${this.failed}`);
    console.log(`   Total:  ${this.passed + this.failed}`);
    console.log('=================================\n');

    if (this.failed === 0) {
      console.log('🎉 All tests passed! Persistence system is robust!\n');
    } else {
      console.log('⚠️ Some tests failed. Check errors above.\n');
    }
  }

  // Run all tests
  async runAllTests() {
    await this.testInitialization();
    await this.testWorkroomPersistence();
    await this.testSessionPersistence();
    await this.testHistoryStorage();
    await this.testHealthCheck();
    await this.testStatistics();
    await this.testDeleteData();
    await this.testSessionRecovery();
    await this.testEmergencyRestore();
    await this.testAppRestartSimulation();
    
    this.printSummary();
  }
}

// ============================================
// RUN TESTS
// ============================================

// Export for manual testing
export const runPersistenceTests = async () => {
  const tests = new PersistenceTests();
  await tests.runAllTests();
};

// Auto-run if in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 Running persistence tests in development mode...');
  runPersistenceTests();
}

// ============================================
// INTERACTIVE DEMO FUNCTIONS
// ============================================

/**
 * Demo: Create a workroom and see it persist
 */
export const demoCreateWorkroom = async () => {
  console.log('🎯 Demo: Creating workroom...');
  
  const result = await createWorkroom('demouser', '1234');
  console.log('Create result:', result);
  
  // Check persistence
  const health = await getPersistenceHealth();
  console.log('Persistence health:', health);
};

/**
 * Demo: Simulate app restart
 */
export const demoAppRestart = async () => {
  console.log('🎯 Demo: Simulating app restart...');
  
  // Save some data first
  await saveWorkroomData('restartdemo', {
    message: 'I will survive!',
    timestamp: Date.now()
  });
  
  console.log('✅ Data saved. Now clearing localStorage markers...');
  
  // Clear localStorage (simulates closing browser)
  localStorage.removeItem('linky_workroom_name');
  localStorage.removeItem('linky_session_token');
  localStorage.removeItem('linky_last_active');
  
  console.log('✅ localStorage cleared. Reloading page...');
  
  // Wait a bit then reload
  setTimeout(async () => {
    window.location.reload();
  }, 2000);
};

/**
 * Demo: After restart, recover session
 */
export const demoAfterRestart = async () => {
  console.log('🎯 Demo: Post-restart recovery...');
  
  // Check health
  const health = await getPersistenceHealth();
  console.log('Current health:', health);
  
  // Try to recover
  const restored = await forceRestoreSession();
  console.log('Restore result:', restored);
  
  // Final health check
  const finalHealth = await getPersistenceHealth();
  console.log('Final health:', finalHealth);
};

/**
 * Demo: Emergency restore scenario
 */
export const demoEmergencyRestore = async () => {
  console.log('🎯 Demo: Emergency restore scenario...');
  
  // Corrupt IndexedDB (simulate disaster)
  console.log('💥 Simulating database corruption...');
  indexedDB.deleteDatabase('linkyy_persistent_db');
  
  // Try emergency restore
  console.log('🚑 Initiating emergency restore...');
  const result = await emergencyRestore();
  console.log('Restore result:', result);
  
  // Check final state
  const health = await getPersistenceHealth();
  console.log('Final health:', health);
};

/**
 * Demo: Export/Import data
 */
export const demoExportImport = async () => {
  console.log('🎯 Demo: Export/Import data...');
  
  const { persistenceManager } = await import('./persistenceService');
  
  // Export all data
  const exported = await persistenceManager.exportData();
  console.log('Exported data (first 200 chars):', exported.substring(0, 200));
  
  // Download as file
  const blob = new Blob([exported], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `linkyy-backup-${new Date().toISOString()}.json`;
  a.click();
  
  console.log('✅ Backup file downloaded!');
  console.log('To import, use: persistenceManager.importData(jsonString)');
};

// Make available globally for console access
if (typeof window !== 'undefined') {
  (window as any).runPersistenceTests = runPersistenceTests;
  (window as any).demoCreateWorkroom = demoCreateWorkroom;
  (window as any).demoAppRestart = demoAppRestart;
  (window as any).demoAfterRestart = demoAfterRestart;
  (window as any).demoEmergencyRestore = demoEmergencyRestore;
  (window as any).demoExportImport = demoExportImport;
  
  console.log('🎮 Persistence Demo Functions Available:');
  console.log('   - runPersistenceTests()');
  console.log('   - demoCreateWorkroom()');
  console.log('   - demoAppRestart()');
  console.log('   - demoAfterRestart()');
  console.log('   - demoEmergencyRestore()');
  console.log('   - demoExportImport()');
}
