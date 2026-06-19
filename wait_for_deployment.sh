#!/bin/bash

echo "⏰ Monitoring ML API Deployment..."
echo "Press Ctrl+C to stop"
echo ""

counter=0
max_attempts=20

while [ $counter -lt $max_attempts ]; do
    counter=$((counter+1))
    echo "[$counter/$max_attempts] Checking deployment status..."
    
    # Test for trends field
    response=$(curl -s -X POST https://landslide-ml-api.onrender.com/predict \
      -H "Content-Type: application/json" \
      -d '{
        "soilMoisture": 52,
        "waterLevel": 79,
        "tilt": 2.8,
        "vibration": 2,
        "history": [
          {"soilMoisture": 40, "waterLevel": 60, "tilt": 1, "vibration": 0, "timestamp": "2026-06-19T08:00:00Z"},
          {"soilMoisture": 45, "waterLevel": 65, "tilt": 1.5, "vibration": 0, "timestamp": "2026-06-19T08:30:00Z"},
          {"soilMoisture": 50, "waterLevel": 70, "tilt": 2, "vibration": 1, "timestamp": "2026-06-19T09:00:00Z"}
        ]
      }')
    
    if echo "$response" | grep -q "trends"; then
        echo ""
        echo "✅ DEPLOYMENT SUCCESSFUL!"
        echo ""
        echo "Trend forecasting is now active. Response:"
        echo "$response" | python3 -m json.tool | head -50
        echo ""
        echo "🎉 Your Predictions page will now show forecasts!"
        echo "Go to: https://frontend-kappa-two-57.vercel.app/predictions"
        exit 0
    fi
    
    if [ $counter -lt $max_attempts ]; then
        echo "   Still deploying... waiting 30 seconds"
        sleep 30
    fi
done

echo ""
echo "⚠️  Deployment taking longer than expected (10 minutes)"
echo "Check Render dashboard: https://dashboard.render.com"
echo "Or run: ./check_ml_deployment.sh"
