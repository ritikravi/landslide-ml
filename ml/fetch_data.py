#!/usr/bin/env python3
"""
Script to fetch sensor data from the API and save to CSV for ML training
"""

import requests
import pandas as pd
import json
from datetime import datetime

# API endpoint
API_URL = "https://landslide-api.onrender.com/api/sensor-data/history"

def fetch_all_data(limit=1000):
    """Fetch sensor data from API"""
    print(f"Fetching up to {limit} records from API...")
    
    response = requests.get(f"{API_URL}?limit={limit}")
    
    if response.status_code == 200:
        data = response.json()
        records = data.get('data', [])
        print(f"✅ Fetched {len(records)} records")
        return records
    else:
        print(f"❌ Error: {response.status_code}")
        return []

def save_to_csv(records, filename='sensor_data.csv'):
    """Convert to DataFrame and save as CSV"""
    if not records:
        print("No data to save")
        return
    
    # Flatten the data
    df = pd.DataFrame(records)
    
    # Select relevant columns
    columns = ['timestamp', 'soilMoisture', 'waterLevel', 'tilt', 
               'vibration', 'ultrasonicDistance', 'latitude', 'longitude']
    
    # Keep only existing columns
    columns = [col for col in columns if col in df.columns]
    df = df[columns]
    
    # Convert timestamp
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Save to CSV
    df.to_csv(filename, index=False)
    print(f"✅ Data saved to {filename}")
    print(f"\nDataset shape: {df.shape}")
    print(f"\nFirst few rows:")
    print(df.head())
    print(f"\nBasic statistics:")
    print(df.describe())

def main():
    # Fetch data
    records = fetch_all_data(limit=1000)  # Adjust limit as needed
    
    # Save to CSV
    if records:
        save_to_csv(records)
        print("\n✅ Ready for machine learning!")
        print("Next steps:")
        print("1. Open sensor_data.csv in Excel/Python")
        print("2. Analyze patterns")
        print("3. Train ML model")

if __name__ == "__main__":
    main()
