# 🔧 Workroom Login/Creation Fix

## ❌ **Problem Identified**

The workrooms table is missing the `passcode_hash` column, which is required for:
- ✅ Creating new workrooms with secure passcodes
- ✅ Authenticating existing workrooms
- ✅ Storing hashed credentials (not plain text)

**Without this column:**
- ❌ Cannot create new workrooms
- ❌ Cannot login to existing workrooms
- ❌ API returns 500 error (column doesn't exist)

---

## ✅ **Solution Applied**

### **1. Updated API Endpoint** ✅

File: [`api/workroom.js`](c:\Users\amans\Downloads\linkaaa\api\workroom.js)

**Changes:**
- ✅ Added detailed console logging for debugging
- ✅ Proper error handling and stack traces
- ✅ Clear logging of each step in creation/authentication flow

**What it does now:**
```javascript
// Creation Flow
1. Check if workroom exists
2. Hash passcode with bcrypt (12 salt rounds)
3. INSERT into database with codename + passcode_hash
4. Return success

// Authentication Flow  
1. Query workroom by codename
2. Retrieve passcode_hash from database
3. Compare provided passcode with stored hash
4. Return success if valid
```

---

### **2. Fixed Database Schema** ✅

File: [`scripts/setupProductionDB.js`](c:\Users\amans\Downloads\linkaaa\scripts\setupProductionDB.js)

**Updated Schema:**
```sql
CREATE TABLE IF NOT EXISTS workrooms (
  codename VARCHAR(255) PRIMARY KEY,
  passcode_hash VARCHAR(255),        -- ← ADDED THIS COLUMN
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Before:**
```sql
workrooms (
  codename,
  created_at
)
```

**After:**
```sql
workrooms (
  codename,
  passcode_hash,     ← NEW!
  created_at
)
```

---

### **3. Created Migration Script** ✅

File: [`scripts/fixWorkroomSchema.js`](c:\Users\amans\Downloads\linkaaa\scripts\fixWorkroomSchema.js)

**Purpose:** Add the missing `passcode_hash` column to existing databases

**What it does:**
1. Checks if `passcode_hash` column exists
2. Adds column if missing using `ALTER TABLE`
3. Verifies the column was added successfully
4. Shows complete table structure
5. Lists existing workrooms

**How to run:**
```bash
node scripts/fixWorkroomSchema.js
```

**Expected Output:**
```
🔧 Fixing Workroom Schema

⚠️  passcode_hash column is missing!
📝 Adding passcode_hash column to workrooms table...

✅ Column added successfully!

📊 Column Details:
   Name: passcode_hash
   Type: character varying
   Nullable: Yes

📋 Complete Workrooms Table Structure:

Column                   Type                Nullable    Default
──────────────────────────────────────────────────────────────────
codename                 character varying   No          
passcode_hash            character varying   Yes         
created_at               timestamp           Yes         now()

✅ Workroom schema is now complete and ready!
```

---

## 🚀 **How to Fix (Step-by-Step)**

### **Option 1: Quick Fix (Recommended)**

Run the migration script to add the missing column:

```bash
# 1. Run the fix script
node scripts/fixWorkroomSchema.js

# 2. Test workroom creation
# Go to http://localhost:3000 and try creating a workroom
```

---

### **Option 2: Fresh Database Setup**

If you want to start fresh or the first option doesn't work:

```bash
# 1. Run the complete setup script
node scripts/setupProductionDB.js

# This will:
# - Guide you through creating a Neon database (if needed)
# - Create all tables with correct schema
# - Import your existing data
# - Update .env.local automatically
```

---

## 🔍 **Testing**

### **Test Workroom Creation:**

1. Go to http://localhost:3000
2. Click "Create New Workroom"
3. Enter:
   - Codename: `testroom`
   - Passcode: `1234`
   - Confirm Passcode: `1234`
4. Click "Create"

**Expected Result:**
- ✅ Success message
- ✅ Redirected to workspace
- ✅ Console shows: `[Workroom API] Created successfully!`

### **Test Workroom Login:**

1. Go to http://localhost:3000
2. Enter existing workroom codename
3. Enter passcode
4. Click "Unlock"

**Expected Result:**
- ✅ Success message
- ✅ Redirected to workspace
- ✅ Console shows: `[Workroom API] Authenticated successfully!`

---

## 🐛 **Troubleshooting**

### **Issue: Still can't create workroom**

**Check API logs:**
```bash
# The API should log:
[Workroom API] Request method: POST
[Workroom API] Action: create
[Workroom API] Codename: yourname
[Workroom API] Hashing passcode...
[Workroom API] Inserting into database...
[Workroom API] Created successfully!
```

**If you see errors:**
1. Check terminal where `npm run vercel:dev` is running
2. Look for SQL errors
3. Verify database connection in `.env.local`

---

### **Issue: "column passcode_hash does not exist"**

**Solution:**
```bash
# Run the migration script again
node scripts/fixWorkroomSchema.js

# Or manually add the column:
psql <your-database-url> -c "ALTER TABLE workrooms ADD COLUMN passcode_hash VARCHAR(255);"
```

---

### **Issue: "Failed to fetch" error**

**This means the API endpoint isn't reachable:**

1. **Check if backend is running:**
   ```bash
   # Should be running on port 8000
   curl http://localhost:8000/api/workroom
   ```

2. **Restart backend:**
   ```bash
   # Kill all node processes
   Get-Process node | Stop-Process -Force
   
   # Restart
   npm run vercel:dev
   ```

3. **Check CORS:**
   - Make sure frontend and backend are on same network
   - Both should be localhost (not one on localhost, one on 127.0.0.1)

---

## 📊 **Database Schema Reference**

### **Complete Workrooms Table:**

```sql
CREATE TABLE workrooms (
  codename VARCHAR(255) PRIMARY KEY,      -- Unique identifier (lowercase)
  passcode_hash VARCHAR(255),             -- Bcrypt hash (12 salt rounds)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- Creation timestamp
);

-- Indexes for performance
CREATE INDEX idx_workrooms_codename ON workrooms(codename);
```

### **Example Data:**

| codename | passcode_hash | created_at |
|----------|---------------|------------|
| testroom | $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.Xdl... | 2026-03-31 12:00:00 |
| myroom | $2a$12$9LmKpXzZv8FhN2QwRtYuI1OpAsdfghjklqwertyuiop... | 2026-03-31 12:05:00 |

**Note:** `passcode_hash` stores the bcrypt hash, NOT the plain text passcode!

---

## 🔐 **Security Notes**

### **Passcode Security:**

- ✅ Passcodes are hashed with bcrypt (12 salt rounds)
- ✅ Never stored as plain text
- ✅ Salt automatically generated for each hash
- ✅ Comparison uses constant-time algorithm

### **Best Practices:**

```javascript
// ✅ GOOD - What we do
const hash = hashSync(passcode, 12);  // Hash with 12 salt rounds
const isValid = compareSync(passcode, hash);  // Safe comparison

// ❌ BAD - Don't do this
// Storing plain text passcodes
// Using weak hashing (MD5, SHA1)
// Creating your own crypto algorithms
```

---

## 📝 **Files Modified**

| File | Changes | Status |
|------|---------|--------|
| [`api/workroom.js`](c:\Users\amans\Downloads\linkaaa\api\workroom.js) | Added debug logging | ✅ Updated |
| [`scripts/setupProductionDB.js`](c:\Users\amans\Downloads\linkaaa\scripts\setupProductionDB.js) | Added passcode_hash to schema | ✅ Updated |
| [`scripts/fixWorkroomSchema.js`](c:\Users\amans\Downloads\linkaaa\scripts\fixWorkroomSchema.js) | Created migration script | ✅ New |

---

## ✅ **Verification Checklist**

After running the fix, verify:

- [ ] `passcode_hash` column exists in workrooms table
- [ ] Can create new workroom from UI
- [ ] Can login to existing workroom
- [ ] API logs show successful operations
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] Data persists after page refresh
- [ ] Session works correctly

---

## 🎯 **Expected Behavior After Fix**

### **Creating New Workroom:**

```
User Input:
  Codename: cooldev
  Passcode: 5678
  
API Flow:
  1. Check availability → Available ✅
  2. Hash passcode → $2a$12$XYZ... 
  3. INSERT into DB → Success ✅
  4. Generate session token → Token123
  5. Redirect to workspace → Done ✅
```

### **Logging In:**

```
User Input:
  Codename: cooldev
  Passcode: 5678
  
API Flow:
  1. Query by codename → Found ✅
  2. Retrieve passcode_hash → $2a$12$XYZ...
  3. Compare passcode → Match ✅
  4. Generate session token → Token456
  5. Redirect to workspace → Done ✅
```

---

## 📞 **Need More Help?**

### **Debug Mode:**

Enable verbose logging by checking:

1. **Frontend Console** (F12):
   - Look for API call errors
   - Check network tab for failed requests

2. **Backend Terminal**:
   - Should show `[Workroom API]` logs
   - Look for SQL errors

3. **Database**:
   ```bash
   # Connect to your database
   psql <database-url>
   
   # Check workrooms table
   \d workrooms
   
   # See recent queries
   SELECT * FROM workrooms ORDER BY created_at DESC LIMIT 5;
   ```

---

## 🎉 **Success Indicators**

You'll know it's working when:

✅ No SQL errors about missing columns  
✅ API responds with 200/201 status codes  
✅ Can create workroom without errors  
✅ Can login to workroom without errors  
✅ Console shows success messages  
✅ Redirects to workspace after success  

---

**Status:** ✅ Fix Ready  
**Last Updated:** April 1, 2026  
**Affected Components:** Workroom Creation, Workroom Authentication  

🚀 **Run `node scripts/fixWorkroomSchema.js` to apply the fix!**
