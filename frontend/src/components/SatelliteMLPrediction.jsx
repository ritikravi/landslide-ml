import { useState, useEffect } from 'react';
import { Satellite, MapPin, TrendingUp, Cloud, Mountain, Droplets, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://landslide-api.onrender.com';

const SatelliteMLPrediction = ({ location, sensorData }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default location (Ropar, Punjab)
  const defaultLocation = { lat: 31.2548, lon: 75.7057 };
  const loc = location || defaultLocation;

  useEffect(() => {
    fetchPrediction();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrediction, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loc.lat, loc.lon, sensorData]);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/satellite-ml/predict`, {
        lat: loc.lat,
        lon: loc.lon,
        sensorData: sensorData || null
      });

      if (response.data.success) {
        setPrediction(response.data.prediction);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Satellite ML prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'from-red-600 to-red-800 border-red-500';
      case 'HIGH': return 'from-orange-600 to-orange-800 border-orange-500';
      case 'MEDIUM': return 'from-yellow-600 to-yellow-800 border-yellow-500';
      case 'LOW': return 'from-green-600 to-green-800 border-green-500';
      default: return 'from-gray-600 to-gray-800 border-gray-500';
    }
  };

  if (loading && !prediction) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading satellite data...</span>
        </div>
      </div>
    );
  }

  if (error && !prediction) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-400">Satellite Data Error</h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className="space-y-4">
      {/* Main Prediction Card */}
      <div className={`bg-gradient-to-br ${getRiskColor(prediction.riskLevel)} border-2 rounded-xl p-6 shadow-2xl`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Satellite className="w-8 h-8 mr-3" />
            <div>
              <h3 className="text-2xl font-bold text-white">{prediction.riskLevel} RISK</h3>
              <p className="text-sm opacity-80">Live Satellite Analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">{prediction.riskScore}</div>
            <div className="text-xs opacity-75">{prediction.confidence}% confident</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm mb-4 bg-black/20 rounded-lg p-3">
          <MapPin className="w-4 h-4 mr-2" />
          <span>Lat: {prediction.location.lat.toFixed(4)}, Lon: {prediction.location.lon.toFixed(4)}</span>
        </div>

        {/* Data Sources */}
        <div className="bg-black/20 rounded-lg p-3 text-sm">
          <p className="font-semibold mb-1">Data Sources:</p>
          <p className="opacity-90">🛰️ NASA POWER • 🌍 Open Elevation • 🌧️ GPM IMERG</p>
          {sensorData && <p className="opacity-90 mt-1">📡 Local Sensors: Active</p>}
        </div>
      </div>

      {/* Risk Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rainfall Factor */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center mb-3">
            <Droplets className="w-5 h-5 text-blue-400 mr-2" />
            <h4 className="font-semibold text-white">Rainfall</h4>
          </div>
          <div className="text-2xl font-bold text-blue-400 mb-2">
            {prediction.factors.rainfall.level}
          </div>
          <div className="text-sm text-gray-400 mb-2">
            Score: {prediction.factors.rainfall.score}/100
          </div>
          <ul className="space-y-1">
            {prediction.factors.rainfall.factors.slice(0, 2).map((factor, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start">
                <span className="text-blue-400 mr-1">•</span>
                {factor}
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-gray-400">
            <p>24h: {prediction.factors.rainfall.data.last24h.toFixed(1)}mm</p>
            <p>7d: {prediction.factors.rainfall.data.last7days.toFixed(1)}mm</p>
          </div>
        </div>

        {/* Terrain Factor */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center mb-3">
            <Mountain className="w-5 h-5 text-amber-400 mr-2" />
            <h4 className="font-semibold text-white">Terrain</h4>
          </div>
          <div className="text-2xl font-bold text-amber-400 mb-2">
            {prediction.factors.terrain.level}
          </div>
          <div className="text-sm text-gray-400 mb-2">
            Score: {prediction.factors.terrain.score}/100
          </div>
          <ul className="space-y-1">
            {prediction.factors.terrain.factors.slice(0, 2).map((factor, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start">
                <span className="text-amber-400 mr-1">•</span>
                {factor}
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-gray-400">
            <p>Elevation: {prediction.factors.terrain.data.elevation}m</p>
            <p>Slope: {prediction.factors.terrain.data.slope.toFixed(1)}°</p>
          </div>
        </div>

        {/* Climate Factor */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center mb-3">
            <Cloud className="w-5 h-5 text-cyan-400 mr-2" />
            <h4 className="font-semibold text-white">Climate</h4>
          </div>
          <div className="text-2xl font-bold text-cyan-400 mb-2">
            {prediction.factors.climate.level}
          </div>
          <div className="text-sm text-gray-400 mb-2">
            Score: {prediction.factors.climate.score}/100
          </div>
          <ul className="space-y-1">
            {prediction.factors.climate.factors.slice(0, 2).map((factor, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start">
                <span className="text-cyan-400 mr-1">•</span>
                {factor}
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-gray-400">
            <p>Temp: {prediction.factors.climate.data.temperature.toFixed(1)}°C</p>
            <p>Humidity: {prediction.factors.climate.data.humidity.toFixed(0)}%</p>
          </div>
        </div>

        {/* Sensor Factor (if available) */}
        {prediction.factors.sensor && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
              <h4 className="font-semibold text-white">Sensors</h4>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {prediction.factors.sensor.level}
            </div>
            <div className="text-sm text-gray-400 mb-2">
              Score: {prediction.factors.sensor.score}/100
            </div>
            <ul className="space-y-1">
              {prediction.factors.sensor.factors.slice(0, 2).map((factor, i) => (
                <li key={i} className="text-xs text-gray-300 flex items-start">
                  <span className="text-green-400 mr-1">•</span>
                  {factor}
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-green-400">
              📡 Local sensor data active
            </div>
          </div>
        )}
      </div>

      {/* Update Info */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 text-xs text-gray-400 text-center">
        Last updated: {new Date(prediction.timestamp).toLocaleString()} • Auto-refreshes every 5 minutes
      </div>
    </div>
  );
};

export default SatelliteMLPrediction;
