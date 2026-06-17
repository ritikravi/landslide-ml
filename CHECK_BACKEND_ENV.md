# 🔍 Backend Using Fallback - Quick Fix

Your ML API is working perfectly, but the backend is still using the fallback formula. Here's how to fix it:

## ✅ What's Working
- ✅ ML API is live: https://landslide-ml-api.onrender.com
- ✅ Model loaded successfully
- ✅ Predictions work when called directly
- ✅ Backend is deployed and running

## ❌ What's Not Working
- Backend is using "Fallback" instead of "RandomForest"
- This means backend can't reach ML API

## 🔧 Fix: Check Environment Variable

### On Render Dashboard:

1. Go to your **backend service** (landslide-api)
2. Click **"Environment"** tab
3. Check if you have:
   ```
   ML_API_URL = https://landslide-ml-api.onrender.com
   ```

### Important Details:
- ✅ Use `https://` (not `http://`)
- ✅ No trailing slash at the end
- ✅ Exact URL: `https://landslide-ml-api.onrender.com`

### If Variable Exists:
1. Try changing it to include `/predict`:
   ```
   ML_API_URL = https://landslide-ml-api.onrender.com
   ```
2. Save changes
3. Wait 2-3 minutes for redeploy

### Alternative: Check Backend Logs

On Render backend service:
1. Click "Logs" tab
2. Look for these messages:
   - ✅ Good: "✅ ML prediction from trained model"
   - ❌ Issue: "ML API unavailable" or "ECONNREFUSED"

### If You See ECONNREFUSED:
The ML API might be sleeping (free tier). Solution:
1. Wake it up: `curl https://landslide-ml-api.onrender.com/health`
2. Send test data again
3. Should work now

### Test After Fix:
```bash
curl -X POST https://landslide-api.onrender.com/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"soilMoisture":10,"waterLevel":90,"tilt":5,"vibration":0,"ultrasonicDistance":100}'
```

Look for:
```json
"features": {
  "modelUsed": "RandomForest"  // ✅ Should say this, not "Fallback"
}
```

## 🎯 Quick Verification

Run this command:
```bash
# Test both services
curl https://landslide-ml-api.onrender.com/health
# Should return: {"model_loaded":true}

# Then test backend
curl https://landslide-api.onrender.com/api/sensor-data/latest
# Check if data exists
```

## 💡 Common Issues

### Issue 1: Timeout (5 seconds)
**Cause**: ML API sleeping on free tier
**Fix**: Keep ML API awake with periodic health checks
```bash
# Run every 10 minutes
curl https://landslide-ml-api.onrender.com/health
```

### Issue 2: CORS Error
**Cause**: Backend can't reach ML API across domains
**Fix**: This should not happen on Render, but if it does:
- Check both services are on Render
- Check ML API CORS is enabled (already is in code)

### Issue 3: Wrong URL Format
**Cause**: Trailing slash or http instead of https
**Fix**: Use exact URL: `https://landslide-ml-api.onrender.com`

## ✅ Success Indicators

You'll know it's working when:
1. Backend logs show: "✅ ML prediction from trained model"
2. Prediction response shows: `"modelUsed": "RandomForest"`
3. Risk scores are different (using 66% water weight)
4. Confidence shows ~49-95% (not fixed at 75%)

## 🚀 Next Steps

1. Double-check `ML_API_URL` environment variable
2. Save and wait for redeploy (2-3 min)
3. Test with curl command above
4. Check for "RandomForest" in response

Your ML model is ready and working - just needs the backend connection! 🎯
