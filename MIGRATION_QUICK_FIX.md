# 🔧 Quick Fix: Database Migration Issue

## ❌ **Problem**

The import script failed with error: `role "amans" does not exist`

This means it's trying to connect to the wrong database server.

---

## ✅ **Solution - 2 Options**

### **Option 1: Interactive Helper (Recommended)**

Run this interactive script that will guide you:

```bash
node scripts/migrateHelper.js
```

It will:
1. Check for export file ✅
2. Ask for production database URL
3. Update `.env.local` automatically
4. Run the import script for you

---

### **Option 2: Manual Steps**

#### **Step 1: Get Production Database URL**

1. Go to: https://vercel.com/amansingh79033-ship-its-projects/linkaaa
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in sidebar
4. Find **"DATABASE_URL"** or **"POSTGRES_URL"**
5. Click **"Reveal"** button
6. Copy the entire URL (it looks like: `postgres://user:password@host:port/database`)

#### **Step 2: Update .env.local**

Open `.env.local` and find this line:
```bash
PRODUCTION_DATABASE_URL=""
```

Paste your production URL between the quotes:
```bash
PRODUCTION_DATABASE_URL="postgres://user:password@host:port/database"
```

Save the file.

#### **Step 3: Run Import**

```bash
node scripts/importDB.js db-export-2026-03-31T12-09-47-886Z.json
```

---

## 🎯 **Expected Output**

If successful, you should see:

```
📥 Importing data from: db-export-2026-03-31T12-09-47-886Z.json
✅ Export file loaded successfully

🚀 Starting database import to production...

✅ Connected to production database
   Database time: 2026-03-31T12:XX:XX.XXXZ

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
```

---

## 🔍 **Verify Migration**

After successful import:

1. Visit: https://www.linkyy.online/admin
2. Login: `Addy` / `Password12`
3. Check Overview tab → Should show **5 total users**
4. Check User Analytics → Should list **all 5 users**
5. Check Workrooms → Should show **3 workrooms**

---

## 🐛 **Still Having Issues?**

### **If you don't have a production database yet:**

Your Vercel deployment might be using a different database or no database at all.

**Check Vercel Environment Variables:**
1. Go to Vercel dashboard
2. Your project → Settings → Environment Variables
3. Look for `DATABASE_URL` or `POSTGRES_URL`
4. If it doesn't exist, you need to set up a production database first

**Popular Options:**
- [Neon](https://neon.tech) - Free PostgreSQL hosting
- [Supabase](https://supabase.com) - Free PostgreSQL with extras
- [Railway](https://railway.app) - Easy PostgreSQL hosting

### **If connection still fails:**

The production database URL might be:
- Incorrect (double-check you copied it correctly)
- Not accessible (firewall blocking connections)
- Wrong format (should start with `postgres://`)

---

## 📞 **Need Help?**

Run the helper script:
```bash
node scripts/migrateHelper.js
```

It will guide you through each step interactively!

---

**Files Created:**
- [`scripts/migrateHelper.js`](c:\Users\amans\Downloads\linkaaa\scripts\migrateHelper.js) - Interactive helper
- [`.env.local`](c:\Users\amans\Downloads\linkaaa\.env.local) - Updated with instructions

**Next Step:** Run `node scripts/migrateHelper.js` and follow the prompts! 🚀
