import satelliteService from '../services/satelliteService.js';

/**
 * Satellite data controller
 */
export const satelliteController = {
  /**
   * Get latest satellite data
   */
  async getLatest(req, res, next) {
    try {
      const { lat = 30.97, lon = 76.52 } = req.query;
      
      const data = await satelliteService.getLatestData(
        parseFloat(lat),
        parseFloat(lon)
      );
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'No satellite data available'
        });
      }
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get historical satellite data
   */
  async getHistory(req, res, next) {
    try {
      const { lat = 30.97, lon = 76.52, days = 30 } = req.query;
      
      const data = await satelliteService.getHistoricalData(
        parseFloat(lat),
        parseFloat(lon),
        parseInt(days)
      );
      
      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update satellite data
   */
  async update(req, res, next) {
    try {
      const { lat = 30.97, lon = 76.52, days = 30 } = req.body;
      
      const records = await satelliteService.updateSatelliteData(
        parseFloat(lat),
        parseFloat(lon),
        parseInt(days)
      );
      
      res.json({
        success: true,
        message: `Updated ${records.length} records`,
        count: records.length
      });
    } catch (error) {
      next(error);
    }
  }
};
