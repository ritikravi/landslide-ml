import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
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
  getPredictions: (params) => api.get('/ml/predictions', { params }),
  getLatest: () => api.get('/ml/predictions/latest')
};

export const weatherAPI = {
  getCurrent: () => api.get('/weather/current'),
  getRiskBoost: () => api.get('/weather/risk-boost')
};

export default api;
