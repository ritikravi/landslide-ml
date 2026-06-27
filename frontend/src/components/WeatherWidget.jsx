import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const CONDITION_ICONS = {
  Rain: CloudRain, Drizzle: CloudRain, Thunderstorm: CloudRain,
  Snow: Cloud, Clouds: Cloud, Clear: Sun,
};

const RAINFALL_COLORS = {
  NONE:       'text-green-400  bg-green-500/10  border-green-500/30',
  LIGHT:      'text-blue-400   bg-blue-500/10   border-blue-500/30',
  MODERATE:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  HEAVY:      'text-orange-400 bg-orange-500/10 border-orange-500/30',
  VERY_HEAVY: 'text-red-400    bg-red-500/10    border-red-500/30',
  EXTREME:    'text-red-500    bg-red-500/20    border-red-500/60',
  UNKNOWN:    'text-gray-400   bg-gray-500/10   border-gray-500/30',
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const fetchWeather = async () => {
    try {
      setError(false);
      const res = await api.get('/weather/current');
      if (res.data.success) setWeather(res.data.data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // refresh every 10 min
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-5 animate-pulse flex items-center gap-3">
        <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
        <span className="text-gray-400 text-sm">Loading weather data...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Cloud className="w-4 h-4" />
          Weather unavailable — add OPENWEATHER_API_KEY to backend .env
        </div>
        <button onClick={fetchWeather} className="text-blue-400 hover:text-blue-300">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const WeatherIcon  = CONDITION_ICONS[weather.condition] || Cloud;
  const rfColors     = RAINFALL_COLORS[weather.rainfallRisk?.level] || RAINFALL_COLORS.UNKNOWN;
  const isRaining    = weather.rainfall1h > 0;

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <WeatherIcon className={`w-6 h-6 ${isRaining ? 'text-blue-400 animate-pulse' : 'text-yellow-400'}`} />
          <div>
            <p className="text-white font-bold text-sm uppercase tracking-wide">Live Weather</p>
            <p className="text-xs text-gray-400">
              {weather.locationName}{weather.country ? `, ${weather.country}` : ''} · {weather.source}
            </p>
          </div>
        </div>
        <button onClick={fetchWeather} className="text-gray-500 hover:text-white transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Rainfall Risk Banner */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg border mb-4 ${rfColors}`}>
        <div className="flex items-center gap-2">
          {isRaining
            ? <AlertTriangle className="w-4 h-4 animate-pulse flex-shrink-0" />
            : <CloudRain className="w-4 h-4 flex-shrink-0" />
          }
          <span className="text-sm font-bold">{weather.rainfallRisk?.label}</span>
        </div>
        <span className="text-sm font-bold">
          {weather.rainfall1h > 0 ? `${weather.rainfall1h} mm/h` : 'No rain'}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <Thermometer className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{weather.temperature?.toFixed(1)}°C</p>
          <p className="text-xs text-gray-400">Temperature</p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{weather.humidity}%</p>
          <p className="text-xs text-gray-400">Humidity</p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <Wind className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{weather.windSpeed} m/s</p>
          <p className="text-xs text-gray-400">Wind Speed</p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <Cloud className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{weather.cloudiness}%</p>
          <p className="text-xs text-gray-400">Cloud Cover</p>
        </div>
      </div>

      {/* Landslide correlation note */}
      {isRaining && (
        <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-xs text-orange-300 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 animate-pulse" />
          Active rainfall detected — landslide risk elevated. Monitor sensors closely.
        </div>
      )}

      <p className="text-xs text-gray-600 mt-2 text-right">
        Updated: {weather.timestamp ? new Date(weather.timestamp).toLocaleTimeString() : '--'}
      </p>
    </div>
  );
}
