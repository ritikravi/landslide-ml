#!/bin/bash
# Test script for Historical Model ML API
# Tests various India landslide scenarios

echo "🧪 Testing ML API with Historical India Model"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5001"

# Function to test endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=$3
    local data=$4
    
    echo -e "${YELLOW}Testing: $name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$API_URL$endpoint")
    else
        response=$(curl -s -X POST "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    if echo "$response" | grep -q "success\|status\|healthy"; then
        echo -e "${GREEN}✅ PASSED${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    
    echo "Response:"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
    echo "---"
    echo ""
}

# Test 1: Health Check
test_endpoint "Health Check" "/health" "GET"

# Test 2: API Info
test_endpoint "API Info" "/" "GET"

# Test 3: LOW Risk - Flat terrain, low moisture (Chandigarh-like)
echo -e "${YELLOW}📍 Scenario 1: Chandigarh (Flat, Low Risk)${NC}"
test_endpoint "Low Risk Prediction" "/predict" "POST" '{
  "soilMoisture": 30,
  "waterLevel": 25,
  "tilt": 2,
  "vibration": 0,
  "ultrasonicDistance": 300,
  "elevation": 350,
  "slope": 5,
  "aspect": 180,
  "rainfall_mm": 10
}'

# Test 4: MEDIUM Risk - Moderate conditions (Pre-monsoon)
echo -e "${YELLOW}📍 Scenario 2: Pre-Monsoon Conditions (Medium Risk)${NC}"
test_endpoint "Medium Risk Prediction" "/predict" "POST" '{
  "soilMoisture": 55,
  "waterLevel": 60,
  "tilt": 8,
  "vibration": 2,
  "ultrasonicDistance": 180,
  "elevation": 1200,
  "slope": 18,
  "aspect": 180,
  "rainfall_mm": 75
}'

# Test 5: HIGH Risk - Steep slope, heavy rain (Uttarakhand monsoon)
echo -e "${YELLOW}📍 Scenario 3: Uttarakhand Monsoon (High Risk)${NC}"
test_endpoint "High Risk Prediction" "/predict" "POST" '{
  "soilMoisture": 85,
  "waterLevel": 90,
  "tilt": 18,
  "vibration": 5,
  "ultrasonicDistance": 80,
  "elevation": 2500,
  "slope": 35,
  "aspect": 180,
  "rainfall_mm": 250
}'

# Test 6: CRITICAL Risk - Extreme conditions (Kerala flood-like)
echo -e "${YELLOW}📍 Scenario 4: Kerala Extreme Rainfall (Critical Risk)${NC}"
test_endpoint "Critical Risk Prediction" "/predict" "POST" '{
  "soilMoisture": 92,
  "waterLevel": 95,
  "tilt": 22,
  "vibration": 8,
  "ultrasonicDistance": 60,
  "elevation": 1800,
  "slope": 32,
  "aspect": 145,
  "rainfall_mm": 350
}'

# Test 7: HIGH Risk - Sikkim earthquake-prone + rain
echo -e "${YELLOW}📍 Scenario 5: Sikkim Earthquake + Rain (High Risk)${NC}"
test_endpoint "Sikkim Risk Prediction" "/predict" "POST" '{
  "soilMoisture": 78,
  "waterLevel": 82,
  "tilt": 16,
  "vibration": 6,
  "ultrasonicDistance": 100,
  "elevation": 3200,
  "slope": 42,
  "aspect": 120,
  "rainfall_mm": 180
}'

# Test 8: MEDIUM Risk - Western Ghats (Karnataka)
echo -e "${YELLOW}📍 Scenario 6: Karnataka Western Ghats (Medium Risk)${NC}"
test_endpoint "Karnataka Risk Prediction" "/predict" "POST" '{
  "soilMoisture": 62,
  "waterLevel": 68,
  "tilt": 10,
  "vibration": 2,
  "ultrasonicDistance": 160,
  "elevation": 950,
  "slope": 22,
  "aspect": 200,
  "rainfall_mm": 120
}'

echo ""
echo "=============================================="
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Summary:"
echo "- API should respond to all requests"
echo "- Risk levels should vary based on input"
echo "- SHAP explanations should highlight:"
echo "  • Rainfall for high-risk scenarios"
echo "  • Slope for mountainous regions"
echo "  • Soil moisture for saturation conditions"
echo ""
echo "Expected Risk Levels:"
echo "  Scenario 1 (Chandigarh):    LOW"
echo "  Scenario 2 (Pre-monsoon):   MEDIUM"
echo "  Scenario 3 (Uttarakhand):   HIGH"
echo "  Scenario 4 (Kerala):        CRITICAL or HIGH"
echo "  Scenario 5 (Sikkim):        HIGH"
echo "  Scenario 6 (Karnataka):     MEDIUM"
echo ""
