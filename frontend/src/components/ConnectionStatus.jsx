import { useSocket } from '../context/SocketContext';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const { isConnected } = useSocket();

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-500">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-500">Disconnected</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;
