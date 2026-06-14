"""
Train Random Forest classifier for landslide risk prediction
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import os

class LandslideModelTrainer:
    def __init__(self, dataset_path='datasets/sensor_data.csv'):
        self.dataset_path = dataset_path
        self.model = None
        self.label_encoder = LabelEncoder()
        
    def load_data(self):
        """Load prepared dataset"""
        df = pd.read_csv(self.dataset_path)
        print(f"✅ Loaded {len(df)} samples")
        return df
    
    def prepare_features(self, df):
        """Prepare features and target for training"""
        feature_columns = [
            'soilMoisture', 'waterLevel', 'tilt', 'vibration',
            'moisture_change_rate', 'moisture_rolling_avg',
            'tilt_change_rate', 'vibration_frequency'
        ]
        
        X = df[feature_columns].fillna(0)
        y = self.label_encoder.fit_transform(df['risk_level'])
        
        return X, y
    
    def train(self, X_train, y_train):
        """Train Random Forest model"""
        print("🌲 Training Random Forest classifier...")
        
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        print("✅ Training completed")
    
    def evaluate(self, X_test, y_test):
        """Evaluate model performance"""
        y_pred = self.model.predict(X_test)
        
        print("\n📊 Model Performance:")
        print("\nClassification Report:")
        print(classification_report(
            y_test, y_pred,
            target_names=self.label_encoder.classes_
        ))
        
        print("\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        
        accuracy = self.model.score(X_test, y_test)
        print(f"\n✅ Accuracy: {accuracy:.2%}")
    
    def save_model(self, model_dir='models'):
        """Save trained model"""
        os.makedirs(model_dir, exist_ok=True)
        
        model_path = f"{model_dir}/landslide_rf_model.pkl"
        encoder_path = f"{model_dir}/label_encoder.pkl"
        
        joblib.dump(self.model, model_path)
        joblib.dump(self.label_encoder, encoder_path)
        
        print(f"\n✅ Model saved to {model_path}")
        print(f"✅ Encoder saved to {encoder_path}")

if __name__ == '__main__':
    trainer = LandslideModelTrainer()
    
    # Load data
    df = trainer.load_data()
    
    # Prepare features
    X, y = trainer.prepare_features(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"📊 Train samples: {len(X_train)}")
    print(f"📊 Test samples: {len(X_test)}")
    
    # Train
    trainer.train(X_train, y_train)
    
    # Evaluate
    trainer.evaluate(X_test, y_test)
    
    # Save
    trainer.save_model()
