#!/bin/bash

echo "🧪 Testing Power BI API Endpoints"
echo "================================="
echo ""

BASE_URL="https://landslide-api.onrender.com/api/powerbi"

# Test 1: Statistics
echo "1️⃣  Testing /statistics..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/statistics")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Statistics endpoint: WORKING"
    curl -s "$BASE_URL/statistics" | python3 -m json.tool | head -20
else
    echo "❌ Statistics endpoint: NOT READY (HTTP $RESPONSE)"
fi
echo ""

# Test 2: Time Series
echo "2️⃣  Testing /timeseries..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/timeseries")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Time Series endpoint: WORKING"
else
    echo "❌ Time Series endpoint: NOT READY (HTTP $RESPONSE)"
fi
echo ""

# Test 3: Risk Distribution
echo "3️⃣  Testing /risk-distribution..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/risk-distribution")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Risk Distribution endpoint: WORKING"
    curl -s "$BASE_URL/risk-distribution" | python3 -m json.tool
else
    echo "❌ Risk Distribution endpoint: NOT READY (HTTP $RESPONSE)"
fi
echo ""

# Test 4: ML Metrics
echo "4️⃣  Testing /ml-metrics..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/ml-metrics")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ ML Metrics endpoint: WORKING"
else
    echo "❌ ML Metrics endpoint: NOT READY (HTTP $RESPONSE)"
fi
echo ""

# Test 5: GPS Data
echo "5️⃣  Testing /gps-data..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/gps-data")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ GPS Data endpoint: WORKING"
else
    echo "❌ GPS Data endpoint: NOT READY (HTTP $RESPONSE)"
fi
echo ""

# Test 6: Alert Summary
echo "6️⃣  Testing /alerts-summary..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/alerts-summary")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Alert Summary endpoint: WORKING"
else
    echo "❌ Alert Summary endpoint: NOT READY (HTTP $RESPONSE)"
fi
echo ""

echo "================================="
echo "✅ If all show WORKING, Power BI integration is ready!"
echo "⏳ If NOT READY, wait 2-3 minutes and run again"
echo ""
echo "Run: ./test_powerbi_endpoints.sh"
