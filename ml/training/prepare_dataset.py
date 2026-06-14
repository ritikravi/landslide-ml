"""
Prepare dataset for ML training
Extracts features from MongoDB sensor data
"""
import pandas as pd
from pymongo import MongoClient
from datetime import datetime, timedelta

class DatasetPreparator:
    def __init__(self, mongo_uri='mongodb://localhost:27017/landslide-monitoring'):
        self.client = MongoClient(mongo_uri)
        self.db = self.client['landslide-monitoring']
    
    def fetch_sensor_data(self, days=30):
        """Fetch sensor data from MongoDB"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        cursor = self.db.sensordatas.find({
            'timestamp': {'$gte': cutoff_date}
        }).sort('timestamp', 1)
        
        return list(cursor)
    
    def extract_features(self, data):
        """Extract ML-ready features from sensor data"""
        df = pd.DataFrame(data)
        
        # Drop MongoDB _id
        if '_id' in df.columns:
            df = df.drop('_id', axis=1)
        
        # Sort by timestamp
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Feature engineering
        df['moisture_change_rate'] = df['soilMoisture'].diff()
        df['moisture_rolling_avg'] = df['soilMoisture'].rolling(window=5).mean()
        df['tilt_change_rate'] = df['tilt'].diff()
        df['vibration_frequency'] = df['vibration'].rolling(window=5).sum()
        
        # Fill NaN values
        df = df.fillna(0)
        
        return df
    
    def generate_labels(self, df):
        """Generate landslide risk labels based on rules"""
        def calculate_risk(row):
            score = (
                row['soilMoisture'] * 0.35 +
                row.get('waterLevel', 0) * 0.25 +
                row.get('tilt', 0) * 10 * 0.20 +
                row.get('vibration', 0) * 10 * 0.10
            )
            
            if score >= 80:
                return 'CRITICAL'
            elif score >= 60:
                return 'HIGH'
            elif score >= 30:
                return 'MEDIUM'
            else:
                return 'LOW'
        
        df['risk_level'] = df.apply(calculate_risk, axis=1)
        return df
    
    def save_dataset(self, df, filename='datasets/sensor_data.csv'):
        """Save dataset to CSV"""
        df.to_csv(filename, index=False)
        print(f"✅ Dataset saved to {filename}")
        print(f"📊 Total samples: {len(df)}")
        print(f"📈 Risk distribution:\n{df['risk_level'].value_counts()}")

if __name__ == '__main__':
    prep = DatasetPreparator()
    
    # Fetch data
    print("📥 Fetching sensor data from MongoDB...")
    data = prep.fetch_sensor_data(days=30)
    
    if not data:
        print("❌ No data found in database")
        exit(1)
    
    # Extract features
    print("⚙️ Extracting features...")
    df = prep.extract_features(data)
    
    # Generate labels
    print("🏷️ Generating risk labels...")
    df = prep.generate_labels(df)
    
    # Save
    prep.save_dataset(df)
