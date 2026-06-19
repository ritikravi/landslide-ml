#!/usr/bin/env python3
"""
ML Prediction API - Uses trained Random Forest model
Receives sensor data and returns landslide risk prediction with trend forecasting
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime
from trend_forecasting import TrendForecaster

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = 'landslide_model.pkl'
ANOMALY_MODEL_PATH  = 'anomaly_model.pkl'
ANOMALY_SCALER_PATH = 'anomaly_scaler.pkl'
ANOMALY_THRESH_PATH = 'anomaly_thresholds.pkl'

model = None
anomaly_model = None
anomaly_scaler = None
anomaly_thresholds = None
forecaster = TrendForecaster()

def load_model():
    global model, anomaly_model, anomaly_scaler, anomaly_thresholds

    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"✅ RandomForest model loaded from {MODEL_PATH}")
    else:
        print(f"❌ Model file not found: {MODEL_PATH}")
        return False

    if os.path.exists(ANOMALY_MODEL_PATH):
        anomaly_model    = joblib.load(ANOMALY_MODEL_PATH)
        anomaly_scaler   = joblib.load(ANOMALY_SCALER_PATH)
        anomaly_thresholds = joblib.load(ANOMALY_THRESH_PATH)
        print(f"✅ Anomaly Detection model loaded")
    else:
        print(f"⚠️  Anomaly model not found — run train_anomaly_model.py")

    return True

@app.route('/', methods=['GET'])
def home():
    """Root endpoint - API info"""
    return jsonify({
        'name': 'Landslide ML Prediction API',
        'version': '1.0.0',
        'status': 'operational',
        'model': 'Random Forest Classifier',
        'accuracy': '98.79%',
        'endpoints': {
            'health': '/health',
            'predict': '/predict (POST)',
            'retrain': '/retrain (POST)'
        },
        'usage': {
            'example': 'POST /predict with JSON body',
            'required_fields': ['soilMoisture', 'waterLevel', 'tilt', 'vibration'],
            'optional_fields': ['ultrasonicDistance']
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'anomaly_model_loaded': anomaly_model is not None,
        'model_path': MODEL_PATH
    })

def detect_anomaly(current_data, history=None):
    """
    Run anomaly detection on current reading + optional history context.
    Returns anomaly score, severity label, and detected patterns.
    """
    if anomaly_model is None:
        return None

    # Build feature row (same as training)
    soil   = current_data.get('soilMoisture', 0)
    water  = current_data.get('waterLevel', 0)
    tilt   = current_data.get('tilt', 0)
    vib    = current_data.get('vibration', 0)
    dist   = current_data.get('ultrasonicDistance', 0)

    # Rate-of-change features from history
    soil_delta  = 0
    water_delta = 0
    tilt_delta  = 0
    soil_roll_dev  = 0
    water_roll_dev = 0

    if history and len(history) >= 2:
        prev = history[-1]
        soil_delta  = abs(soil  - prev.get('soilMoisture', soil))
        water_delta = abs(water - prev.get('waterLevel', water))
        tilt_delta  = abs(tilt  - prev.get('tilt', tilt))

    if history and len(history) >= 5:
        recent_soil  = [r.get('soilMoisture', 0) for r in history[-5:]]
        recent_water = [r.get('waterLevel', 0)   for r in history[-5:]]
        soil_roll_dev  = abs(soil  - np.mean(recent_soil))
        water_roll_dev = abs(water - np.mean(recent_water))

    combined_risk = (
        (soil  / 100) * 0.35 +
        (water / 100) * 0.35 +
        (tilt  / 90 ) * 0.20 +
        min(vib / 10, 1.0)    * 0.10
    )

    features = np.array([[
        soil, water, tilt, vib, dist,
        soil_delta, water_delta, tilt_delta,
        soil_roll_dev, water_roll_dev,
        combined_risk
    ]])

    features_scaled = anomaly_scaler.transform(features)
    prediction      = anomaly_model.predict(features_scaled)[0]   # 1=normal, -1=anomaly
    score           = float(anomaly_model.decision_function(features_scaled)[0])

    is_anomaly = (prediction == -1)

    # Severity based on calibrated thresholds
    if score < anomaly_thresholds['high']:
        severity = 'HIGH'
    elif score < anomaly_thresholds['medium']:
        severity = 'MEDIUM'
    elif score < anomaly_thresholds['low']:
        severity = 'LOW'
    else:
        severity = 'NORMAL'

    # Identify which patterns triggered the anomaly
    triggered_patterns = []
    if soil_delta > 15:
        triggered_patterns.append(f'Sudden soil moisture spike (+{soil_delta:.1f}%)')
    if water_delta > 20:
        triggered_patterns.append(f'Rapid water level change (+{water_delta:.1f}cm)')
    if tilt_delta > 3:
        triggered_patterns.append(f'Sudden tilt change (+{tilt_delta:.2f}°)')
    if soil_roll_dev > 20:
        triggered_patterns.append(f'Soil moisture {soil_roll_dev:.1f}% above rolling average')
    if water_roll_dev > 25:
        triggered_patterns.append(f'Water level {water_roll_dev:.1f}cm above rolling average')
    if tilt > 15:
        triggered_patterns.append(f'Tilt angle {tilt:.2f}° exceeds safe threshold')
    if vib > 5:
        triggered_patterns.append(f'High vibration count: {vib} events in window')
    if combined_risk > 0.7:
        triggered_patterns.append('Multi-sensor combined risk pattern elevated')

    return {
        'isAnomaly': is_anomaly,
        'score': round(score, 4),
        'severity': severity,
        'patterns': triggered_patterns if triggered_patterns else (['Unusual sensor reading pattern detected'] if is_anomaly else []),
        'description': (
            'Unusual sensor pattern detected — conditions differ significantly from historical baseline.' if is_anomaly
            else 'Sensor readings within normal historical patterns.'
        )
    }

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict landslide risk from sensor data with trend forecasting
    
    Request body:
    {
        "soilMoisture": 10,
        "waterLevel": 22,
        "tilt": 0,
        "vibration": 0,
        "ultrasonicDistance": 376,
        "history": [...]  // Optional: for trend analysis
    }
    
    Response:
    {
        "success": true,
        "prediction": {
            "riskLevel": "LOW",
            "riskScore": 15,
            "confidence": 95.5,
            "features": {...},
            "trends": {...},
            "forecasts": [...],
            "warnings": [...]
        }
    }
    """
    try:
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Get sensor data from request
        data = request.json
        
        # Validate required fields
        required_fields = ['soilMoisture', 'waterLevel', 'tilt', 'vibration']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Prepare features for model
        features = pd.DataFrame([{
            'soilMoisture': data.get('soilMoisture', 0),
            'waterLevel': data.get('waterLevel', 0),
            'tilt': data.get('tilt', 0),
            'vibration': data.get('vibration', 0),
            'ultrasonicDistance': data.get('ultrasonicDistance', 0)
        }])
        
        # Make current prediction
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence = float(max(probabilities) * 100)
        
        # Calculate risk score (0-100)
        risk_score_map = {
            'LOW': 20,
            'MEDIUM': 50,
            'HIGH': 75,
            'CRITICAL': 95
        }
        base_score = risk_score_map.get(prediction, 20)
        
        # Adjust based on confidence
        risk_score = int(base_score * (confidence / 100))
        
        # Get feature importance
        feature_importance = {
            'soilMoisture': float(model.feature_importances_[0]),
            'waterLevel': float(model.feature_importances_[1]),
            'tilt': float(model.feature_importances_[2]),
            'vibration': float(model.feature_importances_[3]),
            'ultrasonicDistance': float(model.feature_importances_[4])
        }
        
        response = {
            'success': True,
            'prediction': {
                'riskLevel': prediction,
                'riskScore': risk_score,
                'confidence': round(confidence, 2),
                'features': data,
                'featureImportance': feature_importance
            }
        }

        # Run anomaly detection
        current_data_for_anomaly = {
            'soilMoisture': data.get('soilMoisture', 0),
            'waterLevel': data.get('waterLevel', 0),
            'tilt': data.get('tilt', 0),
            'vibration': data.get('vibration', 0),
            'ultrasonicDistance': data.get('ultrasonicDistance', 0)
        }
        anomaly_result = detect_anomaly(current_data_for_anomaly, data.get('history', []))
        if anomaly_result:
            response['prediction']['anomaly'] = anomaly_result
            if anomaly_result['isAnomaly']:
                print(f"🚨 Anomaly detected! Severity: {anomaly_result['severity']}, Score: {anomaly_result['score']}")
        
        # Add trend analysis and forecasting if history provided
        history = data.get('history', [])
        if history and len(history) >= forecaster.min_data_points:
            # Parse timestamps
            for reading in history:
                if isinstance(reading.get('timestamp'), str):
                    reading['timestamp'] = datetime.fromisoformat(reading['timestamp'].replace('Z', '+00:00'))
            
            # Analyze trends
            trends = forecaster.analyze_sensor_trend(history)
            
            if trends:
                # Generate forecasts
                current_data = {
                    'soilMoisture': data.get('soilMoisture', 0),
                    'waterLevel': data.get('waterLevel', 0),
                    'tilt': data.get('tilt', 0),
                    'vibration': data.get('vibration', 0),
                    'ultrasonicDistance': data.get('ultrasonicDistance', 0)
                }
                forecasts = forecaster.forecast_risk(model, current_data, trends, forecast_minutes=[30, 60, 120, 180])
                
                # Generate warnings
                warnings = forecaster.generate_warning_message(prediction, forecasts, trends)
                
                response['prediction']['trends'] = trends
                response['prediction']['forecasts'] = forecasts
                if warnings:
                    response['prediction']['warnings'] = warnings
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        print(f"❌ Error in /predict: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain():
    """
    Retrain model with new data (future feature)
    """
    return jsonify({
        'success': False,
        'error': 'Retraining not yet implemented'
    }), 501

if __name__ == '__main__':
    print("🚀 Starting ML Prediction API...")
    
    # Load model
    if not load_model():
        print("⚠️  Warning: Model not loaded. Please train a model first.")
        print("   Run: python simple_ml_example.py")
    
    # Start Flask server
    port = int(os.getenv('ML_API_PORT', 5001))
    print(f"🌐 ML API listening on http://localhost:{port}")
    print(f"📊 Model: Random Forest with 98.79% accuracy")
    print(f"⭐ Water Level is 66% important for predictions")
    
    app.run(host='0.0.0.0', port=port, debug=False)
