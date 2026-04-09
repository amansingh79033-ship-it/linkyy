# 🧪 Admin Dashboard - Live Testing Guide

**Servers Running:**
- **Backend (Vercel)**: http://localhost:8000/
- **Frontend (Vite)**: http://localhost:3003/

---

## ✅ **Quick Start**

### **Option 1: Automated Tests (Recommended)**

Open browser console (F12) at http://localhost:3003 and run:

```javascript
// Run full test suite
await runAdminDashboardTests();
```

**Expected Output:**
```
🧪 Starting Admin Dashboard Test Suite...

✅ Backend Connectivity
✅ Database Connection
✅ Admin Authentication Endpoint
✅ User Data Retrieval
✅ Workrooms Data Retrieval
✅ Persistence Health Check
✅ Session Validation with Recovery
✅ Analytics Data Retrieval
✅ Platform Metrics Retrieval
✅ Error Statistics
✅ Admin Dashboard UI Rendering
✅ Data Consistency Check

=================================
📊 Admin Dashboard Test Summary
   ✅ Passed: 12
   ❌ Failed: 0
   📝 Total:  12
=================================

🎉 All tests passed! Admin dashboard is fully operational!
```

---

### **Option 2: Manual Testing**

#### **Step 1: Access Admin Dashboard**

1. Navigate to: http://localhost:3003/
2. Click **"Admin"** button in navigation (top right or bottom)
3. Enter credentials:
   - **Username**: `Addy`
   - **Password**: `Password12`
4. Click **"Login to Admin Dashboard"**

#### **Step 2: Verify All Tabs**

##### **Overview Tab** ✓
Check these metrics are showing real data:
- [ ] **Total Users** - Should show number from database
- [ ] **Active Today** - Real-time active users
- [ ] **Posts Generated** - Total posts created
- [ ] **Avg Dwell Score** - Engagement metric
- [ ] **Uptime** - System status (99.97%)
- [ ] **Response Time** - API latency (245ms)
- [ ] **Error Rate** - Error percentage

**Debug Panel** (at top):
Should show green checkmarks:
```
Data Status: Stats: ✅ Behavior: X users Metrics: ✅ Workrooms: Y
| Users: X | Active: Y | Posts: Z
```

##### **User Analytics Tab** ✓
Verify:
- [ ] User table populated with codenames
- [ ] Posts column showing numbers
- [ ] Return probability bars filled
- [ ] Forecast chart displaying data
- [ ] At least 1 user listed (if any exist)

##### **Forecasting Tab** ✓
Check:
- [ ] Weekly activity pattern bars visible
- [ ] Error rate by time chart rendered
- [ ] User behavior forecast metrics shown
- [ ] High engagement percentage calculated

##### **Workrooms Tab** ✓
Verify:
- [ ] Table shows all workrooms
- [ ] Codenames displayed correctly
- [ ] Creation dates formatted properly
- [ ] Status badges showing "Secured"

##### **Access Control Tab** ✓
Check:
- [ ] User management interface loads
- [ ] Can view user details
- [ ] Can revoke access if needed

---

## 🔍 **API Endpoint Testing**

### **Quick Smoke Test**

In browser console, run:

```javascript
await quickSmokeTest();
```

**Expected Output:**
```
🔬 Running quick API smoke test...

✅ /api/stats: { totalUsers: 5, activeToday: 3, ... }
✅ /api/users: 5 users
✅ /api/admin-workrooms: 2 workrooms

🎉 All API endpoints responding!
```

### **Manual API Testing**

Run each command individually:

```javascript
// Test 1: Platform stats
const stats = await fetch('/api/stats').then(r => r.json());
console.log('Stats:', stats);
// Expected: { totalUsers, activeToday, postsGenerated, ... }

// Test 2: User list
const users = await fetch('/api/users').then(r => r.json());
console.log('Users:', users);
// Expected: Array of user objects

// Test 3: Workrooms
const workrooms = await fetch('/api/admin-workrooms').then(r => r.json());
console.log('Workrooms:', workrooms);
// Expected: Array of workroom objects

// Test 4: Activity logs
const activities = await fetch('/api/log-activity', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    codename: 'test',
    action: 'login',
    userAgent: navigator.userAgent
  })
});
console.log('Activity logged:', await activities.json());
```

---

## 💾 **Persistence Testing**

### **Test Auto-Recovery**

```javascript
await testPersistenceRecovery();
```

**Expected Output:**
```
♻️ Testing persistence recovery...

Current Health: excellent
Session Valid: true

✅ Persistence recovery test complete!
```

### **Manual Persistence Test**

1. **Save Data:**
```javascript
const { saveWorkroomData } = await import('./services/persistenceService');
await saveWorkroomData('test_persist', { 
  message: 'I will survive!', 
  timestamp: Date.now() 
});
console.log('✅ Data saved to IndexedDB');
```

2. **Reload Page:**
```javascript
window.location.reload();
```

3. **After Reload, Recover:**
```javascript
const { loadWorkroomData } = await import('./services/persistenceService');
const data = await loadWorkroomData('test_persist');
console.log('Recovered data:', data);
// Should show your saved message!
```

---

## 🏥 **Health Check Commands**

### **Full System Health**

```javascript
const { getPersistenceHealth } = await import('./services/authService');
const health = await getPersistenceHealth();
console.table(health);
```

**Expected Output:**
```
status: "excellent"
hasPersistentData: true
hasLocalStorageBackup: true
sessionStatus: "active"
workroomExists: true
canRecover: true
details: [
  "✅ Persistent IndexedDB data found",
  "✅ localStorage backup found",
  "✅ Session active (2h old)"
]
```

### **Persistence Statistics**

```javascript
const { getPersistenceStats } = await import('./services/persistenceService');
const stats = await getPersistenceStats();
console.log('Persistence Stats:', stats);
```

**Expected Output:**
```
{
  idbCount: 15,
  lsCount: 8,
  totalSize: "45.2 KB",
  version: 1
}
```

---

## 🐛 **Troubleshooting**

### **Issue: Backend Not Responding**

**Symptoms:**
- `Failed to fetch /api/stats`
- Network errors in console

**Solution:**
```bash
# Check if Vercel dev server is running
# Should see: "Local: http://localhost:8000/"

# If not running:
npm run vercel:dev
```

### **Issue: Database Connection Failed**

**Symptoms:**
- API returns 500 error
- Console: "Cannot connect to PostgreSQL"

**Solution:**
```bash
# Test database connection
node scripts/testDB.js

# Expected output:
# ✅ Connected to PostgreSQL
# ✅ Database schema verified
```

### **Issue: Admin Login Fails**

**Symptoms:**
- "Invalid credentials" error
- Cannot access dashboard

**Solution:**
```javascript
// Verify credentials in console
console.log('Username:', 'Addy');
console.log('Password:', 'Password12');

// Check .env.local file has correct values
// ADMIN_USERNAME=Addy
// ADMIN_PASSWORD=Password12
```

### **Issue: Empty Dashboard (All Zeros)**

**Symptoms:**
- All metrics show "0"
- No users/workrooms listed

**Cause:** Database is empty (normal for fresh install)

**Solution:**
```javascript
// Create test workroom first
// Go to http://localhost:3003/
// Click "Enter Workspace"
// Create new workroom with codename and passcode
// Generate some content

// Then check admin dashboard again
```

### **Issue: Persistence Not Working**

**Symptoms:**
- Data lost after page reload
- Console shows IndexedDB errors

**Solution:**
```javascript
// Force emergency restore
const { emergencyRestore } = await import('./services/persistenceService');
const result = await emergencyRestore();
console.log('Restore result:', result);

// Re-initialize persistence
const { initPersistence } = await import('./services/persistenceService');
await initPersistence();
```

---

## 📊 **Expected Results**

### **With Existing Data:**

If you have existing workrooms/users:

```
Overview Tab:
- Total Users: X (actual count)
- Active Today: Y (recent users)
- Posts Generated: Z (total content)
- Workrooms: N (created rooms)

User Analytics Tab:
- Shows X users in table
- Each row has posts, dwell score, return probability

Workrooms Tab:
- Lists all N workrooms
- Shows creation dates
- Status: Secured
```

### **Fresh Install (Empty Database):**

```
Overview Tab:
- Total Users: 0
- Active Today: 0
- Posts Generated: 0
- Workrooms: 0

Empty State Messages:
- "No workrooms created yet"
- "No user behavior data loaded"
- "User behavior analytics will appear here..."
```

This is **NORMAL** and expected!

---

## 🎯 **Success Criteria**

Your admin dashboard is working correctly if:

✅ **Backend:**
- [ ] All API endpoints respond
- [ ] Database queries succeed
- [ ] Stats endpoint returns valid data
- [ ] Users endpoint returns array
- [ ] Workrooms endpoint returns array

✅ **Frontend:**
- [ ] Admin login page accessible
- [ ] Can authenticate with correct credentials
- [ ] Dashboard loads without errors
- [ ] All 5 tabs render correctly
- [ ] Navigation between tabs works

✅ **Data Flow:**
- [ ] Overview tab shows metrics (or zeros if empty DB)
- [ ] User analytics displays user list
- [ ] Forecasting shows predictions
- [ ] Workrooms lists created rooms
- [ ] Access control tab loads

✅ **Persistence:**
- [ ] Health check returns "excellent" or "good"
- [ ] Has persistent data: true
- [ ] Can recover: true
- [ ] Session survives page reload
- [ ] Auto-backup running

---

## 🚀 **Advanced Testing**

### **Load Testing**

Simulate multiple concurrent requests:

```javascript
async function loadTest() {
  console.log('🏋️ Running load test...\n');
  
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(fetch('/api/stats').then(r => r.json()));
    promises.push(fetch('/api/users').then(r => r.json()));
    promises.push(fetch('/api/admin-workrooms').then(r => r.json()));
  }
  
  const start = performance.now();
  await Promise.all(promises);
  const duration = performance.now() - start;
  
  console.log(`✅ Completed 30 API calls in ${duration.toFixed(0)}ms`);
  console.log(`   Average: ${(duration / 30).toFixed(0)}ms per call\n`);
}

loadTest();
```

### **Stress Test Persistence**

```javascript
async function stressTestPersistence() {
  console.log('💪 Stress testing persistence...\n');
  
  const { saveWorkroomData, loadWorkroomData } = 
    await import('./services/persistenceService');
  
  // Save 100 items rapidly
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    await saveWorkroomData(`stress_test_${i}`, { 
      index: i, 
      timestamp: Date.now() 
    });
  }
  
  // Load them all back
  for (let i = 0; i < 100; i++) {
    const data = await loadWorkroomData(`stress_test_${i}`);
    if (!data || data.index !== i) {
      console.error(`❌ Failed at index ${i}`);
      return;
    }
  }
  
  const duration = performance.now() - start;
  console.log(`✅ Saved & loaded 100 items in ${duration.toFixed(0)}ms`);
  console.log(`   Average: ${(duration / 200).toFixed(0)}ms per operation\n`);
}

stressTestPersistence();
```

---

## 📝 **Testing Checklist**

Before considering testing complete:

### **Backend Tests:**
- [ ] `/api/stats` responds with valid JSON
- [ ] `/api/users` returns user array
- [ ] `/api/admin-workrooms` returns workroom array
- [ ] `/api/log-activity` accepts POST requests
- [ ] Database connection stable
- [ ] No console errors on backend

### **Frontend Tests:**
- [ ] Admin login page renders
- [ ] Authentication works with Addy/Password12
- [ ] Dashboard loads successfully
- [ ] All 5 tabs accessible
- [ ] Navigation works smoothly
- [ ] No TypeScript errors
- [ ] No React warnings

### **Data Tests:**
- [ ] Stats reflect actual database state
- [ ] User list matches database
- [ ] Workrooms match database
- [ ] Analytics calculate correctly
- [ ] Forecasts display properly

### **Persistence Tests:**
- [ ] IndexedDB initialized
- [ ] localStorage backups created
- [ ] Auto-backup running (every 5 min)
- [ ] Session recovery works
- [ ] Health check passes
- [ ] Emergency restore functional

---

## 🎉 **Completion**

Once all tests pass:

**✅ Your Linkyy platform is production-ready!**

You have verified:
- ✅ Backend API functionality
- ✅ Database connectivity
- ✅ Frontend rendering
- ✅ Data persistence
- ✅ Session management
- ✅ Error handling
- ✅ Recovery mechanisms

**Next Steps:**
1. Document any issues found
2. Fix critical bugs if any
3. Deploy to production
4. Monitor with health checks

---

**Testing Guide Version:** 1.0  
**Last Updated:** March 31, 2026  
**Status:** Ready for Testing ✅
