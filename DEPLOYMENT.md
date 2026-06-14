# 🚀 Deployment Guide

Complete guide to deploy your Landslide Monitoring System on Vercel (Frontend) and Render (Backend).

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free): https://vercel.com/signup
- Render account (free): https://render.com/register
- MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas/register

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Free)

### 1.1 Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up or log in
3. Click **"Build a Database"**
4. Select **"M0 FREE"** tier
5. Choose a region close to your users
6. Click **"Create"**

### 1.2 Configure Database Access

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `landslide_user`
5. **Save the password** (you'll need it later)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 1.3 Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - IP: `0.0.0.0/0`
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **"Database"** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://landslide_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name at the end:
   ```
   mongodb+srv://landslide_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/landslide_monitoring?retryWrites=true&w=majority
   ```

---

## 🔧 Step 2: Deploy Backend on Render

### 2.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: **`landslide-ml`**
5. Configure:
   - **Name**: `landslide-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 2.2 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://landslide_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/landslide_monitoring?retryWrites=true&w=majority` |
| `CORS_ORIGIN` | `*` (we'll update this after Vercel deployment) |

### 2.3 Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. You'll get a URL like: `https://landslide-api.onrender.com`
4. **Save this URL** - you'll need it for frontend!

### 2.4 Test Backend

```bash
# Health check
curl https://landslide-api.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

> **Note**: Free tier on Render spins down after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## 🎨 Step 3: Deploy Frontend on Vercel

### 3.1 Create Environment File

Create `frontend/.env.production`:

```env
VITE_API_URL=https://landslide-api.onrender.com
VITE_SOCKET_URL=https://landslide-api.onrender.com
```

### 3.2 Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → `landslide-monitoring`
- **Directory?** → `./`
- **Override settings?** → No

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `landslide-ml`
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables**:
   - Click **"Environment Variables"**
   - Add:
     - `VITE_API_URL` = `https://landslide-api.onrender.com`
     - `VITE_SOCKET_URL` = `https://landslide-api.onrender.com`

6. Click **"Deploy"**

### 3.3 Get Deployment URL

After deployment completes:
- You'll get a URL like: `https://landslide-monitoring.vercel.app`
- **Save this URL!**

---

## 🔒 Step 4: Update CORS Settings

Now that you have both URLs, update backend CORS:

1. Go to **Render Dashboard**
2. Select your **landslide-api** service
3. Go to **"Environment"**
4. Update `CORS_ORIGIN`:
   - Change from `*` to your Vercel URL
   - Example: `https://landslide-monitoring.vercel.app`
5. Click **"Save Changes"**
6. Service will auto-redeploy

---

## ✅ Step 5: Verify Deployment

### Test Backend
```bash
curl https://landslide-api.onrender.com/health
```

### Test Frontend
1. Visit: `https://landslide-monitoring.vercel.app`
2. Check connection status (top-right)
3. Should show "Connected" (green)

### Test Full Flow
```bash
# Submit test sensor data
curl -X POST https://landslide-api.onrender.com/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 75,
    "waterLevel": 12,
    "tilt": 2.5,
    "vibration": 1,
    "ultrasonicDistance": 98,
    "latitude": 30.97,
    "longitude": 76.52
  }'
```

Watch your dashboard update in real-time! 🎉

---

## 📱 Step 6: Configure ESP32 for Production

Update your ESP32 code:

```cpp
// In esp32/landslide_monitor.ino
const char* serverUrl = "https://landslide-api.onrender.com/api/sensor-data";
```

Re-upload to ESP32.

---

## 🔄 Continuous Deployment

Both platforms now auto-deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel deploys frontend automatically
# Render deploys backend automatically
```

---

## 📊 Monitoring & Logs

### Render Logs
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. View real-time logs

### Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click on a deployment
4. View **"Functions"** tab for logs

---

## 💰 Cost Breakdown

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| **MongoDB Atlas** | M0 Free | $0 | 512 MB storage |
| **Render** | Free | $0 | 750 hrs/month, sleeps after 15 min |
| **Vercel** | Hobby | $0 | 100 GB bandwidth/month |
| **Total** | - | **$0/month** | Perfect for development |

### Upgrade Options (Future)

**When you need more:**
- **MongoDB Atlas**: $9/month (Shared M2) or $57/month (Dedicated M10)
- **Render**: $7/month (Starter) - No sleep, 512 MB RAM
- **Vercel**: $20/month (Pro) - Better performance, analytics

---

## 🚨 Troubleshooting

### Backend not starting on Render

**Check logs:**
```
Render Dashboard → Service → Logs
```

**Common issues:**
- MongoDB connection string incorrect
- Missing environment variables
- Build command failed

**Solution:**
1. Verify `MONGODB_URI` is correct
2. Check all env vars are set
3. Re-deploy: **Manual Deploy** → **Clear build cache & deploy**

### Frontend can't connect to backend

**Issue**: CORS error in browser console

**Solution:**
1. Check `CORS_ORIGIN` in Render matches your Vercel URL exactly
2. Ensure no trailing slash in URLs
3. Wait for Render to redeploy after changes

### Socket.IO not connecting

**Issue**: Real-time updates not working

**Solution:**
1. Check `VITE_SOCKET_URL` is set correctly
2. Render free tier sleeps - first request may be slow
3. Check browser console for WebSocket errors

### Render service is slow

**Issue**: Free tier spins down after inactivity

**Solution:**
- First request after sleep takes 30-60 seconds
- Upgrade to paid plan ($7/month) for always-on
- Use a service like UptimeRobot to ping every 14 minutes

---

## 🎯 Production Checklist

- [ ] MongoDB Atlas database created
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Health endpoint working
- [ ] Dashboard loads successfully
- [ ] Real-time updates working
- [ ] Test sensor data submitted
- [ ] ESP32 configured with production URL
- [ ] Custom domain added (optional)

---

## 🌐 Custom Domain (Optional)

### For Vercel (Frontend)

1. Buy domain from Namecheap/GoDaddy
2. Vercel Dashboard → Project → Settings → Domains
3. Add your domain
4. Update DNS records as instructed
5. Wait for propagation (5-60 minutes)

### For Render (Backend)

1. Render Dashboard → Service → Settings
2. Scroll to **"Custom Domain"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS CNAME record
5. Wait for SSL certificate (automatic)

---

## 📧 Support & Next Steps

Your app is now live! 🎉

**Live URLs:**
- Frontend: `https://landslide-monitoring.vercel.app`
- Backend: `https://landslide-api.onrender.com`

**Share your project:**
- Add links to your portfolio
- Share on LinkedIn
- Add to your resume
- Showcase on GitHub

**Monitor your app:**
- Set up MongoDB Atlas alerts
- Use Render metrics dashboard
- Add Vercel analytics

Happy monitoring! 🌍📡
