import express from 'express';
import weatherService from '../services/weatherService.js';
import SensorData from '../models/SensorData.js';

const router = express.Router();

/**
 * GET /api/weather/current
 * Returns current weather for the sensor's last known GPS location
 * Falls back to default location if no GPS fix
 */
router.get('/weather/current', async (req, res) => {
  try {
    // Get latest sensor reading with GPS
    const latest = await SensorData.findOne({
      latitude:  { $exists: true, $ne: 0 },
      longitude: { $exists: true, $ne: 0 }
    }).sort({ timestamp: -1 });

    let weather;
    if (latest?.latitude && latest?.longitude) {
      weather = await weatherService.getWeatherForLocation(
        latest.latitude,
        latest.longitude
      );
    } else {
      // No GPS fix — use default location
      weather = await weatherService.getDefaultWeather();
    }

    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/weather/risk-boost
 * Returns weather risk contribution to landslide score
 */
router.get('/weather/risk-boost', async (req, res) => {
  try {
    const weather   = await weatherService.getDefaultWeather();
    const riskBoost = weatherService.calculateWeatherRiskBoost(weather);

    res.json({
      success: true,
      data: {
        riskBoost,
        rainfall:     weather.rainfall1h,
        humidity:     weather.humidity,
        rainfallRisk: weather.rainfallRisk
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
