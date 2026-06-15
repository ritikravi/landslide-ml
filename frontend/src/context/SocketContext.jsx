import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { sensorAPI } from '../services/api';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(SOCKET_URL);

    socketInstance.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      
      // Fetch latest data from API when socket connects
      fetchLatestData();
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('sensor-update', (data) => {
      setLatestData(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchLatestData = async () => {
    try {
      const response = await sensorAPI.getLatest();
      if (response.data.data) {
        console.log('Loaded initial data:', response.data.data.timestamp);
        setLatestData({ sensorData: response.data.data });
      }
    } catch (error) {
      console.log('No previous data available');
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, latestData }}>
      {children}
    </SocketContext.Provider>
  );
};
