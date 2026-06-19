import { AlertTriangle, CheckCircle, ShieldAlert, Activity, Zap } from 'lucide-react';

const SEVERITY_CONFIG = {
  HIGH:   { bg: 'bg-red-500/10',    border: 'border-red-500/60',    text: 'text-red-400',    dot: 'bg-red-400',    label: 'HIGH ANOMALY',   pulse: true  },
  MEDIUM: { bg: 'bg-orange-500/10', border: 'border-orange-500/60', text: 'text-orange-400', dot: 'bg-orange-400', label: 'MEDIUM ANOMALY', pulse: true  },
  LOW:    { bg: 'bg-yellow-500/10', border: 'border-yellow-500/60', text: 'text-yellow-400', dot: 'bg-yellow-400', label: 'LOW ANOMALY',    pulse: false },
  NORMAL: { bg: 'bg-green-500/10',  border: 'border-green-500/60',  text: 'text-green-400',  dot: 'bg-green-400',  label: 'NORMAL',         pulse: false },
};

const AnomalyDetector = ({ prediction }) => {
  const anomaly = prediction?.features?.anomaly;

  if (!anomaly) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
        <Activity className="w-5 h-5 text-gray-400 animate-pulse" />
        <div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Anomaly Detection</p>
          <p className="text-xs text-gray-500 mt-0.5">Loading pattern analysis...</p>
        </div>
      </div>
    );
  }

  const config = SEVERITY_CONFIG[anomaly.severity] || SEVERITY_CONFIG.NORMAL;

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-xl p-5 transition-all duration-500`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${config.text}`} />
          <p className="text-sm font-bold text-white uppercase tracking-wider">Anomaly Detection</p>
          <span className="text-xs text-gray-400">(Isolation Forest)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${config.dot} ${config.pulse ? 'animate-ping' : ''}`} />
          <span className={`text-xs font-bold ${config.text}`}>{config.label}</span>
        </div>
      </div>

      {/* Anomaly score bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Anomaly Score</span>
          <span className={`font-bold ${config.text}`}>{anomaly.score}</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
          {/* Score is negative = more anomalous, map to visual */}
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              anomaly.severity === 'HIGH'   ? 'bg-red-500' :
              anomaly.severity === 'MEDIUM' ? 'bg-orange-500' :
              anomaly.severity === 'LOW'    ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: anomaly.isAnomaly ? `${Math.min(100, Math.abs(anomaly.score) * 500 + 30)}%` : '10%' }}
          />
        </div>
      </div>

      {/* Status message */}
      <p className={`text-sm mb-3 ${anomaly.isAnomaly ? config.text : 'text-green-300'}`}>
        {anomaly.isAnomaly
          ? <><AlertTriangle className="w-4 h-4 inline mr-1" />{anomaly.description}</>
          : <><CheckCircle className="w-4 h-4 inline mr-1" />{anomaly.description}</>
        }
      </p>

      {/* Triggered patterns */}
      {anomaly.patterns && anomaly.patterns.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Detected Patterns
          </p>
          {anomaly.patterns.map((pattern, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-200">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
              {pattern}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnomalyDetector;
