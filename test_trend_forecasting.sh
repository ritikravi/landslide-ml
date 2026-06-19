#!/bin/bash

echo "=========================================="
echo "Testing ML Trend Forecasting"
echo "=========================================="
echo ""

ML_API_URL="https://landslide-ml-api.onrender.com"

# Test 1: Health Check
echo "1️⃣  Testing ML API Health..."
curl -s "$ML_API_URL/health" | python3 -m json.tool
echo ""
echo ""

# Test 2: Prediction WITHOUT history (no trends)
echo "2️⃣  Testing Prediction WITHOUT history (no trend analysis)..."
curl -s -X POST "$ML_API_URL/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 45,
    "waterLevel": 67,
    "tilt": 1.5,
    "vibration": 0,
    "ultrasonicDistance": 350
  }' | python3 -m json.tool
echo ""
echo ""

# Test 3: Prediction WITH history (with trends and forecasts)
echo "3️⃣  Testing Prediction WITH history (includes trend forecasting)..."
curl -s -X POST "$ML_API_URL/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 52,
    "waterLevel": 79,
    "tilt": 2.8,
    "vibration": 2,
    "ultrasonicDistance": 340,
    "history": [
      {
        "soilMoisture": 38,
        "waterLevel": 55,
        "tilt": 1.2,
        "vibration": 0,
        "ultrasonicDistance": 350,
        "timestamp": "2026-06-19T08:00:00Z"
      },
      {
        "soilMoisture": 40,
        "waterLevel": 58,
        "tilt": 1.5,
        "vibration": 0,
        "ultrasonicDistance": 348,
        "timestamp": "2026-06-19T08:30:00Z"
      },
      {
        "soilMoisture": 43,
        "waterLevel": 63,
        "tilt": 1.8,
        "vibration": 1,
        "ultrasonicDistance": 345,
        "timestamp": "2026-06-19T09:00:00Z"
      },
      {
        "soilMoisture": 46,
        "waterLevel": 68,
        "tilt": 2.1,
        "vibration": 1,
        "ultrasonicDistance": 343,
        "timestamp": "2026-06-19T09:30:00Z"
      },
      {
        "soilMoisture": 49,
        "waterLevel": 73,
        "tilt": 2.4,
        "vibration": 1,
        "ultrasonicDistance": 342,
        "timestamp": "2026-06-19T10:00:00Z"
      },
      {
        "soilMoisture": 52,
        "waterLevel": 79,
        "tilt": 2.8,
        "vibration": 2,
        "ultrasonicDistance": 340,
        "timestamp": "2026-06-19T10:30:00Z"
      }
    ]
  }' | python3 -m json.tool
echo ""
echo ""

echo "=========================================="
echo "✅ Testing Complete!"
echo "=========================================="
echo ""
echo "Expected Results:"
echo "✓ Test 1: Health check returns 'healthy' status"
echo "✓ Test 2: Returns prediction without 'trends' field"
echo "✓ Test 3: Returns prediction WITH:"
echo "  - trends (showing increasing/decreasing/stable)"
echo "  - forecasts (30min, 1hr, 2hr predictions)"
echo "  - warnings (if risk escalating)"
echo ""
