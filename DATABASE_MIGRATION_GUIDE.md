# 🔄 Database Migration Guide - Localhost to Production

**Date:** March 31, 2026  
**Status:** ✅ Ready to Migrate  
**Export File:** `db-export-2026-03-31T12-09-47-886Z.json`

---

## 📊 **Exported Data Summary**

Your local database (localhost:8000) contains:

✅ **5 users**  
✅ **3 workrooms**  
✅ **39 activity logs**  

This data will be migrated to production (linkyy.online).

---

## 🎯 **Migration Steps**

### **Step 1: Verify Export File Exists**

Check that this file exists in your project root:
```
db-export-2026-03-31T12-09-47-886Z.json
```

If it doesn't exist, run the export again:
```bash
node scripts/exportDB.js
```

---

### **Step 2: Get Production Database URL**

You need to add the production database connection to your `.env.local` file temporarily.

**Option A: Using Vercel Dashboard**

1. Go to: https://vercel.com/amansingh79033-ship-its-projects/linkaaa
2. Navigate to **Settings** → **Environment Variables**
3. Find `DATABASE_URL` or `POSTGRES_URL`
4. Copy the value

**Option B: If You Have Direct Access**

If you have the production database credentials directly, use those instead.

---

### **Step 3: Add Production DB to .env.local**

Edit your `.env.local` file and add:

```bash
# Existing local DB
DATABASE_URL="postgres://postgres:postgres@localhost:5432/Linkyy"

# ADD THIS LINE for production
PRODUCTION_DATABASE_URL="your-production-db-url-here"
```

Replace `your-production-db-url-here` with the actual production database URL from Vercel.

---

### **Step 4: Run Import Script**

Run the import script to migrate data to production:

```bash
node scripts/importDB.js db-export-2026-03-31T12-09-47-886Z.json
```

**Expected Output:**
```
📥 Importing data from: db-export-2026-03-31T12-09-47-886Z.json
✅ Export file loaded successfully

🚀 Starting database import to production...

✅ Connected to production database
   Database time: 2026-03-31T12:15:00.000Z

📦 Importing 5 user(s)...
   ✅ Imported 5 user(s)

📦 Importing 3 workroom(s)...
   ✅ Imported 3 workroom(s)

📦 Importing 39 activity log(s)...
   ✅ Imported 39 activity log(s)

📊 Import Summary:
   Total Records Imported: 47
   - Users: 5
   - Workrooms: 3
   - Activity Logs: 39

✅ Production database migration completed successfully!

📝 Next steps:
   1. Visit https://www.linkyy.online/admin
   2. Login with credentials (Addy / Password12)
   3. Verify all data appears correctly
   4. Check all tabs: Overview, User Analytics, Forecasting, Workrooms
```

---

### **Step 5: Verify in Production**

1. **Visit Production Site**: https://www.linkyy.online
2. **Navigate to Admin**: Click "Admin" button
3. **Login**: 
   - Username: `Addy`
   - Password: `Password12`
4. **Check All Tabs**:
   - ✅ **Overview**: Should show 5 total users
   - ✅ **User Analytics**: Should list all 5 users
   - ✅ **Forecasting**: Should show predictions based on 39 activities
   - ✅ **Workrooms**: Should display 3 workrooms
   - ✅ **Access Control**: Should manage 5 users

---

## 🔍 **Troubleshooting**

### **Issue: Import Script Fails with Connection Error**

**Symptoms:**
```
❌ Import failed: connect ECONNREFUSED
```

**Solution:**
The production database URL is incorrect or inaccessible.

1. Double-check the `PRODUCTION_DATABASE_URL` value
2. Ensure production database allows external connections
3. Check if database is running and accessible
4. Verify firewall settings

---

### **Issue: Permission Denied**

**Symptoms:**
```
❌ Import failed: permission denied for table users
```

**Solution:**
Database user doesn't have INSERT permissions.

1. Use a database user with write permissions
2. Grant INSERT privileges:
```sql
GRANT INSERT ON users TO your_user;
GRANT INSERT ON workrooms TO your_user;
GRANT INSERT ON activity_logs TO your_user;
```

---

### **Issue: Data Still Different After Import**

**Symptoms:**
Production still shows different data after successful import.

**Possible Causes:**
1. Browser cache showing old data
2. CDN caching at Vercel
3. Wrong database was updated

**Solution:**

**Clear Browser Cache:**
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
window.location.reload(true);
```

**Wait for Vercel Cache to Expire:**
- Vercel caches API responses for a few minutes
- Wait 5-10 minutes and refresh

**Verify Database Connection:**
```bash
# Test production database directly
node scripts/testDB.js
# Make sure DATABASE_URL points to production
```

---

## 📋 **What Gets Migrated**

### **✅ Will Be Migrated:**
- All users (codename, status, last_active, created_at)
- All workrooms (codename, created_at)
- All activity logs (id, codename, action, dwell_score, created_at)

### **⚠️ Won't Be Migrated:**
- localStorage data ( IndexedDB backups, session tokens)
- Browser-specific data
- Temporary files
- Build artifacts

**Note:** The persistent storage (IndexedDB + localStorage) is browser-specific and cannot be migrated server-side. Users will need to re-authenticate in production, but their server-side data will be intact.

---

## 🔐 **Security Notes**

### **After Migration:**

1. **Remove Production DB URL from .env.local:**
```bash
# Delete this line after migration
PRODUCTION_DATABASE_URL="..."
```

2. **Keep Only Local DB URL:**
```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/Linkyy"
```

3. **Never Commit Production Credentials:**
- `.env.local` should NOT be committed to git
- Use Vercel environment variables for production

---

## 📊 **Data Comparison**

### **Before Migration:**

**Localhost:8000:**
- Total Users: 5
- Workrooms: 3
- Activities: 39

**Production (linkyy.online):**
- Different data (whatever is currently there)

### **After Migration:**

**Both Should Show:**
- Total Users: 5
- Workrooms: 3
- Activities: 39
- Same user list
- Same workroom list

---

## 🎯 **Success Criteria**

Migration is successful when:

✅ Import script completes without errors  
✅ All 47 records imported (5+3+39)  
✅ Production admin dashboard shows same data as localhost  
✅ All tabs display correct information  
✅ No console errors on production site  

---

## 🚀 **Quick Commands Reference**

### **Export from Local:**
```bash
node scripts/exportDB.js
```

### **Import to Production:**
```bash
node scripts/importDB.js db-export-YYYY-MM-DDTHH-MM-SS-MSZ.json
```

### **Test Local DB:**
```bash
node scripts/testDB.js
```

### **Deploy to Vercel:**
```bash
npx vercel --prod
```

---

## 📞 **Support**

If you encounter issues:

1. **Check Export File**: Ensure JSON is valid and not corrupted
2. **Verify Connection**: Test production database connectivity
3. **Review Logs**: Check error messages carefully
4. **Test Locally**: Try import on a test database first

---

## ✅ **Post-Migration Checklist**

After completing migration:

- [ ] Remove `PRODUCTION_DATABASE_URL` from `.env.local`
- [ ] Clear browser cache and cookies
- [ ] Visit production site and verify data
- [ ] Test all admin dashboard tabs
- [ ] Verify user count matches (should be 5)
- [ ] Verify workroom count matches (should be 3)
- [ ] Check activity logs are present (should be 39)
- [ ] Test creating new workroom in production
- [ ] Test admin login still works

---

**Migration Status:** Ready to Execute ✅  
**Estimated Time:** 5-10 minutes  
**Risk Level:** Low (data is upserted, not replaced)  
**Rollback:** Not needed (safe operation)
