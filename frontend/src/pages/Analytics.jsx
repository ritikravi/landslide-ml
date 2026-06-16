import { useState, useEffect } from 'react';
import { sensorAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Analytics = () => {
  const [history, setHistory] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchHistory();
  }, [timeRange]);

  const fetchHistory = async () => {
    try {
      const limit = timeRange === '24h' ? 100 : timeRange === '7d' ? 500 : 1000;
      const res = await sensorAPI.getHistory({ limit });
      setHistory(res.data.data);
      setTotalCount(res.data.total || res.data.count);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const chartData = history.slice(0, 50).map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    moisture: item.soilMoisture,
    water: item.waterLevel,
    tilt: item.tilt * 10
  })).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sensor Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Multi-Sensor Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar dataKey="moisture" fill="#3b82f6" name="Soil Moisture (%)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="water" fill="#06b6d4" name="Water Level (cm)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="tilt" fill="#eab308" name="Tilt (° x10)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/50 rounded-xl p-6 hover:scale-105 transition-transform">
          <h4 className="text-blue-400 font-bold text-lg mb-2">Total Readings</h4>
          <p className="text-5xl font-bold text-white">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-2 border-green-500/50 rounded-xl p-6 hover:scale-105 transition-transform">
          <h4 className="text-green-400 font-bold text-lg mb-2">Avg Soil Moisture</h4>
          <p className="text-5xl font-bold text-white">
            {history.length > 0
              ? (history.reduce((sum, item) => sum + item.soilMoisture, 0) / history.length).toFixed(1)
              : '--'}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-500/50 rounded-xl p-6 hover:scale-105 transition-transform">
          <h4 className="text-yellow-400 font-bold text-lg mb-2">Max Tilt</h4>
          <p className="text-5xl font-bold text-white">
            {history.length > 0
              ? Math.max(...history.map(item => item.tilt || 0)).toFixed(2)
              : '--'}°
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
