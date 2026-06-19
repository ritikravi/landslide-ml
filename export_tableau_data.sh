#!/bin/bash

echo "📊 Exporting Landslide Data for Tableau"
echo "========================================"
echo ""

EXPORT_DIR="tableau_data"
mkdir -p "$EXPORT_DIR"

BASE_URL="https://landslide-api.onrender.com/api/powerbi"

echo "1️⃣  Downloading statistics..."
curl -s "$BASE_URL/statistics" | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
print('totalRecords,avgSoilMoisture,avgWaterLevel,maxTilt,avgTilt,totalAlerts,currentRiskScore,avgRiskScore')
print(f\"{data['totalRecords']},{data['averageSoilMoisture']},{data['averageWaterLevel']},{data['maximumTilt']},{data['averageTilt']},{data['totalAlerts']},{data['currentRiskScore']},{data['averageRiskScore']}\")
" > "$EXPORT_DIR/statistics.csv"
echo "✅ Saved: $EXPORT_DIR/statistics.csv"

echo "2️⃣  Downloading risk distribution..."
curl -s "$BASE_URL/risk-distribution" | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
print('riskLevel,count,percentage')
for item in data:
    print(f\"{item['riskLevel']},{item['count']},{item['percentage']}\")
" > "$EXPORT_DIR/risk_distribution.csv"
echo "✅ Saved: $EXPORT_DIR/risk_distribution.csv"

echo "3️⃣  Downloading time series data..."
curl -s "$BASE_URL/timeseries?limit=500" | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
print('timestamp,soilMoisture,waterLevel,tilt,vibration,distance')
for item in data:
    print(f\"{item['timestamp']},{item.get('soilMoisture', 0)},{item.get('waterLevel', 0)},{item.get('tilt', 0)},{item.get('vibration', 0)},{item.get('ultrasonicDistance', 0)}\")
" > "$EXPORT_DIR/timeseries.csv"
echo "✅ Saved: $EXPORT_DIR/timeseries.csv"

echo "4️⃣  Downloading ML metrics..."
curl -s "$BASE_URL/ml-metrics" | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
print('metric,value')
print(f\"totalPredictions,{data['totalPredictions']}\")
print(f\"averageConfidence,{data['averageConfidence']}\")
print(f\"randomForestUsage,{data['modelUsageStats']['randomForest']}\")
print(f\"fallbackUsage,{data['modelUsageStats']['fallback']}\")
print(f\"minRiskScore,{data['riskScoreStats']['min']}\")
print(f\"maxRiskScore,{data['riskScoreStats']['max']}\")
print(f\"avgRiskScore,{data['riskScoreStats']['average']}\")
" > "$EXPORT_DIR/ml_metrics.csv"
echo "✅ Saved: $EXPORT_DIR/ml_metrics.csv"

echo "5️⃣  Downloading alert summary..."
curl -s "$BASE_URL/alerts-summary" | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
print('metric,value')
print(f\"totalAlerts,{data['total']}\")
print(f\"resolvedAlerts,{data['resolved']}\")
print(f\"unresolvedAlerts,{data['unresolved']}\")
print(f\"highSeverity,{data['bySeverity']['HIGH']}\")
print(f\"mediumSeverity,{data['bySeverity']['MEDIUM']}\")
print(f\"lowSeverity,{data['bySeverity']['LOW']}\")
" > "$EXPORT_DIR/alert_summary.csv"
echo "✅ Saved: $EXPORT_DIR/alert_summary.csv"

echo ""
echo "========================================"
echo "✅ All data exported to: $EXPORT_DIR/"
echo ""
echo "Files created:"
ls -lh "$EXPORT_DIR"
echo ""
echo "📊 Now in Tableau:"
echo "   1. Click 'Text file' in the left panel"
echo "   2. Navigate to $EXPORT_DIR/"
echo "   3. Open any CSV file"
echo "   4. Start building dashboards!"
