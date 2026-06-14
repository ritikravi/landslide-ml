import Alert from '../models/Alert.js';

export class AlertService {
  async generateAlertsFromSensorData(sensorData) {
    const alerts = [];

    // High moisture alert
    if (sensorData.soilMoisture > 80) {
      alerts.push({
        message: `Critical soil moisture detected: ${sensorData.soilMoisture}%`,
        severity: 'CRITICAL',
        sensorDataId: sensorData._id,
        metadata: { soilMoisture: sensorData.soilMoisture }
      });
    } else if (sensorData.soilMoisture > 70) {
      alerts.push({
        message: `High soil moisture: ${sensorData.soilMoisture}%`,
        severity: 'WARNING',
        sensorDataId: sensorData._id,
        metadata: { soilMoisture: sensorData.soilMoisture }
      });
    }

    // Tilt alert
    if (sensorData.tilt > 5) {
      alerts.push({
        message: `Slope movement detected: ${sensorData.tilt}° tilt`,
        severity: 'CRITICAL',
        sensorDataId: sensorData._id,
        metadata: { tilt: sensorData.tilt }
      });
    } else if (sensorData.tilt > 3) {
      alerts.push({
        message: `Elevated slope tilt: ${sensorData.tilt}°`,
        severity: 'WARNING',
        sensorDataId: sensorData._id,
        metadata: { tilt: sensorData.tilt }
      });
    }

    // Vibration alert
    if (sensorData.vibration > 5) {
      alerts.push({
        message: `Ground disturbance detected: vibration level ${sensorData.vibration}`,
        severity: 'CRITICAL',
        sensorDataId: sensorData._id,
        metadata: { vibration: sensorData.vibration }
      });
    }

    // Save alerts if any generated
    if (alerts.length > 0) {
      return await Alert.insertMany(alerts);
    }

    return [];
  }

  async getRecentAlerts(limit = 50) {
    return await Alert.find()
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async getUnresolvedAlerts() {
    return await Alert.find({ isResolved: false })
      .sort({ timestamp: -1 });
  }
}

export default new AlertService();
