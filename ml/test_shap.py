#!/usr/bin/env python3
"""
Test SHAP integration with ML API
"""

import requests
import json

# ML API endpoint
ML_API_URL = "http://localhost:5001"

def test_shap_health():
    """Test if SHAP is initialized"""
    print("🔍 Testing SHAP initialization...")
    response = requests.get(f"{ML_API_URL}/health")
    data = response.json()
    
    print(f"Status: {data['status']}")
    print(f"Model loaded: {data['model_loaded']}")
    print(f"SHAP enabled: {data['shap_enabled']}")
    print(f"Explainability: {data['explainability']}")
    print()

def test_shap_prediction():
    """Test prediction with SHAP explanation"""
    print("🤖 Testing prediction with SHAP explanation...")
    
    # Test case 1: Low risk scenario
    test_data = {
        "soilMoisture": 10,
        "waterLevel": 25,
        "tilt": 0,
        "vibration": 0,
        "ultrasonicDistance": 100
    }
    
    response = requests.post(f"{ML_API_URL}/predict", json=test_data)
    result = response.json()
    
    if result['success']:
        pred = result['prediction']
        print(f"✅ Prediction: {pred['riskLevel']}")
        print(f"   Risk Score: {pred['riskScore']}/100")
        print(f"   Confidence: {pred['confidence']}%")
        
        # Check for SHAP explanation
        if 'shapExplanation' in pred:
            shap = pred['shapExplanation']
            print(f"\n🔍 SHAP Explanation:")
            print(f"   Base Value: {shap['baseValue']:.4f}")
            print(f"   {shap['explanation']}")
            print(f"\n   Top Contributing Factors:")
            for factor in shap['topFactors']:
                print(f"   • {factor}")
            
            print(f"\n   Detailed Contributions:")
            for feature, contrib in shap['contributions'].items():
                impact_symbol = "⬆️" if contrib['impact'] == 'increases' else "⬇️" if contrib['impact'] == 'decreases' else "➡️"
                print(f"   {impact_symbol} {feature}: {contrib['value']:.1f} → contribution: {contrib['contribution']:+.4f}")
        else:
            print("   ⚠️  SHAP explanation not available")
    else:
        print(f"❌ Prediction failed: {result.get('error')}")
    
    print("\n" + "="*60 + "\n")
    
    # Test case 2: High risk scenario
    test_data_high = {
        "soilMoisture": 85,
        "waterLevel": 90,
        "tilt": 5,
        "vibration": 3,
        "ultrasonicDistance": 50
    }
    
    print("🚨 Testing HIGH RISK scenario with SHAP...")
    response = requests.post(f"{ML_API_URL}/predict", json=test_data_high)
    result = response.json()
    
    if result['success']:
        pred = result['prediction']
        print(f"✅ Prediction: {pred['riskLevel']}")
        print(f"   Risk Score: {pred['riskScore']}/100")
        print(f"   Confidence: {pred['confidence']}%")
        
        if 'shapExplanation' in pred:
            shap = pred['shapExplanation']
            print(f"\n🔍 SHAP Explanation:")
            print(f"   {shap['explanation']}")
            print(f"\n   Top Contributing Factors:")
            for factor in shap['topFactors']:
                print(f"   • {factor}")

if __name__ == '__main__':
    print("="*60)
    print("SHAP Integration Test")
    print("="*60 + "\n")
    
    try:
        test_shap_health()
        test_shap_prediction()
        print("✅ All tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ ML API not running!")
        print("   Start it with: python ml_api.py")
    except Exception as e:
        print(f"❌ Test failed: {e}")
