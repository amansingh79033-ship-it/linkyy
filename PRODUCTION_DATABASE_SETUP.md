# 🚀 Production Database Setup - Complete Guide

**Status:** ✅ Ready to Deploy  
**Database Provider:** Neon PostgreSQL (Free, Vercel-optimized)  
**Estimated Time:** 5 minutes  

---

## 🎯 **What This Will Do**

1. ✅ Create a FREE production PostgreSQL database on Neon
2. ✅ Set up complete schema with all tables
3. ✅ Migrate your local data (5 users, 3 workrooms, 39 activities)
4. ✅ Configure `.env.local` automatically
5. ✅ Make production and localhost identical

---

## 📋 **Prerequisites**

- ✅ Export file exists: `db-export-2026-03-31T12-09-47-886Z.json`
- ✅ GitHub account (for Neon signup)
- ✅ 5 minutes of time

---

## 🔧 **Step-by-Step Setup**

### **Run the Automated Setup Script**

```bash
node scripts/setupProductionDB.js
```

This interactive script will:
1. Guide you through creating a Neon database
2. Generate the complete database schema
3. Import all your local data to production
4. Update `.env.local` automatically

---

## 📝 **Manual Steps (What the Script Does)**

### **Step 1: Create Neon Database**

1. Go to: https://neon.tech/signup
2. Sign up with GitHub (recommended) or email
3. Click **"New Project"**
4. Name it: **"linkyy-production"**
5. Choose region closest to you
6. Click **"Create Project"**

**Neon is FREE and includes:**
- ✅ 0.5 GB storage (plenty for Linkyy)
- ✅ Automatic backups
- ✅ Branching support
- ✅ Perfect Vercel integration

---

### **Step 2: Get Connection String**

In Neon dashboard:

1. You'll see your project "linkyy-production"
2. Look for **"Connection Details"** or **"Connection Info"**
3. Find the URI that looks like:
   ```
   postgres://user:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
4. Click **"Copy"** to copy it

---

### **Step 3: Run Migration Script**

The setup script will:

1. Test the connection to Neon
2. Create all required tables:
   - `users` - User accounts
   - `workrooms` - Workroom credentials
   - `activity_logs` - User activity tracking
   - `admin_sessions` - Admin session management
3. Create performance indexes
4. Insert default admin user
5. Import your local data

---

## 🗄️ **Complete Database Schema**

The script creates this exact schema:

```sql
-- Users table
CREATE TABLE users (
  codename VARCHAR(255) PRIMARY KEY,
  status VARCHAR(50) DEFAULT 'active',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workrooms table
CREATE TABLE workrooms (
  codename VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  codename VARCHAR(255) REFERENCES users(codename) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  dwell_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin sessions table
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  token VARCHAR(512) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_activity_codename ON activity_logs(codename);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);
```

---

## ✅ **After Setup Complete**

### **1. Verify .env.local Updated**

Your `.env.local` should now have:

```bash
# Production database (Neon)
DATABASE_URL="postgres://user:pass@ep-xxxxx.neon.tech/dbname?sslmode=require"
PRODUCTION_DATABASE_URL="postgres://user:pass@ep-xxxxx.neon.tech/dbname?sslmode=require"

# Admin credentials
ADMIN_USERNAME=Addy
ADMIN_PASSWORD=Password12
```

### **2. Deploy to Vercel**

```bash
npx vercel --prod
```

Vercel will automatically use the DATABASE_URL from your environment.

### **3. Test Production**

Visit: https://www.linkyy.online/admin

Login:
- Username: `Addy`
- Password: `Password12`

**Expected Results:**
- ✅ Overview shows 5 total users
- ✅ User Analytics lists all 5 users
- ✅ Workrooms shows 3 workrooms
- ✅ All data matches localhost:8000

---

## 🔍 **Verification Commands**

### **Test Database Connection**
```bash
node scripts/testDB.js
```

Should show:
```
✅ Connected to Neon database
Total users in DB: 5
```

### **Check Data Count**
```bash
node -e "
import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL=\"([^\"]+)\"/);
const pool = new Pool({ connectionString: match[1] });
const users = await pool.query('SELECT COUNT(*) FROM users');
console.log('Users:', users.rows[0].count);
const workrooms = await pool.query('SELECT COUNT(*) FROM workrooms');
console.log('Workrooms:', workrooms.rows[0].count);
const activities = await pool.query('SELECT COUNT(*) FROM activity_logs');
console.log('Activities:', activities.rows[0].count);
await pool.end();
"
```

---

## 🎁 **Benefits of Using Neon**

✅ **FREE Forever**
- 0.5 GB storage
- Unlimited databases
- Automatic backups
- No credit card required

✅ **Vercel Integration**
- One-click setup
- Automatic environment variables
- Edge-ready
- SSL by default

✅ **Developer Friendly**
- Instant branching
- Serverless architecture
- Pay-as-you-grow
- Great dashboard

✅ **Production Ready**
- 99.9% uptime SLA
- Auto-scaling
- Point-in-time recovery
- SOC 2 compliant

---

## 🐛 **Troubleshooting**

### **Issue: Can't Access Neon Dashboard**

**Solution:**
- Try incognito/private browsing
- Clear browser cache
- Use GitHub login (most reliable)

### **Issue: Connection String Doesn't Work**

**Check Format:**
Should be: `postgres://user:password@host/database?sslmode=require`

**Common Mistakes:**
- Missing `?sslmode=require` at the end
- Wrong username or password
- Using wrong host URL

### **Issue: Migration Fails**

**Check:**
1. Connection string is correct
2. Internet connection is stable
3. Neon project was created successfully
4. Database URL is in `.env.local`

**Retry Migration:**
```bash
node scripts/importDB.js db-export-2026-03-31T12-09-47-886Z.json
```

---

## 📞 **Alternative: Manual Setup**

If the automated script doesn't work, here's how to do it manually:

### **1. Create Neon Account**
- Go to https://neon.tech
- Sign up with GitHub
- Create project "linkyy-production"

### **2. Copy Connection String**
- Dashboard → Connection Details
- Copy the full URI

### **3. Update .env.local Manually**
Open `.env.local` and set:
```bash
DATABASE_URL="your-neon-url-here"
PRODUCTION_DATABASE_URL="your-neon-url-here"
```

### **4. Create Tables Manually**
Use Neon's SQL editor or a tool like pgAdmin to run the schema SQL above.

### **5. Import Data**
```bash
node scripts/importDB.js db-export-2026-03-31T12-09-47-886Z.json
```

---

## 🎉 **Success Checklist**

After setup, verify:

- [ ] Neon account created
- [ ] Project "linkyy-production" exists
- [ ] Connection string copied to `.env.local`
- [ ] Database tables created successfully
- [ ] Local data imported (5 users, 3 workrooms, 39 activities)
- [ ] Can connect to database (`node scripts/testDB.js`)
- [ ] Deployed to Vercel (`npx vercel --prod`)
- [ ] Production site shows correct data
- [ ] Admin dashboard accessible with Addy/Password12

---

## 🚀 **Quick Start Command**

Just run this one command and follow the prompts:

```bash
node scripts/setupProductionDB.js
```

It handles everything automatically! 🎯

---

**Created:** March 31, 2026  
**Database Provider:** Neon PostgreSQL  
**Cost:** FREE (forever tier)  
**Setup Time:** ~5 minutes  
**Status:** Ready to Execute ✅
