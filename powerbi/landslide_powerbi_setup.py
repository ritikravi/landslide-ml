#!/usr/bin/env python3
"""
Industry-Grade Power BI Integration
Landslide Monitoring System

This script:
1. Creates a Power BI Push Dataset (real-time streaming)
2. Fetches data from your backend API
3. Pushes rows to Power BI every 30 seconds
4. Supports historical backfill on first run

Requirements:
    pip install requests msal python-dotenv schedule

Usage:
    1. Fill in POWER_BI_CONFIG below with your credentials
    2. Run: python landslide_powerbi_setup.py
    3. Your dataset appears in Power BI workspace automatically
"""

import requests
import json
import time
import schedule
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────────────────────
# CONFIGURATION  ← Fill these in
# ─────────────────────────────────────────────────────────────
POWER_BI_CONFIG = {
    # From Azure App Registration (or use device flow — see instructions)
    "client_id":    os.getenv("PBI_CLIENT_ID",    "YOUR_CLIENT_ID"),
    "tenant_id":    os.getenv("PBI_TENANT_ID",    "YOUR_TENANT_ID"),
    "workspace_id": os.getenv("PBI_WORKSPACE_ID", ""),  # leave blank for My Workspace

    # Your backend API
    "api_base": "https://landslide-api.onrender.com/api",
}

BACKEND_API = POWER_BI_CONFIG["api_base"]
PBI_BASE    = "https://api.powerbi.com/v1.0/myorg"

# ─────────────────────────────────────────────────────────────
# DATASET SCHEMA
# ─────────────────────────────────────────────────────────────
DATASET_SCHEMA = {
    "name": "LandslideMonitoring",
    "tables": [
        {
            "name": "SensorReadings",
            "columns": [
                {"name": "timestamp",          "dataType": "DateTime"},
                {"name": "soilMoisture",        "dataType": "Double"},
                {"name": "waterLevel",          "dataType": "Double"},
                {"name": "tilt",                "dataType": "Double"},
                {"name": "vibration",           "dataType": "Int64"},
                {"name": "ultrasonicDistance",  "dataType": "Double"},
            ]
        },
        {
            "name": "RiskPredictions",
            "columns": [
                {"name": "timestamp",   "dataType": "DateTime"},
                {"name": "riskLevel",   "dataType": "String"},
                {"name": "riskScore",   "dataType": "Int64"},
                {"name": "confidence",  "dataType": "Double"},
                {"name": "modelUsed",   "dataType": "String"},
            ]
        },
        {
            "name": "Statistics",
            "columns": [
                {"name": "timestamp",           "dataType": "DateTime"},
                {"name": "totalRecords",         "dataType": "Int64"},
                {"name": "avgSoilMoisture",      "dataType": "Double"},
                {"name": "avgWaterLevel",        "dataType": "Double"},
                {"name": "maxTilt",              "dataType": "Double"},
                {"name": "totalVibrationEvents", "dataType": "Int64"},
                {"name": "currentRiskScore",     "dataType": "Int64"},
                {"name": "sensorHealth",         "dataType": "String"},
            ]
        }
    ]
}

# ─────────────────────────────────────────────────────────────
# AUTHENTICATION (Device Code Flow — works without web redirect)
# ─────────────────────────────────────────────────────────────
def get_access_token():
    """Get Power BI access token using device code flow"""
    import msal

    app = msal.PublicClientApplication(
        POWER_BI_CONFIG["client_id"],
        authority="https://login.microsoftonline.com/common"
    )

    # Try silent token first (cached)
    accounts = app.get_accounts()
    if accounts:
        result = app.acquire_token_silent(
            ["https://analysis.windows.net/powerbi/api/.default"],
            account=accounts[0]
        )
        if result and "access_token" in result:
            return result["access_token"]

    # Device code flow
    flow = app.initiate_device_flow(
        scopes=["https://analysis.windows.net/powerbi/api/.default"]
    )

    if "error" in flow:
        raise Exception(f"Device flow failed: {flow.get('error_description', flow.get('error'))}")

    user_code = flow.get("user_code", "")
    verification_uri = flow.get("verification_uri", "https://microsoft.com/devicelogin")

    print("\n" + "="*60)
    print("🔐 POWER BI AUTHENTICATION REQUIRED")
    print("="*60)
    print(f"\n1. Open this URL: {verification_uri}")
    print(f"2. Enter this code: {user_code}")
    print(f"3. Sign in with: sangam251060@iiitmanipurac.in")
    print("\nWaiting for authentication...")
    print("="*60 + "\n")

    result = app.acquire_token_by_device_flow(flow)
    if "access_token" in result:
        print("✅ Authenticated successfully!")
        return result["access_token"]

    raise Exception(f"Authentication failed: {result.get('error_description', result.get('error'))}")


def get_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }


# ─────────────────────────────────────────────────────────────
# DATASET MANAGEMENT
# ─────────────────────────────────────────────────────────────
def create_or_get_dataset(token):
    """Create push dataset if it doesn't exist, return dataset ID"""
    headers = get_headers(token)
    ws = f"/groups/{POWER_BI_CONFIG['workspace_id']}" if POWER_BI_CONFIG["workspace_id"] else ""

    # List existing datasets
    resp = requests.get(f"{PBI_BASE}{ws}/datasets", headers=headers)
    datasets = resp.json().get("value", [])

    for ds in datasets:
        if ds["name"] == "LandslideMonitoring":
            print(f"✅ Dataset already exists: {ds['id']}")
            return ds["id"]

    # Create new dataset
    resp = requests.post(
        f"{PBI_BASE}{ws}/datasets?defaultRetentionPolicy=None",
        headers=headers,
        json=DATASET_SCHEMA
    )

    if resp.status_code in (200, 201):
        ds_id = resp.json()["id"]
        print(f"✅ Dataset created: {ds_id}")
        return ds_id

    raise Exception(f"Failed to create dataset: {resp.status_code} {resp.text}")


def clear_table(token, dataset_id, table_name):
    """Clear all rows in a table (for fresh push)"""
    headers = get_headers(token)
    ws = f"/groups/{POWER_BI_CONFIG['workspace_id']}" if POWER_BI_CONFIG["workspace_id"] else ""
    resp = requests.delete(
        f"{PBI_BASE}{ws}/datasets/{dataset_id}/tables/{table_name}/rows",
        headers=headers
    )
    print(f"   Cleared table {table_name}: {resp.status_code}")


def push_rows(token, dataset_id, table_name, rows):
    """Push rows to a Power BI push dataset table"""
    if not rows:
        return

    headers = get_headers(token)
    ws = f"/groups/{POWER_BI_CONFIG['workspace_id']}" if POWER_BI_CONFIG["workspace_id"] else ""

    resp = requests.post(
        f"{PBI_BASE}{ws}/datasets/{dataset_id}/tables/{table_name}/rows",
        headers=headers,
        json={"rows": rows}
    )

    if resp.status_code == 200:
        print(f"   ✅ Pushed {len(rows)} rows to {table_name}")
    else:
        print(f"   ❌ Push failed for {table_name}: {resp.status_code} {resp.text[:200]}")


# ─────────────────────────────────────────────────────────────
# DATA FETCHING FROM YOUR BACKEND
# ─────────────────────────────────────────────────────────────
def fetch_latest_sensor():
    try:
        r = requests.get(f"{BACKEND_API}/sensor-data/latest", timeout=10)
        return r.json().get("data")
    except Exception as e:
        print(f"   ⚠️  Sensor fetch error: {e}")
        return None


def fetch_latest_prediction():
    try:
        r = requests.get(f"{BACKEND_API}/ml/predictions/latest", timeout=10)
        return r.json().get("data")
    except Exception as e:
        print(f"   ⚠️  Prediction fetch error: {e}")
        return None


def fetch_statistics():
    try:
        r = requests.get(f"{BACKEND_API}/powerbi/statistics", timeout=10)
        return r.json().get("data")
    except Exception as e:
        print(f"   ⚠️  Statistics fetch error: {e}")
        return None


def fetch_timeseries(limit=500):
    try:
        r = requests.get(f"{BACKEND_API}/powerbi/timeseries?limit={limit}", timeout=30)
        return r.json().get("data", [])
    except Exception as e:
        print(f"   ⚠️  Timeseries fetch error: {e}")
        return []


# ─────────────────────────────────────────────────────────────
# SYNC FUNCTIONS
# ─────────────────────────────────────────────────────────────
_token = None
_dataset_id = None


def refresh_token_if_needed():
    """Re-authenticate if token is expired (tokens last ~1 hour)"""
    global _token
    _token = get_access_token()


def initial_backfill():
    """Push last 500 sensor readings to Power BI on first run"""
    global _token, _dataset_id
    print("\n📦 Running initial backfill (last 500 readings)...")

    sensor_rows = []
    for reading in fetch_timeseries(500):
        sensor_rows.append({
            "timestamp":         reading.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "soilMoisture":      float(reading.get("soilMoisture", 0)),
            "waterLevel":        float(reading.get("waterLevel", 0)),
            "tilt":              float(reading.get("tilt", 0)),
            "vibration":         int(reading.get("vibration", 0)),
            "ultrasonicDistance":float(reading.get("ultrasonicDistance", 0)),
        })

    clear_table(_token, _dataset_id, "SensorReadings")
    # Push in batches of 10000 (PBI limit per call)
    batch = 9999
    for i in range(0, len(sensor_rows), batch):
        push_rows(_token, _dataset_id, "SensorReadings", sensor_rows[i:i+batch])

    print(f"✅ Backfill complete: {len(sensor_rows)} rows")


def sync_realtime():
    """Push latest readings — runs every 30 seconds"""
    global _token, _dataset_id

    print(f"\n🔄 Sync at {datetime.now().strftime('%H:%M:%S')}")

    # Sensor reading
    sensor = fetch_latest_sensor()
    if sensor:
        push_rows(_token, _dataset_id, "SensorReadings", [{
            "timestamp":         sensor.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "soilMoisture":      float(sensor.get("soilMoisture", 0)),
            "waterLevel":        float(sensor.get("waterLevel", 0)),
            "tilt":              float(sensor.get("tilt", 0)),
            "vibration":         int(sensor.get("vibration", 0)),
            "ultrasonicDistance":float(sensor.get("ultrasonicDistance", 0)),
        }])

    # ML prediction
    pred = fetch_latest_prediction()
    if pred:
        push_rows(_token, _dataset_id, "RiskPredictions", [{
            "timestamp":  pred.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "riskLevel":  pred.get("riskLevel", "LOW"),
            "riskScore":  int(pred.get("riskScore", 0)),
            "confidence": float(pred.get("features", {}).get("confidence", 0)),
            "modelUsed":  pred.get("features", {}).get("modelUsed", "Unknown"),
        }])

    # Statistics
    stats = fetch_statistics()
    if stats:
        push_rows(_token, _dataset_id, "Statistics", [{
            "timestamp":           datetime.now(timezone.utc).isoformat(),
            "totalRecords":        int(stats.get("totalRecords", 0)),
            "avgSoilMoisture":     float(stats.get("averageSoilMoisture", 0)),
            "avgWaterLevel":       float(stats.get("averageWaterLevel", 0)),
            "maxTilt":             float(stats.get("maximumTilt", 0)),
            "totalVibrationEvents":int(stats.get("totalVibrationEvents", 0)),
            "currentRiskScore":    int(stats.get("currentRiskScore", 0)),
            "sensorHealth":        stats.get("sensorHealthStatus", "UNKNOWN"),
        }])


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
def main():
    global _token, _dataset_id

    print("=" * 60)
    print("⚡ Landslide Monitor — Power BI Sync Service")
    print("=" * 60)

    # Authenticate
    _token = get_access_token()

    # Create / get dataset
    _dataset_id = create_or_get_dataset(_token)
    print(f"📊 Dataset ID: {_dataset_id}")

    # Initial historical backfill
    initial_backfill()

    # Schedule real-time sync every 30 seconds
    print("\n⏰ Starting real-time sync (every 30 seconds)...")
    print("   Press Ctrl+C to stop\n")

    schedule.every(30).seconds.do(sync_realtime)
    # Refresh token every 45 minutes
    schedule.every(45).minutes.do(refresh_token_if_needed)

    # Run once immediately
    sync_realtime()

    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == "__main__":
    main()
