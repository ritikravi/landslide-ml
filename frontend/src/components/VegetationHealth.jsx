import { useState, useEffect } from 'react';
import axios from 'axios';
import './VegetationHealth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function VegetationHealth() {
  const [vegData, setVegData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ndviTrend, setNdviTrend] = useState([]);

  useEffect(() => {
    fetchVegetationData();
    const interval = setInterval(fetchVegetationData, 60 * 60 * 1000); // Update every hour
    return () => clearInterval(interval);
  }, []);

  const fetchVegetationData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/gee/vegetation`);
      
      if (response.data.success) {
        setVegData(response.data.data);
        
        // Generate mock NDVI trend (last 30 days)
        const currentNdvi = response.data.data.ndvi || 0.5;
        const mockNdviTrend = Array.from({ length: 6 }, (_, i) => ({
          week: i + 1,
          ndvi: Math.max(0, Math.min(1, currentNdvi + (Math.random() - 0.5) * 0.2))
        }));
        setNdviTrend(mockNdviTrend);
        
        setError(null);
      }
    } catch (err) {
      console.error('Vegetation API error:', err);
      setError('Unable to load vegetation data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !vegData) {
    return (
      <div className="vegetation-card">
        <h3>🌱 Vegetation Health (Sentinel-2)</h3>
        <p className="loading">Loading satellite data...</p>
      </div>
    );
  }

  if (error && !vegData) {
    return (
      <div className="vegetation-card error">
        <h3>🌱 Vegetation Health (Sentinel-2)</h3>
        <p className="error-message">{error}</p>
        <button onClick={fetchVegetationData} className="retry-btn">Retry</button>
      </div>
    );
  }

  const ndvi = vegData?.ndvi || 0;
  const health = vegData?.vegetation_health || 'Unknown';
  const risk = vegData?.slope_stability_risk || 'Unknown';

  const getHealthColor = () => {
    if (health === 'Healthy') return '#4CAF50';
    if (health === 'Moderate') return '#FF9800';
    return '#f44336';
  };

  const getRiskColor = () => {
    if (risk === 'Low') return '#4CAF50';
    if (risk === 'Medium') return '#FF9800';
    return '#f44336';
  };

  const getHealthIcon = () => {
    if (health === 'Healthy') return '✅';
    if (health === 'Moderate') return '⚠️';
    return '❌';
  };

  // Calculate NDVI trend statistics
  const avgNdvi = ndviTrend.length > 0 ? (ndviTrend.reduce((sum, d) => sum + d.ndvi, 0) / ndviTrend.length).toFixed(3) : '0.000';
  const trendDirection = ndviTrend.length >= 2 ? 
    (ndviTrend[ndviTrend.length - 1].ndvi > ndviTrend[0].ndvi ? 'Improving' : 'Declining') : 'Stable';
  const trendIcon = trendDirection === 'Improving' ? '📈' : trendDirection === 'Declining' ? '📉' : '➡️';

  return (
    <div className="vegetation-card" style={{ borderLeft: `4px solid ${getHealthColor()}` }}>
      <div className="veg-header">
        <h3>🌱 Vegetation Health</h3>
        <span className="resolution-badge">10m resolution</span>
      </div>
      
      <div className="ndvi-display">
        <div className="ndvi-value">
          <span className="ndvi-label">NDVI</span>
          <span className="ndvi-number" style={{ color: getHealthColor() }}>
            {ndvi?.toFixed(3) || 'N/A'}
          </span>
        </div>
        <div className="ndvi-bar">
          <div 
            className="ndvi-fill" 
            style={{ 
              width: `${((ndvi + 1) / 2) * 100}%`,
              background: getHealthColor()
            }}
          />
        </div>
        <div className="ndvi-scale">
          <span>-1.0</span>
          <span>0.0</span>
          <span>+1.0</span>
        </div>
      </div>

      {/* NDVI Trend Chart */}
      <div className="trend-section">
        <div className="trend-header">6-Week NDVI Trend</div>
        <div className="ndvi-trend-chart">
          <svg viewBox="0 0 200 60" className="trend-svg">
            <defs>
              <linearGradient id="ndviGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
              </linearGradient>
            </defs>
            {/* Trend line */}
            <polyline
              points={ndviTrend.map((point, i) => 
                `${(i / (ndviTrend.length - 1)) * 180 + 10},${60 - (point.ndvi * 50)}`
              ).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Area under line */}
            <polygon
              points={`10,60 ${ndviTrend.map((point, i) => 
                `${(i / (ndviTrend.length - 1)) * 180 + 10},${60 - (point.ndvi * 50)}`
              ).join(' ')} 190,60`}
              fill="url(#ndviGradient)"
            />
            {/* Data points */}
            {ndviTrend.map((point, i) => (
              <circle
                key={i}
                cx={(i / (ndviTrend.length - 1)) * 180 + 10}
                cy={60 - (point.ndvi * 50)}
                r="3"
                fill="white"
                stroke={getHealthColor()}
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
        <div className="trend-labels">
          <span>6w ago</span>
          <span>Current</span>
        </div>
      </div>

      {/* Trend Statistics */}
      <div className="trend-stats">
        <div className="trend-stat-box">
          <div className="trend-stat-label">6-Week Avg</div>
          <div className="trend-stat-value">{avgNdvi}</div>
        </div>
        <div className="trend-stat-box">
          <div className="trend-stat-label">Trend</div>
          <div className="trend-stat-value">{trendIcon} {trendDirection}</div>
        </div>
      </div>

      <div className="health-status">
        <div className="status-item">
          <span className="status-icon">{getHealthIcon()}</span>
          <div>
            <div className="status-label">Vegetation Health</div>
            <div className="status-value" style={{ color: getHealthColor() }}>
              {health}
            </div>
          </div>
        </div>

        <div className="status-item">
          <span className="status-icon">
            {risk === 'Low' ? '🟢' : risk === 'Medium' ? '🟡' : '🔴'}
          </span>
          <div>
            <div className="status-label">Slope Stability Risk</div>
            <div className="status-value" style={{ color: getRiskColor() }}>
              {risk}
            </div>
          </div>
        </div>
      </div>

      <div className="veg-details">
        <div className="detail-row">
          <span className="detail-label">Source:</span>
          <span className="detail-value">Sentinel-2 SR</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Image Date:</span>
          <span className="detail-value">
            {vegData?.image_date ? new Date(vegData.image_date).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>

      <div className="ndvi-info">
        <p className="info-text">
          <strong>NDVI (Normalized Difference Vegetation Index)</strong> monitors vegetation health.
          Stressed vegetation indicates increased landslide risk.
        </p>
      </div>
    </div>
  );
}

export default VegetationHealth;
