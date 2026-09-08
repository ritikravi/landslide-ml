# 🚀 Deploy Both Render Services

## You Have TWO Render Services

### 1. ML API (Python/Flask) ✅ Already Working
- **URL**: https://landslide-ml-api.onrender.com
- **Purpose**: Machine learning predictions
- **Status**: ✅ Live and operational
- **Accuracy**: 98.79%
- **No action needed** - This is working!

### 2. Backend API (Node.js) ❌ Needs Deployment
- **URL**: https://landslide-api.onrender.com
- **Purpose**: Main API (sensor data, alerts, **SATELLITE DATA**)
- **Status**: ❌ Running old code (no satellite endpoints)
- **Action needed**: Deploy latest commit!

---

## 🎯 What You Need to Do

### Deploy the Node.js Backend (Has Satellite Integration)

1. Go to: **https://dashboard.render.com/**
2. Look for service named: 
   - **landslide-monitoring-api** OR
   - **landslide-api** OR
   - Similar name (Node.js service)
3. Click on it
4. Click **"Manual Deploy"** button (top right)
5. Select **"Deploy latest commit"**
6. Wait 5-10 minutes

---

## 🔍 How to Find the Right Service

In your Render dashboard, you should see **2 services**:

### Service 1: ML API (Python) ✅
- Type: Web Service
- Repo: Connected to GitHub
- Language: Python
- URL: landslide-ml-api.onrender.com
- Status: **Already deployed** ✅

### Service 2: Backend API (Node.js) ❌
- Type: Web Service
- Repo: Connected to GitHub  
- Language: Node.js
- URL: landslide-api.onrender.com
- Status: **Needs deployment** ❌ ← DEPLOY THIS ONE!

---

## ✅ Verify After Deployment

### Test Backend API (Node.js)
```bash
# Should return JSON satellite data (not 404)
curl https://landslide-api.onrender.com/api/satellite/latest

# Expected response:
{
  "success": true,
  "data": {
    "rainfall": 0,
    "rainfall7Day": 0.13,
    "rainfall30Day": 55.21,
    ...
  }
}
```

### Test ML API (Python) - Already Working ✅
```bash
# Should return ML API info
curl https://landslide-ml-api.onrender.com/

# Response:
{
  "name": "Landslide ML Prediction API",
  "status": "operational",
  "accuracy": "98.79%"
}
```

---

## 📊 What Each Service Does

| Service | Language | Purpose | Status |
|---------|----------|---------|--------|
| **ML API** | Python/Flask | Predictions only | ✅ Working |
| **Backend API** | Node.js/Express | Everything else | ❌ Deploy needed |

### Backend API (Node.js) Handles:
- ✅ Sensor data storage (MongoDB)
- ✅ Real-time updates (Socket.IO)
- ✅ Alerts
- ✅ Weather data
- ✅ Power BI integration
- ✅ **NEW: Satellite data** ← This is what we added!

### ML API (Python) Handles:
- ✅ `/predict` - Risk predictions
- ✅ `/health` - Health check
- ✅ `/retrain` - Model retraining
- ✅ Already deployed and working!

---

## 🎯 Summary

**What's Working:**
- ✅ ML API (Python) is live
- ✅ Frontend is deployed
- ✅ Code pushed to GitHub

**What Needs Action:**
- ❌ Node.js Backend needs deployment for satellite features

**Action:**
Deploy the **Node.js backend service** on Render dashboard!

---

## 🔗 Quick Links

- Render Dashboard: https://dashboard.render.com/
- ML API: https://landslide-ml-api.onrender.com
- Backend API: https://landslide-api.onrender.com
- GitHub: https://github.com/ritikravi/landslide-ml

---

## ⏱️ Timeline

Once you deploy the Node.js backend:
- Build time: 5-10 minutes
- Then satellite card will work immediately
- Just refresh your frontend dashboard

---

**Next Step:** Find and deploy the Node.js backend service in your Render dashboard! 🚀
