# 🚀 Deploy Frontend to Vercel

**Quick Guide to Get Your Dashboard Live!**

---

## Prerequisites ✅

- [x] Frontend code ready (✅ Done!)
- [x] ML API deployed (✅ https://landslide-ml-api.onrender.com)
- [x] Backend API deployed (should be on Render already)
- [x] Vercel account (create if needed)

---

## Method 1: Deploy via Vercel CLI (Fastest)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Frontend
```bash
cd frontend
vercel --prod
```

**That's it!** Vercel will:
1. Build your frontend
2. Deploy to production
3. Give you a live URL like: `https://your-project.vercel.app`

---

## Method 2: Deploy via Vercel Dashboard (Easiest)

### Step 1: Go to Vercel
Visit: https://vercel.com/new

### Step 2: Import Your GitHub Repo
1. Click "Import Project"
2. Select your GitHub repo: `ritikravi/landslide-ml`
3. Click "Import"

### Step 3: Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

```
VITE_API_URL=https://landslide-api.onrender.com
VITE_SOCKET_URL=https://landslide-api.onrender.com
VITE_ML_API_URL=https://landslide-ml-api.onrender.com
```

### Step 5: Deploy!
Click "Deploy" button

---

## Method 3: Auto-Deploy on Git Push

### Step 1: Connect to Vercel
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo

### Step 2: Configure
Same as Method 2

### Step 3: Enable Auto-Deploy
Once connected, every time you push to `main`:
```bash
git push origin main
```
Vercel automatically deploys! 🎉

---

## After Deployment

### 1. Get Your URL
Vercel gives you a URL like:
```
https://landslide-monitoring.vercel.app
```

### 2. Test Your Dashboard
Visit the URL and verify:
- ✅ Dashboard loads
- ✅ Sensor data shows
- ✅ ML Prediction Card appears
- ✅ Charts display
- ✅ Real-time updates work

### 3. Custom Domain (Optional)
In Vercel dashboard:
1. Go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain

---

## Environment Variables Setup

### Development (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ML_API_URL=https://landslide-ml-api.onrender.com
```

### Production (Vercel Dashboard)
```bash
VITE_API_URL=https://landslide-api.onrender.com
VITE_SOCKET_URL=https://landslide-api.onrender.com
VITE_ML_API_URL=https://landslide-ml-api.onrender.com
```

---

## Quick Deploy Commands

### First Time Deploy
```bash
cd frontend
vercel
```

### Deploy to Production
```bash
cd frontend
vercel --prod
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs
```

---

## Troubleshooting

### Build Fails
**Problem**: "Module not found" errors

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build  # Test locally first
```

### Environment Variables Not Working
**Problem**: API calls fail in production

**Solution**:
1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Add all three VITE_ variables
4. Redeploy: `vercel --prod`

### CORS Errors
**Problem**: ML API blocked by CORS

**Solution**: The ML API already has CORS enabled, but verify:
```bash
curl -I https://landslide-ml-api.onrender.com/health
# Should see: Access-Control-Allow-Origin: *
```

### Slow First Load
**Problem**: Render ML API cold start

**Solution**: Normal for free tier - first request takes 10-30 seconds

---

## Complete Deployment Checklist

- [ ] **Step 1**: Push latest code to GitHub
  ```bash
  git push origin main
  ```

- [ ] **Step 2**: Login to Vercel
  ```bash
  vercel login
  ```

- [ ] **Step 3**: Deploy frontend
  ```bash
  cd frontend
  vercel --prod
  ```

- [ ] **Step 4**: Add environment variables (if prompted)
  - VITE_API_URL
  - VITE_SOCKET_URL  
  - VITE_ML_API_URL

- [ ] **Step 5**: Wait for build (2-3 minutes)

- [ ] **Step 6**: Get your URL from Vercel output

- [ ] **Step 7**: Test your dashboard!

---

## Your Complete System (After Deploy)

```
┌─────────────────────────────────────────────┐
│                                             │
│  ESP32 Sensors (Hardware)                   │
│           ↓                                 │
│  Backend API (Render)                       │
│  https://landslide-api.onrender.com         │
│           ↓                                 │
│  ML API (Render)                            │
│  https://landslide-ml-api.onrender.com      │
│           ↓                                 │
│  Frontend Dashboard (Vercel)                │
│  https://your-project.vercel.app            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Post-Deploy Verification

### 1. Health Checks
```bash
# Backend API
curl https://landslide-api.onrender.com/health

# ML API  
curl https://landslide-ml-api.onrender.com/health

# Frontend (in browser)
https://your-project.vercel.app
```

### 2. Test ML Integration
1. Open your dashboard
2. Check for ML Prediction Card
3. Verify SHAP explanations show
4. Look for anomaly alerts

### 3. Monitor Performance
- Vercel Dashboard → Analytics
- Check response times
- Watch for errors

---

## Quick Start (Do This Now!)

```bash
# 1. Make sure everything is committed
git add .
git commit -m "ready for production deployment"
git push origin main

# 2. Deploy to Vercel
cd frontend
vercel --prod

# 3. Follow the prompts
# - Link to existing project (if you have one)
# - Or create new project
# - Add environment variables when asked

# 4. Done! 🎉
```

---

## Support

**Vercel Docs**: https://vercel.com/docs  
**Your ML API**: https://landslide-ml-api.onrender.com  
**Check Status**: Run `./ml/check_deployment.sh`

---

**Ready to deploy? Just run:**
```bash
cd frontend && vercel --prod
```

**Your complete landslide monitoring system will be live in 3 minutes!** 🚀
