import { useState } from 'react';
import { Cpu, Wifi, WifiOff, Activity, MapPin, Plus, Settings, TrendingUp, AlertTriangle } from 'lucide-react';

// Demo sensor network — in production these would come from your MongoDB
const DEMO_SENSORS = [
  {
    id: 'ESP32-001',
    name: 'Primary Monitor',
    location: 'LPU Campus, Punjab',
    lat: 31.2548, lng: 75.7057,
    status: 'online',
    lastSeen: new Date(Date.now() - 25000).toISOString(),
    soilMoisture: 7, waterLevel: 2, tilt: 0, vibration: 0, distance: 51,
    riskLevel: 'LOW', riskScore: 20,
    uptime: '98.7%', totalReadings: 1240,
    batteryLevel: null, // wired
    firmware: 'v2.1.0',
  },
  {
    id: 'ESP32-002',
    name: 'North Slope Sensor',
    location: 'Slope A — North Face',
    lat: 31.2568, lng: 75.7077,
    status: 'demo',
    lastSeen: null,
    soilMoisture: 45, waterLevel: 30, tilt: 2.5, vibration: 1, distance: 120,
    riskLevel: 'MEDIUM', riskScore: 45,
    uptime: '—', totalReadings: 0,
    batteryLevel: 87, firmware: 'v2.1.0',
  },
  {
    id: 'ESP32-003',
    name: 'River Bank Monitor',
    location: 'River Edge — South',
    lat: 31.2528, lng: 75.7037,
    status: 'demo',
    lastSeen: null,
    soilMoisture: 78, waterLevel: 85, tilt: 5.2, vibration: 3, distance: 45,
    riskLevel: 'HIGH', riskScore: 72,
    uptime: '—', totalReadings: 0,
    batteryLevel: 42, firmware: 'v2.0.5',
  },
];

const RISK_COLORS = {
  LOW:      { bg: 'bg-green-500/20',    border: 'border-green-500/50',    text: 'text-green-400' },
  MEDIUM:   { bg: 'bg-yellow-500/20',   border: 'border-yellow-500/50',   text: 'text-yellow-400' },
  HIGH:     { bg: 'bg-orange-500/20',   border: 'border-orange-500/50',   text: 'text-orange-400' },
  CRITICAL: { bg: 'bg-red-500/20',      border: 'border-red-500/50',      text: 'text-red-400' },
};

const STATUS_CONFIG = {
  online:  { color: 'text-green-400',  dot: 'bg-green-400', label: 'ONLINE', animate: true },
  offline: { color: 'text-red-400',    dot: 'bg-red-400',   label: 'OFFLINE', animate: false },
  demo:    { color: 'text-blue-400',   dot: 'bg-blue-400',  label: 'DEMO',   animate: true },
};

function SensorCard({ sensor, isSelected, onClick }) {
  const risk = RISK_COLORS[sensor.riskLevel] || RISK_COLORS.LOW;
  const status = STATUS_CONFIG[sensor.status];
  const timeAgo = sensor.lastSeen
    ? `${Math.floor((Date.now() - new Date(sensor.lastSeen)) / 1000)}s ago`
    : 'Demo mode';

  return (
    <div
      onClick={onClick}
      className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
        isSelected ? `${risk.border} ${risk.bg}` : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${risk.bg} flex items-center justify-center`}>
            <Cpu className={`w-5 h-5 ${risk.text}`} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">{sensor.name}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />{sensor.location}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end mb-1">
            <span className={`w-2 h-2 rounded-full ${status.dot} ${status.animate ? 'animate-pulse' : ''}`} />
            <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
          </div>
          <span className="text-xs text-gray-500">{sensor.id}</span>
        </div>
      </div>

      {/* Risk badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4 ${risk.bg} ${risk.border} ${risk.text}`}>
        <span className={`w-2 h-2 rounded-full bg-current ${sensor.riskLevel !== 'LOW' ? 'animate-pulse' : ''}`} />
        {sensor.riskLevel} — Score: {sensor.riskScore}/100
      </div>

      {/* Sensor readings grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'Soil', value: `${sensor.soilMoisture}%`, color: 'text-blue-400' },
          { label: 'Water', value: `${sensor.waterLevel}cm`, color: 'text-cyan-400' },
          { label: 'Tilt', value: `${sensor.tilt}°`, color: 'text-yellow-400' },
          { label: 'Vibration', value: sensor.vibration > 0 ? `${sensor.vibration}` : 'None', color: sensor.vibration > 0 ? 'text-red-400' : 'text-gray-400' },
        ].map(r => (
          <div key={r.label} className="bg-slate-700/30 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">{r.label}</p>
            <p className={`text-sm font-bold ${r.color}`}>{r.value}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-slate-700/50">
        <span>Last seen: {timeAgo}</span>
        <span>Readings: {sensor.totalReadings.toLocaleString()}</span>
        {sensor.batteryLevel !== null && (
          <span className={sensor.batteryLevel < 20 ? 'text-red-400' : 'text-green-400'}>
            🔋 {sensor.batteryLevel}%
          </span>
        )}
      </div>

      {sensor.status === 'demo' && (
        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 text-center">
          Demo mode — deploy a second ESP32 to activate this sensor
        </div>
      )}
    </div>
  );
}

export default function SensorNetwork() {
  const [selected, setSelected] = useState('ESP32-001');

  const onlineSensors = DEMO_SENSORS.filter(s => s.status === 'online').length;
  const alertSensors = DEMO_SENSORS.filter(s => ['HIGH', 'CRITICAL'].includes(s.riskLevel)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-slate-900/80 border-2 border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Cpu className="w-10 h-10 text-purple-400 flex-shrink-0" />
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wide">Sensor Network</h1>
              <p className="text-gray-400 text-sm mt-1">
                Multi-sensor deployment dashboard. Monitor multiple ESP32 units across different locations.
                Each sensor has its own ML-powered risk assessment.
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-xl hover:bg-purple-600/40 transition-all text-sm font-bold">
            <Plus className="w-4 h-4" /> Add Sensor
          </button>
        </div>
      </div>

      {/* Network stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sensors', value: DEMO_SENSORS.length, icon: Cpu, color: 'text-purple-400' },
          { label: 'Online', value: onlineSensors, icon: Wifi, color: 'text-green-400' },
          { label: 'Offline / Demo', value: DEMO_SENSORS.length - onlineSensors, icon: WifiOff, color: 'text-gray-400' },
          { label: 'High/Critical Risk', value: alertSensors, icon: AlertTriangle, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
            <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Highest risk alert */}
      {alertSensors > 0 && (
        <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle className="w-7 h-7 text-orange-400 animate-pulse flex-shrink-0" />
          <div>
            <p className="text-orange-300 font-bold">{alertSensors} sensor{alertSensors > 1 ? 's' : ''} reporting elevated risk</p>
            <p className="text-xs text-orange-400/70 mt-0.5">Check sensor details below for specific alerts</p>
          </div>
        </div>
      )}

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEMO_SENSORS.map(sensor => (
          <SensorCard
            key={sensor.id}
            sensor={sensor}
            isSelected={selected === sensor.id}
            onClick={() => setSelected(sensor.id === selected ? null : sensor.id)}
          />
        ))}
      </div>

      {/* How to add more sensors */}
      <div className="bg-slate-800/60 border-2 border-dashed border-slate-600 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-gray-400" />
          <h3 className="text-white font-bold text-lg uppercase tracking-wide">How to Add More Sensors</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { step: '1', title: 'Flash the ESP32', desc: 'Upload the same landslide_monitor_soil_only.ino firmware to a new ESP32 board. Change the SENSOR_ID to "ESP32-002"' },
            { step: '2', title: 'Configure WiFi', desc: 'Update the WiFi credentials and backend URL in the Arduino code to point to your Render API.' },
            { step: '3', title: 'Deploy & Monitor', desc: 'Place the new ESP32 at a different location. It will automatically appear here as a new sensor in the network.' },
          ].map(s => (
            <div key={s.step} className="bg-slate-700/30 rounded-xl p-4">
              <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/40 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm mb-3">
                {s.step}
              </div>
              <h4 className="text-white font-semibold mb-2">{s.title}</h4>
              <p className="text-gray-400 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
