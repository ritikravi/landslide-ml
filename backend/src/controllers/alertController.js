import Alert from '../models/Alert.js';
import alertService from '../services/alertService.js';

export const getAlerts = async (req, res, next) => {
  try {
    const { limit = 50, unresolved } = req.query;

    let alerts;
    if (unresolved === 'true') {
      alerts = await alertService.getUnresolvedAlerts();
    } else {
      alerts = await alertService.getRecentAlerts(parseInt(limit));
    }

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

export const createAlert = async (req, res, next) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();

    // Emit real-time alert
    if (req.io) {
      req.io.emit('alert-created', alert);
    }

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findByIdAndUpdate(
      id,
      { isResolved: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};
