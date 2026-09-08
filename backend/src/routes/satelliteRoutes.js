import express from 'express';
import satelliteService from '../services/satelliteService.js';

const router = express.Router();

/**
 * GET /api/satellite/latest
 * Get latest satellite data for a location
 */
router.get('/satellite/latest', async (req, res, next) => {
  try {
    const { lat = 30.97, lon = 76.52 } = req.query;
    
    const data = await satelliteService.getLatestData(
      parseFloat(lat),
      parseFloat(lon)
    );
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No satellite data found for this location'
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/satellite/history
 * Get historical satellite data
 */
router.get('/satellite/history', async (req, res, next) => {
  try {
    const { lat = 30.97, lon = 76.52, days = 30 } = req.query;
    
    const data = await satelliteService.getHistoricalData(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(days)
    );
    
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/satellite/rainfall-summary
 * Get rainfall summary for ML integration
 */
router.get('/satellite/rainfall-summary', async (req, res, next) => {
  try {
    const { lat = 30.97, lon = 76.52 } = req.query;
    
    const summary = await satelliteService.getRainfallSummary(
      parseFloat(lat),
      parseFloat(lon)
    );
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Unable to get rainfall summary'
      });
    }
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/satellite/update
 * Manually trigger satellite data update
 */
router.post('/satellite/update', async (req, res, next) => {
  try {
    const { lat = 30.97, lon = 76.52, days = 30 } = req.body;
    
    console.log(`📡 Manual update requested for (${lat}, ${lon})`);
    
    const records = await satelliteService.updateSatelliteData(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(days)
    );
    
    res.json({
      success: true,
      message: `Updated ${records.length} satellite data records`,
      count: records.length,
      latestDate: records[0]?.dataDate
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/satellite/status
 * Check if satellite data is up to date
 */
router.get('/satellite/status', async (req, res, next) => {
  try {
    const { lat = 30.97, lon = 76.52 } = req.query;
    
    const needsUpdate = await satelliteService.needsUpdate(
      parseFloat(lat),
      parseFloat(lon)
    );
    
    const latest = await satelliteService.getLatestData(
      parseFloat(lat),
      parseFloat(lon)
    );
    
    res.json({
      success: true,
      needsUpdate,
      latestDataDate: latest?.dataDate,
      dataAge: latest ? Math.floor((Date.now() - latest.dataDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
