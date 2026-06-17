#!/usr/bin/env python3
"""
Simple Machine Learning Example for Landslide Prediction
Perfect for beginners!
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns

# Step 1: Load data
print("📊 Loading data...")
df = pd.read_csv('sensor_data.csv')
print(f"✅ Loaded {len(df)} records")
print(f"\nColumns: {list(df.columns)}")
print(f"\nFirst 5 rows:")
print(df.head())

# Step 2: Create risk labels
print("\n🏷️  Creating risk labels...")

def calculate_risk_score(row):
    """Calculate risk score from sensor data"""
    score = 0
    
    # High soil moisture = risky
    if pd.notna(row['soilMoisture']):
        if row['soilMoisture'] > 70: score += 25
        elif row['soilMoisture'] > 50: score += 15
    
    # High water level = risky
    if pd.notna(row['waterLevel']):
        if row['waterLevel'] > 80: score += 30
        elif row['waterLevel'] > 60: score += 20
    
    # Large tilt angle = risky
    if pd.notna(row['tilt']):
        if row['tilt'] > 30: score += 25
        elif row['tilt'] > 15: score += 15
    
    # Vibration events = risky
    if pd.notna(row['vibration']):
        if row['vibration'] > 5: score += 20
        elif row['vibration'] > 0: score += 10
    
    return score

def score_to_label(score):
    """Convert risk score to label"""
    if score >= 70: return 'CRITICAL'
    elif score >= 50: return 'HIGH'
    elif score >= 30: return 'MEDIUM'
    else: return 'LOW'

df['risk_score'] = df.apply(calculate_risk_score, axis=1)
df['risk_label'] = df['risk_score'].apply(score_to_label)

print(f"✅ Labels created!")
print(f"\nRisk distribution:")
print(df['risk_label'].value_counts())

# Step 3: Prepare features
print("\n🔧 Preparing features...")

features = ['soilMoisture', 'waterLevel', 'tilt', 'vibration']

# Add ultrasonicDistance if it exists
if 'ultrasonicDistance' in df.columns:
    features.append('ultrasonicDistance')

# Remove rows with missing labels
df_clean = df.dropna(subset=['risk_label'])

# Fill missing values with 0
X = df_clean[features].fillna(0)
y = df_clean['risk_label']

print(f"✅ Features: {features}")
print(f"✅ Dataset shape: {X.shape}")

# Step 4: Split data
print("\n✂️  Splitting data (80% train, 20% test)...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f"Training set: {len(X_train)} samples")
print(f"Test set: {len(X_test)} samples")

# Step 5: Train model
print("\n🎓 Training Random Forest model...")
model = RandomForestClassifier(
    n_estimators=100,      # Number of trees
    max_depth=10,          # Prevent overfitting
    random_state=42
)

model.fit(X_train, y_train)
print("✅ Model trained!")

# Step 6: Evaluate
print("\n📈 Evaluating model...")
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print(f"\n✅ Accuracy: {accuracy:.2%}")

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

print("\n🔍 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred, labels=['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
print(cm)

# Step 7: Feature importance
print("\n⭐ Feature Importance:")
importance_df = pd.DataFrame({
    'feature': features,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print(importance_df)

# Plot feature importance
plt.figure(figsize=(10, 6))
plt.barh(importance_df['feature'], importance_df['importance'])
plt.xlabel('Importance')
plt.title('Feature Importance for Landslide Risk Prediction')
plt.tight_layout()
plt.savefig('feature_importance.png')
print("\n✅ Feature importance plot saved to feature_importance.png")

# Step 8: Test with new data
print("\n🧪 Testing with sample predictions...")

sample_data = pd.DataFrame({
    'soilMoisture': [20, 80, 50],
    'waterLevel': [10, 90, 60],
    'tilt': [5, 35, 20],
    'vibration': [0, 8, 2],
})

if 'ultrasonicDistance' in features:
    sample_data['ultrasonicDistance'] = [100, 150, 120]

predictions = model.predict(sample_data)

print("\nSample predictions:")
for i, pred in enumerate(predictions):
    print(f"Sample {i+1}: {pred}")
    print(f"  - Soil: {sample_data.iloc[i]['soilMoisture']}%")
    print(f"  - Water: {sample_data.iloc[i]['waterLevel']}%")
    print(f"  - Tilt: {sample_data.iloc[i]['tilt']}°")
    print(f"  - Vibration: {sample_data.iloc[i]['vibration']} events")
    print()

# Step 9: Save model
import joblib
joblib.dump(model, 'landslide_model.pkl')
print("✅ Model saved to landslide_model.pkl")

print("\n" + "="*50)
print("🎉 Machine Learning Pipeline Complete!")
print("="*50)
print("\nNext steps:")
print("1. Check feature_importance.png to see what matters most")
print("2. Try improving the risk scoring function")
print("3. Collect more data for better accuracy")
print("4. Integrate model into your backend API")
