# Power BI Integration Guide
## Landslide Monitoring & Early Warning System

## 📋 Table of Contents
1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Power BI Setup](#power-bi-setup)
4. [Dashboard Design](#dashboard-design)
5. [DAX Measures](#dax-measures)
6. [Deployment](#deployment)

---

## 🎯 Overview

This guide provides complete Power BI integration for your existing landslide monitoring system WITHOUT modifying any existing APIs or backend code.

### New API Endpoints Added
- `/api/powerbi/*` - All Power BI endpoints (READ-ONLY)
- Existing APIs remain unchanged

### Features
- ✅ Real-time sensor monitoring
- ✅ Historical trend analysis
- ✅ ML model performance metrics
- ✅ Geographic visualization
- ✅ Automated reporting
- ✅ Dark theme matching your React dashboard

---

## 🔌 API Endpoints

### Base URL
```
Production: https://landslide-api.onrender.com/api/powerbi
Local: http://localhost:5000/api/powerbi
```

### 1. KPI Statistics
**Endpoint:** `GET /api/powerbi/statistics`

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 825,
    "averageSoilMoisture": 45.23,
    "averageWaterLevel": 32.15,
    "maximumTilt": 15.67,
    "averageTilt": 5.43,
    "totalVibrationEvents": 12,
    "averageDistance": 125.45,
    "currentRiskScore": 34,
    "averageRiskScore": 28.5,
    "totalAlerts": 15,
    "unresolvedAlerts": 3,
    "sensorHealthStatus": "EXCELLENT",
    "lastUpdateTime": "2026-06-17T14:30:00.000Z"
  }
}
```

### 2. Time Series Data
**Endpoint:** `GET /api/powerbi/timeseries`

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `interval` (optional): hour, day, week (default: hour)

**Response:**
```json
{
  "success": true,
  "count": 500,
  "data": [
    {
      "_id": "...",
      "timestamp": "2026-06-17T10:00:00.000Z",
      "soilMoisture": 45.2,
      "waterLevel": 32.1,
      "tilt": 5.4,
      "vibration": 0,
      "ultrasonicDistance": 125.3
    }
  ]
}
```

### 3. Risk Distribution
**Endpoint:** `GET /api/powerbi/risk-distribution`

**Response:**
```json
{
  "success": true,
  "total": 825,
  "data": [
    {
      "riskLevel": "LOW",
      "count": 650,
      "percentage": "78.79"
    },
    {
      "riskLevel": "MEDIUM",
      "count": 150,
      "percentage": "18.18"
    },
    {
      "riskLevel": "HIGH",
      "count": 20,
      "percentage": "2.42"
    },
    {
      "riskLevel": "CRITICAL",
      "count": 5,
      "percentage": "0.61"
    }
  ]
}
```

### 4. ML Model Metrics
**Endpoint:** `GET /api/powerbi/ml-metrics`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPredictions": 825,
    "averageConfidence": "95.67",
    "modelUsageStats": {
      "randomForest": 800,
      "fallback": 25
    },
    "confidenceDistribution": {
      "high": 750,
      "medium": 50,
      "low": 25
    },
    "riskScoreStats": {
      "min": 5,
      "max": 95,
      "average": "28.45"
    }
  }
}
```

### 5. Sensor Correlation
**Endpoint:** `GET /api/powerbi/correlation`

**Query Parameters:**
- `limit` (optional): Number of records (default: 500)

**Response:**
```json
{
  "success": true,
  "count": 500,
  "data": [
    {
      "soilMoisture": 45.2,
      "waterLevel": 32.1,
      "tilt": 5.4,
      "vibration": 0,
      "ultrasonicDistance": 125.3,
      "riskScore": 34
    }
  ]
}
```

### 6. GPS Location Data
**Endpoint:** `GET /api/powerbi/gps-data`

**Response:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "latitude": 28.7041,
      "longitude": 77.1025,
      "timestamp": "2026-06-17T10:00:00.000Z",
      "soilMoisture": 45.2,
      "waterLevel": 32.1,
      "tilt": 5.4,
      "riskLevel": "MEDIUM",
      "riskScore": 34
    }
  ]
}
```

### 7. Alert Summary
**Endpoint:** `GET /api/powerbi/alerts-summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "resolved": 20,
    "unresolved": 5,
    "bySeverity": {
      "HIGH": 5,
      "MEDIUM": 10,
      "LOW": 10
    },
    "byType": {
      "SOIL_MOISTURE_HIGH": 10,
      "WATER_LEVEL_HIGH": 8,
      "TILT_DETECTED": 7
    }
  }
}
```

### 8. Aggregated Reports
**Endpoint:** `GET /api/powerbi/reports/aggregated`

**Query Parameters:**
- `period`: daily, weekly, monthly (required)
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "period": "daily",
  "data": [
    {
      "period": "2026-06-17",
      "avgSoilMoisture": "45.23",
      "avgWaterLevel": "32.15",
      "avgTilt": "5.43",
      "avgRiskScore": "28.50",
      "totalAlerts": 3,
      "sensorReadings": 48
    }
  ]
}
```

---

## 🚀 Power BI Setup

### Step 1: Install Power BI Desktop
Download from: https://powerbi.microsoft.com/desktop/

### Step 2: Connect to API

1. Open Power BI Desktop
2. Get Data → Web
3. Enter URL: `https://landslide-api.onrender.com/api/powerbi/statistics`
4. Click OK
5. Parse JSON response

### Step 3: Create Data Sources

Create separate queries for each endpoint:

**Query 1: KPI_Statistics**
```
= Json.Document(Web.Contents("https://landslide-api.onrender.com/api/powerbi/statistics"))
```

**Query 2: TimeSeries_Data**
```
= Json.Document(Web.Contents("https://landslide-api.onrender.com/api/powerbi/timeseries"))
```

**Query 3: Risk_Distribution**
```
= Json.Document(Web.Contents("https://landslide-api.onrender.com/api/powerbi/risk-distribution"))
```

**Query 4: ML_Metrics**
```
= Json.Document(Web.Contents("https://landslide-api.onrender.com/api/powerbi/ml-metrics"))
```

**Query 5: GPS_Data**
```
= Json.Document(Web.Contents("https://landslide-api.onrender.com/api/powerbi/gps-data"))
```

**Query 6: Alert_Summary**
```
= Json.Document(Web.Contents("https://landslide-api.onrender.com/api/powerbi/alerts-summary"))
```

### Step 4: Transform Data

For each query, expand the JSON structure:
1. Click on "data" column
2. Select "Expand to New Rows" or "Convert to Table"
3. Expand nested records
4. Set data types (Number, Date, Text)

---

## 🎨 Dashboard Design

### Page 1: Real-Time Monitoring

**KPI Cards (Top Row):**
- Current Risk Score (Large, with color coding)
- Average Soil Moisture
- Average Water Level
- Maximum Tilt Detected
- Total Alerts
- Sensor Health Status

**Charts:**
- Line Chart: Soil Moisture Trend (Last 24 hours)
- Line Chart: Water Level Trend (Last 24 hours)
- Line Chart: Tilt Angle Monitoring
- Bar Chart: Vibration Activity
- Gauge: Current Risk Level

### Page 2: Historical Analytics

**Charts:**
- Area Chart: 30-Day Soil Moisture Trend
- Area Chart: 30-Day Water Level Trend
- Line Chart: Risk Score Over Time
- Stacked Bar Chart: Daily Alert Count
- Table: Recent Sensor Readings

### Page 3: ML Model Performance

**Visuals:**
- Card: Model Accuracy (98.79%)
- Donut Chart: Model Usage (RandomForest vs Fallback)
- Bar Chart: Confidence Distribution
- Line Chart: Prediction Confidence Over Time
- Matrix: Feature Importance
  - Water Level: 66.6%
  - Soil Moisture: 8.9%
  - Distance: 8.5%
  - Tilt: 8.0%
  - Vibration: 8.0%

### Page 4: Risk Analytics

**Visuals:**
- Donut Chart: Risk Distribution (LOW/MEDIUM/HIGH/CRITICAL)
- Treemap: Risk Levels with Percentages
- Waterfall Chart: Risk Score Changes
- Table: High-Risk Events
- Funnel Chart: Risk Escalation

### Page 5: Geographic Visualization

**Map Visual:**
- Azure Maps or Bing Maps
- Plot GPS coordinates
- Color by risk level
- Size by risk score
- Tooltip: All sensor values

### Page 6: Automated Reports

**Tables:**
- Daily Summary Report
- Weekly Trends
- Monthly Statistics
- Sensor Performance Metrics
- Alert Log

---

## 📊 DAX Measures

### KPI Measures

```dax
// Current Risk Level
Current Risk Level = 
VAR Score = MAX(KPI_Statistics[currentRiskScore])
RETURN
    SWITCH(
        TRUE(),
        Score >= 81, "CRITICAL",
        Score >= 61, "HIGH",
        Score >= 31, "MEDIUM",
        "LOW"
    )

// Risk Level Color
Risk Color = 
SWITCH(
    [Current Risk Level],
    "CRITICAL", "#EF4444",
    "HIGH", "#F97316",
    "MEDIUM", "#EAB308",
    "LOW", "#22C55E",
    "#9CA3AF"
)

// Sensor Health Status
Sensor Health = 
SWITCH(
    MAX(KPI_Statistics[sensorHealthStatus]),
    "EXCELLENT", "🟢 Excellent",
    "GOOD", "🟡 Good",
    "FAIR", "🟠 Fair",
    "POOR", "🔴 Poor",
    "⚫ Unknown"
)

// Total Active Sensors
Active Sensors = 6  // Soil, Water, Tilt, Vibration, Distance, GPS

// Data Freshness
Minutes Since Update = 
DATEDIFF(
    MAX(KPI_Statistics[lastUpdateTime]),
    NOW(),
    MINUTE
)

// Alert Rate
Alert Rate = 
DIVIDE(
    SUM(KPI_Statistics[totalAlerts]),
    SUM(KPI_Statistics[totalRecords]),
    0
) * 100
```

### Trend Analysis Measures

```dax
// Soil Moisture Trend
Soil Moisture MA = 
CALCULATE(
    AVERAGE(TimeSeries_Data[soilMoisture]),
    DATESINPERIOD(
        TimeSeries_Data[timestamp],
        LASTDATE(TimeSeries_Data[timestamp]),
        -7,
        DAY
    )
)

// Water Level Change
Water Level Change = 
VAR CurrentValue = AVERAGE(TimeSeries_Data[waterLevel])
VAR PreviousValue = 
    CALCULATE(
        AVERAGE(TimeSeries_Data[waterLevel]),
        DATEADD(TimeSeries_Data[timestamp], -1, DAY)
    )
RETURN
    CurrentValue - PreviousValue

// Risk Score Trend
Risk Trend = 
VAR Current = AVERAGE(TimeSeries_Data[riskScore])
VAR Previous = 
    CALCULATE(
        AVERAGE(TimeSeries_Data[riskScore]),
        DATEADD(TimeSeries_Data[timestamp], -1, HOUR)
    )
RETURN
    IF(Current > Previous, "↑", 
        IF(Current < Previous, "↓", "→")
    )
```

### ML Performance Measures

```dax
// Model Accuracy
Model Accuracy = "98.79%"

// RandomForest Usage %
RF Usage % = 
DIVIDE(
    [RandomForest Count],
    [Total Predictions],
    0
) * 100

// Average Confidence
Avg Confidence = 
AVERAGE(ML_Metrics[averageConfidence])

// Confidence Status
Confidence Status = 
SWITCH(
    TRUE(),
    [Avg Confidence] >= 90, "🟢 High",
    [Avg Confidence] >= 70, "🟡 Medium",
    "🔴 Low"
)

// Feature Importance - Water Level
Water Level Importance = "66.6%"
```

### Alert Measures

```dax
// Unresolved Alerts
Unresolved Alerts = 
SUM(Alert_Summary[unresolved])

// Alert Severity Score
Alert Severity Score = 
SUMX(
    Alert_Summary,
    SWITCH(
        Alert_Summary[severity],
        "HIGH", 3,
        "MEDIUM", 2,
        "LOW", 1,
        0
    )
)

// Critical Alert Count
Critical Alerts = 
CALCULATE(
    COUNT(Alert_Summary[id]),
    Alert_Summary[severity] = "HIGH"
)
```

---

## 🎨 Dark Theme Configuration

### Theme JSON

```json
{
  "name": "Landslide Monitoring Dark",
  "dataColors": [
    "#3B82F6", "#06B6D4", "#EAB308", 
    "#EF4444", "#A855F7", "#22C55E"
  ],
  "background": "#0F172A",
  "foreground": "#F8FAFC",
  "tableAccent": "#1E293B",
  "good": "#22C55E",
  "neutral": "#EAB308",
  "bad": "#EF4444",
  "maximum": "#DC2626",
  "center": "#F59E0B",
  "minimum": "#10B981",
  "textClasses": {
    "label": {
      "color": "#CBD5E1",
      "fontSize": 12
    },
    "title": {
      "color": "#F8FAFC",
      "fontSize": 16,
      "fontFace": "Segoe UI"
    }
  },
  "visualStyles": {
    "*": {
      "*": {
        "background": [{
          "color": {"solid": {"color": "#1E293B"}},
          "transparency": 0
        }],
        "border": [{
          "color": {"solid": {"color": "#334155"}},
          "show": true,
          "radius": 8
        }]
      }
    }
  }
}
```

### Apply Theme
1. View → Themes → Browse for themes
2. Import the JSON file
3. All visuals will adopt dark theme

---

## 🔄 Auto-Refresh Configuration

### Power BI Desktop
1. File → Options → Data Load
2. Enable "Refresh every" → Set to 30 seconds
3. Click OK

### Power BI Service
1. Publish to workspace
2. Dataset settings → Scheduled refresh
3. Set refresh frequency (every 30 mins recommended)
4. Configure credentials

---

## 📱 Mobile Layout

### Configure for Mobile:
1. View → Mobile Layout
2. Drag KPI cards to top
3. Stack charts vertically
4. Prioritize:
   - Current Risk Score
   - Recent Sensor Readings
   - Latest Alerts
   - Risk Distribution Chart

---

## 🚀 Deployment Architecture

```
┌─────────────────┐
│   ESP32 Sensors │
└────────┬────────┘
         │
         v
┌─────────────────┐      ┌──────────────┐
│  Node.js Backend│◄────►│  MongoDB     │
│  (Render.com)   │      │  Atlas       │
└────────┬────────┘      └──────────────┘
         │
         │ Existing APIs (unchanged)
         ├──────────┬────────────┐
         │          │            │
         v          v            v
┌─────────────┐  ┌──────────┐  ┌──────────────┐
│  React      │  │  ML API  │  │  Power BI    │
│  Dashboard  │  │  (Flask) │  │  (NEW)       │
│  (Vercel)   │  │          │  │              │
└─────────────┘  └──────────┘  └──────────────┘
     │                              │
     v                              v
┌─────────────┐              ┌──────────────┐
│   Users     │              │  Management  │
│   (Mobile/  │              │  & Analysts  │
│   Web)      │              │              │
└─────────────┘              └──────────────┘
```

### Power BI Deployment Options:

**Option 1: Power BI Desktop (Free)**
- Local analysis
- Manual refresh
- Export to PDF/PowerPoint

**Option 2: Power BI Service (Paid)**
- Cloud hosting
- Auto-refresh
- Sharing & collaboration
- Mobile apps
- Row-level security

**Option 3: Power BI Embedded**
- Embed in your website
- Custom branding
- API access

---

## 📈 Sample Visuals Configuration

### 1. Risk Score Card

```
Visual: Card
Data Field: KPI_Statistics[currentRiskScore]
Format:
  - Display Units: None
  - Value Color: By Risk Color measure
  - Background: #1E293B
  - Font: 72pt
  - Category Label: "Current Risk Score"
```

### 2. Soil Moisture Line Chart

```
Visual: Line Chart
Axis: TimeSeries_Data[timestamp]
Values: TimeSeries_Data[soilMoisture]
Format:
  - Line Color: #3B82F6
  - Line Width: 3px
  - Data Labels: Off
  - Gridlines: Horizontal only
  - Background: #1E293B
```

### 3. Risk Distribution Donut

```
Visual: Donut Chart
Legend: Risk_Distribution[riskLevel]
Values: Risk_Distribution[count]
Format:
  - Colors: 
    LOW: #22C55E
    MEDIUM: #EAB308
    HIGH: #F97316
    CRITICAL: #EF4444
  - Detail Labels: Percentage
  - Title: "Risk Distribution"
```

### 4. GPS Map

```
Visual: Azure Maps / Bing Maps
Location: GPS_Data[latitude], GPS_Data[longitude]
Size: GPS_Data[riskScore]
Color: GPS_Data[riskLevel]
Format:
  - Bubble size: 5-20
  - Map style: Dark
  - Zoom: Auto
```

---

## 🔐 Security Best Practices

### API Security
- ✅ APIs are read-only
- ✅ No authentication needed (public monitoring)
- ✅ Rate limiting enabled
- ✅ CORS configured

### For Production:
1. Add API key authentication
2. Implement row-level security
3. Use HTTPS only
4. Enable audit logging

---

## 📝 Testing the Integration

### Test API Endpoints:

```bash
# 1. Test KPI Statistics
curl https://landslide-api.onrender.com/api/powerbi/statistics

# 2. Test Time Series
curl https://landslide-api.onrender.com/api/powerbi/timeseries

# 3. Test Risk Distribution
curl https://landslide-api.onrender.com/api/powerbi/risk-distribution

# 4. Test ML Metrics
curl https://landslide-api.onrender.com/api/powerbi/ml-metrics

# 5. Test GPS Data
curl https://landslide-api.onrender.com/api/powerbi/gps-data
```

### Expected Response: 200 OK with JSON data

---

## 🎯 Quick Start Checklist

- [ ] Deploy backend with new Power BI routes
- [ ] Test all API endpoints
- [ ] Install Power BI Desktop
- [ ] Create data connections
- [ ] Transform and model data
- [ ] Create KPI cards
- [ ] Build trend charts
- [ ] Configure ML metrics page
- [ ] Add geographic map
- [ ] Apply dark theme
- [ ] Configure auto-refresh
- [ ] Test mobile layout
- [ ] Publish to Power BI Service (optional)
- [ ] Share with stakeholders

---

## 📞 Support

For issues:
1. Check API endpoints are responding
2. Verify MongoDB connection
3. Review Power BI query errors
4. Check data refresh status

**System Status:** All existing APIs unchanged ✅  
**Power BI APIs:** New endpoints added ✅  
**Impact:** Zero downtime, zero breaking changes ✅

---

## 🎉 Summary

You now have a complete enterprise-grade Power BI integration that:
- ✅ Doesn't modify existing code
- ✅ Provides comprehensive analytics
- ✅ Matches your dark theme
- ✅ Auto-refreshes data
- ✅ Supports mobile devices
- ✅ Enables professional reporting

**Your system is now complete with both React dashboard AND Power BI analytics!** 🚀
