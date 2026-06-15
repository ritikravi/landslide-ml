import { useSocket } from '../context/SocketContext';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const ConnectionStatus = () => {
  const { isConnected, latestData } = useSocket();
  const [isDataFresh, setIsDataFresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (latestData?.sensorData?.timestamp) {
      const dataTime = new Date(latestData.sensorData.timestamp);
      setLastUpdate(dataTime);
      
      // Check if data is fresh (received within last 60 seconds)
      const checkFreshness = () => {
        const now = new Date();
        const diffSeconds = (now - dataTime) / 1000;
        setIsDataFresh(diffSeconds < 60);
      };
      
      checkFreshness();
      const interval = setInterval(checkFreshness, 5000); // Check every 5 seconds
      
      return () => clearInterval(interval);
    } else {
      setIsDataFresh(false);
    }
  }, [latestData]);

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <WifiOff className="w-5 h-5 text-red-500" />
        <span className="text-sm text-red-500">Server Disconnected</span>
      </div>
    );
  }

  if (!lastUpdate) {
    return (
      <div className="flex items-center space-x-2">
        <Clock className="w-5 h-5 text-yellow-500" />
        <span className="text-sm text-yellow-500">Waiting for data...</span>
      </div>
    );
  }

  const secondsAgo = Math.floor((new Date() - lastUpdate) / 1000);

  if (isDataFresh) {
    return (
      <div className="flex items-center space-x-2">
        <Wifi className="w-5 h-5 text-green-500" />
        <span className="text-sm text-green-500">ESP32 Active</span>
        <span className="text-xs text-gray-400">({secondsAgo}s ago)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Clock className="w-5 h-5 text-yellow-500" />
      <span className="text-sm text-yellow-500">No recent data</span>
      <span className="text-xs text-gray-400">({secondsAgo}s ago)</span>
    </div>
  );
};

export default ConnectionStatus;
