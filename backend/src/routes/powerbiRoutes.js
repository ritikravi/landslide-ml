import express from 'express';
import {
  getSensorStatistics,
  getTimeSeriesData,
  getRiskDistribution,
  getMLMetrics,
  getSensorCorrelation,
  getGPSData,
  getAlertSummary,
  getAggregatedReport
} from '../controllers/powerbiController.js';

const router = express.Router();

/**
 * Power BI API Routes
 * All routes are READ-ONLY
 * Base path: /api/powerbi
 */

// KPI Statistics
router.get('/statistics', getSensorStatistics);

// Time Series Data for Charts
router.get('/timeseries', getTimeSeriesData);

// Risk Distribution
router.get('/risk-distribution', getRiskDistribution);

// ML Model Metrics
router.get('/ml-metrics', getMLMetrics);

// Sensor Correlation Matrix
router.get('/correlation', getSensorCorrelation);

// GPS Location Data
router.get('/gps-data', getGPSData);

// Alert Summary
router.get('/alerts-summary', getAlertSummary);

// Aggregated Reports (Daily/Weekly/Monthly)
router.get('/reports/aggregated', getAggregatedReport);

export default router;
