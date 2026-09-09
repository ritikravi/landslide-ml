import { useState, useEffect } from 'react';
import { Leaf, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function VegetationHealth() {
  const [vegData, setVegData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error && !vegData) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64 text-red-400">
          <AlertCircle className="mr-2" />
          {error}
          <button onClick={fetchVegetationData} className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const ndvi = vegData?.ndvi || 0;
  const health = vegData?.vegetation_health || 'Unknown';
  const risk = vegData?.slope_stability_risk || 'Unknown';

  const getHealthInfo = () => {
    if (health === 'Healthy') return { color: 'text-green-500', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    if (health === 'Moderate') return { color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    return { color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' };
  };

  const getRiskInfo = () => {
    if (risk === 'Low') return { color: 'text-green-500', bg: 'bg-green-500/20' };
    if (risk === 'Medium') return { color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    return { color: 'text-red-500', bg: 'bg-red-500/20' };
  };

  const healthInfo = getHealthInfo();
  const riskInfo = getRiskInfo();

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Leaf className="text-green-400" size={24} />
        <span className="text-xs text-slate-400">Sentinel-2 (10m)</span>
      </div>
      <div className="text-2xl font-bold text-white">NDVI: {ndvi?.toFixed(3) || 'N/A'}</div>
      <div className="text-sm text-slate-400 mb-3">Vegetation Index</div>
      
      <div className="space-y-2">
        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${healthInfo.bg} ${healthInfo.color}`}>
          Health: {health}
        </div>
        <div className={`inline-block ml-2 px-2 py-1 rounded text-xs font-semibold ${riskInfo.bg} ${riskInfo.color}`}>
          Risk: {risk}
        </div>
      </div>
      
      {vegData?.image_date && (
        <div className="mt-3 text-xs text-slate-500">
          {new Date(vegData.image_date).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default VegetationHealth;
