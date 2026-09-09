import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cloud, CloudRain, Droplets, AlertTriangle } from 'lucide-react';
import api from '../services/api';

function SatelliteRainfall() {
  const [rainfallData, setRainfallData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchSatelliteData();
    const interval = setInterval(fetchSatelliteData, 60 * 60 * 1000); // Update hourly
    return () => clearInterval(interval);
  }, [days]);

  const fetchSatelliteData = async () => {
    try {
      setLoading(true);
      
      // Fetch historical data
      const historyResponse = await api.get(`/satellite/history?days=${days}`);
      
      if (historyResponse.data.success) {
        const formattedData = historyResponse.data.data
          .map(item => ({
            date: new Date(item.dataDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            rainfall: item.rainfall || 0,
            rainfall7Day: item.rainfall7Day || 0,
            temperature: item.temperature,
            humidity: item.humidity,
            fullDate: item.dataDate
          }))
          .reverse(); // Show oldest to newest
        
        setRainfallData(formattedData);
      }
      
      // Fetch summary
      const summaryResponse = await api.get('/satellite/rainfall-summary');
      if (summaryResponse.data.success) {
        setSummary(summaryResponse.data.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching satellite data:', err);
      setError('Unable to load satellite data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/20' };
    if (score >= 50) return { label: 'HIGH', color: 'text-orange-500', bg: 'bg-orange-500/20' };
    if (score >= 30) return { label: 'MEDIUM', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    return { label: 'LOW', color: 'text-green-500', bg: 'bg-green-500/20' };
  };

  if (loading && rainfallData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && rainfallData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64 text-red-400">
          <AlertTriangle className="mr-2" />
          {error}
        </div>
      </div>
    );
  }

  const riskInfo = summary ? getRiskLevel(summary.riskScore) : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 24h Rainfall */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CloudRain className="text-blue-400" size={24} />
              <span className="text-xs text-slate-400">24h</span>
            </div>
            <div className="text-2xl font-bold text-white">{summary.rainfall24h.toFixed(1)}</div>
            <div className="text-sm text-slate-400">mm rainfall</div>
          </div>

          {/* 7-Day Rainfall */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Cloud className="text-cyan-400" size={24} />
              <span className="text-xs text-slate-400">7 days</span>
            </div>
            <div className="text-2xl font-bold text-white">{summary.rainfall7day.toFixed(1)}</div>
            <div className="text-sm text-slate-400">mm cumulative</div>
          </div>

          {/* 30-Day Rainfall */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="text-indigo-400" size={24} />
              <span className="text-xs text-slate-400">30 days</span>
            </div>
            <div className="text-2xl font-bold text-white">{summary.rainfall30day.toFixed(1)}</div>
            <div className="text-sm text-slate-400">mm cumulative</div>
          </div>

          {/* Rainfall Risk Score */}
          {riskInfo && (
            <div className={`bg-gradient-to-br from-slate-700/50 to-slate-800/50 border ${riskInfo.bg} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className={riskInfo.color} size={24} />
                <span className={`text-xs font-semibold px-2 py-1 rounded ${riskInfo.bg} ${riskInfo.color}`}>
                  {riskInfo.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{summary.riskScore}</div>
              <div className="text-sm text-slate-400">Rainfall Risk Score</div>
            </div>
          )}
        </div>
      )}

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[7, 14, 30].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              days === d
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {d} Days
          </button>
        ))}
      </div>

      {/* Daily Rainfall Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CloudRain className="mr-2 text-blue-400" size={20} />
          Daily Rainfall (Satellite Data)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={rainfallData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              style={{ fontSize: '12px' }}
              label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Bar dataKey="rainfall" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Rainfall Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Droplets className="mr-2 text-cyan-400" size={20} />
          7-Day Cumulative Rainfall
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rainfallData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              style={{ fontSize: '12px' }}
              label={{ value: 'Cumulative Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="rainfall7Day" 
              stroke="#06b6d4" 
              strokeWidth={2}
              dot={{ fill: '#06b6d4', r: 4 }}
              name="7-Day Total"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Source Info */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center text-sm text-slate-400">
          <div className="flex items-center mr-6">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            NASA POWER Satellite Data
          </div>
          {summary?.lastUpdate && (
            <div>
              Last Updated: {new Date(summary.lastUpdate).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SatelliteRainfall;
