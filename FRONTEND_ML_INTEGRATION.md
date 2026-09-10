# Frontend ML Integration Guide

**Status**: ✅ Complete  
**ML API**: https://landslide-ml-api.onrender.com  
**Commit**: 0b3463e

---

## What Was Added

### 1. ML Service Layer (`frontend/src/services/mlService.js`)
Complete service for interacting with the production ML API:
- `getPrediction()` - Get risk prediction with SHAP explanations
- `checkHealth()` - Check ML API status
- `formatRiskLevel()` - Format risk levels for display
- `getRiskColorClass()` - Get Tailwind color classes

### 2. ML Prediction Component (`frontend/src/components/MLPredictionCard.jsx`)
Ready-to-use React component that displays:
- Risk level (LOW/MEDIUM/HIGH/CRITICAL)
- Risk score (0-100)
- Confidence percentage
- SHAP explanation (why this prediction?)
- Top 3 contributing factors
- Anomaly detection alerts

### 3. Updated API Service (`frontend/src/services/api.js`)
- Added `mlAPI.predict()` - Direct call to production ML API
- Added `mlAPI.health()` - Health check endpoint
- Keeps legacy endpoints for backward compatibility

### 4. Environment Variables
- `.env.example` - Added `VITE_ML_API_URL`
- `.env.production` - Added production ML API URL

---

## How to Use in Your Frontend

### Quick Start - Add to Dashboard

```jsx
import MLPredictionCard from '../components/MLPredictionCard';

// In your Dashboard.jsx
<MLPredictionCard 
  sensorData={latestData} 
  history={sensorHistory} 
/>
```

### Example 1: Simple Prediction

```jsx
import { getPrediction } from '../services/mlService';

const handlePredict = async () => {
  const result = await getPrediction({
    soilMoisture: 75,
    waterLevel: 85,
    tilt: 12,
    vibration: 45,
    ultrasonicDistance: 45
  });

  if (result.success) {
    console.log('Risk Level:', result.data.riskLevel);
    console.log('Risk Score:', result.data.riskScore);
    console.log('Explanation:', result.data.explanation);
  }
};
```

### Example 2: With Terrain/Weather Data

```jsx
import { getPrediction } from '../services/mlService';

const result = await getPrediction({
  // Sensor data
  soilMoisture: 75,
  waterLevel: 85,
  tilt: 12,
  vibration: 45,
  ultrasonicDistance: 45,
  
  // Weather data (optional)
  rainfall: 120,
  
  // Terrain data (optional)
  elevation: 2500,
  slope: 35,
  aspect: 180
});
```

### Example 3: With History for Trends

```jsx
import { getPrediction } from '../services/mlService';

const result = await getPrediction(
  currentSensorData,
  sensorHistory // Array of past readings
);

// Access trend data
if (result.data.trends) {
  console.log('Trends:', result.data.trends);
  console.log('Forecasts:', result.data.forecasts);
  console.log('Warnings:', result.data.warnings);
}
```

### Example 4: Check API Health

```jsx
import { checkHealth } from '../services/mlService';

const health = await checkHealth();

if (health.healthy) {
  console.log('ML API is healthy');
  console.log('Model loaded:', health.data.model_loaded);
  console.log('SHAP enabled:', health.data.shap_enabled);
}
```

---

## Integration Points

### 1. Dashboard Page (`frontend/src/pages/Dashboard.jsx`)

**Before**:
```jsx
const [latestRes, predictionRes, historyRes] = await Promise.all([
  sensorAPI.getLatest(),
  mlAPI.getLatest(),  // Old endpoint
  sensorAPI.getHistory({ limit: 50 })
]);
```

**After** (add this):
```jsx
import { getPrediction } from '../services/mlService';
import MLPredictionCard from '../components/MLPredictionCard';

// In fetchData or useEffect:
const sensorData = await sensorAPI.getLatest();
const prediction = await getPrediction(sensorData.data, history);

// In JSX:
<MLPredictionCard 
  sensorData={sensorData} 
  history={history} 
/>
```

### 2. Predictions Page (`frontend/src/pages/Predictions.jsx`)

**Replace old ML API calls** with:
```jsx
import { getPrediction } from '../services/mlService';

const result = await getPrediction(latestSensorData, sensorHistory);
setPrediction(result.data);
```

### 3. Real-time Updates (Socket Context)

```jsx
// In SocketContext or component
useEffect(() => {
  if (latestData) {
    getPrediction(latestData).then(result => {
      if (result.success) {
        setLivePrediction(result.data);
      }
    });
  }
}, [latestData]);
```

---

## Response Structure

### Successful Prediction

```json
{
  "success": true,
  "data": {
    "riskLevel": "LOW",
    "riskScore": 19,
    "confidence": 99.97,
    
    "explanation": "Risk prediction driven by: vibration (45.0) is reducing risk, Water Level (85.0) is increasing risk",
    
    "topFactors": [
      "vibration (45.0) is reducing risk",
      "Water Level (85.0) is increasing risk",
      "Distance (45.0) is reducing risk"
    ],
    
    "contributions": {
      "soilMoisture": {
        "value": 75.0,
        "contribution": -1.15,
        "impact": "decreases"
      }
    },
    
    "anomaly": {
      "isAnomaly": true,
      "score": -0.11,
      "severity": "MEDIUM",
      "description": "Unusual sensor pattern detected",
      "patterns": ["High vibration count: 45 events in window"]
    },
    
    "features": { ... },
    "featureImportance": { ... },
    "trends": { ... },
    "forecasts": [ ... ],
    "warnings": [ ... ]
  }
}
```

---

## Styling with Tailwind

### Risk Level Colors

```jsx
import { getRiskColorClass } from '../services/mlService';

<div className={getRiskColorClass(riskLevel)}>
  {riskLevel} RISK
</div>

// Returns:
// LOW: 'text-green-400 bg-green-500/20 border-green-500/50'
// MEDIUM: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
// HIGH: 'text-orange-400 bg-orange-500/20 border-orange-500/50'
// CRITICAL: 'text-red-400 bg-red-500/20 border-red-500/50'
```

---

## Environment Setup

### Development (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_ML_API_URL=https://landslide-ml-api.onrender.com
```

### Production (.env.production)
```bash
VITE_API_URL=https://landslide-api.onrender.com
VITE_ML_API_URL=https://landslide-ml-api.onrender.com
```

---

## Testing

### Test ML API Connection

```bash
# From frontend directory
curl https://landslide-ml-api.onrender.com/health
```

### Test in Browser Console

```javascript
// Open your dashboard and run in console:
import { checkHealth, getPrediction } from './services/mlService';

// Check health
const health = await checkHealth();
console.log(health);

// Test prediction
const result = await getPrediction({
  soilMoisture: 50,
  waterLevel: 60,
  tilt: 5,
  vibration: 10,
  ultrasonicDistance: 100
});
console.log(result);
```

---

## Key Features

### ✅ Risk Prediction
- 4 levels: LOW, MEDIUM, HIGH, CRITICAL
- Risk score: 0-100
- Confidence: Percentage

### ✅ SHAP Explainability
- Human-readable explanation
- Top 3 contributing factors
- Individual feature impacts

### ✅ Anomaly Detection
- Detects unusual patterns
- Severity levels: LOW, MEDIUM, HIGH
- Specific pattern descriptions

### ✅ Trend Forecasting (with history)
- Analyzes sensor trends
- Forecasts future risk
- Generates warnings

---

## Performance

- **Response Time**: ~1-2 seconds
- **Timeout**: 15 seconds
- **Retries**: Handled by axios
- **CORS**: Enabled

---

## Error Handling

```jsx
const result = await getPrediction(sensorData);

if (!result.success) {
  // Show error to user
  console.error('Prediction failed:', result.error);
  // Fallback to old system or show message
}
```

---

## Next Steps

1. ✅ **Update Dashboard** - Add `<MLPredictionCard />`
2. ✅ **Update Predictions Page** - Use `getPrediction()`
3. ✅ **Test Integration** - Verify predictions work
4. ✅ **Deploy Frontend** - Push to Vercel/Render
5. 🎉 **Launch** - Your ML system is live!

---

## Support

**ML API URL**: https://landslide-ml-api.onrender.com  
**Health Check**: https://landslide-ml-api.onrender.com/health  
**Documentation**: This file + `FINAL_SUCCESS.md`

**Need help?** Check the example implementations in this guide!
