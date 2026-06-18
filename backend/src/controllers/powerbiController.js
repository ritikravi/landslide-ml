import SensorData from '../models/SensorData.js';
import MLPrediction from '../models/MLPrediction.js';
import Alert from '../models/Alert.js';

/**
 * Power BI Integration Controller
 * READ-ONLY endpoints for Power BI dashboard
 * Does NOT modify existing APIs
 */

// Get aggregated sensor statistics for KPI cards
export const getSensorStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Get all sensor data for the period
    const sensorData = await SensorData.find(dateFilter);
    const predictions = await MLPrediction.find(dateFilter);
    const alerts = await Alert.find(dateFilter);

    // Calculate statistics
    const stats = {
      totalRecords: sensorData.length,
      averageSoilMoisture: calculateAverage(sensorData, 'soilMoisture'),
      averageWaterLevel: calculateAverage(sensorData, 'waterLevel'),
      maximumTilt: Math.max(...sensorData.map(d => d.tilt || 0)),
      averageTilt: calculateAverage(sensorData, 'tilt'),
      totalVibrationEvents: sensorData.reduce((sum, d) => sum + (d.vibration || 0), 0),
      averageDistance: calculateAverage(sensorData, 'ultrasonicDistance'),
      currentRiskScore: predictions.length > 0 ? predictions[predictions.length - 1].riskScore : 0,
      averageRiskScore: calculateAverage(predictions, 'riskScore'),
      totalAlerts: alerts.length,
      unresolvedAlerts: alerts.filter(a => !a.resolved).length,
      sensorHealthStatus: calculateSensorHealth(sensorData),
      lastUpdateTime: sensorData.length > 0 ? sensorData[sensorData.length - 1].timestamp : null
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Get time-series data for trend analysis
export const getTimeSeriesData = async (req, res, next) => {
  try {
    const { startDate, endDate, interval = 'hour' } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const data = await SensorData.find(dateFilter)
      .sort({ timestamp: 1 })
      .select('timestamp soilMoisture waterLevel tilt vibration ultrasonicDistance');

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Get risk distribution data
export const getRiskDistribution = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const predictions = await MLPrediction.find(dateFilter);

    const distribution = {
      LOW: predictions.filter(p => p.riskLevel === 'LOW').length,
      MEDIUM: predictions.filter(p => p.riskLevel === 'MEDIUM').length,
      HIGH: predictions.filter(p => p.riskLevel === 'HIGH').length,
      CRITICAL: predictions.filter(p => p.riskLevel === 'CRITICAL').length
    };

    const distributionArray = Object.entries(distribution).map(([level, count]) => ({
      riskLevel: level,
      count,
      percentage: predictions.length > 0 ? ((count / predictions.length) * 100).toFixed(2) : 0
    }));

    res.json({
      success: true,
      total: predictions.length,
      data: distributionArray
    });
  } catch (error) {
    next(error);
  }
};

// Get ML model performance metrics
export const getMLMetrics = async (req, res, next) => {
  try {
    const predictions = await MLPrediction.find().sort({ timestamp: -1 }).limit(1000);

    const metrics = {
      totalPredictions: predictions.length,
      averageConfidence: calculateAverage(predictions, 'features.confidence'),
      modelUsageStats: {
        randomForest: predictions.filter(p => p.features?.modelUsed === 'RandomForest').length,
        fallback: predictions.filter(p => p.features?.modelUsed === 'Fallback').length
      },
      confidenceDistribution: {
        high: predictions.filter(p => (p.features?.confidence || 0) >= 90).length,
        medium: predictions.filter(p => (p.features?.confidence || 0) >= 70 && (p.features?.confidence || 0) < 90).length,
        low: predictions.filter(p => (p.features?.confidence || 0) < 70).length
      },
      riskScoreStats: {
        min: Math.min(...predictions.map(p => p.riskScore)),
        max: Math.max(...predictions.map(p => p.riskScore)),
        average: calculateAverage(predictions, 'riskScore')
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

// Get sensor correlation data
export const getSensorCorrelation = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 500;
    
    const data = await SensorData.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('soilMoisture waterLevel tilt vibration ultrasonicDistance');

    const predictions = await MLPrediction.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('riskScore');

    const correlationData = data.map((sensor, index) => ({
      soilMoisture: sensor.soilMoisture,
      waterLevel: sensor.waterLevel,
      tilt: sensor.tilt || 0,
      vibration: sensor.vibration || 0,
      ultrasonicDistance: sensor.ultrasonicDistance || 0,
      riskScore: predictions[index]?.riskScore || 0
    }));

    res.json({
      success: true,
      count: correlationData.length,
      data: correlationData
    });
  } catch (error) {
    next(error);
  }
};

// Get GPS location data for mapping
export const getGPSData = async (req, res, next) => {
  try {
    const data = await SensorData.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    })
      .sort({ timestamp: -1 })
      .limit(1000)
      .select('timestamp latitude longitude soilMoisture waterLevel tilt');

    // Get associated predictions
    const dataWithRisk = await Promise.all(
      data.map(async (sensor) => {
        const prediction = await MLPrediction.findOne({ sensorDataId: sensor._id });
        return {
          latitude: sensor.latitude,
          longitude: sensor.longitude,
          timestamp: sensor.timestamp,
          soilMoisture: sensor.soilMoisture,
          waterLevel: sensor.waterLevel,
          tilt: sensor.tilt,
          riskLevel: prediction?.riskLevel || 'LOW',
          riskScore: prediction?.riskScore || 0
        };
      })
    );

    res.json({
      success: true,
      count: dataWithRisk.length,
      data: dataWithRisk
    });
  } catch (error) {
    next(error);
  }
};

// Get alert summary for reports
export const getAlertSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const alerts = await Alert.find(dateFilter);

    const summary = {
      total: alerts.length,
      resolved: alerts.filter(a => a.resolved).length,
      unresolved: alerts.filter(a => !a.resolved).length,
      bySeverity: {
        HIGH: alerts.filter(a => a.severity === 'HIGH').length,
        MEDIUM: alerts.filter(a => a.severity === 'MEDIUM').length,
        LOW: alerts.filter(a => a.severity === 'LOW').length
      },
      byType: {}
    };

    // Group by alert type
    alerts.forEach(alert => {
      const type = alert.type || 'UNKNOWN';
      summary.byType[type] = (summary.byType[type] || 0) + 1;
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// Get daily/weekly/monthly aggregated report data
export const getAggregatedReport = async (req, res, next) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const sensorData = await SensorData.find(dateFilter).sort({ timestamp: 1 });
    const predictions = await MLPrediction.find(dateFilter).sort({ timestamp: 1 });
    const alerts = await Alert.find(dateFilter);

    // Group by period
    const groupedData = groupByPeriod(sensorData, predictions, alerts, period);

    res.json({
      success: true,
      period,
      data: groupedData
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function calculateAverage(data, field) {
  if (data.length === 0) return 0;
  
  const values = data.map(item => {
    // Handle nested fields like 'features.confidence'
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = item;
      for (const part of parts) {
        value = value?.[part];
      }
      return value || 0;
    }
    return item[field] || 0;
  });
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return (sum / values.length).toFixed(2);
}

function calculateSensorHealth(data) {
  if (data.length === 0) return 'NO_DATA';
  
  const latest = data[data.length - 1];
  const timeSinceUpdate = Date.now() - new Date(latest.timestamp).getTime();
  const minutesSinceUpdate = timeSinceUpdate / (1000 * 60);
  
  if (minutesSinceUpdate < 2) return 'EXCELLENT';
  if (minutesSinceUpdate < 5) return 'GOOD';
  if (minutesSinceUpdate < 15) return 'FAIR';
  return 'POOR';
}

function groupByPeriod(sensorData, predictions, alerts, period) {
  const grouped = {};
  
  sensorData.forEach(sensor => {
    const key = getPeriodKey(new Date(sensor.timestamp), period);
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        sensorReadings: [],
        predictions: [],
        alerts: []
      };
    }
    grouped[key].sensorReadings.push(sensor);
  });
  
  predictions.forEach(pred => {
    const key = getPeriodKey(new Date(pred.timestamp), period);
    if (grouped[key]) {
      grouped[key].predictions.push(pred);
    }
  });
  
  alerts.forEach(alert => {
    const key = getPeriodKey(new Date(alert.timestamp), period);
    if (grouped[key]) {
      grouped[key].alerts.push(alert);
    }
  });
  
  // Calculate aggregates for each period
  return Object.values(grouped).map(group => ({
    period: group.period,
    avgSoilMoisture: calculateAverage(group.sensorReadings, 'soilMoisture'),
    avgWaterLevel: calculateAverage(group.sensorReadings, 'waterLevel'),
    avgTilt: calculateAverage(group.sensorReadings, 'tilt'),
    avgRiskScore: calculateAverage(group.predictions, 'riskScore'),
    totalAlerts: group.alerts.length,
    sensorReadings: group.sensorReadings.length
  }));
}

function getPeriodKey(date, period) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (period) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      const weekNum = getWeekNumber(date);
      return `${year}-W${String(weekNum).padStart(2, '0')}`;
    case 'monthly':
      return `${year}-${month}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
