#!/bin/bash

echo "🛰️  Testing Satellite Integration"
echo "================================"
echo ""

BASE_URL="http://localhost:5001"

echo "1️⃣  Testing Latest Satellite Data..."
curl -s "$BASE_URL/api/satellite/latest" | python3 -m json.tool
echo ""
echo ""

echo "2️⃣  Testing Rainfall Summary..."
curl -s "$BASE_URL/api/satellite/rainfall-summary" | python3 -m json.tool
echo ""
echo ""

echo "3️⃣  Testing Satellite Status..."
curl -s "$BASE_URL/api/satellite/status" | python3 -m json.tool
echo ""
echo ""

echo "4️⃣  Testing Historical Data (last 7 days)..."
curl -s "$BASE_URL/api/satellite/history?days=7" | python3 -m json.tool | head -50
echo ""
echo ""

echo "5️⃣  Testing Manual Update..."
curl -s -X POST "$BASE_URL/api/satellite/update" \
  -H "Content-Type: application/json" \
  -d '{"lat": 30.97, "lon": 76.52, "days": 30}' | python3 -m json.tool
echo ""
echo ""

echo "✅ All tests completed!"
