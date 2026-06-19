import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

export default function MLStatusBox({ prediction }) {
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

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-8 border-2 border-slate-700 h-full flex flex-col shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
        ML PIPELINE STATUS
      </h3>
      
      <div className="space-y-3 flex-1">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* Step number with line */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${getStatusBg(step.status)} flex items-center justify-center transition-all duration-500 ${step.status === 'success' ? 'scale-110' : ''}`}>
                  <Icon className={`w-4 h-4 ${getStatusColor(step.status)} ${step.status === 'success' ? 'animate-pulse' : ''}`} />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-6 transition-all duration-500 ${step.status === 'success' ? 'bg-green-500/30' : 'bg-gray-600'}`} />
                )}
              </div>

              {/* Step info */}
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${step.status === 'success' ? 'text-white' : 'text-gray-400'}`}>
                    {step.name}
                  </span>
                  {step.status === 'success' && (
                    <span className="text-xs text-green-400">✓</span>
                  )}
                </div>
                {step.detail && (
                  <p className="text-xs text-gray-400 mt-0.5">{step.detail}</p>
                )}
              </div>
            </div>
          );
        })}
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
