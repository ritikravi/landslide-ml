import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import satelliteMlService from '../services/satelliteMlService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load hazard zones data
let hazardZones = [];

async function loadHazardZones() {
  try {
    const dataPath = path.join(__dirname, '../../data/hazard_zones.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    hazardZones = JSON.parse(data);
    console.log(`✅ Loaded ${hazardZones.length} hazard zones`);
  } catch (error) {
    console.error('Error loading hazard zones:', error);
    hazardZones = [];
  }
}

// Load on startup
loadHazardZones();

/**
 * GET /api/hazard-zones
 * Get all hazard zones
 */
router.get('/hazard-zones', async (req, res) => {
  try {
    const { country, riskLevel, region } = req.query;

    let filtered = hazardZones;

    if (country) {
      filtered = filtered.filter(z => 
        z.country.toLowerCase().includes(country.toLowerCase())
      );
    }

    if (riskLevel) {
      filtered = filtered.filter(z => 
        z.riskLevel === riskLevel.toUpperCase()
      );
    }

    if (region) {
      filtered = filtered.filter(z =>
        z.region.toLowerCase().includes(region.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      zones: filtered
    });
  } catch (error) {
    console.error('Error fetching hazard zones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/hazard-zones/:id
 * Get a specific hazard zone by ID
 */
router.get('/hazard-zones/:id', async (req, res) => {
  try {
    const zone = hazardZones.find(z => z.id === req.params.id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Hazard zone not found'
      });
    }

    res.json({
      success: true,
      zone
    });
  } catch (error) {
    console.error('Error fetching hazard zone:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/hazard-zones/:id/live-report
 * Get live satellite report for a hazard zone
 */
router.get('/hazard-zones/:id/live-report', async (req, res) => {
  try {
    const zone = hazardZones.find(z => z.id === req.params.id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Hazard zone not found'
      });
    }

    // Get live satellite prediction
    const prediction = await satelliteMlService.predictFromSatellite(
      zone.coordinates.lat,
      zone.coordinates.lon
    );

    if (!prediction.success) {
      return res.status(500).json({
        success: false,
        error: 'Unable to fetch live data'
      });
    }

    // Combine zone info with live prediction
    const report = {
      zone: {
        id: zone.id,
        name: zone.name,
        region: zone.region,
        country: zone.country,
        coordinates: zone.coordinates,
        staticRiskLevel: zone.riskLevel,
        description: zone.description,
        population: zone.population,
        vulnerableArea: zone.vulnerableArea
      },
      liveData: prediction.prediction,
      historicalEvents: zone.historicalEvents,
      monitoringStatus: zone.monitoringStatus,
      tags: zone.tags,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating live report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/hazard-zones/stats/summary
 * Get summary statistics
 */
router.get('/hazard-zones/stats/summary', async (req, res) => {
  try {
    const stats = {
      total: hazardZones.length,
      byRiskLevel: {
        CRITICAL: hazardZones.filter(z => z.riskLevel === 'CRITICAL').length,
        HIGH: hazardZones.filter(z => z.riskLevel === 'HIGH').length,
        MEDIUM: hazardZones.filter(z => z.riskLevel === 'MEDIUM').length,
        LOW: hazardZones.filter(z => z.riskLevel === 'LOW').length
      },
      byCountry: {},
      totalPopulation: hazardZones.reduce((sum, z) => {
        const pop = parseInt(z.population.replace(/[^0-9]/g, '')) || 0;
        return sum + pop;
      }, 0)
    };

    // Count by country
    hazardZones.forEach(zone => {
      stats.byCountry[zone.country] = (stats.byCountry[zone.country] || 0) + 1;
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error generating stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
