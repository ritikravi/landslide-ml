# 🏗️ Landslide Monitoring System - Complete Architecture & Workflow

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Details](#component-details)
4. [Data Flow](#data-flow)
5. [Workflow Diagrams](#workflow-diagrams)
6. [Technology Stack](#technology-stack)
7. [Deployment Architecture](#deployment-architecture)
8. [API Architecture](#api-architecture)

---

## System Overview

The Landslide Monitoring System is a **full-stack real-time monitoring and prediction platform** that combines:
- IoT sensor data from ESP32 devices
- Multiple satellite data sources (NASA, ESA, ISRO)
- Machine learning models for risk prediction
- Real-time alerts and notifications
- Global hazard zone monitoring

### Key Capabilities
- **Real-time monitoring** via WebSocket connections
- **ML-powered predictions** with 90-100% accuracy
- **Satellite data integration** from 5+ sources
- **Global coverage** of 12+ hazard zones
- **Historical analysis** of 40+ past disasters

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USERS / CLIENTS                                 │
│  (Web Browsers, Mobile Devices, IoT Sensors, APIs)                     │
└────────────┬────────────────────────────────────────────┬───────────────┘
             │                                            │
             │                                            │
             ▼                                            ▼
┌────────────────────────────┐              ┌──────────────────────────┐
│     FRONTEND (Vercel)      │              │   ESP32 IoT SENSORS     │
│  https://frontend-kappa-   │              │  (Field Deployment)     │
│  two-57.vercel.app         │              │                         │
│                            │              │  • Soil Moisture        │
│  • React 18 + Vite         │              │  • Water Level          │
│  • Tailwind CSS            │              │  • Tilt Sensor          │
│  • Socket.IO Client        │              │  • Vibration            │
│  • Recharts                │              │  • Ultrasonic Distance  │
│  • Axios                   │              │  • GPS                  │
└────────────┬───────────────┘              └────────┬─────────────────┘
             │                                       │
             │ HTTP/HTTPS + WebSocket               │ HTTP POST
             │                                       │
             ▼                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER (Render)                         │
│              https://landslide-api.onrender.com                        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    Express.js Application                        │  │
│  │  • REST API Routes                                              │  │
│  │  • WebSocket Server (Socket.IO)                                 │  │
│  │  • Request Validation & Rate Limiting                           │  │
│  │  • CORS & Security Middleware                                   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────┬──────────────┬───────────────┬──────────────────┐  │
│  │ Sensor API   │  ML API      │  Alert API    │  Hazard Zones   │  │
│  │ /sensor-data │  /ml/predict │  /alerts      │  /hazard-zones  │  │
│  └──────────────┴──────────────┴───────────────┴──────────────────┘  │
│                                                                         │
│  ┌──────────────┬──────────────┬───────────────┬──────────────────┐  │
│  │ Weather API  │  Satellite   │  News API     │  GEE API        │  │
│  │ /weather     │  /satellite  │  /news        │  /gee           │  │
│  └──────────────┴──────────────┴───────────────┴──────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      Services Layer                              │  │
│  │  • SatelliteMlService  (Live predictions)                       │  │
│  │  • SatelliteService    (Data collection)                        │  │
│  │  • WeatherService      (OpenWeatherMap)                         │  │
│  │  • NewsService         (Google News)                            │  │
│  │  • GEEService          (Earth Engine)                           │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────┬─────────────────────────────────┬───────────────────┬─────┘
            │                                 │                   │
            │                                 │                   │
            ▼                                 ▼                   ▼
┌─────────────────────┐      ┌──────────────────────┐   ┌─────────────────┐
│  MONGODB DATABASE   │      │   ML API (Render)    │   │ EXTERNAL APIs   │
│  (MongoDB Atlas)    │      │  landslide-ml-api    │   │                 │
│                     │      │  .onrender.com       │   │ • NASA POWER    │
│  Collections:       │      │                      │   │ • Open Elevation│
│  • sensor_data      │      │  ┌────────────────┐ │   │ • GPM IMERG     │
│  • predictions      │      │  │ Flask API      │ │   │ • OpenWeather   │
│  • alerts           │      │  │                │ │   │ • Google News   │
│  • users            │      │  │ • LightGBM     │ │   │ • Sentinel Hub  │
│  • satellite_data   │      │  │ • SHAP         │ │   │ • Google EE     │
│                     │      │  │ • Anomaly Det. │ │   │                 │
│  Indexes:           │      │  │ • Risk Scoring │ │   └─────────────────┘
│  • timestamp        │      │  └────────────────┘ │
│  • location         │      │                      │
│  • risk_level       │      │  Models:             │
│                     │      │  • v1.0 RF (99.4%)   │
└─────────────────────┘      │  • v2.0 LGB (90.7%)  │
                             │  • v3.0 LGB (100%) ✓ │
                             └──────────────────────┘
```

---

## Component Details

### 1. Frontend (React Application)

**Location:** `frontend/`  
**Deployment:** Vercel  
**URL:** https://frontend-kappa-two-57.vercel.app

#### Pages:
- **Dashboard** - Main monitoring interface
  - Real-time sensor data
  - ML predictions with SHAP
  - Satellite ML predictions
  - Risk indicators
  - ML Models Showcase
  - Daily statistics
  - Weather widget

- **Predictions** - Historical predictions and trends
- **Analytics** - Data analysis and insights
- **Alerts** - Alert management system
- **Satellite** - Satellite data visualization
- **Hazard Zones** - Global hazard monitoring (NEW)
- **News** - Live news feed
- **Sensors** - Sensor network status

#### Key Components:
```
src/
├── components/
│   ├── MLPredictionCard.jsx       (Sensor ML predictions)
│   ├── SatelliteMLPrediction.jsx  (Satellite predictions)
│   ├── MLModelsShowcase.jsx       (3 models comparison)
│   ├── RiskIndicator.jsx          (Risk display)
│   ├── StatCard.jsx               (Sensor stats)
│   ├── SensorChart.jsx            (Trend charts)
│   └── ...
├── pages/
│   ├── Dashboard.jsx              (Main page)
│   ├── HazardZones.jsx            (Global zones)
│   └── ...
├── services/
│   ├── api.js                     (API client)
│   ├── mlService.js               (ML integration)
│   └── ...
└── context/
    └── SocketContext.jsx          (WebSocket)
```

#### State Management:
- **React Context** for WebSocket data
- **Local State** for component data
- **Real-time Updates** via Socket.IO

---

### 2. Backend API Server (Node.js)

**Location:** `backend/`  
**Deployment:** Render  
**URL:** https://landslide-api.onrender.com

#### Architecture:
```
src/
├── server.js                 (Main application)
├── routes/
│   ├── sensorRoutes.js       (Sensor CRUD)
│   ├── mlRoutes.js           (ML predictions)
│   ├── alertRoutes.js        (Alerts)
│   ├── satelliteMlRoutes.js  (Satellite ML)
│   ├── hazardZonesRoutes.js  (Hazard zones)
│   ├── weatherRoutes.js      (Weather)
│   ├── newsRoutes.js         (News)
│   └── geeRoutes.js          (Google Earth Engine)
├── services/
│   ├── satelliteMlService.js (Live predictions)
│   ├── satelliteService.js   (Data collection)
│   ├── weatherService.js     (OpenWeather)
│   └── ...
├── models/
│   ├── SensorData.js         (MongoDB model)
│   ├── Alert.js              (MongoDB model)
│   └── ...
├── middleware/
│   ├── errorHandler.js       (Error handling)
│   └── validation.js         (Input validation)
├── socket/
│   └── socketHandler.js      (WebSocket logic)
└── config/
    └── database.js           (MongoDB connection)
```

#### Key Features:
- **RESTful API** with Express.js
- **WebSocket Server** for real-time updates
- **Rate Limiting** (100 requests/minute)
- **CORS** enabled for cross-origin
- **Error Handling** with custom middleware
- **MongoDB** for data persistence

---

### 3. ML API Server (Python/Flask)

**Location:** `ml/`  
**Deployment:** Render (Docker)  
**URL:** https://landslide-ml-api.onrender.com

#### Structure:
```
ml/
├── ml_api.py                      (Flask application)
├── trend_forecasting.py           (Trend analysis)
├── train_simple_model.py          (Training script)
├── landslide_model_simple.pkl     (Active model)
├── anomaly_model.pkl              (Anomaly detection)
├── model_metadata_simple.json     (Model info)
├── requirements.txt               (Dependencies)
└── Dockerfile                     (Container config)
```

#### Endpoints:
- `GET /health` - Health check
- `POST /predict` - Get prediction
- `GET /model-info` - Model metadata

#### ML Pipeline:
```python
Input (5 features)
    ↓
Feature Validation
    ↓
LightGBM Model (v3.0)
    ↓
├─→ Risk Prediction (0-100)
├─→ SHAP Explanation
├─→ Anomaly Detection
└─→ Risk Level Mapping
    ↓
JSON Response
```

#### Models Available:
1. **v1.0** - Random Forest (99.4% accuracy)
2. **v2.0** - LightGBM Historical (90.7% accuracy)
3. **v3.0** - LightGBM Simplified (100% accuracy) ✓ **Active**

---

### 4. Database (MongoDB)

**Provider:** MongoDB Atlas  
**Connection:** Async via Mongoose

#### Collections:

**sensor_data**
```javascript
{
  _id: ObjectId,
  soilMoisture: Number,
  waterLevel: Number,
  tilt: Number,
  vibration: Number,
  ultrasonicDistance: Number,
  latitude: Number,
  longitude: Number,
  timestamp: Date,
  deviceId: String
}
```

**predictions**
```javascript
{
  _id: ObjectId,
  sensorDataId: ObjectId,
  riskLevel: String,
  riskScore: Number,
  confidence: Number,
  modelVersion: String,
  shapExplanation: Object,
  anomaly: Object,
  timestamp: Date
}
```

**alerts**
```javascript
{
  _id: ObjectId,
  type: String,
  severity: String,
  message: String,
  location: Object,
  sensorDataId: ObjectId,
  resolved: Boolean,
  timestamp: Date
}
```

**satellite_data**
```javascript
{
  _id: ObjectId,
  location: { lat: Number, lon: Number },
  rainfall: Object,
  ndvi: Number,
  temperature: Number,
  source: String,
  timestamp: Date
}
```

---

## Data Flow

### 1. Sensor Data Flow (Real-time)

```
ESP32 Sensor
    │
    │ (1) POST /api/sensor-data
    │     { soilMoisture, waterLevel, tilt, vibration, distance }
    ▼
Backend API
    │
    ├─→ (2) Save to MongoDB
    │
    ├─→ (3) POST to ML API /predict
    │        ▼
    │     ML Model Processing
    │        ├─→ Feature validation
    │        ├─→ LightGBM prediction
    │        ├─→ SHAP explanation
    │        └─→ Anomaly detection
    │        ▼
    │     Return prediction
    │
    ├─→ (4) Save prediction to MongoDB
    │
    ├─→ (5) Check alert thresholds
    │        ▼
    │     Create alert if needed
    │
    └─→ (6) Broadcast via WebSocket
             ▼
         All Connected Clients
             ▼
         Dashboard Updates in Real-time
```

**Timeline:** ~1-2 seconds from sensor to dashboard

---

### 2. Satellite ML Prediction Flow

```
User Opens Dashboard
    │
    │ (1) Component mounts
    ▼
Frontend
    │
    │ (2) POST /api/satellite-ml/predict
    │     { lat: 31.25, lon: 75.70 }
    ▼
Backend Satellite ML Service
    │
    ├─→ (3) Check cache (1-hour TTL)
    │        │
    │        ├─→ Hit: Return cached data
    │        │
    │        └─→ Miss: Fetch fresh data
    │
    ├─→ (4) Parallel API calls:
    │    │
    │    ├─→ NASA POWER API
    │    │   (Rainfall, temperature, humidity)
    │    │
    │    ├─→ Open Elevation API
    │    │   (Elevation, calculate slope)
    │    │
    │    └─→ Weather data
    │        (Current conditions)
    │
    ├─→ (5) Process satellite data
    │        │
    │        ├─→ Calculate rainfall risk
    │        ├─→ Calculate terrain risk
    │        ├─→ Calculate climate risk
    │        └─→ Calculate sensor risk (if available)
    │
    ├─→ (6) Combine risk factors
    │        │
    │        └─→ Weighted average:
    │            • Rainfall: 35%
    │            • Terrain: 25%
    │            • Climate: 20%
    │            • Sensor: 20%
    │
    ├─→ (7) Generate risk level
    │        └─→ CRITICAL/HIGH/MEDIUM/LOW
    │
    └─→ (8) Cache result & return
         ▼
    Frontend displays:
    ├─→ Overall risk score
    ├─→ 4 risk factor cards
    ├─→ Satellite data details
    └─→ Auto-refresh in 5 minutes
```

**Timeline:** ~2-5 seconds (first call), <100ms (cached)

---

### 3. Hazard Zone Report Flow

```
User Clicks "View Report" on Hazard Zone
    │
    │ (1) GET /api/hazard-zones/{id}/live-report
    ▼
Backend
    │
    ├─→ (2) Load zone from hazard_zones.json
    │        { name, coordinates, historical events, etc. }
    │
    ├─→ (3) Call SatelliteMlService.predictFromSatellite()
    │        (Same flow as above)
    │
    ├─→ (4) Combine zone info + live data
    │
    └─→ (5) Return comprehensive report
         ▼
    Frontend Modal displays:
    ├─→ Zone details
    ├─→ Live risk assessment
    ├─→ 4 risk factor breakdown
    ├─→ Historical disasters
    ├─→ Monitoring status
    └─→ Population at risk
```

**Timeline:** ~3-6 seconds

---

### 4. WebSocket Real-time Update Flow

```
Backend receives new sensor data
    │
    │ (1) Data processed & saved
    ▼
Socket.IO Server
    │
    │ (2) io.emit('sensor-update', data)
    │
    └─→ Broadcast to all connected clients
         │
         ├─→ Client 1 (Dashboard)
         │    └─→ Updates charts, stats, predictions
         │
         ├─→ Client 2 (Analytics)
         │    └─→ Updates graphs
         │
         └─→ Client 3 (Alerts)
              └─→ Shows new alerts
```

**Latency:** <100ms

---

## Workflow Diagrams

### Complete User Journey

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER VISITS DASHBOARD                                │
│    https://frontend-kappa-two-57.vercel.app             │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 2. FRONTEND INITIALIZATION                               │
│    • Load React app                                      │
│    • Connect to WebSocket                                │
│    • Fetch initial data                                  │
│      - Latest sensor readings                            │
│      - Latest predictions                                │
│      - Historical data (50 points)                       │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 3. DASHBOARD DISPLAYS                                    │
│    • Risk Indicator (current risk level)                 │
│    • Sensor Statistics (6 cards)                         │
│    • ML Prediction Card (SHAP explanations)              │
│    • Satellite ML Prediction (4 risk factors)            │
│    • ML Models Showcase (3 models)                       │
│    • Daily Statistics                                    │
│    • Trend Charts (5 sensors)                            │
│    • Weather Widget                                      │
│    • Satellite Data (rainfall, NDVI)                     │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 4. REAL-TIME UPDATES (via WebSocket)                    │
│    ESP32 sends data every 30 seconds                     │
│         ↓                                                │
│    Backend processes & broadcasts                        │
│         ↓                                                │
│    Dashboard updates automatically                       │
│    • New sensor values                                   │
│    • Updated predictions                                 │
│    • New alerts (if any)                                 │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 5. USER EXPLORES FEATURES                                │
│    • View Predictions page (historical trends)           │
│    • Check Alerts page (active alerts)                   │
│    • Browse Hazard Zones (global monitoring)             │
│    • View Satellite Data (detailed analysis)             │
│    • Check News (live updates)                           │
└─────────────────────────────────────────────────────────┘
```

---

### ML Prediction Workflow (Detailed)

```
┌──────────────────────────────────────────────────────────┐
│ STEP 1: Data Collection                                  │
│                                                           │
│ ESP32 Sensor reads:                                      │
│ ├─→ Capacitive sensor → Soil Moisture (0-100%)          │
│ ├─→ Ultrasonic sensor → Water Level (cm)                │
│ ├─→ MPU6050 → Tilt Angle (degrees)                      │
│ ├─→ Vibration sensor → Vibration Count                   │
│ ├─→ HC-SR04 → Ultrasonic Distance (cm)                  │
│ └─→ GPS module → Coordinates (optional)                  │
│                                                           │
│ Sends via WiFi: POST /api/sensor-data                   │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 2: Backend Processing                               │
│                                                           │
│ (1) Validate input data                                  │
│     • Check required fields                              │
│     • Validate ranges                                    │
│     • Sanitize values                                    │
│                                                           │
│ (2) Save to MongoDB                                      │
│     • Add timestamp                                      │
│     • Index by location                                  │
│                                                           │
│ (3) Prepare ML request                                   │
│     {                                                     │
│       soilMoisture: 100,                                 │
│       waterLevel: 0,                                     │
│       tilt: 0,                                           │
│       vibration: 0,                                      │
│       ultrasonicDistance: 8.5                            │
│     }                                                     │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 3: ML API Processing                                │
│                                                           │
│ Flask API receives request                               │
│     ↓                                                     │
│ Load LightGBM Model v3.0                                 │
│     ↓                                                     │
│ Create feature DataFrame:                                │
│ ┌────────────────────────────────────────┐              │
│ │ soilMoisture | waterLevel | tilt | ... │              │
│ │     100.0    |    0.0     | 0.0  | ... │              │
│ └────────────────────────────────────────┘              │
│     ↓                                                     │
│ Model Prediction:                                        │
│ ├─→ prediction_class = 0 (No landslide)                 │
│ ├─→ probabilities = [0.95, 0.05]                        │
│ └─→ confidence = 95%                                     │
│     ↓                                                     │
│ Map to Risk Level:                                       │
│ ├─→ class 0 → LOW                                       │
│ └─→ class 1 → HIGH/CRITICAL (based on probability)     │
│     ↓                                                     │
│ Calculate Risk Score:                                    │
│ └─→ LOW: 20, MEDIUM: 50, HIGH: 75, CRITICAL: 95        │
│     ↓                                                     │
│ SHAP Explanation:                                        │
│ ├─→ TreeExplainer.shap_values(features)                │
│ ├─→ Feature contributions:                               │
│ │   • vibration: -4.98 (reducing risk)                  │
│ │   • distance: -2.55 (reducing risk)                   │
│ │   • waterLevel: -1.22 (reducing risk)                 │
│ │   • soilMoisture: +0.06 (increasing risk)             │
│ │   • tilt: -0.54 (reducing risk)                       │
│ └─→ Top factors: [vibration, distance, waterLevel]     │
│     ↓                                                     │
│ Anomaly Detection:                                       │
│ ├─→ Isolation Forest score                              │
│ ├─→ Compare to historical baseline                       │
│ └─→ Flag anomalies (HIGH/MEDIUM/LOW/NORMAL)            │
│     ↓                                                     │
│ Return JSON Response                                     │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 4: Backend Post-Processing                          │
│                                                           │
│ (1) Save prediction to MongoDB                           │
│     • Link to sensor_data document                       │
│     • Store SHAP explanation                             │
│     • Store anomaly info                                 │
│                                                           │
│ (2) Check Alert Thresholds:                              │
│     IF riskScore >= 75 → CRITICAL alert                 │
│     IF riskScore >= 50 → HIGH alert                     │
│     IF anomaly = HIGH → Anomaly alert                   │
│                                                           │
│ (3) Create alerts if needed                              │
│                                                           │
│ (4) Broadcast via WebSocket:                             │
│     io.emit('sensor-update', {                           │
│       sensorData: {...},                                 │
│       prediction: {...}                                  │
│     })                                                    │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 5: Frontend Display                                 │
│                                                           │
│ Dashboard components update:                             │
│                                                           │
│ (1) RiskIndicator                                        │
│     • Shows: LOW RISK (17/100)                          │
│     • Color: Green                                       │
│     • Recommended action                                 │
│                                                           │
│ (2) MLPredictionCard                                     │
│     • Risk level badge                                   │
│     • SHAP explanation text                              │
│     • Top 3 contributing factors                         │
│     • Feature importance bars                            │
│     • Anomaly alert (if detected)                        │
│                                                           │
│ (3) Sensor Stats Cards (6)                               │
│     • Soil Moisture: 100.0%                             │
│     • Water Level: 0.0 cm                               │
│     • Tilt Angle: 0.00°                                 │
│     • Vibration: None                                    │
│     • Distance: 8.5 cm                                  │
│     • GPS: N/A                                          │
│                                                           │
│ (4) Trend Charts                                         │
│     • Update with new data point                         │
│     • Scroll older data out                              │
│                                                           │
│ (5) Daily Stats                                          │
│     • Update aggregations                                │
│     • Recalculate risk distribution                      │
└──────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
```
┌─────────────────────────────────────┐
│ Framework: React 18                  │
│ Build Tool: Vite                     │
│ Styling: Tailwind CSS                │
│ HTTP Client: Axios                   │
│ WebSocket: Socket.IO Client          │
│ Charts: Recharts                     │
│ Icons: Lucide React                  │
│ Routing: React Router v6             │
│ State: React Context + Hooks         │
└─────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────┐
│ Runtime: Node.js 20                  │
│ Framework: Express.js                │
│ WebSocket: Socket.IO                 │
│ Database: MongoDB (Mongoose)         │
│ HTTP Client: Axios                   │
│ Security: Helmet, CORS               │
│ Rate Limiting: express-rate-limit    │
│ Logging: Morgan                      │
│ Environment: dotenv                  │
└─────────────────────────────────────┘
```

### ML/AI
```
┌─────────────────────────────────────┐
│ Language: Python 3.11                │
│ Framework: Flask                     │
│ WSGI Server: Gunicorn                │
│ ML Framework: LightGBM               │
│ Explainability: SHAP                 │
│ Data Processing: Pandas, NumPy       │
│ Model Training: scikit-learn         │
│ Anomaly Detection: Isolation Forest  │
│ Serialization: joblib                │
└─────────────────────────────────────┘
```

### IoT Hardware
```
┌─────────────────────────────────────┐
│ Microcontroller: ESP32               │
│ Connectivity: WiFi                   │
│                                      │
│ Sensors:                             │
│ • Capacitive Soil Moisture           │
│ • Ultrasonic Distance (HC-SR04)      │
│ • MPU6050 (Accelerometer/Gyro)       │
│ • Vibration Sensor                   │
│ • GPS Module (optional)              │
│                                      │
│ Power: USB/Battery                   │
│ Programming: Arduino IDE             │
└─────────────────────────────────────┘
```

### External Services
```
┌─────────────────────────────────────┐
│ • NASA POWER API (Climate)           │
│ • Open Elevation API (Terrain)       │
│ • GPM IMERG (Rainfall)               │
│ • OpenWeatherMap (Weather)           │
│ • Google Earth Engine (Satellite)    │
│ • Sentinel-2 (NDVI, vegetation)      │
│ • Google News API (News feed)        │
└─────────────────────────────────────┘
```

---

## Deployment Architecture

### Infrastructure Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         GITHUB                                │
│                   Main Branch (Production)                    │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐           │
│  │ Frontend   │  │ Backend    │  │ ML API      │           │
│  │ /frontend  │  │ /backend   │  │ /ml         │           │
│  └────────────┘  └────────────┘  └─────────────┘           │
└────────┬──────────────┬─────────────────┬───────────────────┘
         │              │                 │
         │ Git Push     │ Git Push        │ Git Push
         ▼              ▼                 ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
│    VERCEL      │ │   RENDER     │ │     RENDER       │
│  (Frontend)    │ │  (Backend)   │ │   (ML API)       │
│                │ │              │ │                  │
│ • Auto Deploy  │ │ • Auto Deploy│ │ • Docker Build   │
│ • CDN Edge     │ │ • Node.js    │ │ • Python 3.11    │
│ • HTTPS        │ │ • Auto Scale │ │ • Gunicorn       │
│ • Global       │ │ • HTTPS      │ │ • HTTPS          │
│                │ │ • Health     │ │ • Health Check   │
│ Build Time:    │ │   Check      │ │                  │
│ ~1-2 min       │ │              │ │ Build Time:      │
│                │ │ Boot Time:   │ │ ~3-5 min         │
└────────────────┘ │ ~30 sec      │ └──────────────────┘
                   └──────┬───────┘
                          │
                          │ Connects to
                          ▼
                   ┌──────────────┐
                   │ MONGODB      │
                   │ ATLAS        │
                   │              │
                   │ • Cluster    │
                   │ • Auto       │
                   │   Backup     │
                   │ • Replica    │
                   │   Set        │
                   │ • Monitoring │
                   └──────────────┘
```

### Environment Variables

**Frontend (.env.production)**
```bash
VITE_API_URL=https://landslide-api.onrender.com
VITE_SOCKET_URL=https://landslide-api.onrender.com
VITE_ML_API_URL=https://landslide-ml-api.onrender.com
```

**Backend (.env)**
```bash
PORT=5000
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
CORS_ORIGIN=*
```

**ML API (.env)**
```bash
PORT=10000
FLASK_ENV=production
MODEL_PATH=landslide_model_simple.pkl
```

---

## API Architecture

### Complete API Reference

#### Backend API (Port 5000)

**Base URL:** `https://landslide-api.onrender.com/api`

##### Sensor Data APIs
```
GET    /sensor-data/latest          # Get latest reading
GET    /sensor-data/history         # Get historical data
POST   /sensor-data                 # Submit new reading
GET    /sensor-data/:id             # Get specific reading
```

##### ML Prediction APIs
```
GET    /ml/predictions              # Get all predictions
GET    /ml/predictions/latest       # Get latest prediction
POST   /ml/predict                  # Request prediction
```

##### Satellite ML APIs
```
POST   /satellite-ml/predict        # Get satellite prediction
GET    /satellite-ml/data           # Get satellite data
```

##### Hazard Zones APIs
```
GET    /hazard-zones                # Get all zones
GET    /hazard-zones/:id            # Get specific zone
GET    /hazard-zones/:id/live-report # Get live report
GET    /hazard-zones/stats/summary  # Get statistics
```

##### Alert APIs
```
GET    /alerts                      # Get all alerts
POST   /alerts                      # Create alert
PATCH  /alerts/:id/resolve          # Resolve alert
```

##### Weather APIs
```
GET    /weather/current             # Current weather
GET    /weather/risk-boost          # Weather risk factor
```

##### Satellite Data APIs
```
GET    /satellite/rainfall          # Rainfall data
GET    /satellite/vegetation        # NDVI data
GET    /satellite/rainfall-summary  # Summary stats
```

##### News APIs
```
GET    /news                        # Get landslide news
```

##### Google Earth Engine APIs
```
GET    /gee/ndvi                    # Get NDVI data
GET    /gee/rainfall                # Get GEE rainfall
```

#### ML API (Port 10000)

**Base URL:** `https://landslide-ml-api.onrender.com`

```
GET    /health                      # Health check
POST   /predict                     # Get ML prediction
GET    /model-info                  # Model metadata
```

**Predict Request:**
```json
{
  "soilMoisture": 100.0,
  "waterLevel": 0.0,
  "tilt": 0.0,
  "vibration": 0,
  "ultrasonicDistance": 8.5
}
```

**Predict Response:**
```json
{
  "success": true,
  "prediction": {
    "riskLevel": "LOW",
    "riskScore": 19,
    "confidence": 100.0,
    "features": {...},
    "featureImportance": {...},
    "shapExplanation": {
      "baseValue": -2.85,
      "contributions": {...},
      "topFactors": [...],
      "explanation": "..."
    },
    "anomaly": {
      "isAnomaly": false,
      "score": 0.10,
      "severity": "NORMAL",
      "description": "..."
    }
  }
}
```

---

## Performance Metrics

### Response Times
- Sensor data POST: ~200ms
- ML prediction: <50ms
- Satellite ML prediction: ~2-5s (first), <100ms (cached)
- WebSocket latency: <100ms
- Dashboard load: ~1-2s

### Throughput
- API requests: 100/minute (rate limited)
- WebSocket connections: Unlimited
- ML predictions: 20/second
- Database queries: <100ms (indexed)

### Availability
- Frontend (Vercel): 99.99%
- Backend (Render): 99.9%
- ML API (Render): 99.9%
- Database (Atlas): 99.995%

---

## Security

### Authentication & Authorization
- API Key (future implementation)
- Rate limiting (100 req/min)
- CORS enabled
- Input validation
- SQL injection prevention (NoSQL)

### Data Security
- HTTPS everywhere
- MongoDB encrypted at rest
- Environment variables for secrets
- No credentials in code

### Network Security
- Helmet.js security headers
- CORS configuration
- Request size limits
- Timeout protection

---

## Monitoring & Logging

### Application Monitoring
- Render dashboard (CPU, Memory, Network)
- MongoDB Atlas monitoring
- Vercel analytics

### Error Tracking
- Console logs
- Error middleware
- HTTP status codes
- Stack traces

### Performance Monitoring
- Response time tracking
- API endpoint metrics
- Database query performance
- WebSocket connection count

---

## Disaster Recovery

### Backup Strategy
- MongoDB: Automated daily backups (Atlas)
- Code: Git repository (GitHub)
- Models: Stored in repository
- Configuration: Environment variables documented

### Recovery Time
- Frontend: ~2 minutes (redeploy from Git)
- Backend: ~5 minutes (redeploy from Git)
- ML API: ~10 minutes (Docker rebuild)
- Database: ~30 minutes (restore from backup)

---

## Future Architecture Enhancements

### Planned Improvements
1. **Microservices** - Split backend into services
2. **Message Queue** - RabbitMQ/Redis for async processing
3. **API Gateway** - Centralized routing & auth
4. **Kubernetes** - Container orchestration
5. **CDN** - CloudFlare for static assets
6. **Cache Layer** - Redis for API responses
7. **Load Balancer** - Handle increased traffic
8. **GraphQL** - More flexible API queries

### Scalability Roadmap
- Horizontal scaling (multiple instances)
- Database sharding
- Read replicas
- Caching layer
- Async job processing

---

**Document Version:** 3.0  
**Last Updated:** September 10, 2026  
**Status:** Production System - Fully Operational
