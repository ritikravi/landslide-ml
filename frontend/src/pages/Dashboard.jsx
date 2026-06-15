import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { sensorAPI, mlAPI } from '../services/api';
import StatCard from '../components/StatCard';
import RiskIndicator from '../components/RiskIndicator';
import { Droplets, TrendingUp, Navigation, Activity, Waves, Ruler } from 'lucide-react';
import SensorChart from '../components/SensorChart';

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
    <div className="space-y-6">
      {/* Risk Indicator */}
      <RiskIndicator
        riskLevel={prediction?.riskLevel}
        riskScore={prediction?.riskScore}
      />

      {/* Sensor Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ESP32 Status Card */}
        <div className={`p-6 rounded-lg border-2 ${esp32Active ? 'bg-green-900/20 border-green-500' : 'bg-gray-800/50 border-gray-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">ESP32 Status</p>
              <p className={`text-2xl font-bold ${esp32Active ? 'text-green-500' : 'text-gray-400'}`}>
                {esp32Active ? 'Connected' : 'Disconnected'}
              </p>
              {sensorData?.timestamp && (
                <p className="text-xs text-gray-500 mt-1">
                  Last: {Math.floor((new Date() - new Date(sensorData.timestamp)) / 1000)}s ago
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${esp32Active ? 'bg-green-500/20' : 'bg-gray-700'}`}>
              <Activity className={`w-6 h-6 ${esp32Active ? 'text-green-500' : 'text-gray-500'}`} />
            </div>
          </div>
        </div>
        
        <StatCard
          title="Soil Moisture"
          value={sensorData?.soilMoisture?.toFixed(1)}
          unit="%"
          icon={Droplets}
          color="blue"
        />
        <StatCard
          title="Water Level"
          value={sensorData?.waterLevel?.toFixed(1)}
          unit="cm"
          icon={Waves}
          color="cyan"
        />
        <StatCard
          title="Tilt Angle"
          value={sensorData?.tilt?.toFixed(2)}
          unit="°"
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          title="Vibration"
          value={sensorData?.vibration?.toFixed(1)}
          unit=""
          icon={Activity}
          color="red"
        />
        <StatCard
          title="Distance"
          value={sensorData?.ultrasonicDistance?.toFixed(1)}
          unit="cm"
          icon={Ruler}
          color="purple"
        />
        <StatCard
          title="GPS Status"
          value={sensorData?.latitude ? 'Active' : 'N/A'}
          unit=""
          icon={Navigation}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart
          data={history}
          dataKey="soilMoisture"
          title="Soil Moisture Trend"
          color="#3b82f6"
        />
        <SensorChart
          data={history}
          dataKey="waterLevel"
          title="Water Level Trend"
          color="#06b6d4"
        />
        <SensorChart
          data={history}
          dataKey="tilt"
          title="Tilt Angle Trend"
          color="#eab308"
        />
        <SensorChart
          data={history}
          dataKey="vibration"
          title="Vibration Activity"
          color="#ef4444"
        />
      </div>
    </div>
  );
};

export default Dashboard;
