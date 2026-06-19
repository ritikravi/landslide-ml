#!/bin/bash

echo "🧪 Testing LIVE ML Prediction"
echo "================================"
echo ""

echo "Sending sensor data to backend..."
curl -X POST https://landslide-api.onrender.com/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 10,
    "waterLevel": 15,
    "tilt": 0,
    "vibration": 0,
    "distance": 75
  }' | json_pp

echo ""
echo "Waiting 2 seconds..."
sleep 2

echo ""
echo "Getting latest prediction..."
curl https://landslide-api.onrender.com/api/ml/predictions/latest | json_pp

echo ""
echo "================================"
echo "✅ Check the 'modelUsed' field above"
echo "   - Should be 'RandomForest' (ML working)"
echo "   - If 'Fallback' (ML API unreachable)"
