#!/usr/bin/env python3
"""
Script to export data directly from MongoDB Atlas
Requires: MONGODB_URI environment variable
"""

import os
import pandas as pd
from pymongo import MongoClient
from datetime import datetime

# MongoDB connection string (set in environment or replace here)
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://username:password@cluster.mongodb.net/database')

def export_from_mongodb():
    """Export sensor data directly from MongoDB"""
    print("Connecting to MongoDB...")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client.get_database()
        collection = db['sensordatas']
        
        # Fetch all records
        print("Fetching records...")
        cursor = collection.find({}).sort('timestamp', -1)
        records = list(cursor)
        
        print(f"✅ Fetched {len(records)} records from MongoDB")
        
        # Convert to DataFrame
        df = pd.DataFrame(records)
        
        # Remove MongoDB internal fields
        if '_id' in df.columns:
            df = df.drop(['_id', '__v', 'createdAt', 'updatedAt'], axis=1, errors='ignore')
        
        # Convert timestamp
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Save to CSV
        filename = f'sensor_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        df.to_csv(filename, index=False)
        
        print(f"✅ Data exported to {filename}")
        print(f"\nDataset shape: {df.shape}")
        print(f"\nColumns: {list(df.columns)}")
        print(f"\nFirst few rows:")
        print(df.head())
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    export_from_mongodb()
