#!/usr/bin/env python3
"""
Data Preprocessing Pipeline for Landslide Prediction
=====================================================
Cleans, validates, and preprocesses both historical and sensor data
Handles outliers, missing values, feature scaling, and data quality checks
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, RobustScaler
import joblib
import json
from datetime import datetime

class LandslideDataPreprocessor:
    """
    Comprehensive data preprocessing for landslide prediction
    """
    
    def __init__(self):
        self.scaler = None
        self.feature_ranges = None
        self.preprocessing_stats = {}
        
    def validate_ranges(self, df):
        """
        Validate data ranges - detect unrealistic values
        """
        print("\n🔍 STEP 1: Validating Data Ranges")
        print("="*70)
        
        # Define realistic ranges for each feature
        valid_ranges = {
            'soilMoisture': (0, 100),          # Percentage
            'waterLevel': (0, 300),            # cm
            'tilt': (0, 90),                   # degrees
            'vibration': (0, 100),             # arbitrary units
            'ultrasonicDistance': (0, 500),    # cm
            'elevation': (0, 8900),            # meters (0 to Mt. Everest)
            'slope': (0, 90),                  # degrees
            'aspect': (0, 360),                # degrees
            'rainfall_mm': (0, 500)            # mm/day (realistic max ~400mm)
        }
        
        invalid_count = 0
        for feature, (min_val, max_val) in valid_ranges.items():
            if feature in df.columns:
                # Count out-of-range values
                out_of_range = ((df[feature] < min_val) | (df[feature] > max_val)).sum()
                
                if out_of_range > 0:
                    print(f"   ⚠️  {feature}: {out_of_range} values out of range [{min_val}, {max_val}]")
                    invalid_count += out_of_range
                    
                    # Clip to valid range
                    df[feature] = df[feature].clip(min_val, max_val)
                else:
                    print(f"   ✅ {feature}: All values in valid range")
        
        print(f"\n✅ Validation complete")
        print(f"   Total out-of-range values clipped: {invalid_count}")
        
        self.preprocessing_stats['invalid_values_clipped'] = invalid_count
        return df
    
    def remove_outliers(self, df, method='iqr', threshold=3.0):
        """
        Remove outliers using IQR or Z-score method
        """
        print(f"\n🔍 STEP 2: Detecting Outliers (method={method})")
        print("="*70)
        
        initial_count = len(df)
        
        numeric_features = ['soilMoisture', 'waterLevel', 'tilt', 'vibration', 
                           'ultrasonicDistance', 'elevation', 'slope', 'aspect']
        
        if method == 'iqr':
            # Interquartile Range method (more robust)
            for feature in numeric_features:
                if feature in df.columns:
                    Q1 = df[feature].quantile(0.25)
                    Q3 = df[feature].quantile(0.75)
                    IQR = Q3 - Q1
                    
                    lower_bound = Q1 - threshold * IQR
                    upper_bound = Q3 + threshold * IQR
                    
                    outliers = ((df[feature] < lower_bound) | (df[feature] > upper_bound)).sum()
                    if outliers > 0:
                        print(f"   {feature}: {outliers} outliers detected (IQR bounds: [{lower_bound:.2f}, {upper_bound:.2f}])")
                        df = df[(df[feature] >= lower_bound) & (df[feature] <= upper_bound)]
        
        elif method == 'zscore':
            # Z-score method (assumes normal distribution)
            for feature in numeric_features:
                if feature in df.columns:
                    z_scores = np.abs((df[feature] - df[feature].mean()) / df[feature].std())
                    outliers = (z_scores > threshold).sum()
                    if outliers > 0:
                        print(f"   {feature}: {outliers} outliers detected (|z| > {threshold})")
                        df = df[z_scores <= threshold]
        
        removed = initial_count - len(df)
        print(f"\n✅ Outlier removal complete")
        print(f"   Samples removed: {removed} ({removed/initial_count*100:.2f}%)")
        print(f"   Samples remaining: {len(df)}")
        
        self.preprocessing_stats['outliers_removed'] = removed
        return df
    
    def handle_missing_values(self, df, strategy='smart'):
        """
        Handle missing values intelligently
        """
        print(f"\n🔍 STEP 3: Handling Missing Values (strategy={strategy})")
        print("="*70)
        
        missing_before = df.isnull().sum().sum()
        
        if strategy == 'smart':
            # Different strategies for different features
            strategies = {
                'soilMoisture': 'median',      # Environmental - use median
                'waterLevel': 'median',
                'tilt': 'mean',                # Sensor - use mean
                'vibration': 'zero',           # Event count - use 0
                'ultrasonicDistance': 'median',
                'elevation': 'forward_fill',   # Terrain - use location-based
                'slope': 'forward_fill',
                'aspect': 'forward_fill',
                'rainfall_mm': 'zero'          # Weather - 0 = no rain
            }
            
            for feature, method in strategies.items():
                if feature in df.columns:
                    missing_count = df[feature].isnull().sum()
                    if missing_count > 0:
                        if method == 'median':
                            df[feature].fillna(df[feature].median(), inplace=True)
                        elif method == 'mean':
                            df[feature].fillna(df[feature].mean(), inplace=True)
                        elif method == 'zero':
                            df[feature].fillna(0, inplace=True)
                        elif method == 'forward_fill':
                            df[feature].fillna(method='ffill', inplace=True)
                            df[feature].fillna(method='bfill', inplace=True)
                        
                        print(f"   {feature}: {missing_count} missing → filled with {method}")
        
        elif strategy == 'zero':
            df.fillna(0, inplace=True)
        
        elif strategy == 'drop':
            df.dropna(inplace=True)
        
        missing_after = df.isnull().sum().sum()
        print(f"\n✅ Missing value handling complete")
        print(f"   Missing values before: {missing_before}")
        print(f"   Missing values after: {missing_after}")
        
        self.preprocessing_stats['missing_values_handled'] = missing_before - missing_after
        return df
    
    def remove_duplicates(self, df):
        """
        Remove duplicate records
        """
        print(f"\n🔍 STEP 4: Removing Duplicates")
        print("="*70)
        
        initial_count = len(df)
        df_dedup = df.drop_duplicates()
        removed = initial_count - len(df_dedup)
        
        print(f"   Duplicates found: {removed}")
        print(f"   Samples after deduplication: {len(df_dedup)}")
        
        self.preprocessing_stats['duplicates_removed'] = removed
        return df_dedup
    
    def feature_engineering(self, df):
        """
        Create derived features
        """
        print(f"\n🔍 STEP 5: Feature Engineering")
        print("="*70)
        
        features_created = []
        
        # 1. Combined risk indicator
        if all(col in df.columns for col in ['soilMoisture', 'waterLevel', 'tilt']):
            df['soil_water_interaction'] = df['soilMoisture'] * df['waterLevel'] / 100
            features_created.append('soil_water_interaction')
        
        # 2. Terrain severity index
        if all(col in df.columns for col in ['elevation', 'slope']):
            # Higher elevation + steeper slope = higher risk
            df['terrain_severity'] = (df['elevation'] / 1000) * (df['slope'] / 10)
            features_created.append('terrain_severity')
        
        # 3. Saturation index
        if 'soilMoisture' in df.columns and 'rainfall_mm' in df.columns:
            df['saturation_index'] = df['soilMoisture'] + (df['rainfall_mm'] / 10)
            df['saturation_index'] = df['saturation_index'].clip(0, 100)
            features_created.append('saturation_index')
        
        # 4. Movement indicator
        if 'tilt' in df.columns and 'vibration' in df.columns:
            df['movement_indicator'] = (df['tilt'] / 10) + (df['vibration'] / 5)
            features_created.append('movement_indicator')
        
        if features_created:
            print(f"   ✅ Created {len(features_created)} derived features:")
            for feat in features_created:
                print(f"      • {feat}")
        else:
            print(f"   ℹ️  No derived features created (missing required columns)")
        
        self.preprocessing_stats['features_created'] = len(features_created)
        return df
    
    def scale_features(self, df, feature_columns, method='robust'):
        """
        Scale numerical features
        """
        print(f"\n🔍 STEP 6: Feature Scaling (method={method})")
        print("="*70)
        
        if method == 'robust':
            # RobustScaler - resistant to outliers
            scaler = RobustScaler()
        elif method == 'standard':
            # StandardScaler - standard normalization
            scaler = StandardScaler()
        else:
            print("   ℹ️  Skipping scaling")
            return df
        
        # Only scale numeric features
        numeric_features = [col for col in feature_columns if col in df.columns and df[col].dtype in ['int64', 'float64']]
        
        if numeric_features:
            df[numeric_features] = scaler.fit_transform(df[numeric_features])
            self.scaler = scaler
            
            print(f"   ✅ Scaled {len(numeric_features)} features")
            print(f"   Method: {method.capitalize()}Scaler")
        else:
            print(f"   ℹ️  No numeric features to scale")
        
        return df
    
    def preprocess(self, df, remove_outliers_flag=True, scale_features_flag=False):
        """
        Run complete preprocessing pipeline
        """
        print("\n" + "="*70)
        print("🔬 DATA PREPROCESSING PIPELINE")
        print("="*70)
        print(f"   Input samples: {len(df)}")
        print(f"   Input features: {len(df.columns)}")
        
        self.preprocessing_stats['initial_samples'] = len(df)
        self.preprocessing_stats['initial_features'] = len(df.columns)
        
        # Step 1: Validate ranges
        df = self.validate_ranges(df)
        
        # Step 2: Remove outliers (optional)
        if remove_outliers_flag:
            df = self.remove_outliers(df, method='iqr', threshold=3.0)
        
        # Step 3: Handle missing values
        df = self.handle_missing_values(df, strategy='smart')
        
        # Step 4: Remove duplicates
        df = self.remove_duplicates(df)
        
        # Step 5: Feature engineering (optional)
        # df = self.feature_engineering(df)
        
        # Step 6: Scale features (optional - not needed for tree-based models)
        # if scale_features_flag:
        #     feature_cols = [col for col in df.columns if col not in ['timestamp', 'region', 'risk_level', 'landslide_occurred']]
        #     df = self.scale_features(df, feature_cols, method='robust')
        
        self.preprocessing_stats['final_samples'] = len(df)
        self.preprocessing_stats['final_features'] = len(df.columns)
        
        print("\n" + "="*70)
        print("✅ PREPROCESSING COMPLETE")
        print("="*70)
        print(f"   Final samples: {len(df)} (lost {self.preprocessing_stats['initial_samples'] - len(df)})")
        print(f"   Final features: {len(df.columns)}")
        print(f"   Data quality: {(len(df)/self.preprocessing_stats['initial_samples'])*100:.1f}% retained")
        
        return df
    
    def save_stats(self, filepath='preprocessing_stats.json'):
        """
        Save preprocessing statistics
        """
        stats = {
            **{k: int(v) if isinstance(v, (np.integer, np.int64)) else v 
               for k, v in self.preprocessing_stats.items()},
            'timestamp': datetime.now().isoformat(),
            'data_quality_score': float((self.preprocessing_stats['final_samples'] / self.preprocessing_stats['initial_samples']) * 100)
        }
        
        with open(filepath, 'w') as f:
            json.dump(stats, f, indent=2)
        
        print(f"\n💾 Preprocessing stats saved: {filepath}")
        return stats


# ============================================================================
# MAIN: Preprocess historical data
# ============================================================================
if __name__ == "__main__":
    print("🔬 Preprocessing Historical Landslide Data")
    print("="*70 + "\n")
    
    # Load raw data
    data_path = 'data/historical/india_training_dataset.csv'
    
    try:
        df = pd.read_csv(data_path)
        print(f"✅ Loaded {len(df)} records from {data_path}")
    except FileNotFoundError:
        print(f"❌ File not found: {data_path}")
        print("   Run: python fetch_india_landslide_data.py first")
        exit(1)
    
    # Initialize preprocessor
    preprocessor = LandslideDataPreprocessor()
    
    # Run preprocessing
    df_clean = preprocessor.preprocess(
        df,
        remove_outliers_flag=True,   # Remove statistical outliers
        scale_features_flag=False     # Don't scale (tree models don't need it)
    )
    
    # Save cleaned data
    output_path = 'data/historical/india_training_dataset_cleaned.csv'
    df_clean.to_csv(output_path, index=False)
    print(f"\n💾 Cleaned data saved: {output_path}")
    
    # Save preprocessing stats
    stats = preprocessor.save_stats('data/historical/preprocessing_stats.json')
    
    # Summary
    print("\n" + "="*70)
    print("📊 PREPROCESSING SUMMARY")
    print("="*70)
    print(f"   Original samples: {stats['initial_samples']}")
    print(f"   Final samples: {stats['final_samples']}")
    print(f"   Data retained: {stats['data_quality_score']:.1f}%")
    print(f"   Outliers removed: {stats.get('outliers_removed', 0)}")
    print(f"   Duplicates removed: {stats.get('duplicates_removed', 0)}")
    print(f"   Missing values handled: {stats.get('missing_values_handled', 0)}")
    print(f"   Invalid values clipped: {stats.get('invalid_values_clipped', 0)}")
    print("\n✅ Ready for training!")
    print("   Next: python train_on_historical_data.py")
    print("="*70 + "\n")
