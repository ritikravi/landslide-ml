# 🛰️ Google Earth Engine Satellite Service

Near real-time satellite data processing using Google Earth Engine.

## Features

- **GPM IMERG**: Near real-time rainfall (4-6 hour delay)
- **Sentinel-2**: Vegetation health (NDVI) at 10m resolution
- **Cloud Processing**: Runs on Google's servers
- **Free**: Unlimited API calls for research use

## Setup

### 1. Sign Up for Earth Engine
Visit: https://earthengine.google.com/signup/
- Choose: Research/Academic account
- Approval: 1-2 days

### 2. Install Dependencies
```bash
cd satellite_service
pip install -r requirements.txt
```

### 3. Authenticate Earth Engine
```bash
earthengine authenticate
```
This opens a browser to sign in with your Google account. Copy the authorization code back to terminal.

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your location
```

### 5. Run Service
```bash
python earth_engine_api.py
```

Service runs on http://localhost:5002

## API Endpoints

### Get GPM Rainfall (Near Real-Time)
```bash
GET /gpm/rainfall?lat=30.97&lon=76.52&hours=24
```

**Response:**
```json
{
  "success": true,
  "location": {"latitude": 30.97, "longitude": 76.52},
  "data": {
    "rainfall_mm": 15.3,
    "hours": 24,
    "source": "GPM_IMERG_V06",
    "resolution_km": 10,
    "delay_hours": "4-6"
  }
}
```

### Get Sentinel-2 NDVI (Vegetation Health)
```bash
GET /sentinel2/ndvi?lat=30.97&lon=76.52
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ndvi": 0.65,
    "vegetation_health": "Healthy",
    "slope_stability_risk": "Low",
    "image_date": "2026-09-05",
    "source": "Sentinel-2 SR",
    "resolution_m": 10
  }
}
```

### Get Rainfall Summary
```bash
GET /rainfall/summary?lat=30.97&lon=76.52
```

Returns 3-hour, 24-hour, and 7-day rainfall.

### Get Combined Analysis (For ML)
```bash
GET /combined/analysis?lat=30.97&lon=76.52
```

Returns combined rainfall + vegetation data ready for ML model.

## Deploy to Render

### 1. Create New Web Service
- Go to Render dashboard
- New → Web Service
- Connect this repository
- Root directory: `satellite_service`

### 2. Configure
```
Name: landslide-gee-api
Build Command: pip install -r requirements.txt
Start Command: gunicorn earth_engine_api:app
Environment: Python 3
```

### 3. Add Environment Variables
```
PORT: (leave blank - Render auto-assigns)
DEFAULT_LAT: 30.97
DEFAULT_LON: 76.52
```

### 4. Authenticate Earth Engine on Render
This is tricky for serverless - we'll use service account authentication:

1. Create service account in Google Cloud Console
2. Download JSON key
3. Add to Render as environment variable
4. Update code to use service account

(I'll guide you through this after your Earth Engine approval)

## Usage from Backend

### Node.js Backend Integration
```javascript
// backend/src/services/geeService.js
import axios from 'axios';

const GEE_API_URL = process.env.GEE_API_URL || 'http://localhost:5002';

export async function getGPMRainfall(lat, lon, hours = 24) {
  const response = await axios.get(`${GEE_API_URL}/gpm/rainfall`, {
    params: { lat, lon, hours }
  });
  return response.data;
}

export async function getNDVI(lat, lon) {
  const response = await axios.get(`${GEE_API_URL}/sentinel2/ndvi`, {
    params: { lat, lon }
  });
  return response.data;
}
```

## Data Sources

### GPM IMERG V06
- **Updates**: Every 30 minutes
- **Delay**: 4-6 hours
- **Resolution**: 10km
- **Coverage**: Global
- **Best for**: Near real-time rainfall

### Sentinel-2
- **Updates**: Every 5 days
- **Delay**: 2-3 days
- **Resolution**: 10 meters
- **Coverage**: Global (land only)
- **Best for**: Vegetation health, land cover

## NDVI Interpretation

| NDVI Value | Vegetation | Slope Stability |
|------------|-----------|-----------------|
| > 0.6      | Healthy   | Low risk        |
| 0.3 - 0.6  | Moderate  | Medium risk     |
| < 0.3      | Stressed  | High risk       |

Healthy vegetation = stable slopes
Stressed/dying vegetation = increased landslide risk

## Troubleshooting

### "Earth Engine not initialized"
```bash
# Authenticate
earthengine authenticate

# Test
python -c "import ee; ee.Initialize(); print('✅ Working')"
```

### "User memory limit exceeded"
Reduce the buffer size or time range in queries.

### "Too many requests"
Earth Engine has rate limits. Add delays between requests or batch process.

## Next Steps

1. Wait for Earth Engine approval (1-2 days)
2. Authenticate locally
3. Test endpoints
4. Deploy to Render
5. Integrate with Node.js backend
6. Add to ML model features

## Support

- Earth Engine Docs: https://developers.google.com/earth-engine
- GPM Data: https://gpm.nasa.gov/data/imerg
- Sentinel-2: https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2
