import MLPrediction from '../models/MLPrediction.js';
import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

export class MLService {
  /**
   * Use trained ML model via Python API
   */
  async getPredictionFromModel(sensorData) {
    try {
      const response = await axios.post(`${ML_API_URL}/predict`, {
        soilMoisture: sensorData.soilMoisture,
        waterLevel: sensorData.waterLevel || 0,
        tilt: sensorData.tilt || 0,
        vibration: sensorData.vibration || 0,
        ultrasonicDistance: sensorData.ultrasonicDistance || 0
      }, {
        timeout: 5000
      });
      
      if (response.data.success) {
        return response.data.prediction;
      }
      
      throw new Error('ML API returned unsuccessful response');
    } catch (error) {
      console.warn('ML API unavailable, using fallback calculation:', error.message);
      return this.fallbackCalculation(sensorData);
    }
  }

  /**
   * Fallback: Calculate landslide risk score based on sensor data
   * Used when ML API is unavailable
   */
  fallbackCalculation(sensorData) {
    const weights = {
      soilMoisture: 0.35,
      waterLevel: 0.25,
      tilt: 0.20,
      vibration: 0.10,
      displacement: 0.10
    };

    // Normalize values to 0-100 scale
    const normalizedMoisture = sensorData.soilMoisture || 0;
    const normalizedWaterLevel = Math.min((sensorData.waterLevel || 0) * 5, 100);
    const normalizedTilt = Math.min((sensorData.tilt || 0) * 10, 100);
    const normalizedVibration = Math.min((sensorData.vibration || 0) * 10, 100);
    
    // Displacement: calculated from ultrasonic distance change
    const normalizedDisplacement = sensorData.ultrasonicDistance 
      ? Math.max(0, 100 - sensorData.ultrasonicDistance) 
      : 0;

    const riskScore = Math.round(
      normalizedMoisture * weights.soilMoisture +
      normalizedWaterLevel * weights.waterLevel +
      normalizedTilt * weights.tilt +
      normalizedVibration * weights.vibration +
      normalizedDisplacement * weights.displacement
    );

    const finalScore = Math.min(riskScore, 100);
    
    return {
      riskLevel: this.getRiskLevel(finalScore),
      riskScore: finalScore,
      confidence: 75, // Lower confidence for fallback
      features: sensorData
    };
  }

  /**
   * Calculate landslide risk score based on sensor data
   * Formula: weighted sum of normalized sensor values
   */
  calculateRiskScore(sensorData) {
    const weights = {
      soilMoisture: 0.35,
      waterLevel: 0.25,
      tilt: 0.20,
      vibration: 0.10,
      displacement: 0.10
    };

    // Normalize values to 0-100 scale
    const normalizedMoisture = sensorData.soilMoisture || 0;
    const normalizedWaterLevel = Math.min((sensorData.waterLevel || 0) * 5, 100);
    const normalizedTilt = Math.min((sensorData.tilt || 0) * 10, 100);
    const normalizedVibration = Math.min((sensorData.vibration || 0) * 10, 100);
    
    // Displacement: calculated from ultrasonic distance change (lower distance = higher risk)
    const normalizedDisplacement = sensorData.ultrasonicDistance 
      ? Math.max(0, 100 - sensorData.ultrasonicDistance) 
      : 0;

    const riskScore = Math.round(
      normalizedMoisture * weights.soilMoisture +
      normalizedWaterLevel * weights.waterLevel +
      normalizedTilt * weights.tilt +
      normalizedVibration * weights.vibration +
      normalizedDisplacement * weights.displacement
    );

    return Math.min(riskScore, 100);
  }

  /**
   * Determine risk level from risk score
   */
  getRiskLevel(riskScore) {
    if (riskScore >= 81) return 'CRITICAL';
    if (riskScore >= 61) return 'HIGH';
    if (riskScore >= 31) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Extract ML-ready features from sensor data
   */
  extractFeatures(sensorData, previousData = null) {
    const features = {
      currentMoisture: sensorData.soilMoisture,
      currentWaterLevel: sensorData.waterLevel || 0,
      currentTilt: sensorData.tilt || 0,
      currentVibration: sensorData.vibration || 0,
      currentDisplacement: sensorData.ultrasonicDistance || 0
    };

    // Calculate change rates if previous data available
    if (previousData) {
      features.moistureChangeRate = sensorData.soilMoisture - (previousData.soilMoisture || 0);
      features.tiltChangeRate = (sensorData.tilt || 0) - (previousData.tilt || 0);
      features.vibrationFrequency = sensorData.vibration || 0;
    }

    return features;
  }

  /**
   * Generate and save ML prediction
   */
  async generatePrediction(sensorData, previousData = null) {
    // Try to get prediction from trained ML model
    const mlPrediction = await this.getPredictionFromModel(sensorData);
    
    const riskScore = mlPrediction.riskScore;
    const riskLevel = mlPrediction.riskLevel;
    const features = this.extractFeatures(sensorData, previousData);

    const prediction = new MLPrediction({
      riskScore,
      riskLevel,
      sensorDataId: sensorData._id,
      features: {
        ...features,
        confidence: mlPrediction.confidence,
        modelUsed: mlPrediction.confidence > 80 ? 'RandomForest' : 'Fallback'
      }
    });

    await prediction.save();
    return prediction;
  }

  /**
   * Get latest prediction
   */
  async getLatestPrediction() {
    return await MLPrediction.findOne()
      .sort({ timestamp: -1 })
      .populate('sensorDataId');
  }

  /**
   * Get prediction history
   */
  async getPredictionHistory(limit = 100) {
    return await MLPrediction.find()
      .sort({ timestamp: -1 })
      .limit(limit);
  }
}

export default new MLService();
