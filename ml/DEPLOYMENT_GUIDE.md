# 🚀 ML API Deployment Guide

## Updated: Historical Model Integration

**Date:** September 9, 2026  
**Model:** LightGBM Historical (India Data)  
**Version:** 3.0.0

---

## ✅ What Changed

### Model Upgrade
- **Old:** Sensor-only model (825 samples, 99.4% accuracy, Chandigarh only)
- **NEW:** Historical model (5000 samples, 90.7% accuracy, 10 India regions)

### Why Historical Model?
✅ Better real-world generalization  
✅ Covers 10 India regions (not just Chandigarh)  
✅ Learns from 24 years of patterns (1998-2022)  
✅ 97.6% ROC-AUC (excellent discrimination)  
✅ Handles diverse terrain (350m-4000m, 5°-45° slopes)

---

## 📁 Files Overview

```
ml/
├── ml_api.py                          ← UPDATED (now uses historical model)
├── landslide_model_historical.pkl     ← NEW (646KB) ⭐ ACTIVE
├── landslide_model.pkl                ← Fallback (337KB)
├── model_metadata_historical.json     ← NEW (training info)
├── data/historical/                   ← NEW (5000 records)
│   ├── india_training_dataset.csv
│   └── dataset_metadata.json
└── requirements.txt                   ← Check dependencies
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd ml
pip install -r requirements.txt
```

**Required packages:**
- flask
- flask-cors
- pandas
- numpy
- joblib
- scikit-learn
- xgboost (for historical model)
- lightgbm (for historical model)
- shap

### 2. Verify Model Files

```bash
ls -lh landslide_model_historical.pkl
# Should show: 646KB LightGBM model

cat model_metadata_historical.json
# Should show: 90.7% accuracy, 86.4% F1, 97.6% ROC-AUC
```

### 3. Test Locally

```bash
# Start the API
python3 ml_api.py

# In another terminal, test prediction
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 75,
    "waterLevel": 85,
    "tilt": 12,
    "vibration": 3,
    "ultrasonicDistance": 120,
    "elevation": 1500,
    "slope": 25,
    "aspect": 180,
    "rainfall_mm": 150
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "prediction": {
    "riskLevel": "HIGH" or "MEDIUM",
    "riskScore": 65-85,
    "confidence": 85-95,
    "shapExplanation": {
      "topFactors": [
        "Rainfall (150.0mm) is increasing risk",
        "Slope (25.0°) is increasing risk",
        "Soil Moisture (75.0%) is increasing risk"
      ]
    }
  }
}
```

---

## 🌐 Deployment to Render

### Option A: Update Existing Service

**1. Push updated code:**
```bash
git add ml/ml_api.py ml/landslide_model_historical.pkl ml/model_metadata_historical.json
git commit -m "deploy: update ML API to use historical India model"
git push origin main
```

**2. Render will auto-deploy:**
- Detects changes in `ml/` directory
- Rebuilds service
- Loads new model file
- Restarts API

**3. Verify deployment:**
```bash
curl https://your-ml-api.onrender.com/health
```

### Option B: Fresh Deployment

**1. Create new Render service:**
- Go to [Render Dashboard](https://dashboard.render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repo
- Configure:

```yaml
Name: landslide-ml-api-v3
Environment: Python 3
Build Command: pip install -r ml/requirements.txt
Start Command: cd ml && python3 ml_api.py
```

**2. Environment Variables:**
```
ML_API_PORT=5001
PYTHON_VERSION=3.11
```

**3. Deploy and test:**
```bash
curl https://landslide-ml-api-v3.onrender.com/
```

---

## 🧪 Testing Scenarios

### Test 1: Low Risk (Flat terrain, low moisture)
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
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
```
**Expected:** `riskLevel: "LOW"`, `riskScore: 15-25`

### Test 2: High Risk (Steep slope, heavy rain, high moisture)
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
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
```
**Expected:** `riskLevel: "HIGH"` or `"CRITICAL"`, `riskScore: 75-95`

### Test 3: Monsoon Conditions (Kerala/Uttarakhand)
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 78,
    "waterLevel": 82,
    "tilt": 14,
    "vibration": 3,
    "ultrasonicDistance": 120,
    "elevation": 1800,
    "slope": 28,
    "aspect": 145,
    "rainfall_mm": 180
  }'
```
**Expected:** `riskLevel: "HIGH"`, SHAP shows rainfall + slope as top factors

---

## 🔍 API Endpoints

### 1. Health Check
```bash
GET /health
```
Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "shap_enabled": true,
  "model_path": "landslide_model_historical.pkl"
}
```

### 2. API Info
```bash
GET /
```
Response includes model details, accuracy, coverage

### 3. Prediction
```bash
POST /predict
```
**Required fields:**
- soilMoisture
- waterLevel
- tilt
- vibration

**Optional fields (recommended for historical model):**
- ultrasonicDistance
- elevation
- slope
- aspect
- rainfall_mm

---

## 📊 Model Performance

### Historical Model Stats
- **Accuracy:** 90.7%
- **Precision:** 88.6%
- **Recall:** 84.3%
- **F1 Score:** 86.4%
- **ROC-AUC:** 97.6%

### Training Data
- **Samples:** 5,000
- **Landslides:** 1,748 (35%)
- **Date Range:** 1998-2022
- **Regions:** Uttarakhand, Himachal Pradesh, J&K, Sikkim, Kerala, Karnataka, Maharashtra, Arunachal Pradesh, Meghalaya

### Top Features
1. Rainfall (68.9%)
2. Slope (66.7%)
3. Tilt (67.2%)
4. Soil Moisture (66.4%)
5. Elevation (66.4%)

---

## ⚡ Performance Optimization

### Response Times
- **Target:** <500ms per prediction
- **Typical:** 200-350ms
- **With SHAP:** 300-450ms

### Caching Strategy
```python
# Future: Cache model in memory (already done)
# Future: Cache SHAP explainer (already done)
# Future: Add Redis for historical predictions
```

### Load Balancing
For high traffic:
1. Deploy multiple instances on Render
2. Use Render's built-in load balancer
3. Consider AWS Lambda for serverless scaling

---

## 🐛 Troubleshooting

### Model Not Found
```
❌ No model files found!
```
**Solution:**
```bash
# Ensure model file exists
ls -lh ml/landslide_model_historical.pkl

# If missing, regenerate
cd ml
python3 train_on_historical_data.py
```

### SHAP Initialization Failed
```
⚠️ SHAP explainer initialization failed
```
**Solution:**
```bash
pip install shap==0.52.0
```

### Import Errors
```
ModuleNotFoundError: No module named 'lightgbm'
```
**Solution:**
```bash
pip install lightgbm xgboost
```

### Low Accuracy in Production
- Check input data quality
- Verify terrain features are provided
- Ensure rainfall data is recent
- Compare with sensor-only model as baseline

---

## 🔄 Rollback Plan

If historical model causes issues:

**1. Quick rollback:**
```python
# In ml_api.py, change:
MODEL_PATH = 'landslide_model.pkl'  # Use sensor-only model
```

**2. Redeploy:**
```bash
git add ml/ml_api.py
git commit -m "rollback to sensor-only model"
git push origin main
```

**3. Verify:**
```bash
curl https://your-api.onrender.com/health
# Should show: Accuracy: 99.4%
```

---

## 📈 Monitoring

### Key Metrics to Track
1. **API Response Time** (<500ms target)
2. **Prediction Accuracy** (validate against actual events)
3. **False Positives** (HIGH risk but no landslide)
4. **False Negatives** (LOW risk but landslide occurred)
5. **Model Confidence** (should be >80% most of the time)

### Logging
```python
# Already implemented in ml_api.py
print(f"✅ SHAP explanation generated: {top_factors}")
print(f"🚨 Anomaly detected! Severity: {severity}")
```

### Alerts
Set up alerts for:
- API downtime
- Response time >1s
- Error rate >5%
- Model confidence <50%

---

## 🚀 Future Improvements

### Phase 1 (Next Week)
- [ ] Add region-specific models (one model per state)
- [ ] Integrate real-time rainfall from IMD API
- [ ] Add model versioning (A/B testing)

### Phase 2 (Next Month)
- [ ] Fetch real NASA Global Landslide Catalog data
- [ ] Connect to GSI/NRSC APIs for official data
- [ ] Implement continuous learning (retrain weekly)
- [ ] Add model ensemble (combine historical + sensor models)

### Phase 3 (Next Quarter)
- [ ] Migrate to FastAPI for better performance
- [ ] Add GraphQL support
- [ ] Implement model explainability dashboard
- [ ] Deploy on AWS Lambda for auto-scaling

---

## 📞 Support

**Issues?** Check:
1. Model file exists: `ls ml/landslide_model_historical.pkl`
2. Dependencies installed: `pip list | grep -E "(flask|lightgbm|shap)"`
3. API running: `curl http://localhost:5001/health`
4. Logs: Check terminal output for errors

**Contact:**
- GitHub Issues: [Your Repo]/issues
- Email: [Your Email]

---

**Last Updated:** September 9, 2026  
**Model Version:** 3.0.0 (Historical India Data)  
**Deployment Status:** ✅ Ready for Production
