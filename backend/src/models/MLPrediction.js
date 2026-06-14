import mongoose from 'mongoose';

const mlPredictionSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },
  sensorDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SensorData'
  },
  features: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

mlPredictionSchema.index({ timestamp: -1 });

export default mongoose.model('MLPrediction', mlPredictionSchema);
