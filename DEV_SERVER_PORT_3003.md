# 🚀 Dev Server Configuration - Port 3003

## ✅ **Configuration Updated**

### **Changed:** `vite.config.ts`

**Before:**
```typescript
const port = parseInt(process.env.PORT || '3000');
```

**After:**
```typescript
const port = parseInt(process.env.PORT || '3003');
```

---

## 📋 **Port Assignments**

| Service | Command | Port | URL | Status |
|---------|---------|------|-----|--------|
| **Frontend** | `npm run dev` | **3003** | http://localhost:3003 | ✅ Configured |
| **Backend (Vercel)** | `npm run vercel:dev` | **8000** | http://localhost:8000 | ✅ Running |

---

## 🎯 **How to Run**

### **Option 1: Run Both Servers (Recommended)**

```bash
# Terminal 1 - Backend on port 8000
npm run vercel:dev

# Terminal 2 - Frontend on port 3003
npm run dev
```

### **Option 2: Just Frontend**

```bash
# This will run frontend on port 3003
# Note: API calls won't work without backend running
npm run dev
```

---

## 🔗 **Access URLs**

### **Development:**
- **Frontend:** http://localhost:3003
- **Backend API:** http://localhost:8000/api
- **Admin Dashboard:** http://localhost:8000/admin

### **Network Access:**
- **Frontend:** http://192.168.1.106:3003
- **Backend:** http://192.168.1.106:8000

---

## 🧪 **Quick Test**

After starting the servers, verify they're working:

### **Test Frontend:**
```bash
curl http://localhost:3003
```
Should return HTML content

### **Test Backend:**
```bash
curl http://localhost:8000/api/stats
```
Should return JSON with statistics

### **Test Workroom Creation:**
1. Go to http://localhost:3003
2. Try creating a workroom
3. Should work if backend is also running on port 8000

---

## 🔧 **Proxy Configuration**

The Vite config includes proxy settings to forward API calls:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true
  }
}
```

**What this means:**
- Any request to `/api/*` from frontend (port 3003)
- Automatically forwarded to backend (port 8000)
- No CORS issues!

---

## 🐛 **Troubleshooting**

### **Issue: Port 3003 already in use**

**Solution:**
```bash
# Find what's using port 3003
Get-NetTCPConnection -LocalPort 3003 -ErrorAction SilentlyContinue

# Kill the process
Stop-Process -Id <PID> -Force

# Or use a different port
PORT=3004 npm run dev
```

---

### **Issue: Can't connect to backend API**

**Check:**
1. Backend is running on port 8000
   ```bash
   curl http://localhost:8000/api/stats
   ```

2. Proxy is configured correctly in `vite.config.ts`

3. Both servers are on same network (localhost)

---

### **Issue: Wrong port showing**

**Verify:**
```bash
# Check vite.config.ts has correct port
cat vite.config.ts | grep "const port"

# Should show: 3003
```

---

## 📊 **Server Startup Output**

### **Expected Frontend Output:**
```
VITE v6.4.1  ready in 573 ms

➜  Local:   http://localhost:3003/
➜  Network: http://192.168.1.106:3003/
➜  press h + enter to show help
```

### **Expected Backend Output:**
```
Vercel CLI 50.9.6
> Running Dev Command "vite --port $PORT"
  VITE v6.4.1  ready in 918 ms
  ➜  Local:   http://localhost:8000/
  ➜  Network: http://192.168.1.106:8000/
```

---

## ✅ **Verification Checklist**

After running both servers:

- [ ] Frontend accessible at http://localhost:3003
- [ ] Backend accessible at http://localhost:8000
- [ ] API calls from frontend work (proxied to backend)
- [ ] Can create/login to workrooms
- [ ] Admin dashboard accessible
- [ ] No CORS errors in browser console
- [ ] Both terminals show "ready" messages

---

## 🎯 **Quick Start Commands**

### **Terminal 1 (Backend):**
```bash
npm run vercel:dev
```

### **Terminal 2 (Frontend):**
```bash
npm run dev
```

### **Then visit:**
- Frontend: http://localhost:3003
- Workroom: Create or login
- Admin: http://localhost:8000/admin (Addy/Password12)

---

## 📝 **Files Modified**

| File | Change | Status |
|------|--------|--------|
| [`vite.config.ts`](c:\Users\amans\Downloads\linkaaa\vite.config.ts) | Changed default port from 3000 to 3003 | ✅ Updated |

---

## 💡 **Pro Tips**

### **Custom Port via Environment Variable:**

```bash
# Override to any port you want
PORT=3005 npm run dev
```

### **Run Both in Background (PowerShell):**

```powershell
# Terminal 1
Start-Process powershell -ArgumentList "npm run vercel:dev"

# Terminal 2  
Start-Process powershell -ArgumentList "npm run dev"
```

---

**Status:** ✅ Configured for port 3003  
**Last Updated:** April 1, 2026  
**Default Ports:** Frontend=3003, Backend=8000  

🎉 **Now run `npm run dev` and it will start on port 3003!**
