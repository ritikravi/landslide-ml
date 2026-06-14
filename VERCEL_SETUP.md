# 🎨 Vercel Deployment - Copy & Paste Ready

> **Prerequisites**: Backend must be deployed on Render first!
> You need your Render URL: `https://landslide-api-xxxx.onrender.com`

---

## Method 1: Vercel CLI (Fastest - 2 minutes) ⚡

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Navigate to Frontend

```bash
cd frontend
```

### Step 3: Login to Vercel

```bash
vercel login
```

Follow the browser prompt to login with GitHub.

### Step 4: Deploy

```bash
vercel --prod
```

Answer the prompts:
```
? Set up and deploy? [Y/n] Y
? Which scope? → Select your account
? Link to existing project? [y/N] N
? What's your project's name? landslide-monitoring
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

### Step 5: Add Environment Variables

```bash
# Add API URL (replace with YOUR Render URL)
vercel env add VITE_API_URL production
# Paste: https://landslide-api-xxxx.onrender.com

# Add Socket URL (same as above)
vercel env add VITE_SOCKET_URL production
# Paste: https://landslide-api-xxxx.onrender.com
```

### Step 6: Redeploy with Environment Variables

```bash
vercel --prod
```

**Done!** You'll get your URL: `https://landslide-monitoring.vercel.app`

---

## Method 2: Vercel Dashboard (Alternative) 🖱️

### Step 1: Go to Vercel
👉 https://vercel.com/new

### Step 2: Import Repository
1. Click **"Import Git Repository"**
2. Select **`ritikravi/landslide-ml`**
3. Click **"Import"**

### Step 3: Configure Project

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

### Step 4: Environment Variables

Click **"Environment Variables"** → Add these **2 variables**:

#### Variable 1:
```
Name: VITE_API_URL
Value: https://landslide-api-xxxx.onrender.com
```
👆 **Replace with YOUR actual Render URL!**

#### Variable 2:
```
Name: VITE_SOCKET_URL
Value: https://landslide-api-xxxx.onrender.com
```
👆 **Same as above**

**Environment**: Select **"Production"**

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes ⏳
3. Status: "Building" → "Ready" 🟢

---

## ✅ After Deployment

### Your URLs:
- **Frontend**: `https://landslide-monitoring-xxxx.vercel.app`
- **Backend**: `https://landslide-api-xxxx.onrender.com`

### Test It:

1. **Visit your Vercel URL**
2. **Check connection** (top-right corner)
   - Should show: **"Connected"** 🟢 with WiFi icon

3. **Submit test data**:
```bash
curl -X POST https://YOUR-RENDER-URL.onrender.com/api/sensor-data \
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

4. **Watch dashboard update** in real-time! 🎉

---

## 🔒 Update CORS (Important!)

Now that you have both URLs, secure your backend:

1. Go to **Render Dashboard**
2. Select **landslide-api** service
3. Click **"Environment"** tab
4. Find **CORS_ORIGIN** → Click **"Edit"**
5. Change from `*` to: `https://landslide-monitoring-xxxx.vercel.app`
   👆 **Use YOUR exact Vercel URL**
6. Click **"Save"**
7. Wait 1-2 minutes for redeploy

---

## 🎯 Continuous Deployment

Both platforms now auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# ✅ Vercel deploys automatically
# ✅ Render deploys automatically
```

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
**Check**: Browser console (F12) for errors

**Fix**:
1. Verify `VITE_API_URL` is correct in Vercel
2. Check CORS is updated in Render
3. Test backend URL: `curl https://your-render-url.onrender.com/health`

### Environment variables not working
**Fix**:
```bash
# CLI users: Check variables are set
vercel env ls

# Dashboard users: Check in project settings
```

### Dashboard shows "Disconnected"
**Reason**: Backend might be sleeping (free tier)

**Fix**: Wait 30-60 seconds, it will wake up automatically

---

## 🎉 Success Checklist

- [ ] Frontend deployed to Vercel
- [ ] Environment variables added
- [ ] Dashboard loads successfully
- [ ] Connection status shows "Connected" 🟢
- [ ] Test data submitted successfully
- [ ] Real-time updates working
- [ ] CORS updated in Render

**ALL DONE!** Share your live URL! 🌍

---

Your Live URLs:
```
Frontend: https://landslide-monitoring-xxxx.vercel.app
Backend:  https://landslide-api-xxxx.onrender.com
```

Add these to your:
- GitHub README
- Portfolio
- LinkedIn
- Resume

Congratulations! 🎊
