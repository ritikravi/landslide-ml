import { useSocket } from '../context/SocketContext';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const ConnectionStatus = () => {
  const { isConnected, latestData } = useSocket();
  const [esp32Status, setEsp32Status] = useState('checking');
  const [lastDataTime, setLastDataTime] = useState(null);

  useEffect(() => {
    const checkESP32Status = () => {
      if (latestData?.sensorData?.timestamp) {
        const dataTime = new Date(latestData.sensorData.timestamp);
        const now = new Date();
        const secondsAgo = (now - dataTime) / 1000;
        
        setLastDataTime(Math.floor(secondsAgo));
        
        if (secondsAgo < 60) {
          setEsp32Status('active');
        } else {
          setEsp32Status('inactive');
        }
      } else if (isConnected) {
        setEsp32Status('waiting');
      }
    };
    
    checkESP32Status();
    const interval = setInterval(checkESP32Status, 5000);
    return () => clearInterval(interval);
  }, [latestData, isConnected]);

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <WifiOff className="w-5 h-5 text-red-500" />
        <span className="text-sm text-red-500">Server Down</span>
      </div>
    );
  }

  if (esp32Status === 'active') {
    return (
      <div className="flex items-center space-x-2">
        <Wifi className="w-5 h-5 text-green-500" />
        <span className="text-sm text-green-500">ESP32 Active</span>
        {lastDataTime !== null && (
          <span className="text-xs text-gray-400">({lastDataTime}s)</span>
        )}
      </div>
    );
  }

  if (esp32Status === 'inactive') {
    return (
      <div className="flex items-center space-x-2">
        <Clock className="w-5 h-5 text-yellow-500" />
        <span className="text-sm text-yellow-500">ESP32 Offline</span>
        {lastDataTime !== null && (
          <span className="text-xs text-gray-400">({lastDataTime}s ago)</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Clock className="w-5 h-5 text-gray-400" />
      <span className="text-sm text-gray-400">Waiting...</span>
    </div>
  );
};

export default ConnectionStatus;
