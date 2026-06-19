#!/bin/bash

echo "============================================"
echo "Checking ML API Deployment Status"
echo "============================================"
echo ""

ML_API="https://landslide-ml-api.onrender.com"

echo "1️⃣  Checking ML API Health..."
HEALTH=$(curl -s "$ML_API/health")
echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
echo ""

echo "2️⃣  Testing prediction WITH history (trend forecasting)..."
echo "   (This should return 'trends', 'forecasts', 'warnings' if deployed)"
echo ""

RESPONSE=$(curl -s -X POST "$ML_API/predict" \
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
  }')

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Check for trends field
if echo "$RESPONSE" | grep -q "trends"; then
    echo "✅ DEPLOYED! Trend forecasting is working!"
else
    echo "❌ NOT YET DEPLOYED. Waiting for Render to deploy..."
    echo ""
    echo "Expected in response:"
    echo "  - prediction.trends"
    echo "  - prediction.forecasts"
    echo "  - prediction.warnings"
fi

echo ""
echo "============================================"
