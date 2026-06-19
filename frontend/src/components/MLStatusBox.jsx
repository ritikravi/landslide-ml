import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Zap, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function MLStatusBox({ prediction }) {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([
    { id: 1, name: 'ESP32 Sensors', status: 'waiting', icon: Clock },
    { id: 2, name: 'Cloud Upload', status: 'waiting', icon: Clock },
    { id: 3, name: 'ML Analysis', status: 'waiting', icon: Clock },
    { id: 4, name: 'Risk Prediction', status: 'waiting', icon: Clock }
  ]);

  const [forecastData, setForecastData] = useState([]);

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

      // Process forecast data for pie chart
      const forecasts = prediction.features?.forecasts || [];
      if (forecasts.length > 0) {
        const riskCount = forecasts.reduce((acc, forecast) => {
          acc[forecast.riskLevel] = (acc[forecast.riskLevel] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(riskCount).map(([level, count]) => ({
          name: level,
          value: count,
          percentage: Math.round((count / forecasts.length) * 100)
        }));

        setForecastData(chartData);
      }
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

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'LOW': return '#22c55e';
      case 'MEDIUM': return '#eab308';
      case 'HIGH': return '#f97316';
      case 'CRITICAL': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleChartClick = () => {
    navigate('/predictions');
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-8 border-2 border-slate-700 h-full flex flex-col shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
        ML PIPELINE STATUS
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Pipeline Steps */}
        <div className="space-y-3">
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

        {/* Forecast Pie Chart */}
        <div className="flex flex-col items-center justify-center">
          {forecastData.length > 0 ? (
            <div 
              onClick={handleChartClick}
              className="cursor-pointer hover:scale-105 transition-transform duration-300 w-full"
            >
              <div className="text-center mb-3">
                <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Future Risk Forecast
                </h4>
                <p className="text-xs text-gray-400 mt-1">Click to view details</p>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={forecastData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {forecastData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getRiskColor(entry.name)}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      padding: '8px'
                    }}
                    formatter={(value, name, props) => [
                      `${props.payload.percentage}% (${value} forecast${value > 1 ? 's' : ''})`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {forecastData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getRiskColor(item.name) }}
                    />
                    <span className="text-gray-300 font-medium">{item.name}</span>
                    <span className="text-gray-500">({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No forecast data available</p>
              <p className="text-xs mt-1">Collecting sensor readings...</p>
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
