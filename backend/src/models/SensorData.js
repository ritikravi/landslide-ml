import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  soilMoisture: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  waterLevel: {
    type: Number,
    required: false,
    min: 0
  },
  tilt: {
    type: Number,
    required: false,
    min: 0
  },
  vibration: {
    type: Number,
    required: false,
    min: 0
  },
  ultrasonicDistance: {
    type: Number,
    required: false,
    min: 0
  },
  latitude: {
    type: Number,
    required: false
  },
  longitude: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient time-based queries
sensorDataSchema.index({ timestamp: -1 });

export default mongoose.model('SensorData', sensorDataSchema);
