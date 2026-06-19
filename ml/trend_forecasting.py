#!/usr/bin/env python3
"""
Trend-Based Forecasting Module
Analyzes time-series data to predict future risk levels
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression

class TrendForecaster:
    def __init__(self):
        self.min_data_points = 5  # Minimum points needed for trend analysis
        
    def calculate_trend(self, values, timestamps):
        """
        Calculate trend (slope) from time-series data
        Returns: slope, intercept, r_squared
        """
        if len(values) < self.min_data_points:
            return 0, values[-1] if values else 0, 0
        
        # Convert timestamps to numeric (minutes from first reading)
        time_numeric = [(t - timestamps[0]).total_seconds() / 60 for t in timestamps]
        
        # Fit linear regression
        X = np.array(time_numeric).reshape(-1, 1)
        y = np.array(values)
        
        model = LinearRegression()
        model.fit(X, y)
        
        slope = model.coef_[0]
        intercept = model.intercept_
        r_squared = model.score(X, y)
        
        return slope, intercept, r_squared
    
    def predict_future_value(self, current_value, slope, minutes_ahead):
        """
        Predict value after X minutes based on current trend
        """
        return current_value + (slope * minutes_ahead)
    
    def analyze_sensor_trend(self, history):
        """
        Analyze trend for each sensor from historical data
        
        Args:
            history: List of sensor readings with timestamps
            
        Returns:
            Dictionary with trend analysis for each sensor
        """
        if not history or len(history) < self.min_data_points:
            return None
        
        # Extract data
        timestamps = [reading['timestamp'] for reading in history]
        soil_values = [reading['soilMoisture'] for reading in history]
        water_values = [reading['waterLevel'] for reading in history]
        tilt_values = [reading['tilt'] for reading in history]
        vibration_values = [reading['vibration'] for reading in history]
        
        # Calculate trends
        soil_slope, soil_intercept, soil_r2 = self.calculate_trend(soil_values, timestamps)
        water_slope, water_intercept, water_r2 = self.calculate_trend(water_values, timestamps)
        tilt_slope, tilt_intercept, tilt_r2 = self.calculate_trend(tilt_values, timestamps)
        vibration_slope, vibration_intercept, vibration_r2 = self.calculate_trend(vibration_values, timestamps)
        
        return {
            'soilMoisture': {
                'current': soil_values[-1],
                'slope': float(soil_slope),
                'trend': 'increasing' if soil_slope > 0.1 else ('decreasing' if soil_slope < -0.1 else 'stable'),
                'confidence': float(soil_r2)
            },
            'waterLevel': {
                'current': water_values[-1],
                'slope': float(water_slope),
                'trend': 'increasing' if water_slope > 0.1 else ('decreasing' if water_slope < -0.1 else 'stable'),
                'confidence': float(water_r2)
            },
            'tilt': {
                'current': tilt_values[-1],
                'slope': float(tilt_slope),
                'trend': 'increasing' if tilt_slope > 0.05 else ('decreasing' if tilt_slope < -0.05 else 'stable'),
                'confidence': float(tilt_r2)
            },
            'vibration': {
                'current': vibration_values[-1],
                'slope': float(vibration_slope),
                'trend': 'increasing' if vibration_slope > 0.1 else ('decreasing' if vibration_slope < -0.1 else 'stable'),
                'confidence': float(vibration_r2)
            }
        }
    
    def forecast_risk(self, model, current_data, trends, forecast_minutes=[30, 60, 120]):
        """
        Forecast future risk levels based on trends
        
        Args:
            model: Trained ML model
            current_data: Current sensor readings
            trends: Trend analysis from analyze_sensor_trend()
            forecast_minutes: List of time intervals to forecast (in minutes)
            
        Returns:
            List of forecasts with timestamps and predictions
        """
        if not trends:
            return []
        
        forecasts = []
        
        for minutes in forecast_minutes:
            # Predict future sensor values
            future_soil = self.predict_future_value(
                current_data['soilMoisture'],
                trends['soilMoisture']['slope'],
                minutes
            )
            future_water = self.predict_future_value(
                current_data['waterLevel'],
                trends['waterLevel']['slope'],
                minutes
            )
            future_tilt = self.predict_future_value(
                current_data['tilt'],
                trends['tilt']['slope'],
                minutes
            )
            future_vibration = self.predict_future_value(
                current_data['vibration'],
                trends['vibration']['slope'],
                minutes
            )
            
            # Clip values to realistic ranges
            future_soil = np.clip(future_soil, 0, 100)
            future_water = np.clip(future_water, 0, 100)
            future_tilt = np.clip(future_tilt, 0, 90)
            future_vibration = np.clip(future_vibration, 0, 100)
            
            # Prepare features for prediction
            features = pd.DataFrame([{
                'soilMoisture': future_soil,
                'waterLevel': future_water,
                'tilt': future_tilt,
                'vibration': future_vibration,
                'ultrasonicDistance': current_data.get('ultrasonicDistance', 0)
            }])
            
            # Make prediction
            prediction = model.predict(features)[0]
            probabilities = model.predict_proba(features)[0]
            confidence = float(max(probabilities) * 100)
            
            # Calculate risk score
            risk_score_map = {'LOW': 20, 'MEDIUM': 50, 'HIGH': 75, 'CRITICAL': 95}
            base_score = risk_score_map.get(prediction, 20)
            risk_score = int(base_score * (confidence / 100))
            
            # Calculate average trend confidence
            avg_trend_confidence = np.mean([
                trends['soilMoisture']['confidence'],
                trends['waterLevel']['confidence'],
                trends['tilt']['confidence'],
                trends['vibration']['confidence']
            ])
            
            forecasts.append({
                'timeAhead': minutes,
                'timestamp': (datetime.now() + timedelta(minutes=minutes)).isoformat(),
                'riskLevel': prediction,
                'riskScore': risk_score,
                'confidence': round(confidence * avg_trend_confidence, 2),
                'predictedValues': {
                    'soilMoisture': round(future_soil, 2),
                    'waterLevel': round(future_water, 2),
                    'tilt': round(future_tilt, 2),
                    'vibration': round(future_vibration, 2)
                }
            })
        
        return forecasts
    
    def generate_warning_message(self, current_risk, forecasts, trends):
        """
        Generate human-readable warning based on trends and forecasts
        """
        if not forecasts:
            return None
        
        warnings = []
        
        # Check if risk is escalating
        future_risks = [f['riskLevel'] for f in forecasts]
        risk_levels = {'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3}
        current_level = risk_levels.get(current_risk, 0)
        
        for i, forecast in enumerate(forecasts):
            future_level = risk_levels.get(forecast['riskLevel'], 0)
            
            if future_level > current_level:
                time_str = f"{forecast['timeAhead']} minutes" if forecast['timeAhead'] < 60 else f"{forecast['timeAhead']//60} hours"
                warnings.append({
                    'severity': forecast['riskLevel'],
                    'message': f"Risk may escalate to {forecast['riskLevel']} in {time_str}",
                    'confidence': forecast['confidence']
                })
        
        # Check concerning trends
        concerning_sensors = []
        if trends['soilMoisture']['trend'] == 'increasing' and trends['soilMoisture']['current'] > 60:
            concerning_sensors.append('Soil Moisture rising rapidly')
        if trends['waterLevel']['trend'] == 'increasing' and trends['waterLevel']['current'] > 50:
            concerning_sensors.append('Water Level increasing')
        if trends['tilt']['trend'] == 'increasing' and trends['tilt']['current'] > 10:
            concerning_sensors.append('Ground tilt angle increasing')
        if trends['vibration']['current'] > 5:
            concerning_sensors.append('High vibration activity detected')
        
        if concerning_sensors:
            warnings.append({
                'severity': 'WARNING',
                'message': ', '.join(concerning_sensors),
                'confidence': 85
            })
        
        return warnings if warnings else None
