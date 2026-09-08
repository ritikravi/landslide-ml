import axios from 'axios';

const GEE_API_URL = process.env.GEE_API_URL || 'http://localhost:5002';

/**
 * Get near real-time rainfall from GPM IMERG via Earth Engine
 * 4-6 hour delay (much better than NASA POWER's 1-2 day delay)
 */
export async function getGPMRainfall(lat = 30.97, lon = 76.52, hours = 24) {
  try {
    const response = await axios.get(`${GEE_API_URL}/gpm/rainfall`, {
      params: { lat, lon, hours },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error('❌ GEE GPM API error:', error.message);
    return null;
  }
}

/**
 * Get vegetation health (NDVI) from Sentinel-2
 * 10m resolution - monitors slope stability
 */
export async function getVegetationHealth(lat = 30.97, lon = 76.52) {
  try {
    const response = await axios.get(`${GEE_API_URL}/sentinel2/ndvi`, {
      params: { lat, lon }
    });
    return response.data;
  } catch (error) {
    console.error('❌ GEE Sentinel-2 API error:', error.message);
    return null;
  }
}

/**
 * Get comprehensive rainfall summary (3h, 24h, 7d)
 */
export async function getRainfallSummary(lat = 30.97, lon = 76.52) {
  try {
    const response = await axios.get(`${GEE_API_URL}/rainfall/summary`, {
      params: { lat, lon },
      timeout: 45000
    });
    return response.data;
  } catch (error) {
    console.error('❌ GEE Rainfall Summary error:', error.message);
    return null;
  }
}

/**
 * Get combined satellite analysis for ML model
 */
export async function getCombinedAnalysis(lat = 30.97, lon = 76.52) {
  try {
    const response = await axios.get(`${GEE_API_URL}/combined/analysis`, {
      params: { lat, lon },
      timeout: 60000
    });
    return response.data;
  } catch (error) {
    console.error('❌ GEE Combined Analysis error:', error.message);
    return null;
  }
}

/**
 * Check if Earth Engine service is available
 */
export async function checkGEEHealth() {
  try {
    const response = await axios.get(`${GEE_API_URL}/health`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
}

export default {
  getGPMRainfall,
  getVegetationHealth,
  getRainfallSummary,
  getCombinedAnalysis,
  checkGEEHealth
};
