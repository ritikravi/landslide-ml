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
      const [latestRes, predictionRes, historyRes] = await Promise.all([
        sensorAPI.getLatest(),
        mlAPI.getLatest(),
        sensorAPI.getHistory({ limit: 50 })
      ]);

      setSensorData(latestRes.data.data);
      setPrediction(predictionRes.data.data);
      setHistory(historyRes.data.data);
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

      {/* Satellite Rainfall Data */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="text-2xl mr-2">🛰️</span>
            Satellite Rainfall Data
          </h2>
          <a 
            href="/satellite" 
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Details →
          </a>
        </div>
        <SatelliteRainfall />
      </div>

      {/* Earth Engine Data - Coming Soon */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          <span className="text-2xl mr-2">🛰️</span>
          Advanced Satellite Analysis (Coming Soon)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">📡 GPM Rainfall (Near Real-Time)</h3>
            <p className="text-gray-300 text-sm">4-6 hour delay, 10km resolution</p>
            <p className="text-blue-400 text-sm mt-2">Deploying soon...</p>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">🌱 Vegetation Health (NDVI)</h3>
            <p className="text-gray-300 text-sm">Sentinel-2, 10m resolution</p>
            <p className="text-blue-400 text-sm mt-2">Deploying soon...</p>
          </div>
        </div>
      </div>

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
