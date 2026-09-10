import { Brain, TrendingUp, Award, CheckCircle, Clock, Target } from 'lucide-react';

const MLModelsShowcase = () => {
  const models = [
    {
      version: "v1.0",
      name: "Real-Time Sensor Model",
      status: "Production Ready",
      statusColor: "green",
      accuracy: "99.4%",
      trained: "September 2026",
      features: 5,
      featureList: ["Soil Moisture", "Water Level", "Tilt Angle", "Vibration", "Distance"],
      modelType: "Random Forest",
      performance: {
        precision: "99.5%",
        recall: "99.2%",
        f1Score: "99.3%",
        rocAuc: "99.8%"
      },
      trainingData: "10,000 synthetic sensor readings",
      useCase: "Real-time IoT monitoring",
      icon: "🎯"
    },
    {
      version: "v2.0",
      name: "Historical India Model",
      status: "Production Ready",
      statusColor: "green",
      accuracy: "90.7%",
      trained: "Sept 9, 2026",
      features: 9,
      featureList: [
        "Elevation", "Slope", "Aspect", "Rainfall",
        "Soil Moisture", "Water Level", "Tilt", "Vibration", "Distance"
      ],
      modelType: "LightGBM + SHAP",
      performance: {
        precision: "88.6%",
        recall: "84.3%",
        f1Score: "86.4%",
        rocAuc: "97.6%"
      },
      trainingData: "5,000 India landslides (1998-2022)",
      dataSources: "ISRO/NRSC (80k), GSI India (87k)",
      regions: "Uttarakhand, Himachal, J&K, Sikkim, Kerala",
      useCase: "Terrain-aware predictions",
      specialFeatures: ["SHAP Explanations", "Anomaly Detection", "Trend Forecasting"],
      icon: "🏔️"
    },
    {
      version: "v3.0",
      name: "Simplified Sensor Model",
      status: "🚀 Currently Active",
      statusColor: "blue",
      isActive: true,
      accuracy: "100%",
      trained: "Sept 10, 2026",
      features: 5,
      featureList: ["Soil Moisture", "Water Level", "Tilt Angle", "Vibration", "Distance"],
      modelType: "LightGBM",
      performance: {
        accuracy: "100%",
        inference: "<50ms",
        optimized: "Real-time IoT"
      },
      trainingData: "1,000 sensor threshold samples",
      useCase: "Production deployment",
      advantages: [
        "Matches ESP32 sensor setup",
        "No terrain data required",
        "Works globally",
        "Faster predictions",
        "Lower latency"
      ],
      icon: "⚡"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/50 rounded-xl p-6">
        <div className="flex items-center mb-3">
          <Brain className="w-8 h-8 text-blue-400 mr-3" />
          <h2 className="text-2xl font-bold text-white">ML Models Evolution</h2>
        </div>
        <p className="text-gray-300">
          Three generations of machine learning models powering our landslide prediction system
        </p>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {models.map((model, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${
              model.isActive
                ? 'from-blue-900/40 to-purple-900/40 border-blue-400 shadow-lg shadow-blue-500/20 scale-105'
                : 'from-slate-800/40 to-slate-900/40 border-slate-600'
            } border-2 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden`}
          >
            {/* Active Badge */}
            {model.isActive && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                ACTIVE
              </div>
            )}

            {/* Model Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl mb-2">{model.icon}</div>
                <h3 className="text-xl font-bold text-white">{model.name}</h3>
                <p className="text-sm text-gray-400">{model.version}</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  model.isActive ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {model.accuracy}
                </div>
                <p className="text-xs text-gray-400">Accuracy</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center mb-4">
              <CheckCircle className={`w-5 h-5 ${
                model.isActive ? 'text-blue-400' : 'text-green-400'
              } mr-2`} />
              <span className={`text-sm font-medium ${
                model.isActive ? 'text-blue-300' : 'text-green-300'
              }`}>
                {model.status}
              </span>
            </div>

            {/* Key Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-300">Trained: {model.trained}</span>
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-300">{model.features} Features</span>
              </div>
              <div className="flex items-center text-sm">
                <Award className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-300">{model.modelType}</span>
              </div>
            </div>

            {/* Features List */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 font-semibold mb-2">Features:</p>
              <div className="flex flex-wrap gap-1">
                {model.featureList.slice(0, 5).map((feature, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
                {model.featureList.length > 5 && (
                  <span className="text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded">
                    +{model.featureList.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-black/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-400 font-semibold mb-2">Performance:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(model.performance).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm font-bold text-white">{value}</div>
                    <div className="text-xs text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Case */}
            <div className="flex items-start mb-3">
              <Target className="w-4 h-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Use Case:</p>
                <p className="text-sm text-gray-300">{model.useCase}</p>
              </div>
            </div>

            {/* Special Features */}
            {model.specialFeatures && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-gray-400 mb-2">Special Features:</p>
                <ul className="space-y-1">
                  {model.specialFeatures.map((feature, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Advantages */}
            {model.advantages && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-gray-400 mb-2">Advantages:</p>
                <ul className="space-y-1">
                  {model.advantages.slice(0, 3).map((adv, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-center">
                      <span className="text-blue-400 mr-2">✓</span>
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Training Data */}
            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="text-xs text-gray-400 mb-1">Training Data:</p>
              <p className="text-xs text-gray-300">{model.trainingData}</p>
              {model.dataSources && (
                <p className="text-xs text-gray-400 mt-1">Sources: {model.dataSources}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
          Model Evolution Strategy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-white mb-2">Phase 1: Prototype</p>
            <p>Built initial Random Forest with synthetic data for proof of concept</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Phase 2: Enhancement</p>
            <p>Integrated real Indian landslide data with terrain features</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Phase 3: Optimization</p>
            <p>Simplified for production with current IoT sensor setup</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLModelsShowcase;
