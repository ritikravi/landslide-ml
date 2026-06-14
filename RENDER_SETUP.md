# 🚀 Render Deployment - Copy & Paste Ready

## Step 1: Go to Render
👉 https://dashboard.render.com/

## Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub
3. Select repo: **`ritikravi/landslide-ml`**

## Step 3: Basic Configuration

```
Name: landslide-api
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

## Step 4: Environment Variables

Click **"Advanced"** → Add these **4 variables**:

### Variable 1:
```
Key: NODE_ENV
Value: production
```

### Variable 2:
```
Key: PORT
Value: 5000
```

### Variable 3:
```
Key: MONGODB_URI
Value: mongodb+srv://Cluster63640:ritik1641@cluster63640.ulrqzvm.mongodb.net/landslide_monitoring?retryWrites=true&w=majority&appName=Cluster63640
```

### Variable 4:
```
Key: CORS_ORIGIN
Value: *
```

> **Note**: We'll update `CORS_ORIGIN` to your Vercel URL after frontend deployment for better security.

## Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes ⏳
3. Status will change from "Building" → "Live" 🟢

## Step 6: Get Your Backend URL
After deployment, you'll see:
```
https://landslide-api-xxxx.onrender.com
```

**📋 Copy this URL!** You'll need it for:
- Vercel frontend deployment
- ESP32 configuration
- Testing

## Step 7: Test Backend

Open a new terminal and run:

```bash
# Health check (replace with your URL)
curl https://your-render-url.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2026-06-15T..."}
```

If you see the JSON response, **YOU'RE DONE!** ✅

## ⚠️ Important Notes

### Free Tier Behavior:
- **Spins down after 15 minutes** of inactivity
- **First request** after sleep takes 30-60 seconds
- **Automatic wake-up** on any request

### If Deployment Fails:
1. Check **Logs** tab in Render
2. Common issues:
   - MongoDB connection string incorrect → Check password
   - Missing environment variables → Verify all 4 are set
   - Build failed → Check logs for npm errors

### Security:
- After Vercel deployment, update `CORS_ORIGIN` to your exact Vercel URL
- This prevents unauthorized access to your API

## 🎯 Next Step: Deploy Frontend to Vercel

Once your backend is live, move to Vercel deployment!

**Backend URL**: `https://your-render-url.onrender.com` ← Copy this!

---

Need help? Check logs in Render Dashboard → Your Service → Logs tab
