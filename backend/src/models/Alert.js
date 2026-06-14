import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  sensorDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SensorData'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

alertSchema.index({ timestamp: -1 });
alertSchema.index({ isResolved: 1 });

export default mongoose.model('Alert', alertSchema);
