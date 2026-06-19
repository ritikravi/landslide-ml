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
model = None
forecaster = TrendForecaster()

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
        return True
    else:
        print(f"❌ Model file not found: {MODEL_PATH}")
        return False

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
        'model_path': MODEL_PATH
    })

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
                forecasts = forecaster.forecast_risk(model, current_data, trends)
                
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
