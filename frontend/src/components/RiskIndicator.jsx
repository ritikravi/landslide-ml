import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const RiskIndicator = ({ riskLevel, riskScore }) => {
  const riskConfig = {
    LOW: {
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500',
      glowColor: 'shadow-green-500/50',
      icon: CheckCircle,
      label: 'Low Risk',
      gradient: 'from-green-500/20 to-green-500/5'
    },
    MEDIUM: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500',
      glowColor: 'shadow-yellow-500/50',
      icon: AlertCircle,
      label: 'Medium Risk',
      gradient: 'from-yellow-500/20 to-yellow-500/5'
    },
    HIGH: {
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500',
      glowColor: 'shadow-orange-500/50',
      icon: AlertTriangle,
      label: 'High Risk',
      gradient: 'from-orange-500/20 to-orange-500/5'
    },
    CRITICAL: {
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500',
      glowColor: 'shadow-red-500/50',
      icon: XCircle,
      label: 'Critical Risk',
      gradient: 'from-red-500/20 to-red-500/5'
    }
  };

  const config = riskConfig[riskLevel] || riskConfig.LOW;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} bg-gradient-to-br ${config.gradient} border-2 ${config.borderColor} rounded-xl p-8 h-full shadow-2xl ${config.glowColor} backdrop-blur-sm transition-all duration-500 hover:shadow-3xl`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
          Landslide Risk Assessment
        </h2>
        <Icon className={`w-12 h-12 ${config.color} animate-pulse`} />
      </div>
      <div className="space-y-4">
        <div className="flex items-baseline space-x-4">
          <span className="text-8xl font-bold text-white drop-shadow-2xl animate-pulse-slow">
            {riskScore ?? '--'}
          </span>
          <span className="text-4xl text-gray-400 font-light">/100</span>
        </div>
        <div className={`inline-block px-8 py-4 rounded-full ${config.bgColor} ${config.color} text-2xl font-bold border-2 ${config.borderColor} shadow-lg transform transition-transform hover:scale-105`}>
          {config.label}
        </div>
      </div>
      <div className="mt-8 w-full bg-gray-800/50 rounded-full h-5 overflow-hidden backdrop-blur-sm shadow-inner">
        <div
          className={`h-5 rounded-full ${config.color} bg-current transition-all duration-1000 ease-out shadow-lg`}
          style={{ 
            width: `${riskScore || 0}%`,
            boxShadow: `0 0 20px currentColor`
          }}
        />
      </div>
    </div>
  );
};

export default RiskIndicator;
