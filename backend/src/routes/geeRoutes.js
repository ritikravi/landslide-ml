import express from 'express';
import {
  getGPMRainfall,
  getVegetationHealth,
  getRainfallSummary,
  getCombinedAnalysis,
  checkGEEHealth
} from '../services/geeService.js';

const router = express.Router();

// Health check
router.get('/health', async (req, res) => {
  const health = await checkGEEHealth();
  res.json(health);
});

// Get GPM rainfall (near real-time)
router.get('/rainfall', async (req, res) => {
  const { lat = 30.97, lon = 76.52, hours = 24 } = req.query;
  const data = await getGPMRainfall(parseFloat(lat), parseFloat(lon), parseInt(hours));
  
  if (data) {
    res.json({ success: true, ...data });
  } else {
    res.status(503).json({ success: false, error: 'Earth Engine service unavailable' });
  }
});

// Get vegetation health (NDVI)
router.get('/vegetation', async (req, res) => {
  const { lat = 30.97, lon = 76.52 } = req.query;
  const data = await getVegetationHealth(parseFloat(lat), parseFloat(lon));
  
  if (data) {
    res.json({ success: true, ...data });
  } else {
    res.status(503).json({ success: false, error: 'Earth Engine service unavailable' });
  }
});

// Get rainfall summary (3h, 24h, 7d)
router.get('/rainfall/summary', async (req, res) => {
  const { lat = 30.97, lon = 76.52 } = req.query;
  const data = await getRainfallSummary(parseFloat(lat), parseFloat(lon));
  
  if (data) {
    res.json({ success: true, ...data });
  } else {
    res.status(503).json({ success: false, error: 'Earth Engine service unavailable' });
  }
});

// Get combined analysis for ML
router.get('/analysis', async (req, res) => {
  const { lat = 30.97, lon = 76.52 } = req.query;
  const data = await getCombinedAnalysis(parseFloat(lat), parseFloat(lon));
  
  if (data) {
    res.json({ success: true, ...data });
  } else {
    res.status(503).json({ success: false, error: 'Earth Engine service unavailable' });
  }
});

export default router;
