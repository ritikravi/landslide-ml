# ML Integration Status

## Current Deployment Status

### ✅ ML API (Python Flask)
- **URL**: https://landslide-ml-api.onrender.com
- **Status**: WORKING ✅
- **Model**: Random Forest Classifier
- **Accuracy**: 98.79%
- **Confidence**: 95%+
- **Health Check**: `/health` returns 200 OK

### 🔧 Backend (Node.js/Express)
- **URL**: https://landslide-api.onrender.com
- **Status**: DEPLOYED (needs verification)
- **Integration**: Should call ML API via axios
- **Environment**: `ML_API_URL=https://landslide-ml-api.onrender.com`

## Fixes Applied (Just Now)

### 1. Trust Proxy Configuration ✅
**Problem**: Rate limiter errors due to `X-Forwarded-For` header
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Fix**: Added to `backend/src/server.js`
```javascript
app.set('trust proxy', true);
```

### 2. Enhanced ML API Logging ✅
**Problem**: Silent failures, no visibility into ML API calls

**Fix**: Added detailed console logging in `mlService.js`:
- 🤖 When calling ML API
- ✅ When ML API succeeds
- ❌ When ML API fails (with detailed error info)
- ⚠️ When falling back to local calculation

### 3. Increased Timeout ✅
**Problem**: 5-second timeout may be too short for Render cold starts

**Fix**: Increased to 10 seconds
```javascript
timeout: 10000  // Was 5000
```

### 4. Fixed Model Detection Logic ✅
**Problem**: Confidence threshold was 80%, but ML API returns 95%+

**Fix**: Changed threshold to 90%
```javascript
const modelUsed = mlPrediction.confidence >= 90 ? 'RandomForest' : 'Fallback';
```

## What to Check After Redeployment

### 1. Check Backend Logs on Render
Look for these log messages:
```
🤖 Calling ML API at: https://landslide-ml-api.onrender.com/predict
📊 Sending data: {...}
✅ ML API responded: LOW (95.5% confidence)
📈 Saving prediction: LOW (score: 19, confidence: 95.5%, model: RandomForest)
```

**If you see**:
- ❌ "ML API Error" → ML API is unreachable
- ⚠️ "Using fallback" → ML API failed or timed out
- "model: Fallback" → ML API didn't respond correctly

### 2. Test API Endpoint Directly
```bash
curl https://landslide-api.onrender.com/api/ml/latest
```

Should return:
```json
{
  "prediction": {
    "features": {
      "confidence": 95.5,
      "modelUsed": "RandomForest"  // ← Should be "RandomForest" not "Fallback"
    }
  }
}
```

### 3. Check Dashboard
Visit: https://frontend-kappa-two-57.vercel.app

Look for:
- Risk score should match ML prediction
- No "using fallback" messages in browser console

## Troubleshooting

### If Still Using Fallback:

**Check 1: Is ML API URL set correctly?**
```bash
# On Render dashboard → Environment → Check:
ML_API_URL=https://landslide-ml-api.onrender.com
```

**Check 2: Can backend reach ML API?**
Run test script:
```bash
cd backend
ML_API_URL=https://landslide-ml-api.onrender.com node ../test_ml_connection.js
```

**Check 3: Is ML API responding?**
```bash
curl https://landslide-ml-api.onrender.com/health
```

**Check 4: CORS issue?**
ML API has `CORS(app)` enabled, should work

**Check 5: Network connectivity between Render services?**
Both services are on Render, should be able to communicate

## Next Steps

1. ⏳ Wait for Render to redeploy backend (commit `54ecdfb`)
2. 📋 Check backend logs for ML API calls
3. 🧪 Test `/api/ml/latest` endpoint
4. 📊 Verify dashboard shows RandomForest model
5. 🎉 Celebrate when confidence = 95%+ and modelUsed = "RandomForest"

## Expected vs Current Behavior

| Metric | Expected (ML Model) | Previous (Fallback) |
|--------|---------------------|---------------------|
| Model | RandomForest | Fallback |
| Confidence | 95%+ | 75% |
| Water Level Importance | 66.6% | 25% |
| Accuracy | 98.79% | ~75% |
| Risk Score Precision | High (ML-based) | Medium (formula) |

## Test Data

Sample sensor data for testing:
```json
{
  "soilMoisture": 10,
  "waterLevel": 11,
  "tilt": 0,
  "vibration": 0,
  "ultrasonicDistance": 82
}
```

Expected ML prediction:
```json
{
  "riskLevel": "LOW",
  "riskScore": 15-20,
  "confidence": 95.5,
  "modelUsed": "RandomForest"
}
```
