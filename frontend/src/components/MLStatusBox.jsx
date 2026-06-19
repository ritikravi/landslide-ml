import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';

export default function MLStatusBox({ prediction }) {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([
    { id: 1, name: 'ESP32 Sensors', status: 'waiting', icon: Clock },
    { id: 2, name: 'Cloud Upload', status: 'waiting', icon: Clock },
    { id: 3, name: 'ML Analysis', status: 'waiting', icon: Clock },
    { id: 4, name: 'Risk Prediction', status: 'waiting', icon: Clock }
  ]);

  useEffect(() => {
    if (prediction) {
      const isMLWorking = prediction.features?.modelUsed === 'RandomForest';
      const confidence = prediction.features?.confidence || 0;

      setSteps([
        { id: 1, name: 'ESP32 Sensors', status: 'success', icon: CheckCircle, detail: 'Reading data' },
        { id: 2, name: 'Cloud Upload', status: 'success', icon: CheckCircle, detail: 'Data received' },
        { 
          id: 3, 
          name: isMLWorking ? 'ML Model (RandomForest)' : 'ML Model (Fallback)', 
          status: isMLWorking ? 'success' : 'warning',
          icon: isMLWorking ? Zap : Clock,
          detail: isMLWorking ? `${confidence}% confidence` : 'Using fallback'
        },
        { 
          id: 4, 
          name: 'Risk Prediction', 
          status: 'success', 
          icon: CheckCircle, 
          detail: `${prediction.riskLevel} (${prediction.riskScore}/100)`
        }
      ]);
    }
  }, [prediction]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'success': return 'bg-green-500/10';
      case 'warning': return 'bg-yellow-500/10';
      case 'error': return 'bg-red-500/10';
      default: return 'bg-gray-500/10';
    }
  };

  const handleChartClick = () => {
    navigate('/predictions');
  };

  const forecastData = prediction?.features?.forecasts || [];

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-8 border-2 border-slate-700 h-full flex flex-col shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-wide">
        <Zap className="w-7 h-7 text-yellow-400 animate-pulse" />
        ML PIPELINE STATUS
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Pipeline Steps */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              Pipeline Status
            </h4>
            <p className="text-xs text-gray-400 mt-1">Real-time processing steps</p>
          </div>
          <div className="space-y-4 flex-1">
            {steps.map((step) => {
              const Icon = step.icon;
              const stepColors = {
                'success': 'from-green-500/20 to-green-500/5 border-green-500/50',
                'warning': 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/50',
                'error': 'from-red-500/20 to-red-500/5 border-red-500/50',
                'waiting': 'from-gray-500/20 to-gray-500/5 border-gray-500/50'
              };
              
              const colorClass = stepColors[step.status] || stepColors.waiting;
              
              return (
                <div 
                  key={step.id}
                  className={`bg-gradient-to-br ${colorClass} border rounded-xl p-4 hover:shadow-lg transition-all duration-300 h-[72px] flex items-center`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${getStatusBg(step.status)} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${getStatusColor(step.status)} ${step.status === 'success' ? 'animate-pulse' : ''}`} />
                      </div>
                      <div>
                        <span className={`font-semibold text-base block ${step.status === 'success' ? 'text-white' : 'text-gray-400'}`}>
                          {step.name}
                        </span>
                        {step.detail && (
                          <p className="text-sm text-gray-300 font-medium">{step.detail}</p>
                        )}
                      </div>
                    </div>
                    {step.status === 'success' && (
                      <span className="text-lg text-green-400 flex-shrink-0">✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecast Timeline */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Future Risk Forecast
            </h4>
            <p className="text-xs text-gray-400 mt-1">Click to view details</p>
          </div>
          <div className="space-y-4 flex-1">
            {forecastData.length > 0 ? (
              <div 
                onClick={handleChartClick}
                className="cursor-pointer space-y-4"
              >
                {/* Timeline Forecasts */}
                {(prediction?.features?.forecasts || []).map((forecast, index) => {
                  const riskColors = {
                    'LOW': 'from-green-500/20 to-green-500/5 border-green-500/50 text-green-400',
                    'MEDIUM': 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/50 text-yellow-400',
                    'HIGH': 'from-orange-500/20 to-orange-500/5 border-orange-500/50 text-orange-400',
                    'CRITICAL': 'from-red-500/20 to-red-500/5 border-red-500/50 text-red-400'
                  };
                  
                  const timeLabels = ['30 min', '1 hour', '2 hours', '3 hours'];
                  const colorClass = riskColors[forecast.riskLevel] || 'from-gray-500/20 to-gray-500/5 border-gray-500/50 text-gray-400';
                  
                  return (
                    <div 
                      key={index}
                      className={`bg-gradient-to-br ${colorClass} border rounded-xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 h-[72px] flex items-center`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 flex-1">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-white">{timeLabels[index]}</span>
                            <span className="text-3xl font-bold text-white">{forecast.riskScore}</span>
                            <span className="text-sm text-gray-400">/100</span>
                          </div>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorClass.split(' ')[0]} border flex-shrink-0`}>
                          {forecast.riskLevel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12 flex flex-col items-center justify-center h-full">
                <TrendingUp className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-base font-medium">No forecast data available</p>
                <p className="text-sm mt-2">Collecting sensor readings...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      {prediction?.features?.modelUsed === 'RandomForest' && (
        <div className="mt-6 pt-5 border-t border-slate-700/50">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            What's Driving the Prediction
          </h4>
          <p className="text-xs text-gray-400 mb-4">ML model weights learned from 825 real sensor readings</p>
          <div className="space-y-2.5">
            {(() => {
              const fi = prediction?.features?.featureImportance;
              const sensors = [
                { key: 'waterLevel',        label: 'Water Level',   icon: '🌊', color: 'bg-cyan-400',   glow: 'shadow-cyan-400/40' },
                { key: 'soilMoisture',      label: 'Soil Moisture', icon: '💧', color: 'bg-blue-400',   glow: 'shadow-blue-400/40' },
                { key: 'ultrasonicDistance',label: 'Distance',      icon: '📏', color: 'bg-purple-400', glow: 'shadow-purple-400/40' },
                { key: 'tilt',              label: 'Tilt Angle',    icon: '📐', color: 'bg-yellow-400', glow: 'shadow-yellow-400/40' },
                { key: 'vibration',         label: 'Vibration',     icon: '⚡', color: 'bg-red-400',    glow: 'shadow-red-400/40' },
              ];

              const items = fi
                ? sensors
                    .map(s => ({ ...s, value: parseFloat((fi[s.key] * 100).toFixed(1)) }))
                    .sort((a, b) => b.value - a.value)
                : sensors.map(s => ({ ...s, value: null }));

              return items.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-base w-6 flex-shrink-0">{item.icon}</span>
                  <span className="text-xs text-gray-300 w-28 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${item.color} shadow-lg ${item.glow} transition-all duration-1000`}
                      style={{ width: item.value !== null ? `${Math.min(item.value * 1.5, 100)}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-12 text-right flex-shrink-0">
                    {item.value !== null ? `${item.value}%` : '—'}
                  </span>
                </div>
              ));
            })()}
          </div>
          {!prediction?.features?.featureImportance && (
            <p className="text-xs text-gray-500 mt-3 text-center">Live values load on next sensor reading</p>
          )}
        </div>
      )}

      {/* Model info */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-700/30 rounded-lg p-2">
            <span className="text-gray-400">Model:</span>
            <p className={`font-bold mt-1 ${prediction?.features?.modelUsed === 'RandomForest' ? 'text-green-400' : 'text-yellow-400'}`}>
              {prediction?.features?.modelUsed || 'Loading...'}
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-2">
            <span className="text-gray-400">Confidence:</span>
            <p className="font-bold text-white mt-1">{prediction?.features?.confidence || '--'}%</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-2">
            <span className="text-gray-400">Accuracy:</span>
            <p className="font-bold text-white mt-1">
              {prediction?.features?.modelUsed === 'RandomForest' ? '98.79%' : 'N/A'}
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-2">
            <span className="text-gray-400">Updated:</span>
            <p className="font-bold text-white mt-1">
              {prediction?.timestamp ? new Date(prediction.timestamp).toLocaleTimeString() : '--:--:--'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
