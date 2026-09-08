import { useState, useEffect } from 'react';
import axios from 'axios';
import './GPMRainfall.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function GPMRainfall() {
  const [gpmData, setGpmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGPMData();
    const interval = setInterval(fetchGPMData, 10 * 60 * 1000); // Update every 10 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchGPMData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/gee/rainfall?hours=24`);
      
      if (response.data.success) {
        setGpmData(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('GPM API error:', err);
      setError('Unable to load GPM data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !gpmData) {
    return (
      <div className="gpm-rainfall-card">
        <h3>🛰️ GPM Rainfall (Near Real-Time)</h3>
        <p className="loading">Loading satellite data...</p>
      </div>
    );
  }

  if (error && !gpmData) {
    return (
      <div className="gpm-rainfall-card error">
        <h3>🛰️ GPM Rainfall (Near Real-Time)</h3>
        <p className="error-message">{error}</p>
        <button onClick={fetchGPMData} className="retry-btn">Retry</button>
      </div>
    );
  }

  const rainfall = gpmData?.rainfall_mm || 0;
  const getRainfallStatus = () => {
    if (rainfall === 0) return { status: 'No rain', color: '#4CAF50', icon: '☀️' };
    if (rainfall < 10) return { status: 'Light rain', color: '#2196F3', icon: '🌦️' };
    if (rainfall < 30) return { status: 'Moderate rain', color: '#FF9800', icon: '🌧️' };
    return { status: 'Heavy rain', color: '#f44336', icon: '⛈️' };
  };

  const status = getRainfallStatus();

  return (
    <div className="gpm-rainfall-card" style={{ borderLeft: `4px solid ${status.color}` }}>
      <div className="gpm-header">
        <h3>🛰️ GPM Rainfall (Near Real-Time)</h3>
        <span className="delay-badge">4-6 hour delay</span>
      </div>
      
      <div className="rainfall-main">
        <span className="rainfall-icon">{status.icon}</span>
        <div className="rainfall-amount">
          <span className="rainfall-value">{rainfall.toFixed(1)}</span>
          <span className="rainfall-unit">mm</span>
        </div>
      </div>

      <div className="rainfall-status" style={{ color: status.color }}>
        {status.status}
      </div>

      <div className="gpm-details">
        <div className="detail-item">
          <span className="detail-label">Period:</span>
          <span className="detail-value">Last 24 hours</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Source:</span>
          <span className="detail-value">GPM IMERG V06</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Resolution:</span>
          <span className="detail-value">10 km</span>
        </div>
      </div>

      {gpmData?.end_date && (
        <div className="gpm-timestamp">
          Updated: {new Date(gpmData.end_date).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default GPMRainfall;
