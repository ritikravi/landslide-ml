/**
 * ML Service - Production ML API Integration
 * Connects to: https://landslide-ml-api.onrender.com
 * 
 * Features:
 * - Real-time risk predictions
 * - SHAP explainability
 * - Anomaly detection
 * - Trend forecasting
 */

import { mlAPI } from './api';

/**
 * Get ML prediction from production model
 * @param {Object} sensorData - Current sensor readings
 * @param {Array} history - Optional historical readings for trend analysis
 * @returns {Promise<Object>} Prediction with risk level, SHAP explanation, anomalies
 */
export const getPrediction = async (sensorData, history = []) => {
  try {
    const result = await mlAPI.predict({
      ...sensorData,
      history
    });

    if (!result.success) {
      throw new Error(result.error || 'Prediction failed');
    }

    // Map numeric risk levels to strings (backward compatibility)
    let riskLevel = result.prediction.riskLevel;
    if (riskLevel === '0' || riskLevel === 0) riskLevel = 'LOW';
    if (riskLevel === '1' || riskLevel === 1) riskLevel = 'HIGH';

    return {
      success: true,
      data: {
        // Risk Assessment
        riskLevel: riskLevel,
        riskScore: result.prediction.riskScore,
        confidence: result.prediction.confidence,
        
        // SHAP Explainability
        explanation: result.prediction.shapExplanation?.explanation,
        topFactors: result.prediction.shapExplanation?.topFactors || [],
        contributions: result.prediction.shapExplanation?.contributions || {},
        
        // Anomaly Detection
        anomaly: result.prediction.anomaly || null,
        
        // Feature Data
        features: result.prediction.features,
        featureImportance: result.prediction.featureImportance,
        
        // Trends & Forecasts (if history provided)
        trends: result.prediction.trends || null,
        forecasts: result.prediction.forecasts || [],
        warnings: result.prediction.warnings || []
      }
    };
  } catch (error) {
    console.error('ML Prediction Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get prediction',
      data: null
    };
  }
};

/**
 * Check ML API health status
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await mlAPI.health();
    return {
      success: true,
      healthy: response.data.status === 'healthy',
      data: response.data
    };
  } catch (error) {
    console.error('ML Health Check Error:', error);
    return {
      success: false,
      healthy: false,
      error: error.message
    };
  }
};

/**
 * Format risk level for display
 * @param {string} riskLevel - LOW/MEDIUM/HIGH/CRITICAL
 * @returns {Object} Formatted risk data
 */
export const formatRiskLevel = (riskLevel) => {
  const levels = {
    'LOW': {
      color: 'green',
      icon: '✓',
      label: 'Low Risk',
      description: 'Conditions are safe'
    },
    'MEDIUM': {
      color: 'yellow',
      icon: '⚠',
      label: 'Medium Risk',
      description: 'Monitor conditions'
    },
    'HIGH': {
      color: 'orange',
      icon: '⚠',
      label: 'High Risk',
      description: 'Alert - prepare precautions'
    },
    'CRITICAL': {
      color: 'red',
      icon: '🚨',
      label: 'Critical Risk',
      description: 'Evacuate immediately'
    }
  };

  return levels[riskLevel] || levels['LOW'];
};

/**
 * Get risk color class for Tailwind
 * @param {string} riskLevel - LOW/MEDIUM/HIGH/CRITICAL
 * @returns {string} Tailwind color classes
 */
export const getRiskColorClass = (riskLevel) => {
  switch (riskLevel) {
    case 'LOW':
      return 'text-green-400 bg-green-500/20 border-green-500/50';
    case 'MEDIUM':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    case 'HIGH':
      return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
    case 'CRITICAL':
      return 'text-red-400 bg-red-500/20 border-red-500/50';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
};

export default {
  getPrediction,
  checkHealth,
  formatRiskLevel,
  getRiskColorClass
};
