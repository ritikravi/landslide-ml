import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { sensorAPI, mlAPI } from '../services/api';
import StatCard from '../components/StatCard';
import RiskIndicator from '../components/RiskIndicator';
import MLStatusBox from '../components/MLStatusBox';
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
    <div className="space-y-6">
      {/* Risk Indicator and ML Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskIndicator
            riskLevel={prediction?.riskLevel}
            riskScore={prediction?.riskScore}
          />
        </div>
        <div>
          <MLStatusBox prediction={prediction} />
        </div>
      </div>

      {/* Sensor Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          value={sensorData?.vibration > 0 ? sensorData.vibration : 'None'}
          unit={sensorData?.vibration > 0 ? 'events' : ''}
          icon={Activity}
          color={sensorData?.vibration > 0 ? 'red' : 'gray'}
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
        <SensorChart
          data={history}
          dataKey="ultrasonicDistance"
          title="Distance Trend"
          color="#a855f7"
        />
      </div>
    </div>
  );
};

export default Dashboard;
