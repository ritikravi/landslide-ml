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
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Step number with line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${getStatusBg(step.status)} flex items-center justify-center transition-all duration-500 ${step.status === 'success' ? 'scale-110' : ''}`}>
                    <Icon className={`w-5 h-5 ${getStatusColor(step.status)} ${step.status === 'success' ? 'animate-pulse' : ''}`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-0.5 h-8 transition-all duration-500 ${step.status === 'success' ? 'bg-green-500/30' : 'bg-gray-600'}`} />
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-base ${step.status === 'success' ? 'text-white' : 'text-gray-400'}`}>
                      {step.name}
                    </span>
                    {step.status === 'success' && (
                      <span className="text-sm text-green-400">✓</span>
                    )}
                  </div>
                  {step.detail && (
                    <p className="text-sm text-gray-400 mt-1">{step.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Forecast Timeline */}
        <div className="flex flex-col justify-center gap-4">
          {forecastData.length > 0 ? (
            <div 
              onClick={handleChartClick}
              className="cursor-pointer hover:scale-[1.02] transition-transform duration-300 space-y-4"
            >
              <div className="text-center mb-3">
                <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Future Risk Forecast
                </h4>
                <p className="text-xs text-gray-400 mt-1">Click to view details</p>
              </div>
              
              {/* Timeline Forecasts */}
              {(prediction?.features?.forecasts || []).map((forecast, index) => {
                const riskColors = {
                  'LOW': 'from-green-500/20 to-green-500/5 border-green-500/50 text-green-400',
                  'MEDIUM': 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/50 text-yellow-400',
                  'HIGH': 'from-orange-500/20 to-orange-500/5 border-orange-500/50 text-orange-400',
                  'CRITICAL': 'from-red-500/20 to-red-500/5 border-red-500/50 text-red-400'
                };
                
                const timeLabels = ['30 min', '1 hour', '2 hours'];
                const colorClass = riskColors[forecast.riskLevel] || 'from-gray-500/20 to-gray-500/5 border-gray-500/50 text-gray-400';
                
                return (
                  <div 
                    key={index}
                    className={`bg-gradient-to-br ${colorClass} border rounded-xl p-4 hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-bold text-white">{timeLabels[index]}</span>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorClass.split(' ')[0]} border`}>
                        {forecast.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-white">{forecast.riskScore}</span>
                      <span className="text-sm text-gray-400">/100</span>
                    </div>
                    <div className="mt-3 bg-gray-700/30 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          forecast.riskLevel === 'CRITICAL' ? 'bg-red-500' :
                          forecast.riskLevel === 'HIGH' ? 'bg-orange-500' :
                          forecast.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${forecast.riskScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-gray-400">
                      <span>Confidence: {forecast.confidence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No forecast data available</p>
              <p className="text-sm mt-2">Collecting sensor readings...</p>
            </div>
          )}
        </div>
      </div>

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
