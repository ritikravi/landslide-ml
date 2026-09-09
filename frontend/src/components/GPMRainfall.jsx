import { useState, useEffect } from 'react';
import { CloudRain, AlertCircle } from 'lucide-react';
import axios from 'axios';

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
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error && !gpmData) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64 text-red-400">
          <AlertCircle className="mr-2" />
          {error}
          <button onClick={fetchGPMData} className="ml-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const rainfall = gpmData?.rainfall_mm || 0;
  const getRainfallLevel = () => {
    if (rainfall === 0) return { label: 'NO RAIN', color: 'text-green-500', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    if (rainfall < 10) return { label: 'LIGHT', color: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    if (rainfall < 30) return { label: 'MODERATE', color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
    return { label: 'HEAVY', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' };
  };

  const level = getRainfallLevel();

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <CloudRain className="text-purple-400" size={24} />
        <span className="text-xs text-slate-400">GPM (4-6h delay)</span>
      </div>
      <div className="text-2xl font-bold text-white">{rainfall.toFixed(1)} mm</div>
      <div className="text-sm text-slate-400 mb-3">24h Rainfall</div>
      
      <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${level.bg} ${level.color}`}>
        {level.label}
      </div>
      
      {gpmData?.end_date && (
        <div className="mt-3 text-xs text-slate-500">
          {new Date(gpmData.end_date).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default GPMRainfall;
