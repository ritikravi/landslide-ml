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
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        ML PIPELINE STATUS
      </h3>
      
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* Step number with line */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${getStatusBg(step.status)} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${getStatusColor(step.status)}`} />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-6 ${step.status === 'success' ? 'bg-green-500/30' : 'bg-gray-600'}`} />
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
      {prediction?.features && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400">Model:</span>
              <p className={`font-bold ${prediction.features.modelUsed === 'RandomForest' ? 'text-green-400' : 'text-yellow-400'}`}>
                {prediction.features.modelUsed}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Confidence:</span>
              <p className="font-bold text-white">{prediction.features.confidence}%</p>
            </div>
            <div>
              <span className="text-gray-400">Accuracy:</span>
              <p className="font-bold text-white">
                {prediction.features.modelUsed === 'RandomForest' ? '98.79%' : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Updated:</span>
              <p className="font-bold text-white">
                {new Date(prediction.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
