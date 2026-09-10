#!/usr/bin/env python3
"""
Quick fix: Train a model on ONLY the 5 sensor features we actually have
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from lightgbm import LGBMClassifier
import joblib
import json
from datetime import datetime

# Generate synthetic training data with ONLY 5 features
np.random.seed(42)
n_samples = 1000

# Create realistic sensor data
data = pd.DataFrame({
    'soilMoisture': np.random.uniform(0, 100, n_samples),
    'waterLevel': np.random.uniform(0, 100, n_samples),
    'tilt': np.random.uniform(0, 15, n_samples),
    'vibration': np.random.randint(0, 50, n_samples),
    'ultrasonicDistance': np.random.uniform(0, 500, n_samples)
})

# Create target: landslide risk based on sensor thresholds
data['risk'] = (
    (data['soilMoisture'] > 70) | 
    (data['waterLevel'] > 70) | 
    (data['tilt'] > 10) |
    (data['vibration'] > 30) |
    (data['ultrasonicDistance'] < 50)
).astype(int)

# Split data
X = data[['soilMoisture', 'waterLevel', 'tilt', 'vibration', 'ultrasonicDistance']]
y = data['risk']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train LightGBM model
print("🚀 Training LightGBM model on 5 sensor features...")
model = LGBMClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    verbose=-1
)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"✅ Model trained! Accuracy: {accuracy:.2%}")

# Save model
joblib.dump(model, 'landslide_model_simple.pkl')
print("💾 Saved model as landslide_model_simple.pkl")

# Save metadata
metadata = {
    "training_date": datetime.now().isoformat(),
    "features": list(X.columns),
    "n_features": len(X.columns),
    "accuracy": accuracy,
    "model": "LightGBM",
    "samples": n_samples
}

with open('model_metadata_simple.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("✅ Done! Model ready to use.")
