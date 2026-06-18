# Power BI Quick Start Guide
## Get Your Dashboard Running in 15 Minutes

## 🚀 What You Get

**8 New API Endpoints** (all READ-ONLY, zero impact on existing system):
1. `/api/powerbi/statistics` - KPI metrics
2. `/api/powerbi/timeseries` - Trend data
3. `/api/powerbi/risk-distribution` - Risk breakdown
4. `/api/powerbi/ml-metrics` - ML performance
5. `/api/powerbi/correlation` - Sensor correlation
6. `/api/powerbi/gps-data` - Location data
7. `/api/powerbi/alerts-summary` - Alert stats
8. `/api/powerbi/reports/aggregated` - Daily/weekly/monthly reports

**8 Professional Dashboard Pages:**
1. Executive Summary
2. Real-Time Sensor Monitoring
3. ML Model Performance
4. Risk Analytics
5. Geographic Visualization
6. Historical Analytics
7. Alerts & Notifications
8. Automated Reports

---

## 📋 Prerequisites

- [ ] Backend deployed on Render (already done ✅)
- [ ] MongoDB with sensor data (already done ✅)
- [ ] Power BI Desktop (download free from Microsoft)

---

## ⚡ 5-Minute Setup

### Step 1: Test API (30 seconds)

Open in browser or run in terminal:
```bash
curl https://landslide-api.onrender.com/api/powerbi/statistics
```

**Expected:** JSON with sensor statistics ✅

### Step 2: Install Power BI Desktop (3 minutes)

Download from: https://powerbi.microsoft.com/desktop/

### Step 3: Connect to API (1 minute)

1. Open Power BI Desktop
2. Get Data → Web
3. Enter URL: `https://landslide-api.onrender.com/api/powerbi/statistics`
4. Click "OK"
5. Click "Convert to Table"
6. Expand "data" column
7. Rename query to "KPI_Statistics"

### Step 4: Add More Data Sources (30 seconds each)

Repeat Step 3 for each endpoint:

**Quick Copy-Paste URLs:**
```
https://landslide-api.onrender.com/api/powerbi/statistics
https://landslide-api.onrender.com/api/powerbi/timeseries
https://landslide-api.onrender.com/api/powerbi/risk-distribution
https://landslide-api.onrender.com/api/powerbi/ml-metrics
https://landslide-api.onrender.com/api/powerbi/gps-data
https://landslide-api.onrender.com/api/powerbi/alerts-summary
```

---

## 🎨 Build First Dashboard (5 minutes)

### Create KPI Cards:

1. **Current Risk Score Card:**
   - Visual: Card
   - Field: KPI_Statistics[currentRiskScore]
   - Format: 72pt font, center align

2. **Average Soil Moisture Card:**
   - Visual: Card
   - Field: KPI_Statistics[averageSoilMoisture]
   - Format: Add "%" suffix

3. **Sensor Health Card:**
   - Visual: Card
   - Field: KPI_Statistics[sensorHealthStatus]
   - Format: Change color based on status

4. **Total Alerts Card:**
   - Visual: Card
   - Field: KPI_Statistics[totalAlerts]

### Create First Chart:

5. **Risk Distribution Donut:**
   - Visual: Donut Chart
   - Legend: Risk_Distribution[riskLevel]
   - Values: Risk_Distribution[count]
   - Colors:
     - LOW: Green (#22C55E)
     - MEDIUM: Yellow (#EAB308)
     - HIGH: Orange (#F97316)
     - CRITICAL: Red (#EF4444)

### Apply Dark Theme:

6. View → Themes → Browse
7. Import `powerbi_dark_theme.json` (see below)

---

## 🌙 Dark Theme JSON

Save this as `powerbi_dark_theme.json`:

```json
{
  "name": "Landslide Monitoring Dark",
  "dataColors": ["#3B82F6", "#06B6D4", "#EAB308", "#EF4444", "#A855F7", "#22C55E"],
  "background": "#0F172A",
  "foreground": "#F8FAFC",
  "tableAccent": "#1E293B",
  "good": "#22C55E",
  "neutral": "#EAB308",
  "bad": "#EF4444"
}
```

---

## 📊 Pre-Built DAX Measures

Copy-paste these into Power BI:

### Current Risk Level
```dax
Current Risk Level = 
VAR Score = MAX(KPI_Statistics[currentRiskScore])
RETURN SWITCH(TRUE(), Score >= 81, "CRITICAL", Score >= 61, "HIGH", Score >= 31, "MEDIUM", "LOW")
```

### Risk Color
```dax
Risk Color = 
SWITCH([Current Risk Level], "CRITICAL", "#EF4444", "HIGH", "#F97316", "MEDIUM", "#EAB308", "LOW", "#22C55E", "#9CA3AF")
```

### Sensor Health Status
```dax
Sensor Health = 
SWITCH(MAX(KPI_Statistics[sensorHealthStatus]), "EXCELLENT", "🟢 Excellent", "GOOD", "🟡 Good", "FAIR", "🟠 Fair", "POOR", "🔴 Poor", "⚫ Unknown")
```

### Model Accuracy
```dax
Model Accuracy = "98.79%"
```

### Water Level Importance
```dax
Water Level Importance = "66.6%"
```

---

## 🔄 Auto-Refresh Setup

### Power BI Desktop:
1. File → Options → Data Load
2. Check "Refresh every" → Set to 30 seconds
3. Click OK

### Power BI Service (after publishing):
1. Publish to workspace
2. Dataset settings → Scheduled refresh
3. Set to refresh every 30 minutes
4. Save

---

## 📱 Test Your Dashboard

### Must-Have Visuals for Page 1:

```
┌─────────────────────────────────────┐
│  Risk Score: 34    Soil: 45.2%     │
│  ┌─────────┐      ┌──────────┐    │
│  │ Gauge   │      │ Donut    │    │
│  │ Chart   │      │ Risk     │    │
│  └─────────┘      └──────────┘    │
└─────────────────────────────────────┘
```

**If you see data** → ✅ Success!  
**If you see blanks** → Check API is responding

---

## 🐛 Troubleshooting

### Problem: "Unable to connect"
**Solution:** 
- Check if backend is running: `curl https://landslide-api.onrender.com/api/powerbi/statistics`
- Verify URL is correct (no typos)

### Problem: "No data showing in visuals"
**Solution:**
- Refresh data: Home → Refresh
- Check if MongoDB has data
- Verify data types are correct (numbers, not text)

### Problem: "Authentication required"
**Solution:**
- APIs are public (no auth needed)
- If prompted, select "Anonymous"

### Problem: "JSON parsing error"
**Solution:**
- Click "Convert to Table" on the response
- Expand the "data" column
- Expand nested objects

---

## 🎯 Success Checklist

After 15 minutes, you should have:

- [ ] Power BI Desktop installed
- [ ] Connected to at least 3 API endpoints
- [ ] Created 4 KPI cards
- [ ] Created 1 chart (donut/gauge/line)
- [ ] Applied dark theme
- [ ] Data refreshing every 30 seconds
- [ ] Dashboard looks professional

---

## 📈 Next Steps

### Build More Pages:
1. **Real-Time Monitoring** (30 mins)
   - Add TimeSeries data
   - Create line charts for each sensor
   - Add moving averages

2. **ML Performance** (20 mins)
   - Add ML_Metrics data
   - Create confidence distribution
   - Show feature importance

3. **Geographic Map** (15 mins)
   - Add GPS_Data
   - Use Azure Maps or Bing Maps
   - Color by risk level

### Publish to Cloud:
1. Sign up for Power BI Service (free trial)
2. Click "Publish" in Power BI Desktop
3. Share link with team
4. Enable mobile viewing

---

## 💡 Pro Tips

### Performance:
- Limit TimeSeries to last 30 days for faster loading
- Use aggregated reports for historical data
- Enable incremental refresh for large datasets

### Visuals:
- Match colors with React dashboard
- Use consistent fonts (Segoe UI)
- Keep KPIs at top of every page

### Refresh:
- 30 seconds for desktop (real-time monitoring)
- 30 minutes for service (sufficient for reports)
- Manual refresh before presentations

---

## 📞 Testing Endpoints

Run these tests to verify everything works:

```bash
# Test 1: KPI Statistics
curl https://landslide-api.onrender.com/api/powerbi/statistics | json_pp

# Test 2: Time Series (last 24 hours)
curl "https://landslide-api.onrender.com/api/powerbi/timeseries?limit=100" | json_pp

# Test 3: Risk Distribution
curl https://landslide-api.onrender.com/api/powerbi/risk-distribution | json_pp

# Test 4: ML Metrics
curl https://landslide-api.onrender.com/api/powerbi/ml-metrics | json_pp

# Test 5: GPS Data
curl https://landslide-api.onrender.com/api/powerbi/gps-data | json_pp
```

**All should return JSON with "success": true** ✅

---

## 🎉 You're Done!

Your system now has:
- ✅ ESP32 sensors collecting data
- ✅ Node.js backend processing data
- ✅ MongoDB storing data
- ✅ ML model predicting risks
- ✅ React dashboard for real-time monitoring
- ✅ **Power BI dashboards for analytics & reports** 🆕

**Welcome to enterprise-grade IoT monitoring!** 🚀

---

## 📚 Resources

- Full Documentation: `POWERBI_INTEGRATION_GUIDE.md`
- Dashboard Templates: `powerbi/DASHBOARD_TEMPLATE.md`
- API Documentation: In integration guide
- DAX Measures: In integration guide

## 🤝 Support

If you need help:
1. Check API endpoints are responding
2. Verify data is in MongoDB
3. Review Power BI query errors
4. Check refresh settings

**Everything is working - just connect and visualize!** 🎨
