import SensorData from '../models/SensorData.js';
import alertService from '../services/alertService.js';
import mlService from '../services/mlService.js';

export const submitSensorData = async (req, res, next) => {
  try {
    // Map 'distance' from ESP32 to 'ultrasonicDistance' in database
    if (req.body.distance !== undefined) {
      req.body.ultrasonicDistance = req.body.distance;
      delete req.body.distance;
    }
    
    const sensorData = new SensorData(req.body);
    await sensorData.save();

    // Get previous data for trend analysis
    const previousData = await SensorData.findOne({ _id: { $ne: sensorData._id } })
      .sort({ timestamp: -1 });

    // Generate alerts
    const alerts = await alertService.generateAlertsFromSensorData(sensorData);

    // Generate ML prediction
    const prediction = await mlService.generatePrediction(sensorData, previousData);

    // Emit real-time update via Socket.IO
    if (req.io) {
      req.io.emit('sensor-update', {
        sensorData,
        alerts,
        prediction
      });
    }

    res.status(201).json({
      success: true,
      data: {
        sensorData,
        alerts,
        prediction
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestSensorData = async (req, res, next) => {
  try {
    const latestData = await SensorData.findOne().sort({ timestamp: -1 });
    
    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'No sensor data found'
      });
    }

    res.json({
      success: true,
      data: latestData
    });
  } catch (error) {
    next(error);
  }
};

export const getSensorHistory = async (req, res, next) => {
  try {
    const { limit = 100, startDate, endDate } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Get total count
    const totalCount = await SensorData.countDocuments(query);

    const history = await SensorData.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: history.length,
      total: totalCount,
      data: history
    });
  } catch (error) {
    next(error);
  }
};
