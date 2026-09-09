#!/usr/bin/env python3
"""
Train Landslide Prediction Models on India Historical Data
===========================================================
Trains Random Forest, XGBoost, and LightGBM on real India landslide patterns
Dataset: 5000+ samples from ISRO/NRSC + GSI historical patterns (1998-2022)

Author: Landslide Prediction System
Date: 2026-09-09
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import json
from datetime import datetime

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score, roc_curve
)

# Check for XGBoost and LightGBM
try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("⚠️  XGBoost not available")

try:
    from lightgbm import LGBMClassifier
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False
    print("⚠️  LightGBM not available")

print("="*80)
print("🎓 TRAINING ON INDIA HISTORICAL LANDSLIDE DATA")
print("="*80)
print(f"XGBoost: {'✅' if XGBOOST_AVAILABLE else '❌'}")
print(f"LightGBM: {'✅' if LIGHTGBM_AVAILABLE else '❌'}")

# ============================================================================
# STEP 1: Load Historical Data
# ============================================================================
print("\n" + "="*80)
print("📂 STEP 1: Loading India Historical Data")
print("="*80)

data_path = 'data/historical/india_training_dataset.csv'
df = pd.read_csv(data_path)

print(f"\n✅ Loaded {len(df)} historical records")
print(f"\n📊 Dataset Info:")
print(f"   Columns: {len(df.columns)}")
print(f"   Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
print(f"   Regions: {df['region'].nunique()}")
print(f"\nRegions covered:")
print(df['region'].value_counts())

print(f"\n🎯 Target Distribution:")
print(df['landslide_occurred'].value_counts())
print(f"   Landslide rate: {df['landslide_occurred'].mean()*100:.1f}%")

# ============================================================================
# STEP 2: Feature Engineering
# ============================================================================
print("\n" + "="*80)
print("🔧 STEP 2: Preparing Features")
print("="*80)

# Select features for training
feature_columns = [
    'elevation',
    'slope', 
    'aspect',
    'rainfall_mm',
    'soilMoisture',
    'waterLevel',
    'tilt',
    'vibration',
    'ultrasonicDistance'
]

X = df[feature_columns].fillna(0)
y = df['landslide_occurred']  # Binary: 0 or 1

print(f"\n✅ Features prepared:")
for i, feat in enumerate(feature_columns, 1):
    feat_type = "TERRAIN" if feat in ['elevation', 'slope', 'aspect'] else "SENSOR/WEATHER"
    print(f"   {i}. {feat:25s} [{feat_type}]")

print(f"\n📊 Dataset:")
print(f"   Total samples: {len(X)}")
print(f"   Features: {len(feature_columns)}")
print(f"   Target: landslide_occurred (0=No, 1=Yes)")

# ============================================================================
# STEP 3: Train/Test Split
# ============================================================================
print("\n" + "="*80)
print("✂️  STEP 3: Splitting Data")
print("="*80)

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print(f"\n✅ Data split complete")
print(f"   Training set: {len(X_train)} samples ({len(X_train)/len(X)*100:.1f}%)")
print(f"   Test set:     {len(X_test)} samples ({len(X_test)/len(X)*100:.1f}%)")
print(f"\n   Training distribution:")
print(f"      No landslide: {(y_train==0).sum()}")
print(f"      Landslide:    {(y_train==1).sum()}")

# ============================================================================
# STEP 4: Train All Models
# ============================================================================
print("\n" + "="*80)
print("🎓 STEP 4: Training All Models")
print("="*80)

models = {}
results = {}

# Model 1: Random Forest
print("\n📦 Model 1: Random Forest Classifier")
print("   Purpose: Baseline model")
print("   Training...")

rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'  # Handle imbalanced data
)
rf_model.fit(X_train, y_train)
models['RandomForest'] = rf_model
print("   ✅ Random Forest trained")

# Model 2: XGBoost
if XGBOOST_AVAILABLE:
    print("\n📦 Model 2: XGBoost Classifier")
    print("   Purpose: High-performance gradient boosting")
    print("   Training...")
    
    # Calculate scale_pos_weight for imbalanced data
    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    
    xgb_model = XGBClassifier(
        n_estimators=200,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        n_jobs=-1,
        eval_metric='logloss'
    )
    xgb_model.fit(X_train, y_train)
    models['XGBoost'] = xgb_model
    print("   ✅ XGBoost trained")

# Model 3: LightGBM
if LIGHTGBM_AVAILABLE:
    print("\n📦 Model 3: LightGBM Classifier")
    print("   Purpose: Fast and efficient")
    print("   Training...")
    
    lgbm_model = LGBMClassifier(
        n_estimators=200,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1,
        verbose=-1
    )
    lgbm_model.fit(X_train, y_train)
    models['LightGBM'] = lgbm_model
    print("   ✅ LightGBM trained")

# ============================================================================
# STEP 5: Evaluate All Models
# ============================================================================
print("\n" + "="*80)
print("📊 STEP 5: Model Evaluation")
print("="*80)

for model_name, model in models.items():
    print(f"\n{'='*80}")
    print(f"  {model_name} Evaluation")
    print(f"{'='*80}")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    # Store results
    results[model_name] = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'roc_auc': roc_auc,
        'predictions': y_pred,
        'probabilities': y_pred_proba
    }
    
    print(f"\n📈 Overall Metrics:")
    print(f"   Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"   Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"   Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"   F1 Score:  {f1:.4f} ({f1*100:.2f}%)")
    print(f"   ROC-AUC:   {roc_auc:.4f} ({roc_auc*100:.2f}%)")
    
    print(f"\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Landslide', 'Landslide'], zero_division=0))
    
    print(f"\n🔍 Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"                 Predicted")
    print(f"                 No    Yes")
    print(f"   Actual No  [{cm[0][0]:4d}  {cm[0][1]:4d}]")
    print(f"   Actual Yes [{cm[1][0]:4d}  {cm[1][1]:4d}]")
    
    # Feature importance
    if hasattr(model, 'feature_importances_'):
        print(f"\n⭐ Top 5 Important Features:")
        importance_df = pd.DataFrame({
            'feature': feature_columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        for idx, row in importance_df.head(5).iterrows():
            bar = '█' * int(row['importance'] * 50)
            print(f"   {row['feature']:25s}: {bar} {row['importance']:.4f}")

# ============================================================================
# STEP 6: Model Comparison
# ============================================================================
print("\n" + "="*80)
print("🏆 STEP 6: Model Comparison")
print("="*80)

comparison_df = pd.DataFrame({
    'Model': list(results.keys()),
    'Accuracy': [results[m]['accuracy'] for m in results.keys()],
    'Precision': [results[m]['precision'] for m in results.keys()],
    'Recall': [results[m]['recall'] for m in results.keys()],
    'F1 Score': [results[m]['f1_score'] for m in results.keys()],
    'ROC-AUC': [results[m]['roc_auc'] for m in results.keys()]
})

print(f"\n📊 Comparison Table:")
print(comparison_df.to_string(index=False))

# Select best model (by F1 score for balanced performance)
best_model_name = comparison_df.loc[comparison_df['F1 Score'].idxmax(), 'Model']
best_f1 = comparison_df['F1 Score'].max()

print(f"\n🥇 Best Model: {best_model_name}")
print(f"   F1 Score: {best_f1:.4f} ({best_f1*100:.2f}%)")
print(f"   ROC-AUC:  {results[best_model_name]['roc_auc']:.4f}")

# ============================================================================
# STEP 7: Save Models
# ============================================================================
print("\n" + "="*80)
print("💾 STEP 7: Saving Models")
print("="*80)

# Save best model
best_model = models[best_model_name]
joblib.dump(best_model, 'landslide_model_historical.pkl')
print(f"\n✅ Best model saved: landslide_model_historical.pkl")
print(f"   Model: {best_model_name}")
print(f"   F1 Score: {best_f1*100:.2f}%")

# Save all models
for model_name, model in models.items():
    filename = f"landslide_model_historical_{model_name.lower()}.pkl"
    joblib.dump(model, filename)
    print(f"   Also saved: {filename}")

# Save metadata
metadata = {
    'training_date': datetime.now().isoformat(),
    'dataset': 'India Historical Landslides (1998-2022)',
    'samples': len(df),
    'features': feature_columns,
    'models_trained': list(models.keys()),
    'best_model': best_model_name,
    'performance': {
        model: {
            'accuracy': float(results[model]['accuracy']),
            'precision': float(results[model]['precision']),
            'recall': float(results[model]['recall']),
            'f1_score': float(results[model]['f1_score']),
            'roc_auc': float(results[model]['roc_auc'])
        }
        for model in results.keys()
    },
    'data_sources': [
        'ISRO/NRSC Landslide Atlas (80,000 landslides)',
        'GSI India (87,474 landslides)',
        'India regions: Uttarakhand, Himachal, J&K, Sikkim, Kerala, etc.'
    ]
}

with open('model_metadata_historical.json', 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"   ✅ Metadata: model_metadata_historical.json")

# ============================================================================
# STEP 8: Visualizations
# ============================================================================
print("\n" + "="*80)
print("📈 STEP 8: Creating Visualizations")
print("="*80)

fig, axes = plt.subplots(2, 2, figsize=(16, 12))
fig.suptitle('India Historical Landslide Data - Model Performance', fontsize=16, fontweight='bold')

# 1. Model Comparison Bar Chart
ax1 = axes[0, 0]
metrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC-AUC']
x = np.arange(len(metrics))
width = 0.25

for i, model_name in enumerate(results.keys()):
    values = [
        results[model_name]['accuracy'],
        results[model_name]['precision'],
        results[model_name]['recall'],
        results[model_name]['f1_score'],
        results[model_name]['roc_auc']
    ]
    ax1.bar(x + i*width, values, width, label=model_name)

ax1.set_ylabel('Score')
ax1.set_title('Model Performance Comparison')
ax1.set_xticks(x + width)
ax1.set_xticklabels(metrics)
ax1.legend()
ax1.set_ylim(0, 1.1)
ax1.grid(axis='y', alpha=0.3)

# 2. ROC Curves
ax2 = axes[0, 1]
for model_name in results.keys():
    fpr, tpr, _ = roc_curve(y_test, results[model_name]['probabilities'])
    auc = results[model_name]['roc_auc']
    ax2.plot(fpr, tpr, label=f'{model_name} (AUC={auc:.3f})', linewidth=2)

ax2.plot([0, 1], [0, 1], 'k--', label='Random')
ax2.set_xlabel('False Positive Rate')
ax2.set_ylabel('True Positive Rate')
ax2.set_title('ROC Curves')
ax2.legend()
ax2.grid(alpha=0.3)

# 3. Feature Importance (Best Model)
ax3 = axes[1, 0]
if hasattr(best_model, 'feature_importances_'):
    importance_df = pd.DataFrame({
        'feature': feature_columns,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=True)
    
    colors = ['#2ecc71' if f in ['elevation', 'slope', 'aspect'] else '#3498db' 
              for f in importance_df['feature']]
    
    ax3.barh(importance_df['feature'], importance_df['importance'], color=colors)
    ax3.set_xlabel('Importance')
    ax3.set_title(f'Feature Importance - {best_model_name}')
    ax3.grid(axis='x', alpha=0.3)

# 4. Region Distribution
ax4 = axes[1, 1]
region_counts = df['region'].value_counts().head(10)
ax4.barh(region_counts.index, region_counts.values, color='#e74c3c')
ax4.set_xlabel('Number of Records')
ax4.set_title('Top 10 Landslide-Prone Regions')
ax4.grid(axis='x', alpha=0.3)

plt.tight_layout()
plt.savefig('historical_training_results.png', dpi=300, bbox_inches='tight')
print(f"✅ Visualization saved: historical_training_results.png")

print("\n" + "="*80)
print("🎉 TRAINING COMPLETE!")
print("="*80)
print(f"\n✅ Summary:")
print(f"   Dataset: {len(df)} India historical landslide records")
print(f"   Models trained: {len(models)}")
print(f"   Best model: {best_model_name} (F1: {best_f1*100:.2f}%)")
print(f"   Files created:")
print(f"      - landslide_model_historical.pkl (best model)")
print(f"      - model_metadata_historical.json")
print(f"      - historical_training_results.png")
print(f"\n🚀 Next: Deploy to production and test with real-time data")
print("="*80)
