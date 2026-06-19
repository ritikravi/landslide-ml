# Fix Predictions Page - Deployment Steps

## Problem
You have 50+ readings but the Predictions page shows "Collecting Data".

## Root Cause
The ML API on Render needs to be redeployed with the new `trend_forecasting.py` code.

---

## Solution: Redeploy ML API on Render

### Option 1: Auto-Deploy (Recommended)
✅ **Already triggered!** Your GitHub push will auto-deploy in ~5 minutes.

Check deployment status:
```bash
./check_ml_deployment.sh
```

### Option 2: Manual Deploy on Render Dashboard

1. Go to: https://dashboard.render.com
2. Find your ML API service (landslide-ml-api)
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait ~5 minutes for deployment

---

## Verify Deployment

### Step 1: Check ML API has trends feature
```bash
curl -X POST https://landslide-ml-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 50,
    "waterLevel": 70,
    "tilt": 2,
    "vibration": 1,
    "history": [
      {"soilMoisture": 40, "waterLevel": 60, "tilt": 1, "vibration": 0, "timestamp": "2026-06-19T08:00:00Z"},
      {"soilMoisture": 45, "waterLevel": 65, "tilt": 1.5, "vibration": 0, "timestamp": "2026-06-19T08:30:00Z"},
      {"soilMoisture": 50, "waterLevel": 70, "tilt": 2, "vibration": 1, "timestamp": "2026-06-19T09:00:00Z"}
    ]
  }'
```

**Look for these fields in response:**
- ✅ `prediction.trends` - Current sensor trends
- ✅ `prediction.forecasts` - Future predictions  
- ✅ `prediction.warnings` - Risk warnings

### Step 2: Trigger new prediction from ESP32
Once ML API is deployed, the next sensor reading from your ESP32 will create a prediction WITH trends.

Wait 30 seconds for next ESP32 transmission.

### Step 3: Refresh Predictions page
Go to: https://frontend-kappa-two-57.vercel.app/predictions

You should now see:
- ✅ Sensor Trend Analysis (4 cards)
- ✅ Future Risk Forecasts (3 cards)
- ✅ Warnings (if any)

---

## Why This Happened

### The Flow:
```
ESP32 → Backend → ML API → Backend stores prediction → Frontend displays
```

### What was missing:
The ML API code had `trend_forecasting.py` added but wasn't deployed to Render yet.

### Files that needed deployment:
- ✅ `ml/trend_forecasting.py` (NEW)
- ✅ `ml/ml_api.py` (UPDATED - imports trend_forecasting)
- ✅ `ml/requirements.txt` (already had scikit-learn)

---

## Timeline

**5 minutes ago**: Code pushed to GitHub  
**Now**: Render is deploying  
**In 5 minutes**: ML API will have trend forecasting  
**In 6 minutes**: Next ESP32 reading triggers prediction with trends  
**Result**: Predictions page shows forecasts!

---

## Quick Status Commands

### Check ML API deployment:
```bash
./check_ml_deployment.sh
```

### Check backend predictions:
```bash
curl -s https://landslide-api.onrender.com/api/ml/predictions/latest | python3 -m json.tool
```

Look for `features.trends` in the response.

### Check frontend:
Open: https://frontend-kappa-two-57.vercel.app/predictions  
(Refresh after ML API deploys)

---

## Troubleshooting

### Still showing "Collecting Data" after 10 minutes?

**Check 1: Is ML API deployed?**
```bash
curl https://landslide-ml-api.onrender.com/health
```
Should show: `"status": "healthy"`

**Check 2: Is backend calling ML API with history?**
Check backend logs on Render for:
```
📈 Including 20 historical readings for trend analysis
🔮 Generated 3 forecasts
```

**Check 3: Is ESP32 sending data?**
```bash
curl https://landslide-api.onrender.com/api/sensor-data/latest
```
Timestamp should be recent (< 1 minute old)

**Check 4: Force new prediction**
Wait for next ESP32 transmission (30 seconds), then refresh Predictions page.

---

## Manual Fix (If Auto-Deploy Fails)

If Render doesn't auto-deploy after 10 minutes:

1. SSH into Render (if possible) or use dashboard
2. Go to ML API service
3. Click "Manual Deploy"
4. Select latest commit: "Trigger ML API redeployment with trend forecasting"
5. Click "Deploy"
6. Wait 5 minutes
7. Test with `./check_ml_deployment.sh`

---

## Expected Response After Deployment

### ML API Response (with history):
```json
{
  "success": true,
  "prediction": {
    "riskLevel": "MEDIUM",
    "riskScore": 52,
    "confidence": 95.5,
    "features": {...},
    "featureImportance": {...},
    "trends": {
      "soilMoisture": {
        "current": 50,
        "slope": 0.8,
        "trend": "increasing",
        "confidence": 0.92
      },
      ...
    },
    "forecasts": [
      {
        "timeAhead": 30,
        "riskLevel": "MEDIUM",
        "riskScore": 55,
        "confidence": 84.5,
        "predictedValues": {...}
      },
      ...
    ],
    "warnings": [...]
  }
}
```

### Backend stores this in MongoDB

### Frontend reads it and displays Predictions page!

---

## Need Help?

Run diagnostics:
```bash
# Check all services
echo "=== ESP32 Status ===" 
curl -s https://landslide-api.onrender.com/api/sensor-data/latest | python3 -c "import sys,json,datetime; d=json.load(sys.stdin); print(f\"Last reading: {d['data']['timestamp']}\")"

echo "=== ML API Status ==="
curl -s https://landslide-ml-api.onrender.com/health | python3 -m json.tool

echo "=== Latest Prediction ==="
curl -s https://landslide-api.onrender.com/api/ml/predictions/latest | python3 -c "import sys,json; d=json.load(sys.stdin); print('Has trends:', 'trends' in d['data']['features'])"
```

---

**Status**: 🔄 Deployment in Progress  
**ETA**: 5-10 minutes  
**Next Step**: Wait for Render deployment, then refresh Predictions page  

---

**Created**: June 19, 2026  
**Issue**: Predictions page not showing trends despite 50+ readings  
**Cause**: ML API needs redeployment  
**Fix**: GitHub push triggered auto-deploy  
