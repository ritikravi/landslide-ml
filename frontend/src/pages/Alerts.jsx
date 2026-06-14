import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { alertAPI } from '../services/api';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const params = filter === 'unresolved' ? { unresolved: true } : {};
      const res = await alertAPI.getAll(params);
      setAlerts(res.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertAPI.resolve(id);
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'WARNING': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'INFO': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/20 border-red-500';
      case 'WARNING': return 'bg-yellow-500/20 border-yellow-500';
      case 'INFO': return 'bg-blue-500/20 border-blue-500';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Alert Management</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Alerts</option>
          <option value="unresolved">Unresolved Only</option>
        </select>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-lg p-8 text-center text-gray-400">
            No alerts found
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`border rounded-lg p-4 ${getSeverityBg(alert.severity)} ${
                alert.isResolved ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.severity)}
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {alert.isResolved ? (
                    <span className="flex items-center space-x-1 text-green-500 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Resolved</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
