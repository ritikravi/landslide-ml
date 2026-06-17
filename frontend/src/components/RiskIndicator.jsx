import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const RiskIndicator = ({ riskLevel, riskScore }) => {
  const riskConfig = {
    LOW: {
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      icon: CheckCircle,
      label: 'Low Risk'
    },
    MEDIUM: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      icon: AlertCircle,
      label: 'Medium Risk'
    },
    HIGH: {
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      icon: AlertTriangle,
      label: 'High Risk'
    },
    CRITICAL: {
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      icon: XCircle,
      label: 'Critical Risk'
    }
  };

  const config = riskConfig[riskLevel] || riskConfig.LOW;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border-2 border-current rounded-xl p-8 h-full`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wide">Landslide Risk Assessment</h2>
        <Icon className={`w-12 h-12 ${config.color}`} />
      </div>
      <div className="space-y-4">
        <div className="flex items-baseline space-x-4">
          <span className="text-7xl font-bold text-white">{riskScore ?? '--'}</span>
          <span className="text-3xl text-gray-400">/100</span>
        </div>
        <div className={`inline-block px-6 py-3 rounded-full ${config.bgColor} ${config.color} text-xl font-bold border-2 border-current`}>
          {config.label}
        </div>
      </div>
      <div className="mt-6 w-full bg-gray-700 rounded-full h-4">
        <div
          className={`h-4 rounded-full ${config.color} bg-current transition-all duration-500`}
          style={{ width: `${riskScore || 0}%` }}
        />
      </div>
    </div>
  );
};

export default RiskIndicator;
