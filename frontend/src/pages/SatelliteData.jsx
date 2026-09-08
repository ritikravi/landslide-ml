import { useState, useEffect } from 'react';
import { Satellite, RefreshCw, Download, MapPin } from 'lucide-react';
import SatelliteRainfall from '../components/SatelliteRainfall';
import api from '../services/api';

function SatelliteData() {
  const [status, setStatus] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [location, setLocation] = useState({ lat: 30.97, lon: 76.52 });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/satellite/status', {
        params: { lat: location.lat, lon: location.lon }
      });
      if (response.data.success) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching satellite status:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const response = await api.post('/satellite/update', {
        lat: location.lat,
        lon: location.lon,
        days: 30
      });
      
      if (response.data.success) {
        alert(`✅ Successfully updated ${response.data.count} records`);
        fetchStatus();
      }
    } catch (error) {
      console.error('Error updating satellite data:', error);
      alert('❌ Failed to update satellite data. Check console for details.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center mb-2">
              <Satellite className="mr-3" size={36} />
              Satellite Data Integration
            </h1>
            <p className="text-blue-100">
              Real-time rainfall and environmental data from NASA POWER satellites
            </p>
          </div>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              updating
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50 hover:scale-105'
            }`}
          >
            <RefreshCw className={updating ? 'animate-spin' : ''} size={20} />
            {updating ? 'Updating...' : 'Update Data'}
          </button>
        </div>
      </div>

      {/* Status Card */}
      {status && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Data Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-1">Location</div>
              <div className="text-white font-semibold flex items-center">
                <MapPin size={16} className="mr-2 text-blue-400" />
                {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-1">Latest Data</div>
              <div className="text-white font-semibold">
                {status.latestDataDate
                  ? new Date(status.latestDataDate).toLocaleDateString()
                  : 'No data'}
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-1">Data Age</div>
              <div className="text-white font-semibold">
                {status.dataAge !== null ? `${status.dataAge} days old` : 'N/A'}
              </div>
            </div>
          </div>
          
          {status.needsUpdate && (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-yellow-400 font-semibold">
                ⚠️ Data is outdated. Click "Update Data" to fetch latest satellite information.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Satellite Rainfall Component */}
      <SatelliteRainfall />

      {/* Information Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">About NASA POWER Data</h2>
        <div className="prose prose-invert max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Source</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Provider:</strong> NASA Prediction Of Worldwide Energy Resources (POWER)</li>
                <li>• <strong>Resolution:</strong> 0.5° × 0.5° grid (~50km)</li>
                <li>• <strong>Update Frequency:</strong> Daily</li>
                <li>• <strong>Data Latency:</strong> 1-2 days</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Parameters</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>PRECTOTCORR:</strong> Precipitation (corrected)</li>
                <li>• <strong>T2M:</strong> Temperature at 2 meters</li>
                <li>• <strong>RH2M:</strong> Relative Humidity at 2 meters</li>
                <li>• <strong>Cumulative Rainfall:</strong> 7-day and 30-day totals</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Why Satellite Data Matters</h3>
            <p className="text-sm text-slate-300">
              Rainfall is the <strong>#1 trigger</strong> for landslides. By integrating satellite-based 
              precipitation data with your ground sensors, the ML model can:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>✓ Detect rainfall patterns before they affect local soil moisture</li>
              <li>✓ Provide regional context for your point-based ground sensors</li>
              <li>✓ Improve prediction accuracy by understanding cumulative rainfall effects</li>
              <li>✓ Enable early warnings based on weather trends</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Download className="mr-2" size={20} />
          Export Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            Export as CSV
          </button>
          <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            Export as JSON
          </button>
          <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            Generate Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}

export default SatelliteData;
