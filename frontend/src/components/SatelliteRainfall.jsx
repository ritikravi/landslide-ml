import { useState, useEffect } from 'react';
import axios from 'axios';
import './SatelliteRainfall.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function SatelliteRainfall() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchSatelliteData();
    const interval = setInterval(fetchSatelliteData, 60 * 60 * 1000); // Update hourly
    return () => clearInterval(interval);
  }, []);

  const fetchSatelliteData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary
      const summaryResponse = await axios.get(`${API_URL}/api/satellite/rainfall-summary`);
      if (summaryResponse.data.success) {
        setSummary(summaryResponse.data.data);
        
        // Fetch 7-day history for trend
        const historyResponse = await axios.get(`${API_URL}/api/satellite/history?days=7`);
        if (historyResponse.data.success) {
          const formattedTrend = historyResponse.data.data
            .map(item => ({
              day: new Date(item.dataDate).getDate(),
              rainfall: item.rainfall || 0
            }))
            .reverse();
          setTrendData(formattedTrend);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching satellite data:', err);
      setError('Unable to load satellite data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="nasa-power-card">
        <h3>🛰️ NASA POWER (Satellite)</h3>
        <p className="loading">Loading satellite data...</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="nasa-power-card error">
        <h3>🛰️ NASA POWER (Satellite)</h3>
        <p className="error-message">{error}</p>
        <button onClick={fetchSatelliteData} className="retry-btn">Retry</button>
      </div>
    );
  }

  const getRiskLevel = (score) => {
    if (score >= 70) return { label: 'CRITICAL', color: '#f44336', icon: '🔴' };
    if (score >= 50) return { label: 'HIGH', color: '#ff9800', icon: '🟠' };
    if (score >= 30) return { label: 'MEDIUM', color: '#ffc107', icon: '🟡' };
    return { label: 'LOW', color: '#4caf50', icon: '🟢' };
  };

  const riskInfo = summary ? getRiskLevel(summary.riskScore) : null;
  const maxTrend = Math.max(...trendData.map(d => d.rainfall), 1);

  return (
    <div className="nasa-power-card" style={{ borderLeft: `4px solid ${riskInfo?.color}` }}>
      <div className="nasa-header">
        <h3>🛰️ NASA POWER</h3>
        <span className="delay-badge">1-2 day delay</span>
      </div>
      
      {/* Main Metrics Display */}
      <div className="metrics-grid">
        <div className="metric-box primary">
          <span className="metric-label">30-Day Total</span>
          <div className="metric-value-group">
            <span className="metric-value">{summary?.rainfall30day?.toFixed(1) || '0.0'}</span>
            <span className="metric-unit">mm</span>
          </div>
        </div>
        
        <div className="metric-box secondary">
          <span className="metric-label">7-Day</span>
          <span className="metric-value-small">{summary?.rainfall7day?.toFixed(1) || '0.0'} mm</span>
        </div>
        
        <div className="metric-box secondary">
          <span className="metric-label">24-Hour</span>
          <span className="metric-value-small">{summary?.rainfall24h?.toFixed(1) || '0.0'} mm</span>
        </div>
      </div>

      {/* Risk Score */}
      {riskInfo && (
        <div className="risk-section" style={{ borderColor: riskInfo.color }}>
          <div className="risk-header">
            <span className="risk-icon">{riskInfo.icon}</span>
            <div>
              <div className="risk-label">Rainfall Risk Score</div>
              <div className="risk-value" style={{ color: riskInfo.color }}>
                {summary.riskScore} - {riskInfo.label}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Trend Sparkline */}
      {trendData.length > 0 && (
        <div className="trend-section">
          <div className="trend-header">7-Day Rainfall Trend</div>
          <div className="sparkline">
            {trendData.map((point, i) => (
              <div
                key={i}
                className="sparkline-bar"
                style={{
                  height: `${(point.rainfall / maxTrend) * 100}%`,
                  background: `rgba(255, 255, 255, ${0.4 + (point.rainfall / maxTrend) * 0.6})`
                }}
                title={`Day ${point.day}: ${point.rainfall.toFixed(1)}mm`}
              />
            ))}
          </div>
          <div className="trend-labels">
            <span>7d ago</span>
            <span>Today</span>
          </div>
        </div>
      )}

      {/* Details Section */}
      <div className="nasa-details">
        <div className="detail-item">
          <span className="detail-label">Source:</span>
          <span className="detail-value">NASA POWER API</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Coverage:</span>
          <span className="detail-value">Global, 0.5° resolution</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Data Type:</span>
          <span className="detail-value">Reanalysis (MERRA-2)</span>
        </div>
      </div>

      {summary?.lastUpdate && (
        <div className="nasa-timestamp">
          Updated: {new Date(summary.lastUpdate).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default SatelliteRainfall;
