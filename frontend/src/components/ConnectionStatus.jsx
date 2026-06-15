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
    }
  }, [latestData]);

  const getStatusColor = () => {
    if (!isConnected) return 'red';
    if (!lastUpdate) return 'yellow';
    return isDataFresh ? 'green' : 'yellow';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Server Disconnected';
    if (!lastUpdate) return 'Waiting for data...';
    if (isDataFresh) return 'ESP32 Active';
    return 'No recent data';
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <div className="flex items-center space-x-2">
      {statusColor === 'green' ? (
        <Wifi className="w-5 h-5 text-green-500" />
      ) : statusColor === 'yellow' ? (
        <Clock className="w-5 h-5 text-yellow-500" />
      ) : (
        <WifiOff className="w-5 h-5 text-red-500" />
      )}
      <span className={`text-sm text-${statusColor}-500`}>
        {statusText}
      </span>
      {lastUpdate && (
        <span className="text-xs text-gray-400">
          ({Math.floor((new Date() - lastUpdate) / 1000)}s ago)
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;
