import { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { getPrediction, getRiskColorClass } from '../services/mlService';

const MLPredictionCard = ({ sensorData, history = [] }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sensorData) {
      fetchPrediction();
    }
  }, [sensorData]);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getPrediction(sensorData, history);
      
      if (result.success) {
        setPrediction(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Analyzing risk...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900/20 to-slate-900/80 border-2 border-red-500/50 rounded-xl p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-400">Prediction Error</h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Risk Level Card */}
      <div className={`border-2 rounded-xl p-6 ${getRiskColorClass(prediction.riskLevel)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Brain className="w-8 h-8 mr-3" />
            <div>
              <h3 className="text-xl font-bold">{prediction.riskLevel} RISK</h3>
              <p className="text-sm opacity-80">ML Prediction v3.0</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{prediction.riskScore}%</div>
            <div className="text-xs opacity-75">{prediction.confidence.toFixed(1)}% confident</div>
          </div>
        </div>

        {/* SHAP Explanation */}
        {prediction.explanation && (
          <div className="bg-black/20 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-2">Why this prediction?</p>
                <p className="text-sm opacity-90">{prediction.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Contributing Factors */}
      {prediction.topFactors && prediction.topFactors.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Key Risk Factors
          </h4>
          <div className="space-y-3">
            {prediction.topFactors.map((factor, index) => {
              const isIncreasing = factor.includes('increasing');
              const isDecreasing = factor.includes('reducing') || factor.includes('decreasing');
              
              return (
                <div
                  key={index}
                  className="flex items-center p-3 bg-slate-700/30 rounded-lg"
                >
                  {isIncreasing && <TrendingUp className="w-5 h-5 text-red-400 mr-3" />}
                  {isDecreasing && <TrendingDown className="w-5 h-5 text-green-400 mr-3" />}
                  {!isIncreasing && !isDecreasing && <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />}
                  <span className="text-sm text-gray-300">{factor}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Anomaly Detection */}
      {prediction.anomaly && prediction.anomaly.isAnomaly && (
        <div className={`border-2 rounded-xl p-6 ${
          prediction.anomaly.severity === 'HIGH' ? 'bg-red-900/20 border-red-500/50' :
          prediction.anomaly.severity === 'MEDIUM' ? 'bg-yellow-900/20 border-yellow-500/50' :
          'bg-blue-900/20 border-blue-500/50'
        }`}>
          <div className="flex items-start">
            <AlertTriangle className={`w-6 h-6 mr-3 mt-1 ${
              prediction.anomaly.severity === 'HIGH' ? 'text-red-400' :
              prediction.anomaly.severity === 'MEDIUM' ? 'text-yellow-400' :
              'text-blue-400'
            }`} />
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Anomaly Detected - {prediction.anomaly.severity}
              </h4>
              <p className="text-sm text-gray-300 mb-3">{prediction.anomaly.description}</p>
              {prediction.anomaly.patterns && prediction.anomaly.patterns.length > 0 && (
                <div className="space-y-1">
                  {prediction.anomaly.patterns.map((pattern, index) => (
                    <div key={index} className="text-xs text-gray-400">
                      • {pattern}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLPredictionCard;
