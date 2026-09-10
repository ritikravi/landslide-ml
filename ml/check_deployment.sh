#!/bin/bash

echo "🔍 Checking ML API Deployment Status..."
echo "========================================="

# Render ML API endpoint (CORRECT URL)
ML_API_URL="https://landslide-ml-api.onrender.com"

echo ""
echo "1️⃣  Health Check..."
curl -k -s "${ML_API_URL}/health" | python3 -m json.tool || echo "❌ Health check failed"

echo ""
echo ""
echo "2️⃣  Testing Historical Model with Uttarakhand scenario..."
curl -k -s -X POST "${ML_API_URL}/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 75,
    "waterLevel": 85,
    "tilt": 12,
    "vibration": 45,
    "ultrasonicDistance": 45,
    "rainfall": 120,
    "elevation": 2500,
    "slope": 35,
    "aspect": 180
  }' | python3 -m json.tool || echo "❌ Prediction failed"

echo ""
echo ""
echo "✅ Deployment check complete!"
