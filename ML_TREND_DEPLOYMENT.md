# ML Trend Forecasting - Deployment Guide

## What's New

### Enhanced ML Features
1. **Trend Analysis** - Analyzes sensor data trends over time using linear regression
2. **Future Predictions** - Forecasts risk levels 30 minutes, 1 hour, and 2 hours ahead
3. **Smart Warnings** - Generates alerts when risk will escalate
4. **Visual Dashboard** - New TrendForecast component showing predictions

## How It Works

### Backend Flow
```
ESP32 → Backend → Fetch last 20 readings → ML API (with history) → Trend Analysis → Future Predictions → Frontend
```

### Prediction Logic
1. **Linear Regression** on each sensor (soil, water, tilt, vibration)
2. **Calculate slope** to determine if values are increasing/decreasing/stable
3. **Project future values** at 30min, 1hr, 2hr intervals
4. **Run ML model** on projected values to get future risk levels
5. **Generate warnings** if risk will escalate

### Example Output
```json
{
  "trends": {
    "soilMoisture": {
      "current": 45.2,
      "slope": 0.8,
      "trend": "increasing",
      "confidence": 0.92
    },
    "waterLevel": {
      "current": 67.0,
      "slope": 1.2,
      "trend": "increasing", 
      "confidence": 0.88
    }
  },
  "forecasts": [
    {
      "timeAhead": 30,
      "riskLevel": "MEDIUM",
      "riskScore": 52,
      "confidence": 84.5,
      "predictedValues": {
        "soilMoisture": 69.2,
        "waterLevel": 103.0,
        "tilt": 2.1,
        "vibration": 0
      }
    }
  ],
  "warnings": [
    {
      "severity": "MEDIUM",
      "message": "Risk may escalate to MEDIUM in 30 minutes",
      "confidence": 84.5
    }
  ]
}
```

## Deployment Steps

### 1. Update ML API on Render

The ML API code is already updated. To deploy:

```bash
# Push changes (already done)
git push

# Render will auto-deploy if connected to GitHub
# Or manually trigger deploy from Render dashboard
```

### 2. Verify ML API

```bash
curl https://landslide-ml-api.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_path": "landslide_model.pkl"
}
```

### 3. Test Trend Forecasting

```bash
curl -X POST https://landslide-ml-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 45,
    "waterLevel": 67,
    "tilt": 1.5,
    "vibration": 0,
    "ultrasonicDistance": 350,
    "history": [
      {
        "soilMoisture": 40,
        "waterLevel": 60,
        "tilt": 1.0,
        "vibration": 0,
        "ultrasonicDistance": 350,
        "timestamp": "2026-06-19T10:00:00Z"
      },
      {
        "soilMoisture": 42,
        "waterLevel": 63,
        "tilt": 1.2,
        "vibration": 0,
        "ultrasonicDistance": 350,
        "timestamp": "2026-06-19T10:30:00Z"
      },
      {
        "soilMoisture": 45,
        "waterLevel": 67,
        "tilt": 1.5,
        "vibration": 0,
        "ultrasonicDistance": 350,
        "timestamp": "2026-06-19T11:00:00Z"
      }
    ]
  }'
```

### 4. Backend Configuration

Backend is already updated to:
- Fetch last 20 sensor readings
- Send history to ML API
- Store trends, forecasts, warnings in database

No configuration changes needed!

### 5. Frontend

Frontend auto-deployed via Vercel. Check:
- https://frontend-kappa-two-57.vercel.app

The TrendForecast component will automatically appear when:
- ML API returns trend data
- At least 5 historical readings exist

## Features

### Dashboard Display

#### Current Trends Section
Shows each sensor with:
- Current value
- Trend direction (⬆ increasing / ⬇ decreasing / ➖ stable)
- Confidence percentage

#### Risk Predictions Section
Shows 3 forecasts (30min, 1hr, 2hr):
- Predicted risk level (LOW/MEDIUM/HIGH/CRITICAL)
- Predicted sensor values
- Risk score bar
- Confidence percentage

#### Warnings Section (if any)
Red alerts showing:
- "Risk may escalate to MEDIUM in 30 minutes"
- "Soil Moisture rising rapidly"
- Confidence level

## Requirements

### Minimum Data for Trends
- At least **5 historical readings** needed
- More data = better accuracy
- Backend fetches last 20 readings automatically

### Confidence Calculation
```
forecast_confidence = ml_confidence × average_trend_confidence
```

Example:
- ML confidence: 95%
- Trend confidence: 90%
- Final: 85.5%

## Technical Details

### Files Changed
- `ml/trend_forecasting.py` - New trend analysis module
- `ml/ml_api.py` - Enhanced to include trends/forecasts
- `backend/src/services/mlService.js` - Fetch and send history
- `frontend/src/components/TrendForecast.jsx` - New component
- `frontend/src/pages/Dashboard.jsx` - Display trends

### Performance
- Trend analysis adds ~100ms to prediction time
- Linear regression is fast (O(n) complexity)
- No impact on fallback mode

### Limitations
1. Assumes linear trends (not exponential/logarithmic)
2. Requires minimum 5 data points
3. Predictions become less accurate beyond 2 hours
4. Sudden changes (earthquakes) not predictable

## Monitoring

### Check Logs

**Backend:**
```
📈 Including 20 historical readings for trend analysis
🔮 Generated 3 forecasts
⚠️  Warnings: 2 alerts
```

**ML API:**
```
✅ Trend analysis completed for 4 sensors
🔮 Forecasting 30, 60, 120 minutes ahead
```

### Database

Predictions now include:
```javascript
{
  features: {
    trends: {...},
    forecasts: [...],
    warnings: [...]
  }
}
```

## Troubleshooting

### No Trend Data Shown
1. Check if at least 5 readings exist
2. Verify ML API is responding
3. Check browser console for errors

### Inaccurate Forecasts
1. More data = better accuracy
2. Check sensor calibration
3. Verify timestamps are correct

### High CPU Usage
1. Trend analysis runs on every prediction
2. Consider caching if needed
3. Adjust history limit (currently 20)

## Future Enhancements

Potential improvements:
- [ ] Exponential smoothing for non-linear trends
- [ ] Seasonal pattern detection (rain/dry seasons)
- [ ] Multi-variate analysis (cross-sensor correlations)
- [ ] Longer forecasts (6hr, 12hr, 24hr)
- [ ] SMS/Email alerts for escalating risks
- [ ] Historical forecast accuracy tracking

---

**Status**: ✅ Deployed and Active
**ML API**: https://landslide-ml-api.onrender.com
**Frontend**: https://frontend-kappa-two-57.vercel.app
**Last Updated**: June 19, 2026
