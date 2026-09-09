import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { sensorAPI, mlAPI } from '../services/api';
import StatCard from '../components/StatCard';
import RiskIndicator from '../components/RiskIndicator';
import MLStatusBox from '../components/MLStatusBox';
import GPSMap from '../components/GPSMap';
import NewsTicker from '../components/NewsTicker';
import AnomalyDetector from '../components/AnomalyDetector';
import WeatherWidget from '../components/WeatherWidget';
import AlertNotifier from '../components/AlertNotifier';
import SatelliteRainfall from '../components/SatelliteRainfall';
import GPMRainfall from '../components/GPMRainfall';
import VegetationHealth from '../components/VegetationHealth';
import { Droplets, TrendingUp, Navigation, Activity, Waves, Ruler } from 'lucide-react';
import SensorChart from '../components/SensorChart';
import DailyStats from '../components/DailyStats';

const Dashboard = () => {
  const { latestData } = useSocket();
  const [sensorData, setSensorData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [esp32Active, setEsp32Active] = useState(false);
  const [nasaPowerSummary, setNasaPowerSummary] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (latestData) {
      console.log('📊 Received sensor data:', latestData.sensorData);
      console.log('🔔 Vibration value:', latestData.sensorData?.vibration);
      
      setSensorData(latestData.sensorData);
      setPrediction(latestData.prediction);
      setHistory((prev) => [latestData.sensorData, ...prev].slice(0, 50));
      
      // Check if data is fresh (within last 60 seconds)
      const dataTime = new Date(latestData.sensorData.timestamp);
      const now = new Date();
      const secondsAgo = (now - dataTime) / 1000;
      setEsp32Active(secondsAgo < 60);
    }
  }, [latestData]);

  // Check ESP32 status every 5 seconds
  useEffect(() => {
    const checkStatus = () => {
      if (sensorData?.timestamp) {
        const dataTime = new Date(sensorData.timestamp);
        const now = new Date();
        const secondsAgo = (now - dataTime) / 1000;
        setEsp32Active(secondsAgo < 60);
      }
    };
    
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [sensorData]);

  const fetchInitialData = async () => {
    try {
      const [latestRes, predictionRes, historyRes, nasaRes] = await Promise.all([
        sensorAPI.getLatest(),
        mlAPI.getLatest(),
        sensorAPI.getHistory({ limit: 50 }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/satellite/rainfall-summary`)
          .then(res => res.json())
      ]);

      setSensorData(latestRes.data.data);
      setPrediction(predictionRes.data.data);
      setHistory(historyRes.data.data);
      
      if (nasaRes.success) {
        setNasaPowerSummary(nasaRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-full animate-fade-in">
      {/* Live News Ticker */}
      <NewsTicker />

      {/* Alert Sound Notifier */}
      <div className="flex justify-end">
        <AlertNotifier riskLevel={prediction?.riskLevel} />
      </div>

      {/* Risk Indicator and ML Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="w-full transform transition-all duration-300 hover:scale-[1.02]">
          <RiskIndicator
            riskLevel={prediction?.riskLevel}
            riskScore={prediction?.riskScore}
            sensorData={sensorData}
          />
        </div>
        <div className="w-full transform transition-all duration-300 hover:scale-[1.02]">
          <MLStatusBox prediction={prediction} />
        </div>
      </div>

      {/* Sensor Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Soil Moisture" value={sensorData?.soilMoisture?.toFixed(1)} unit="%" icon={Droplets} color="blue" />
        <StatCard title="Water Level" value={sensorData?.waterLevel?.toFixed(1)} unit="cm" icon={Waves} color="cyan" />
        <StatCard title="Tilt Angle" value={sensorData?.tilt?.toFixed(2)} unit="°" icon={TrendingUp} color="yellow" />
        <StatCard title="Vibration" value={sensorData?.vibration > 0 ? sensorData.vibration : 'None'} unit={sensorData?.vibration > 0 ? 'events' : ''} icon={Activity} color={sensorData?.vibration > 0 ? 'red' : 'gray'} />
        <StatCard title="Distance" value={sensorData?.ultrasonicDistance?.toFixed(1)} unit="cm" icon={Ruler} color="purple" />
        <StatCard title="GPS Status" value={sensorData?.latitude ? 'Active' : 'N/A'} unit="" icon={Navigation} color="green" />
      </div>

      {/* Daily Risk Summary */}
      <DailyStats history={history} />

      {/* Anomaly Detection */}
      <AnomalyDetector prediction={prediction} />

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Satellite Data - Compact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GPMRainfall />
        <VegetationHealth />
        {nasaPowerSummary && (
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="text-blue-400" size={24} />
              <span className="text-xs text-slate-400">NASA POWER</span>
            </div>
            <div className="text-2xl font-bold text-white">{nasaPowerSummary.rainfall30day?.toFixed(1) || '0.0'} mm</div>
            <div className="text-sm text-slate-400 mb-3">30-Day Rainfall</div>
            
            <div className="space-y-1 text-xs text-slate-400">
              <div>7-Day: {nasaPowerSummary.rainfall7day?.toFixed(1) || '0.0'} mm</div>
              <div>24h: {nasaPowerSummary.rainfall24h?.toFixed(1) || '0.0'} mm</div>
            </div>
            
            {nasaPowerSummary.lastUpdate && (
              <div className="mt-3 text-xs text-slate-500">
                {new Date(nasaPowerSummary.lastUpdate).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Satellite Data Widget */}
      <SatelliteRainfall />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <SensorChart
            data={history}
            dataKey="soilMoisture"
            title="Soil Moisture Trend"
            color="#3b82f6"
          />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <SensorChart
            data={history}
            dataKey="waterLevel"
            title="Water Level Trend"
            color="#06b6d4"
          />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <SensorChart
            data={history}
            dataKey="tilt"
            title="Tilt Angle Trend"
            color="#eab308"
          />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <SensorChart
            data={history}
            dataKey="vibration"
            title="Vibration Activity"
            color="#ef4444"
          />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <SensorChart
            data={history}
            dataKey="ultrasonicDistance"
            title="Distance Trend"
            color="#a855f7"
          />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <GPSMap sensorData={sensorData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
