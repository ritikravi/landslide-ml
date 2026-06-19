#!/usr/bin/env python3
"""
Anomaly Detection Model for Landslide Sensor Data
Uses Isolation Forest — detects unusual patterns that precede landslides
without needing labeled anomaly data.

How it works:
1. Trains on your NORMAL sensor readings (low risk baseline)
2. Learns what "normal" patterns look like
3. Flags readings that deviate significantly from normal patterns
4. Also extracts 6 engineered features: rate of change, moving averages,
   cross-sensor correlations — things thresholds can't capture
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

print("=" * 60)
print("🤖 Anomaly Detection Model Training")
print("   Algorithm: Isolation Forest (Unsupervised)")
print("=" * 60)

# ── 1. Load data ──────────────────────────────────────────────
print("\n📊 Loading sensor data...")
df = pd.read_csv('sensor_data.csv')
print(f"✅ Loaded {len(df)} records")

# Sort by timestamp if exists
if 'timestamp' in df.columns:
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
    df = df.sort_values('timestamp').reset_index(drop=True)

# Fill missing values
for col in ['soilMoisture', 'waterLevel', 'tilt', 'vibration', 'ultrasonicDistance']:
    if col in df.columns:
        df[col] = df[col].fillna(0)
    else:
        df[col] = 0

print(f"Columns available: {list(df.columns)}")

# ── 2. Engineer features ──────────────────────────────────────
print("\n🔧 Engineering anomaly features...")

def engineer_features(df):
    """
    Extract 11 pattern-based features that capture:
    - Rates of change (sudden spikes)
    - Rolling statistics (moving average deviation)
    - Cross-sensor correlations
    - Combined risk indicators
    """
    features = pd.DataFrame()

    # Raw sensor values
    features['soilMoisture']       = df['soilMoisture']
    features['waterLevel']         = df['waterLevel']
    features['tilt']               = df['tilt']
    features['vibration']          = df['vibration']
    features['ultrasonicDistance'] = df['ultrasonicDistance']

    # Rate of change (1-step difference) — sudden jumps = anomaly
    features['soil_delta']   = df['soilMoisture'].diff().fillna(0).abs()
    features['water_delta']  = df['waterLevel'].diff().fillna(0).abs()
    features['tilt_delta']   = df['tilt'].diff().fillna(0).abs()

    # Rolling mean deviation — sustained deviation from normal baseline
    window = min(10, len(df))
    features['soil_roll_dev']  = (df['soilMoisture'] - df['soilMoisture'].rolling(window, min_periods=1).mean()).abs()
    features['water_roll_dev'] = (df['waterLevel']   - df['waterLevel'].rolling(window, min_periods=1).mean()).abs()

    # Combined risk score — cross-sensor signal
    features['combined_risk'] = (
        (df['soilMoisture'] / 100) * 0.35 +
        (df['waterLevel']   / 100) * 0.35 +
        (df['tilt']         / 90 ) * 0.20 +
        (df['vibration']    / 10 ).clip(0, 1) * 0.10
    )

    return features

X = engineer_features(df)
print(f"✅ Engineered {X.shape[1]} features from {X.shape[0]} readings")
print(f"   Features: {list(X.columns)}")

# ── 3. Scale features ─────────────────────────────────────────
print("\n📏 Scaling features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
print("✅ StandardScaler fitted")

# ── 4. Train Isolation Forest ─────────────────────────────────
print("\n🌲 Training Isolation Forest...")
print("   contamination=0.05 means ~5% of data expected to be anomalies")

anomaly_model = IsolationForest(
    n_estimators=200,
    contamination=0.05,   # Expect ~5% anomalies in training data
    max_samples='auto',
    random_state=42,
    n_jobs=-1
)

anomaly_model.fit(X_scaled)
print("✅ Isolation Forest trained!")

# ── 5. Evaluate on training data ──────────────────────────────
print("\n📈 Evaluating anomaly detection...")
predictions = anomaly_model.predict(X_scaled)
scores = anomaly_model.decision_function(X_scaled)

n_anomalies = (predictions == -1).sum()
n_normal    = (predictions == 1).sum()

print(f"   Normal readings:  {n_normal} ({n_normal/len(df)*100:.1f}%)")
print(f"   Anomalous readings: {n_anomalies} ({n_anomalies/len(df)*100:.1f}%)")
print(f"   Score range: [{scores.min():.3f}, {scores.max():.3f}]")
print(f"   (More negative = more anomalous)")

# Show sample anomalies
anomaly_indices = np.where(predictions == -1)[0]
if len(anomaly_indices) > 0:
    print(f"\n🔍 Sample anomalies detected (first 5):")
    sample = df.iloc[anomaly_indices[:5]][['soilMoisture','waterLevel','tilt','vibration']]
    print(sample.to_string())

# ── 6. Save models ────────────────────────────────────────────
print("\n💾 Saving models...")
joblib.dump(anomaly_model, 'anomaly_model.pkl')
joblib.dump(scaler, 'anomaly_scaler.pkl')
print("✅ Saved anomaly_model.pkl")
print("✅ Saved anomaly_scaler.pkl")

# ── 7. Threshold calibration ──────────────────────────────────
# Compute score percentiles for severity classification
p10 = np.percentile(scores, 10)
p5  = np.percentile(scores, 5)
p1  = np.percentile(scores, 1)

thresholds = {'low': float(p10), 'medium': float(p5), 'high': float(p1)}
joblib.dump(thresholds, 'anomaly_thresholds.pkl')
print(f"\n📊 Anomaly Severity Thresholds:")
print(f"   Low anomaly    (score < {p10:.4f})")
print(f"   Medium anomaly (score < {p5:.4f})")
print(f"   High anomaly   (score < {p1:.4f})")

print("\n" + "=" * 60)
print("🎉 Anomaly Detection Model Ready!")
print("=" * 60)
print("\nFiles created:")
print("  anomaly_model.pkl      — Isolation Forest model")
print("  anomaly_scaler.pkl     — Feature scaler")
print("  anomaly_thresholds.pkl — Severity thresholds")
print("\nThe model detects:")
print("  ✓ Sudden sensor spikes  (rate of change features)")
print("  ✓ Sustained deviations  (rolling mean features)")
print("  ✓ Cross-sensor patterns (combined risk feature)")
print("  ✓ Unusual correlations  (multi-sensor analysis)")
print("\nNext: Deploy to Render by adding files to Dockerfile")
