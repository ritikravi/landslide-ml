#!/bin/bash
# Test ML Integration - Simulates ESP32 sending data

echo "🧪 Testing ML Integration"
echo "=========================="
echo ""

echo "1️⃣ Testing ML API directly..."
ML_RESPONSE=$(curl -s -X POST https://landslide-ml-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 10,
    "waterLevel": 85,
    "tilt": 5,
    "vibration": 0,
    "ultrasonicDistance": 100
  }')

echo "ML API Response:"
echo "$ML_RESPONSE" | python3 -m json.tool
echo ""

echo "2️⃣ Sending test data to backend (like ESP32)..."
BACKEND_RESPONSE=$(curl -s -X POST https://landslide-api.onrender.com/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 10,
    "waterLevel": 85,
    "tilt": 5,
    "vibration": 0,
    "ultrasonicDistance": 100
  }')

echo "Backend Response:"
echo "$BACKEND_RESPONSE" | python3 -m json.tool
echo ""

echo "3️⃣ Checking if prediction was generated..."
PREDICTION=$(echo "$BACKEND_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'data' in data and 'prediction' in data['data']:
        pred = data['data']['prediction']
        print(f\"✅ Risk Level: {pred.get('riskLevel', 'N/A')}\")
        print(f\"✅ Risk Score: {pred.get('riskScore', 'N/A')}\")
        print(f\"✅ ML Model is working!\")
    else:
        print('⚠️ No prediction in response')
        print('Check if ML_API_URL is set in backend environment')
except Exception as e:
    print(f'❌ Error: {e}')
" 2>/dev/null)

echo "$PREDICTION"
echo ""

echo "=========================="
echo "✅ Integration test complete!"
