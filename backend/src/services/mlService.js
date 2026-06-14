import MLPrediction from '../models/MLPrediction.js';

export class MLService {
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
    const riskScore = this.calculateRiskScore(sensorData);
    const riskLevel = this.getRiskLevel(riskScore);
    const features = this.extractFeatures(sensorData, previousData);

    const prediction = new MLPrediction({
      riskScore,
      riskLevel,
      sensorDataId: sensorData._id,
      features
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
