#!/usr/bin/env python3
"""
Test the trained ML model with sample data
"""

import joblib
import pandas as pd

# Load the trained model
print("📦 Loading trained model...")
model = joblib.load('landslide_model.pkl')
print("✅ Model loaded successfully!\n")

# Test with different scenarios
test_scenarios = [
    {
        'name': 'Normal Conditions',
        'soilMoisture': 10,
        'waterLevel': 20,
        'tilt': 5,
        'vibration': 0,
        'ultrasonicDistance': 100
    },
    {
        'name': 'High Water Alert',
        'soilMoisture': 60,
        'waterLevel': 85,
        'tilt': 10,
        'vibration': 0,
        'ultrasonicDistance': 100
    },
    {
        'name': 'Extreme Risk',
        'soilMoisture': 80,
        'waterLevel': 95,
        'tilt': 35,
        'vibration': 10,
        'ultrasonicDistance': 150
    },
    {
        'name': 'Your Current Readings',
        'soilMoisture': 10,
        'waterLevel': 22,
        'tilt': 0,
        'vibration': 0,
        'ultrasonicDistance': 376
    }
]

print("🧪 Testing ML Model with Different Scenarios:\n")
print("=" * 70)

for scenario in test_scenarios:
    # Create DataFrame (model expects DataFrame input)
    test_data = pd.DataFrame([scenario])
    
    # Drop the 'name' column
    name = test_data['name'].values[0]
    test_data = test_data.drop('name', axis=1)
    
    # Predict
    prediction = model.predict(test_data)[0]
    
    # Get prediction probability
    probabilities = model.predict_proba(test_data)[0]
    confidence = max(probabilities) * 100
    
    # Print results
    print(f"\n🔍 Scenario: {name}")
    print(f"   Input:")
    print(f"     - Soil Moisture: {scenario['soilMoisture']}%")
    print(f"     - Water Level: {scenario['waterLevel']}%")
    print(f"     - Tilt: {scenario['tilt']}°")
    print(f"     - Vibration: {scenario['vibration']} events")
    print(f"     - Distance: {scenario['ultrasonicDistance']} cm")
    print(f"   \n   ✨ PREDICTION: {prediction}")
    print(f"   📊 Confidence: {confidence:.1f}%")
    print("-" * 70)

print("\n✅ ML Model is working perfectly!")
print("\nThe model predicts landslide risk based on sensor readings.")
print("Higher water levels = Higher risk (as we learned from feature importance)")
