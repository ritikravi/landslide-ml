import mongoose from 'mongoose';

const satelliteDataSchema = new mongoose.Schema({
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  
  // Meteorological data from NASA POWER
  rainfall: {
    type: Number,  // mm/day
    default: 0
  },
  
  rainfall7Day: {
    type: Number,  // 7-day cumulative rainfall
    default: 0
  },
  
  rainfall30Day: {
    type: Number,  // 30-day cumulative rainfall
    default: 0
  },
  
  temperature: {
    type: Number,  // Celsius
    default: null
  },
  
  humidity: {
    type: Number,  // Percentage
    default: null
  },
  
  // Metadata
  source: {
    type: String,
    default: 'NASA_POWER',
    enum: ['NASA_POWER', 'SENTINEL', 'MODIS', 'GPM', 'MANUAL']
  },
  
  dataDate: {
    type: Date,
    required: true,
    index: true
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Additional satellite metrics (for future use)
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Compound index for efficient queries
satelliteDataSchema.index({ 'location.latitude': 1, 'location.longitude': 1, dataDate: -1 });

// Method to calculate risk contribution from rainfall
satelliteDataSchema.methods.getRainfallRiskScore = function() {
  let score = 0;
  
  // Daily rainfall thresholds
  if (this.rainfall > 100) score += 40;  // Extreme rainfall
  else if (this.rainfall > 50) score += 30;  // Heavy rainfall
  else if (this.rainfall > 25) score += 15;  // Moderate rainfall
  
  // 7-day cumulative
  if (this.rainfall7Day > 300) score += 30;
  else if (this.rainfall7Day > 150) score += 20;
  else if (this.rainfall7Day > 75) score += 10;
  
  // 30-day cumulative (soil saturation indicator)
  if (this.rainfall30Day > 500) score += 20;
  else if (this.rainfall30Day > 300) score += 10;
  
  return Math.min(score, 100);
};

const SatelliteData = mongoose.model('SatelliteData', satelliteDataSchema);

export default SatelliteData;
