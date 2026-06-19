import { TrendingUp, TrendingDown, Minus, Clock, AlertTriangle } from 'lucide-react';

const TrendForecast = ({ prediction }) => {
  if (!prediction?.features?.trends) {
    return null;
  }

  const trends = prediction.features.trends;
  const forecasts = prediction.features.forecasts || [];
  const warnings = prediction.features.warnings || [];

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'increasing': return 'text-red-400';
      case 'decreasing': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'LOW': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm animate-fade-in">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
        <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
        Trend Forecast
      </h3>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {warnings.map((warning, index) => (
            <div key={index} className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-3 flex items-start gap-3 animate-pulse-slow">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 font-medium text-sm">{warning.message}</p>
                <p className="text-red-400/60 text-xs mt-1">{warning.confidence}% confidence</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Trends */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Current Trends</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(trends).map(([sensor, data]) => (
            <div key={sensor} className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 capitalize">
                  {sensor.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {getTrendIcon(data.trend)}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">{data.current.toFixed(1)}</span>
                <span className={`text-xs font-medium ${getTrendColor(data.trend)}`}>
                  {data.trend}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {(data.confidence * 100).toFixed(0)}% confidence
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Forecasts */}
      {forecasts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Risk Predictions
          </h4>
          <div className="space-y-3">
            {forecasts.map((forecast, index) => (
              <div key={index} className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-semibold">In {formatTime(forecast.timeAhead)}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(forecast.riskLevel)}`}>
                    {forecast.riskLevel}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 block">Soil</span>
                    <span className="text-white font-semibold">{forecast.predictedValues.soilMoisture}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Water</span>
                    <span className="text-white font-semibold">{forecast.predictedValues.waterLevel}cm</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Tilt</span>
                    <span className="text-white font-semibold">{forecast.predictedValues.tilt}°</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Risk</span>
                    <span className="text-white font-semibold">{forecast.riskScore}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex-1 bg-gray-700/30 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        forecast.riskLevel === 'CRITICAL' ? 'bg-red-500' :
                        forecast.riskLevel === 'HIGH' ? 'bg-orange-500' :
                        forecast.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${forecast.riskScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 ml-3">{forecast.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendForecast;
