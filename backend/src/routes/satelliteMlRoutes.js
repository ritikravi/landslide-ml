import express from 'express';
import satelliteMlService from '../services/satelliteMlService.js';

const router = express.Router();

/**
 * POST /api/satellite-ml/predict
 * Get live satellite-based landslide prediction for a location
 */
router.post('/satellite-ml/predict', async (req, res) => {
  try {
    const { lat, lon, sensorData } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const prediction = await satelliteMlService.predictFromSatellite(
      parseFloat(lat),
      parseFloat(lon),
      sensorData
    );

    res.json(prediction);
  } catch (error) {
    console.error('Satellite ML prediction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/satellite-ml/data
 * Get raw satellite data for a location
 */
router.get('/satellite-ml/data', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const data = await satelliteMlService.getSatelliteData(
      parseFloat(lat),
      parseFloat(lon)
    );

    if (!data) {
      return res.status(500).json({
        success: false,
        error: 'Unable to fetch satellite data'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Satellite data error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
