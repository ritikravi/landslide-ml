import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'https://landslide-ml-api.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Direct ML API client (no /api prefix)
const mlApiDirect = axios.create({
  baseURL: ML_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const sensorAPI = {
  getLatest: () => api.get('/sensor-data/latest'),
  getHistory: (params) => api.get('/sensor-data/history', { params }),
  submit: (data) => api.post('/sensor-data', data)
};

export const alertAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  create: (data) => api.post('/alerts', data),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`)
};

export const mlAPI = {
  // Legacy endpoints (keep for backward compatibility)
  getPredictions: (params) => api.get('/ml/predictions', { params }),
  getLatest: () => api.get('/ml/predictions/latest'),
  getHistory: (params) => api.get('/ml/predictions', { params }),
  
  // New Production ML API endpoints
  health: () => mlApiDirect.get('/health'),
  
  predict: async (sensorData) => {
    try {
      const response = await mlApiDirect.post('/predict', {
        soilMoisture: sensorData.soilMoisture || sensorData.soil || 0,
        waterLevel: sensorData.waterLevel || sensorData.water || 0,
        tilt: sensorData.tilt || 0,
        vibration: sensorData.vibration || 0,
        ultrasonicDistance: sensorData.ultrasonicDistance || sensorData.distance || 0,
        // Optional terrain/weather features
        rainfall: sensorData.rainfall || 0,
        elevation: sensorData.elevation || 350,
        slope: sensorData.slope || 5,
        aspect: sensorData.aspect || 180,
        // Optional history for trend analysis
        history: sensorData.history || []
      });
      return response.data;
    } catch (error) {
      console.error('ML Prediction Error:', error);
      throw error;
    }
  }
};

export const weatherAPI = {
  getCurrent: () => api.get('/weather/current'),
  getRiskBoost: () => api.get('/weather/risk-boost')
};

export default api;
