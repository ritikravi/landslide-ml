#!/bin/bash

echo "⏳ Waiting for Render Deployment to Complete"
echo "==========================================="
echo ""
echo "Checking every 30 seconds..."
echo "Press Ctrl+C to stop monitoring"
echo ""

COUNTER=0
MAX_WAIT=20  # 20 checks = 10 minutes

while [ $COUNTER -lt $MAX_WAIT ]; do
  echo "[$((COUNTER * 30))s] Testing satellite endpoint..."
  
  RESPONSE=$(curl -s https://landslide-api.onrender.com/api/satellite/latest)
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo ""
    echo "✅ ✅ ✅ DEPLOYMENT SUCCESSFUL! ✅ ✅ ✅"
    echo ""
    echo "Satellite endpoint is now live!"
    echo "$RESPONSE" | python3 -m json.tool | head -30
    echo ""
    echo "🎉 Your frontend will now work!"
    echo "👉 Refresh your dashboard to see satellite data"
    exit 0
  elif echo "$RESPONSE" | grep -q "Cannot GET"; then
    echo "   Still deploying... (getting 404)"
  else
    echo "   Service may be restarting..."
  fi
  
  COUNTER=$((COUNTER + 1))
  sleep 30
done

echo ""
echo "⏰ Timeout reached (10 minutes)"
echo "Check Render dashboard for deployment status"
echo "https://dashboard.render.com/"

