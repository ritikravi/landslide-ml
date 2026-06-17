# Machine Learning for Landslide Prediction - Complete Guide

## Overview
Use your 825+ sensor readings to train ML models that predict landslide risk.

## Step 1: Fetch Your Data

### Method A: Using API (Easiest)
```bash
cd ml
pip install requests pandas
python fetch_data.py
```

This will create `sensor_data.csv` with all your readings.

### Method B: MongoDB Direct Export
```bash
pip install pymongo pandas
export MONGODB_URI="your_mongodb_connection_string"
python export_from_mongodb.py
```

## Step 2: Understand Your Data

Your dataset includes:
- **soilMoisture**: 0-100% (dry to wet)
- **waterLevel**: 0-100% (water depth)
- **tilt**: 0-180° (ground angle)
- **vibration**: Event count (ground movement)
- **ultrasonicDistance**: cm (displacement)
- **latitude/longitude**: GPS location
- **timestamp**: When reading was taken

## Step 3: Choose ML Approach

### A. **Classification** (Recommended for beginners)
Predict risk level: LOW, MEDIUM, HIGH, CRITICAL

**Good for**: Alert systems, binary decisions

**Algorithms to try**:
1. Random Forest (best for beginners)
2. Decision Tree (easy to visualize)
3. Logistic Regression (simple, interpretable)
4. XGBoost (advanced, very accurate)

### B. **Regression**
Predict exact risk score: 0-100

**Good for**: Precise risk estimation

**Algorithms**:
1. Linear Regression (baseline)
2. Random Forest Regressor
3. Gradient Boosting

### C. **Time Series** (Advanced)
Predict future sensor values

**Good for**: Early warning, trend prediction

**Algorithms**:
1. LSTM (deep learning)
2. ARIMA (classical)
3. Prophet (Facebook's tool)

## Step 4: Create Labels (Target Variable)

You need to label your data. Options:

### Manual Labeling
Based on domain knowledge:
```python
def calculate_risk_label(row):
    risk_score = 0
    
    # Soil moisture: High = risky
    if row['soilMoisture'] > 70: risk_score += 25
    elif row['soilMoisture'] > 50: risk_score += 15
    
    # Water level: High = risky
    if row['waterLevel'] > 80: risk_score += 30
    elif row['waterLevel'] > 60: risk_score += 20
    
    # Tilt: Large angle = risky
    if row['tilt'] > 30: risk_score += 25
    elif row['tilt'] > 15: risk_score += 15
    
    # Vibration: Events = risky
    if row['vibration'] > 5: risk_score += 20
    elif row['vibration'] > 0: risk_score += 10
    
    # Distance change: Sudden change = risky (need time-series comparison)
    
    # Classify
    if risk_score >= 70: return 'CRITICAL'
    elif risk_score >= 50: return 'HIGH'
    elif risk_score >= 30: return 'MEDIUM'
    else: return 'LOW'

df['risk_label'] = df.apply(calculate_risk_label, axis=1)
```

### Anomaly Detection (Unsupervised)
Detect unusual patterns without labels:
```python
from sklearn.ensemble import IsolationForest

model = IsolationForest(contamination=0.1)
df['anomaly'] = model.fit_predict(df[features])
```

## Step 5: Basic ML Example

### Random Forest Classifier
```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# Load data
df = pd.read_csv('sensor_data.csv')

# Create labels (use function from Step 4)
df['risk_label'] = df.apply(calculate_risk_label, axis=1)

# Features
features = ['soilMoisture', 'waterLevel', 'tilt', 'vibration', 'ultrasonicDistance']
X = df[features].fillna(0)  # Handle missing values
y = df['risk_label']

# Split data (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Feature importance
importance = pd.DataFrame({
    'feature': features,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print("\nFeature Importance:")
print(importance)

# Save model
import joblib
joblib.dump(model, 'landslide_model.pkl')
print("\n✅ Model saved to landslide_model.pkl")
```

## Step 6: Learning Resources

### For Beginners
1. **Kaggle Learn**: https://www.kaggle.com/learn
   - Start with "Intro to Machine Learning"
   - Then "Intermediate Machine Learning"

2. **Google's ML Crash Course**: https://developers.google.com/machine-learning/crash-course

3. **Scikit-learn Tutorials**: https://scikit-learn.org/stable/tutorial/

### Intermediate
1. **Fast.ai**: https://www.fast.ai/
2. **Andrew Ng's ML Course**: https://www.coursera.org/learn/machine-learning

### Books
1. "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow" by Aurélien Géron
2. "Python Machine Learning" by Sebastian Raschka

## Step 7: Integration with Your System

Once trained, integrate the model:

```python
# In backend/src/services/mlService.js
import { spawn } from 'child_process';

export const generatePrediction = async (sensorData) => {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['ml/predict.py', JSON.stringify(sensorData)]);
    
    let result = '';
    python.stdout.on('data', (data) => { result += data; });
    python.on('close', () => resolve(JSON.parse(result)));
  });
};
```

## Step 8: Next Steps

1. **Run fetch_data.py** to get your CSV
2. **Explore data** in Excel or Jupyter Notebook
3. **Create labels** based on domain knowledge
4. **Train basic model** (Random Forest)
5. **Evaluate performance** (accuracy, confusion matrix)
6. **Improve model** (feature engineering, hyperparameter tuning)
7. **Deploy model** (integrate with backend)

## Tips for Your Landslide Dataset

1. **Feature Engineering**:
   - Rate of change (e.g., soil moisture increase per hour)
   - Rolling averages (e.g., 3-hour average tilt)
   - Interaction features (e.g., soil_moisture * water_level)

2. **Time-based Features**:
   - Hour of day
   - Day of week
   - Time since last rain (if available)

3. **Data Quality**:
   - Handle missing GPS values
   - Remove outliers (e.g., distance > 400cm)
   - Normalize values (0-1 scale)

4. **Model Evaluation**:
   - Confusion matrix (which classes are confused?)
   - Precision/Recall (better than accuracy for imbalanced data)
   - Cross-validation (test on different time periods)

## Need Help?

1. Check the error messages carefully
2. Google the error (Stack Overflow is your friend)
3. Start simple (Decision Tree) before complex (Neural Networks)
4. Visualize your data first (scatter plots, histograms)

Good luck with your ML journey! 🚀
