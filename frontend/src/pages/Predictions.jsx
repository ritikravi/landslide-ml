import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { sensorAPI, mlAPI } from '../services/api';
import { TrendingUp, TrendingDown, Minus, Clock, AlertTriangle, Brain, Activity, Calendar, Target, Zap, ShieldAlert, ShieldCheck, Search } from 'lucide-react';

const Predictions = () => {
  const { latestData } = useSocket();
  const [prediction, setPrediction] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (latestData) {
      setSensorData(latestData.sensorData);
      setPrediction(latestData.prediction);
      setHistory((prev) => [latestData.sensorData, ...prev].slice(0, 50));
    }
  }, [latestData]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [latestRes, predictionRes, historyRes] = await Promise.all([
        sensorAPI.getLatest(),
        mlAPI.getLatest(),
        sensorAPI.getHistory({ limit: 50 })
      ]);

      setSensorData(latestRes.data.data);
      setPrediction(predictionRes.data.data);
      setHistory(historyRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trends = prediction?.features?.trends;
  const forecasts = prediction?.features?.forecasts || [];
  const warnings = prediction?.features?.warnings || [];

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'increasing': return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'decreasing': return <TrendingDown className="w-5 h-5 text-green-400" />;
      default: return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'increasing': return 'text-red-400 bg-red-500/10';
      case 'decreasing': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!trends) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-12 text-center shadow-xl">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-3">Collecting Data for Predictions</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            The ML prediction system needs at least 5 historical readings to analyze trends and forecast future risk levels.
            Your ESP32 sensor is currently collecting data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300 font-semibold">Current Readings</p>
              <p className="text-2xl font-bold text-white">{history.length}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300 font-semibold">Required Minimum</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300 font-semibold">Estimated Time</p>
              <p className="text-2xl font-bold text-white">{Math.max(0, (5 - history.length) * 0.5)}m</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            Data is collected every 30 seconds. Refresh this page once you have enough readings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
          <h1 className="text-3xl font-bold text-white uppercase tracking-wide">AI-Powered Risk Predictions</h1>
        </div>
        <p className="text-gray-300">
          Two ML models working together: <span className="text-green-400 font-semibold">Random Forest (98.79% accuracy)</span> for risk classification
          and <span className="text-purple-400 font-semibold">Isolation Forest</span> for anomaly pattern detection.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <Zap className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-400 font-bold text-sm">Model 1 — Random Forest Classifier</p>
              <p className="text-gray-400 text-xs mt-0.5">Predicts risk level (LOW/MEDIUM/HIGH/CRITICAL) with 98.79% accuracy. Trained on 825 real sensor readings. Forecasts 30min → 3hr ahead.</p>
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <Search className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div>
              <p className="text-purple-400 font-bold text-sm">Model 2 — Isolation Forest (Anomaly Detection)</p>
              <p className="text-gray-400 text-xs mt-0.5">Detects unusual sensor patterns that precede landslides — sudden spikes, sustained deviations, cross-sensor correlations. Flags 5% of readings as anomalous.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Critical Warnings
          </h2>
          {warnings.map((warning, index) => (
            <div key={index} className="bg-gradient-to-r from-red-900/40 to-red-800/40 border-l-4 border-red-500 rounded-xl p-5 flex items-start gap-4 animate-pulse-slow shadow-xl shadow-red-500/20">
              <AlertTriangle className="w-7 h-7 text-red-400 flex-shrink-0 mt-1 animate-pulse" />
              <div className="flex-1">
                <p className="text-red-200 font-bold text-lg mb-1">{warning.message}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-red-400/80">Confidence: {warning.confidence}%</span>
                  <span className="px-3 py-1 bg-red-500/30 rounded-full text-red-300 font-semibold">
                    {warning.severity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Risk Status */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Activity className="w-6 h-6 text-blue-400" />
          Current Risk Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-gray-400 mb-1">Risk Level</p>
            <p className={`text-2xl font-bold ${getRiskColor(prediction?.riskLevel).split(' ')[0]}`}>
              {prediction?.riskLevel || 'N/A'}
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-gray-400 mb-1">Risk Score</p>
            <p className="text-2xl font-bold text-white">
              {prediction?.riskScore || '--'}<span className="text-lg text-gray-400">/100</span>
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-gray-400 mb-1">ML Confidence</p>
            <p className="text-2xl font-bold text-white">
              {prediction?.features?.confidence || '--'}%
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-gray-400 mb-1">Model Used</p>
            <p className="text-lg font-bold text-green-400">
              {prediction?.features?.modelUsed || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Anomaly Detection Model */}
      {(() => {
        const anomaly = prediction?.features?.anomaly;
        const SEVERITY = {
          HIGH:   { bg: 'bg-red-500/10',    border: 'border-red-500/60',    text: 'text-red-400',    dot: 'bg-red-400',    barColor: 'bg-red-500',    label: 'HIGH ANOMALY'   },
          MEDIUM: { bg: 'bg-orange-500/10', border: 'border-orange-500/60', text: 'text-orange-400', dot: 'bg-orange-400', barColor: 'bg-orange-500', label: 'MEDIUM ANOMALY' },
          LOW:    { bg: 'bg-yellow-500/10', border: 'border-yellow-500/60', text: 'text-yellow-400', dot: 'bg-yellow-400', barColor: 'bg-yellow-500', label: 'LOW ANOMALY'    },
          NORMAL: { bg: 'bg-green-500/10',  border: 'border-green-500/60',  text: 'text-green-400',  dot: 'bg-green-400',  barColor: 'bg-green-500',  label: 'NORMAL'         },
        };
        const cfg = anomaly ? (SEVERITY[anomaly.severity] || SEVERITY.NORMAL) : null;
        return (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-purple-500/30 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
              <Search className="w-6 h-6 text-purple-400" />
              Anomaly Detection Model
              <span className="text-xs font-normal text-purple-400 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full ml-2">Isolation Forest</span>
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Pattern-based detection using 11 engineered features — finds unusual sensor combinations that simple thresholds miss.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                { label: 'Raw Sensors', value: '5', desc: 'soil, water, tilt, vibration, distance', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Rate of Change', value: '3', desc: 'sudden spikes per reading', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: 'Rolling Deviation', value: '2', desc: 'deviation from 5-reading average', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { label: 'Combined Risk', value: '1', desc: 'cross-sensor weighted score', color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: 'Training Data', value: '825', desc: 'real sensor readings', color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Anomaly Rate', value: '5.1%', desc: 'flagged in training set', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map(f => (
                <div key={f.label} className={`${f.bg} border border-slate-600/50 rounded-xl p-3 text-center`}>
                  <p className={`text-2xl font-bold ${f.color}`}>{f.value}</p>
                  <p className="text-white font-semibold text-xs mt-1">{f.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
            {anomaly && cfg ? (
              <div className={`${cfg.bg} border-2 ${cfg.border} rounded-xl p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {anomaly.isAnomaly ? <AlertTriangle className={`w-5 h-5 ${cfg.text} animate-pulse`} /> : <ShieldCheck className={`w-5 h-5 ${cfg.text}`} />}
                    Current Reading Analysis
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${cfg.dot} ${anomaly.isAnomaly ? 'animate-ping' : ''}`} />
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>{cfg.label}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Anomaly Score</span>
                    <span className={`font-bold ${cfg.text}`}>{anomaly.score}</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                    <div className={`h-3 rounded-full transition-all duration-1000 ${cfg.barColor}`}
                      style={{ width: anomaly.isAnomaly ? `${Math.min(100, Math.abs(anomaly.score) * 600 + 25)}%` : '8%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Normal (0.24)</span><span>Threshold (0.06)</span><span>Anomalous (-0.18)</span>
                  </div>
                </div>
                <p className="text-sm text-gray-200 mb-4">{anomaly.description}</p>
                {anomaly.patterns?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <ShieldAlert className="w-3.5 h-3.5" /> Detected Patterns
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {anomaly.patterns.map((p, i) => (
                        <div key={i} className={`flex items-start gap-2 text-sm p-3 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot} ${anomaly.isAnomaly ? 'animate-pulse' : ''}`} />
                          <span className="text-gray-200">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-6 text-center">
                <Search className="w-10 h-10 text-purple-400 mx-auto mb-2 animate-pulse" />
                <p className="text-white font-semibold">Waiting for next sensor reading</p>
                <p className="text-gray-400 text-sm mt-1">Anomaly analysis runs on every ESP32 reading</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Sensor Trends Analysis */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Sensor Trend Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(trends).map(([sensor, data]) => (
            <div key={sensor} className="bg-slate-700/40 rounded-xl p-5 border border-slate-600/50 hover:border-slate-500 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  {sensor.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {getTrendIcon(data.trend)}
              </div>
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{data.current.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">
                    {sensor === 'soilMoisture' ? '%' : sensor === 'waterLevel' ? 'cm' : sensor === 'tilt' ? '°' : ''}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getTrendColor(data.trend)}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  {data.trend.toUpperCase()}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Confidence</span>
                  <span className="text-white font-semibold">{(data.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${data.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Risk Forecasts */}
      {forecasts.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
            <Clock className="w-6 h-6 text-purple-400 animate-pulse" />
            Future Risk Forecasts
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {forecasts.map((forecast, index) => {
              const isEscalating = prediction?.riskLevel && 
                ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].indexOf(forecast.riskLevel) > 
                ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].indexOf(prediction.riskLevel);
              
              return (
                <div 
                  key={index} 
                  className={`bg-slate-700/30 rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                    isEscalating 
                      ? 'border-red-500/50 shadow-lg shadow-red-500/20' 
                      : 'border-slate-600/50'
                  }`}
                >
                  {/* Time Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-5 h-5 ${isEscalating ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
                      <span className="text-white font-bold text-lg">In {formatTime(forecast.timeAhead)}</span>
                    </div>
                    {isEscalating && (
                      <TrendingUp className="w-5 h-5 text-red-400 animate-bounce" />
                    )}
                  </div>

                  {/* Risk Level Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 mb-4 ${getRiskColor(forecast.riskLevel)}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                    {forecast.riskLevel}
                  </div>

                  {/* Risk Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Predicted Risk Score</span>
                      <span className="text-2xl font-bold text-white">{forecast.riskScore}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          forecast.riskLevel === 'CRITICAL' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                          forecast.riskLevel === 'HIGH' ? 'bg-orange-500 shadow-lg shadow-orange-500/50' :
                          forecast.riskLevel === 'MEDIUM' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
                          'bg-green-500 shadow-lg shadow-green-500/50'
                        }`}
                        style={{ width: `${forecast.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Predicted Sensor Values */}
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Predicted Values</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800/50 rounded-lg p-2">
                        <span className="text-gray-400 block">Soil</span>
                        <span className="text-white font-bold">{forecast.predictedValues.soilMoisture}%</span>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-2">
                        <span className="text-gray-400 block">Water</span>
                        <span className="text-white font-bold">{forecast.predictedValues.waterLevel}cm</span>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-2">
                        <span className="text-gray-400 block">Tilt</span>
                        <span className="text-white font-bold">{forecast.predictedValues.tilt}°</span>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-2">
                        <span className="text-gray-400 block">Vibration</span>
                        <span className="text-white font-bold">{forecast.predictedValues.vibration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-600/50">
                    <span className="text-gray-400">Forecast Confidence</span>
                    <span className="text-white font-bold">{forecast.confidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Calendar className="w-6 h-6 text-cyan-400" />
          Analysis Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-gray-400 mb-1">Historical Readings</p>
            <p className="text-2xl font-bold text-white">{history.length}</p>
            <p className="text-xs text-gray-500 mt-1">Used for trend analysis</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-gray-400 mb-1">Forecasts Generated</p>
            <p className="text-2xl font-bold text-white">{forecasts.length}</p>
            <p className="text-xs text-gray-500 mt-1">Future time intervals</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-gray-400 mb-1">Last Updated</p>
            <p className="text-lg font-bold text-white">
              {prediction?.timestamp ? new Date(prediction.timestamp).toLocaleTimeString() : '--:--:--'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {prediction?.timestamp ? new Date(prediction.timestamp).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
