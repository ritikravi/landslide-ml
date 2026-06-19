# Power BI Industry Integration — Setup Guide

## What This Does

Connects your live sensor data to Power BI via **Push Dataset API**.
- Creates a real-time streaming dataset automatically in your Power BI workspace
- Backfills the last 500 historical readings on first run
- Pushes live data every 30 seconds
- 3 tables: SensorReadings, RiskPredictions, Statistics

---

## Step 1 — Register an Azure App

1. Open: https://portal.azure.com
2. Sign in with: `sangam251060@iiitmanipurac.in`
3. Search for **"App registrations"** → **"New registration"**
4. Name: `LandslideMonitor`
5. Supported account types: **Single tenant**
6. Click **Register**
7. Copy **Application (client) ID** → this is your `PBI_CLIENT_ID`
8. Copy **Directory (tenant) ID** → this is your `PBI_TENANT_ID`

### Add API Permissions
1. In your app, click **API permissions** → **Add a permission**
2. Select **Power BI Service**
3. Select **Delegated permissions**
4. Check all of these:
   - `Dataset.ReadWrite.All`
   - `Workspace.Read.All`
5. Click **Add permissions**
6. Click **Grant admin consent** (if available) OR use device code flow

---

## Step 2 — Get Your Workspace ID

1. Open: https://app.powerbi.com
2. Go to **My Workspace** (or create a new workspace)
3. Look at the URL: `https://app.powerbi.com/groups/YOUR_WORKSPACE_ID/...`
4. Copy the UUID after `/groups/` — that's your `PBI_WORKSPACE_ID`
5. If using **My Workspace**, leave `PBI_WORKSPACE_ID` blank

---

## Step 3 — Configure Environment

Create a `.env` file in the `powerbi/` folder:

```env
PBI_CLIENT_ID=your-client-id-here
PBI_TENANT_ID=your-tenant-id-here
PBI_WORKSPACE_ID=your-workspace-id-here
```

Example:
```env
PBI_CLIENT_ID=12345678-1234-1234-1234-123456789abc
PBI_TENANT_ID=abcdef12-abcd-abcd-abcd-abcdef123456
PBI_WORKSPACE_ID=
```

---

## Step 4 — Install Dependencies

```bash
cd powerbi
pip install -r requirements.txt
```

---

## Step 5 — Run the Sync Service

```bash
cd powerbi
python landslide_powerbi_setup.py
```

### First Run Output:
```
============================================================
⚡ Landslide Monitor — Power BI Sync Service
============================================================

🔐 POWER BI AUTHENTICATION REQUIRED
============================================================

To sign in, use a web browser to open the page
https://microsoft.com/devicelogin and enter the code XXXXX to authenticate.

Open the URL above and enter the code to authenticate.
============================================================

✅ Authenticated successfully!
✅ Dataset created: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
📊 Dataset ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

📦 Running initial backfill (last 500 readings)...
   ✅ Pushed 500 rows to SensorReadings
✅ Backfill complete: 500 rows

⏰ Starting real-time sync (every 30 seconds)...
   Press Ctrl+C to stop

🔄 Sync at 15:30:00
   ✅ Pushed 1 rows to SensorReadings
   ✅ Pushed 1 rows to RiskPredictions
   ✅ Pushed 1 rows to Statistics
```

---

## Step 6 — Build Power BI Dashboard

After the script runs, go to https://app.powerbi.com

### Your dataset will appear as: **LandslideMonitoring**

### Recommended Visuals:

#### Page 1 — Live Monitoring
| Visual | Table | Fields | Settings |
|--------|-------|--------|----------|
| Card | Statistics | currentRiskScore | Title: "Risk Score" |
| Gauge | Statistics | currentRiskScore | Min: 0, Max: 100 |
| Card | Statistics | sensorHealth | Title: "Sensor Status" |
| Line Chart | SensorReadings | timestamp (X), soilMoisture + waterLevel (Y) | Title: "Sensor Trends" |
| Card | RiskPredictions | riskLevel | Title: "Risk Level" |
| Card | Statistics | totalRecords | Title: "Total Readings" |

#### Page 2 — Sensor Analytics
| Visual | Table | Fields |
|--------|-------|--------|
| Line Chart | SensorReadings | timestamp, soilMoisture |
| Line Chart | SensorReadings | timestamp, waterLevel |
| Line Chart | SensorReadings | timestamp, tilt |
| Column Chart | SensorReadings | timestamp, vibration |
| Scatter Chart | SensorReadings | soilMoisture (X), waterLevel (Y), riskScore (size) |

#### Page 3 — Risk Analytics
| Visual | Table | Fields |
|--------|-------|--------|
| Donut Chart | RiskPredictions | riskLevel (Legend), count (Values) |
| Line Chart | RiskPredictions | timestamp, riskScore |
| Card | RiskPredictions | confidence (Avg) |
| Table | RiskPredictions | timestamp, riskLevel, riskScore, confidence |

### DAX Measures (create these in Power BI):

```dax
// Average Risk Score (last 24h)
Avg Risk 24h = 
CALCULATE(
    AVERAGE(RiskPredictions[riskScore]),
    DATESINPERIOD(RiskPredictions[timestamp], NOW(), -1, DAY)
)

// High Risk Events Count
High Risk Count = 
CALCULATE(
    COUNTROWS(RiskPredictions),
    RiskPredictions[riskLevel] IN {"HIGH", "CRITICAL"}
)

// Soil Moisture Status
Soil Status = 
IF(
    AVERAGE(SensorReadings[soilMoisture]) > 85, "CRITICAL",
    IF(AVERAGE(SensorReadings[soilMoisture]) > 70, "WARNING", "SAFE")
)

// Risk Escalation (is risk getting worse?)
Risk Trend = 
VAR latest = LASTNONBLANK(RiskPredictions[riskScore], 1)
VAR prev = CALCULATE(
    LASTNONBLANK(RiskPredictions[riskScore], 1),
    DATEADD(RiskPredictions[timestamp], -1, HOUR)
)
RETURN IF(latest > prev, "↑ INCREASING", IF(latest < prev, "↓ DECREASING", "→ STABLE"))
```

---

## Step 7 — Enable Auto Refresh

The sync script handles real-time push, so no scheduled refresh needed.

To keep the script running continuously:

### On Windows:
```
# Run as background service
pythonw landslide_powerbi_setup.py
```

### On Mac/Linux:
```bash
# Run in background
nohup python landslide_powerbi_setup.py > powerbi_sync.log 2>&1 &
```

### Check if running:
```bash
tail -f powerbi_sync.log
```

---

## Troubleshooting

### "Authentication failed"
- Make sure you used the IIIT Manipur email in the device login
- Check client_id and tenant_id are correct

### "Dataset not found"
- Make sure workspace_id is correct
- Try leaving workspace_id blank (uses My Workspace)

### "Push failed 401"
- Token expired — restart the script to re-authenticate

### "Push failed 403"
- Check API permissions in Azure App Registration
- Make sure `Dataset.ReadWrite.All` is added

---

## Architecture

```
ESP32 Sensors
    ↓ (every 30s)
Backend API (Render)
    ↓
MongoDB Atlas
    ↓
landslide_powerbi_setup.py  ← runs on your Mac
    ↓ (every 30s, REST API)
Power BI Push Dataset
    ↓
Power BI Dashboard (live)
```

---

## What You Get

✅ Real-time data (30 second latency)
✅ 500 historical readings on first load
✅ 3 tables: SensorReadings, RiskPredictions, Statistics
✅ KPI cards, trend charts, risk gauges
✅ DAX measures for custom analytics
✅ Industry-standard Push Dataset pattern

**Source**: Microsoft Power BI REST API Push Datasets documentation
