import { AlertTriangle, CheckCircle, AlertCircle, XCircle, ShieldCheck, ShieldAlert, ShieldX, Droplets, Waves, Activity, Ruler, TrendingUp } from 'lucide-react';

const RiskIndicator = ({ riskLevel, riskScore, sensorData }) => {
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

  // Build safety checklist dynamically from sensor values
  const getChecks = () => {
    const soil = sensorData?.soilMoisture ?? null;
    const water = sensorData?.waterLevel ?? null;
    const vibration = sensorData?.vibration ?? null;
    const tilt = sensorData?.tilt ?? null;
    const distance = sensorData?.ultrasonicDistance ?? null;

    return [
      {
        icon: Droplets,
        label: 'Soil Moisture',
        value: soil !== null ? `${soil.toFixed(1)}%` : 'N/A',
        status: soil === null ? 'unknown' : soil < 70 ? 'safe' : soil < 85 ? 'warning' : 'danger',
        desc: soil === null ? 'No data' : soil < 70 ? 'In safe range' : soil < 85 ? 'Elevated — monitor' : 'Critical saturation'
      },
      {
        icon: Waves,
        label: 'Water Level',
        value: water !== null ? `${water.toFixed(1)}cm` : 'N/A',
        status: water === null ? 'unknown' : water < 60 ? 'safe' : water < 80 ? 'warning' : 'danger',
        desc: water === null ? 'No data' : water < 60 ? 'Stable' : water < 80 ? 'Rising — caution' : 'Flood risk'
      },
      {
        icon: Activity,
        label: 'Vibration',
        value: vibration !== null ? (vibration > 0 ? `${vibration} events` : 'None') : 'N/A',
        status: vibration === null ? 'unknown' : vibration === 0 ? 'safe' : vibration < 5 ? 'warning' : 'danger',
        desc: vibration === null ? 'No data' : vibration === 0 ? 'No activity detected' : vibration < 5 ? 'Minor vibrations' : 'High seismic activity'
      },
      {
        icon: TrendingUp,
        label: 'Tilt Angle',
        value: tilt !== null ? `${tilt.toFixed(2)}°` : 'N/A',
        status: tilt === null ? 'unknown' : tilt < 5 ? 'safe' : tilt < 15 ? 'warning' : 'danger',
        desc: tilt === null ? 'No data' : tilt < 5 ? 'Ground stable' : tilt < 15 ? 'Slight tilt — watch' : 'Dangerous tilt'
      },
      {
        icon: Ruler,
        label: 'Distance Sensor',
        value: distance !== null ? `${distance.toFixed(1)}cm` : 'N/A',
        status: distance === null ? 'unknown' : distance > 30 ? 'safe' : distance > 15 ? 'warning' : 'danger',
        desc: distance === null ? 'No data' : distance > 30 ? 'No displacement' : distance > 15 ? 'Slight movement' : 'Ground shifting'
      }
    ];
  };

  // Real-world recommended actions based on USGS & Japan emergency protocols
  const getRecommendedAction = () => {
    const soil = sensorData?.soilMoisture ?? 0;
    const water = sensorData?.waterLevel ?? 0;
    const vibration = sensorData?.vibration ?? 0;
    const tilt = sensorData?.tilt ?? 0;

    if (riskLevel === 'CRITICAL') {
      return {
        level: 'CRITICAL',
        color: 'border-red-500 bg-red-500/10',
        titleColor: 'text-red-400',
        icon: '🚨',
        title: 'EVACUATE IMMEDIATELY',
        actions: [
          'Leave the area now — do not wait for official orders',
          'Move sideways away from the slide path, never run uphill or downhill',
          'Alert neighbors and call emergency services (112 / local disaster cell)',
          'Do not re-enter the zone until authorities declare it safe'
        ]
      };
    }

    if (riskLevel === 'HIGH') {
      return {
        level: 'HIGH',
        color: 'border-orange-500 bg-orange-500/10',
        titleColor: 'text-orange-400',
        icon: '⚠️',
        title: 'PREPARE TO EVACUATE',
        actions: [
          vibration > 0 ? 'Ground vibration detected — stay away from slopes and cliffs' : 'Monitor slope areas closely — avoid unnecessary outdoor activity',
          water > 80 ? 'Water level critical — move to higher ground immediately' : 'Prepare emergency kit: documents, water, food, torch, first aid',
          soil > 80 ? 'Soil is heavily saturated — slope failure risk is high' : 'Identify and keep evacuation route clear',
          'Alert local disaster management authority and stay by phone'
        ]
      };
    }

    if (riskLevel === 'MEDIUM') {
      return {
        level: 'MEDIUM',
        color: 'border-yellow-500 bg-yellow-500/10',
        titleColor: 'text-yellow-400',
        icon: '🔔',
        title: 'STAY ALERT',
        actions: [
          soil > 70 ? 'Soil moisture elevated — watch for cracks or bulges in ground' : 'Continue regular monitoring of sensor readings',
          water > 60 ? 'Water level rising — check drainage channels near slopes' : 'Avoid construction or digging on or near slopes',
          'Prepare go-bag with essentials in case rapid evacuation is needed',
          'Watch for warning signs: cracking sounds, small rockfalls, tilting trees'
        ]
      };
    }

    // LOW risk — dynamic based on sensor context
    return {
      level: 'LOW',
      color: 'border-green-500 bg-green-500/10',
      titleColor: 'text-green-400',
      icon: '✅',
      title: 'ALL CLEAR — CONTINUE MONITORING',
      actions: [
        'All sensor readings are within safe thresholds',
        'Inspect slope drainage systems and clear any blockages periodically',
        'Check sensor calibration and ESP32 connectivity regularly',
        'Review evacuation plan with household members as a precaution'
      ]
    };
  };

  const action = getRecommendedAction();

  const checks = getChecks();

  const statusStyle = {
    safe:    { dot: 'bg-green-400',  text: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',  Icon: ShieldCheck },
    warning: { dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', Icon: ShieldAlert },
    danger:  { dot: 'bg-red-400',    text: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',       Icon: ShieldX },
    unknown: { dot: 'bg-gray-500',   text: 'text-gray-400',   bg: 'bg-gray-500/10 border-gray-500/30',     Icon: ShieldAlert }
  };

  return (
    <div className={`${config.bgColor} bg-gradient-to-br ${config.gradient} border-2 ${config.borderColor} rounded-xl p-8 h-full shadow-2xl ${config.glowColor} backdrop-blur-sm transition-all duration-500`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
          Landslide Risk Assessment
        </h2>
        <Icon className={`w-12 h-12 ${config.color} animate-pulse`} />
      </div>

      {/* Score + label */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-8xl font-bold text-white drop-shadow-2xl animate-pulse-slow">
            {riskScore ?? '--'}
          </span>
          <span className="text-4xl text-gray-400 font-light">/100</span>
        </div>
        <div className={`px-6 py-3 rounded-full ${config.bgColor} ${config.color} text-xl font-bold border-2 ${config.borderColor} shadow-lg`}>
          {config.label}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800/50 rounded-full h-5 overflow-hidden backdrop-blur-sm shadow-inner mb-6">
        <div
          className={`h-5 rounded-full ${config.color} bg-current transition-all duration-1000 ease-out shadow-lg`}
          style={{ width: `${riskScore || 0}%`, boxShadow: '0 0 20px currentColor' }}
        />
      </div>

      {/* Safety Checklist */}
      <div className="border-t border-white/10 pt-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Safety Status Monitor
        </p>
        <div className="grid grid-cols-1 gap-2">
          {checks.map((check) => {
            const style = statusStyle[check.status];
            const SIcon = check.icon;
            const StatusIcon = style.Icon;
            return (
              <div
                key={check.label}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${style.bg} transition-all duration-300`}
              >
                {/* sensor icon */}
                <SIcon className={`w-4 h-4 ${style.text} flex-shrink-0`} />

                {/* label + desc */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-white">{check.label}</span>
                  <span className="text-xs text-gray-400 ml-2">{check.desc}</span>
                </div>

                {/* value */}
                <span className={`text-sm font-bold ${style.text} flex-shrink-0`}>{check.value}</span>

                {/* status icon with pulsing dot */}
                <div className="relative flex-shrink-0">
                  <StatusIcon className={`w-4 h-4 ${style.text}`} />
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${style.dot} ${check.status !== 'safe' ? 'animate-ping' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Action */}
      <div className={`mt-5 rounded-xl border ${action.color} px-4 py-3`}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Recommended Action
        </p>
        <p className={`text-base font-bold mb-3 ${action.titleColor}`}>
          {action.icon} {action.title}
        </p>
        <ul className="space-y-1.5">
          {action.actions.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                action.level === 'CRITICAL' ? 'bg-red-400' :
                action.level === 'HIGH'     ? 'bg-orange-400' :
                action.level === 'MEDIUM'   ? 'bg-yellow-400' : 'bg-green-400'
              } ${action.level !== 'LOW' ? 'animate-pulse' : ''}`} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RiskIndicator;
