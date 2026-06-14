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
    <div className={`${config.bgColor} border border-current rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Landslide Risk Assessment</h3>
        <Icon className={`w-8 h-8 ${config.color}`} />
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline space-x-3">
          <span className="text-4xl font-bold">{riskScore ?? '--'}</span>
          <span className="text-gray-400">/100</span>
        </div>
        <div className={`inline-block px-3 py-1 rounded-full ${config.bgColor} ${config.color} text-sm font-medium`}>
          {config.label}
        </div>
      </div>
      <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${config.color} bg-current transition-all duration-500`}
          style={{ width: `${riskScore || 0}%` }}
        />
      </div>
    </div>
  );
};

export default RiskIndicator;
