import mlService from '../services/mlService.js';

export const getPredictions = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    
    const predictions = await mlService.getPredictionHistory(parseInt(limit));

    res.json({
      success: true,
      count: predictions.length,
      data: predictions
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestPrediction = async (req, res, next) => {
  try {
    const prediction = await mlService.getLatestPrediction();

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'No predictions found'
      });
    }

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    next(error);
  }
};
