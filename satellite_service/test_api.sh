#!/bin/bash

echo "🧪 Testing Google Earth Engine API"
echo "=================================="
echo ""

BASE_URL="http://localhost:5002"
LAT="30.97"
LON="76.52"

echo "1️⃣  Testing Health Endpoint..."
curl -s "$BASE_URL/health" | python3 -m json.tool
echo ""
echo ""

echo "2️⃣  Testing GPM Rainfall (24 hours)..."
curl -s "$BASE_URL/gpm/rainfall?lat=$LAT&lon=$LON&hours=24" | python3 -m json.tool
echo ""
echo ""

echo "3️⃣  Testing Sentinel-2 NDVI..."
curl -s "$BASE_URL/sentinel2/ndvi?lat=$LAT&lon=$LON" | python3 -m json.tool
echo ""
echo ""

echo "4️⃣  Testing Rainfall Summary..."
curl -s "$BASE_URL/rainfall/summary?lat=$LAT&lon=$LON" | python3 -m json.tool | head -50
echo ""
echo ""

echo "5️⃣  Testing Combined Analysis..."
curl -s "$BASE_URL/combined/analysis?lat=$LAT&lon=$LON" | python3 -m json.tool | head -50
echo ""
echo ""

echo "✅ All tests completed!"
