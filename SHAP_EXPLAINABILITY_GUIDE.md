# 🔍 SHAP Explainability Integration

## What is SHAP?

**SHAP (SHapley Additive exPlanations)** is a unified approach to explain the output of machine learning models. It tells us **why** the model made a specific prediction by showing how much each feature contributed to the prediction.

---

## Why SHAP Matters for Landslide Monitoring

Your senior's architecture document (Section 42-43) requires explainability to answer:

> **"Why did the model assign this risk?"**

Instead of just saying "Risk Score: 84", we can now explain:
- Water Level (90cm) → **+0.35 contribution** (increases risk)
- Soil Moisture (85%) → **+0.28 contribution** (increases risk)  
- Slope (37°) → **+0.15 contribution** (increases risk)
- Vibration (0) → **-0.02 contribution** (reduces risk)

This helps authorities understand and trust the predictions.

---

## What We Implemented

### 1. SHAP TreeExplainer
- Automatically initialized when ML model loads
- Calculates feature contributions for each prediction
- Works with Random Forest, XGBoost, LightGBM

### 2. Enhanced Prediction Response
The `/predict` endpoint now returns:

```json
{
  "success": true,
  "prediction": {
    "riskLevel": "HIGH",
    "riskScore": 75,
    "confidence": 94.2,
    "features": {...},
    "featureImportance": {...},
    "shapExplanation": {
      "baseValue": 0.2456,
      "contributions": {
        "soilMoisture": {
          "value": 85.0,
          "contribution": 0.2847,
          "impact": "increases"
        },
        "waterLevel": {
          "value": 90.0,
          "contribution": 0.3512,
          "impact": "increases"
        },
        "tilt": {
          "value": 5.0,
          "contribution": 0.0823,
          "impact": "increases"
        },
        "vibration": {
          "value": 0.0,
          "contribution": -0.0156,
          "impact": "decreases"
        },
        "ultrasonicDistance": {
          "value": 50.0,
          "contribution": 0.0234,
          "impact": "increases"
        }
      },
      "topFactors": [
        "Water Level (90.0) is increasing risk",
        "Soil Moisture (85.0) is increasing risk",
        "Tilt (5.0) is increasing risk"
      ],
      "explanation": "Risk prediction driven by: Water Level (90.0) is increasing risk, Soil Moisture (85.0) is increasing risk"
    }
  }
}
```

---

## How It Works

### Step 1: Model Makes Prediction
```python
prediction = model.predict(features)  # → "HIGH"
```

### Step 2: SHAP Calculates Contributions
```python
shap_values = shap_explainer.shap_values(features)
# Shows how each feature pushed the prediction up or down
```

### Step 3: Format for Dashboard
```python
{
  "waterLevel": +0.35,  # Strong positive contribution
  "soilMoisture": +0.28, # Strong positive contribution
  "tilt": +0.08,         # Moderate positive contribution
  "vibration": -0.02,    # Slight negative contribution
  "ultrasonicDistance": +0.02  # Minimal contribution
}
```

---

## Testing SHAP

### Local Testing

1. **Start ML API:**
```bash
cd ml
python ml_api.py
```

2. **Run SHAP Test:**
```bash
python test_shap.py
```

Expected output:
```
🔍 Testing SHAP initialization...
Status: healthy
Model loaded: True
SHAP enabled: True
Explainability: SHAP TreeExplainer

🤖 Testing prediction with SHAP explanation...
✅ Prediction: LOW
   Risk Score: 18/100
   Confidence: 95.5%

🔍 SHAP Explanation:
   Base Value: 0.2456
   Risk prediction driven by: Water Level (25.0) is reducing risk, Soil Moisture (10.0) is reducing risk

   Top Contributing Factors:
   • Water Level (25.0) is reducing risk
   • Soil Moisture (10.0) is reducing risk

   Detailed Contributions:
   ⬇️ waterLevel: 25.0 → contribution: -0.1234
   ⬇️ soilMoisture: 10.0 → contribution: -0.0987
   ⬇️ tilt: 0.0 → contribution: -0.0045
   ➡️ vibration: 0.0 → contribution: +0.0001
   ⬇️ ultrasonicDistance: 100.0 → contribution: -0.0023
```

### API Testing

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 85,
    "waterLevel": 90,
    "tilt": 5,
    "vibration": 3,
    "ultrasonicDistance": 50
  }'
```

---

## Integration with Dashboard

### Display SHAP Explanations

Update your dashboard to show:

```jsx
// In MLStatusBox or new component
{prediction.shapExplanation && (
  <div className="shap-explanation">
    <h4>Why this prediction?</h4>
    <p>{prediction.shapExplanation.explanation}</p>
    
    <div className="top-factors">
      {prediction.shapExplanation.topFactors.map((factor, i) => (
        <div key={i} className="factor">
          {factor}
        </div>
      ))}
    </div>
    
    {/* Visual contribution chart */}
    <div className="contributions">
      {Object.entries(prediction.shapExplanation.contributions).map(([feature, contrib]) => (
        <div key={feature} className="contribution-bar">
          <span className="feature-name">{feature}</span>
          <div 
            className={`bar ${contrib.impact}`}
            style={{width: `${Math.abs(contrib.contribution) * 100}%`}}
          />
          <span className="contribution-value">
            {contrib.contribution > 0 ? '+' : ''}{contrib.contribution.toFixed(3)}
          </span>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## Understanding SHAP Values

### Base Value
The average prediction across all training data (baseline risk).

### Contribution
How much this feature value moved the prediction from the baseline:
- **Positive (+)**: Feature increases risk
- **Negative (-)**: Feature decreases risk
- **Near zero**: Feature has minimal impact on this prediction

### Example Interpretation

```
Base Value: 0.25 (25% baseline risk)

Water Level = 90cm → +0.35
Soil Moisture = 85% → +0.28
Tilt = 5° → +0.08
Vibration = 0 → -0.02
Distance = 50cm → +0.02

Final Prediction = 0.25 + 0.35 + 0.28 + 0.08 - 0.02 + 0.02 = 0.96 (96% risk)
```

**Explanation**: "High water level and soil moisture are driving this high-risk prediction"

---

## Aligns with Senior's Architecture

✅ **Section 42**: "The system will use SHAP for model explanation"  
✅ **Section 43**: "Why did the model assign this risk?"  
✅ **Section 56**: "ML → GenAI Integration" (SHAP data can feed GenAI)  
✅ **Section 72**: "SHAP-based explainability" listed as mandatory  

---

## Production Deployment

### Update ML API on Render

1. **Ensure requirements.txt includes SHAP:**
```bash
# ml/requirements.txt
shap>=0.52.0
```

2. **Redeploy to Render:**
```bash
git push origin main
# Render auto-deploys from GitHub
```

3. **Verify SHAP is working:**
```bash
curl https://landslide-ml-api.onrender.com/health
# Should show: "shap_enabled": true
```

---

## Benefits

### 1. Trust & Transparency
Authorities can see **why** the system predicts high risk, not just the number.

### 2. Model Validation
If SHAP shows unexpected feature contributions, it helps identify model issues.

### 3. Decision Support
Helps responders focus on the most critical factors (e.g., "Water level is the main concern").

### 4. Research Quality
Meets IIT/government-level requirements for explainable AI.

### 5. GenAI Integration
SHAP explanations can be passed to your GenAI copilot for natural language summaries:
```
GenAI: "Zone A is at critical risk primarily because water levels have 
risen to 90cm (contributing 35% to the risk), combined with high soil 
saturation at 85% (contributing 28%). These conditions significantly 
exceed safe thresholds for this steep 37° slope."
```

---

## Next Steps

1. ✅ **SHAP integrated** - Done!
2. ⏳ **Update dashboard** - Display SHAP explanations visually
3. ⏳ **Deploy to production** - Push to Render
4. ⏳ **Compare models** - Train XGBoost/LightGBM with SHAP
5. ⏳ **Add terrain features** - Enhance model with slope/elevation data

---

## Technical Details

### SHAP Values Calculation

```python
# Initialize explainer (done once at startup)
explainer = shap.TreeExplainer(model)

# Calculate SHAP values for prediction
shap_values = explainer.shap_values(features)

# For binary classification:
# shap_values[0] = contributions for "LOW" class
# shap_values[1] = contributions for "HIGH" class

# We use the positive class (landslide risk)
contributions = shap_values[1][0]  # [1]=HIGH class, [0]=first sample
```

### SHAP vs Feature Importance

| Metric | Scope | Purpose |
|--------|-------|---------|
| **Feature Importance** | Global (entire model) | Which features matter most overall? |
| **SHAP Values** | Local (specific prediction) | Why this specific prediction? |

**Example:**
- Feature Importance: "Water Level is 66% important overall"
- SHAP: "For this prediction, water level of 90cm contributed +0.35 to risk"

---

## Documentation References

- SHAP Library: https://github.com/slundberg/shap
- TreeExplainer: https://shap.readthedocs.io/en/latest/example_notebooks/tabular_examples/tree_based_models/Tree%20SHAP.html
- Your Senior's Architecture: Sections 42-43, 72

---

**Status**: ✅ SHAP Explainability Implemented  
**Version**: ML API v2.0.0  
**Alignment**: Fully meets Senior's Architecture Requirements
