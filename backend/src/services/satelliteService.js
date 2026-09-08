import axios from 'axios';
import SatelliteData from '../models/SatelliteData.js';

const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

export class SatelliteService {
  /**
   * Fetch rainfall and weather data from NASA POWER API
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} startDate - Format: YYYYMMDD
   * @param {string} endDate - Format: YYYYMMDD
   */
  async fetchNASAPowerData(lat, lon, startDate, endDate) {
    try {
      console.log(`🛰️  Fetching NASA POWER data for (${lat}, ${lon}) from ${startDate} to ${endDate}`);
      
      const params = {
        parameters: 'PRECTOTCORR,T2M,RH2M',  // Precipitation, Temperature, Humidity
        community: 'RE',  // Renewable Energy community (best for general weather)
        longitude: lon,
        latitude: lat,
        start: startDate,
        end: endDate,
        format: 'JSON'
      };
      
      const response = await axios.get(NASA_POWER_BASE_URL, {
        params,
        timeout: 30000
      });
      
      if (response.data && response.data.properties && response.data.properties.parameter) {
        console.log('✅ NASA POWER data received');
        return response.data.properties.parameter;
      }
      
      throw new Error('Invalid response format from NASA POWER API');
      
    } catch (error) {
      console.error('❌ Error fetching NASA POWER data:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Process and save NASA POWER data to database
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} days - Number of days to fetch (default: 30)
   */
  async updateSatelliteData(lat, lon, days = 30) {
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const startStr = this.formatDate(startDate);
      const endStr = this.formatDate(endDate);
      
      // Fetch data from NASA POWER
      const nasaData = await this.fetchNASAPowerData(lat, lon, startStr, endStr);
      
      // Extract parameters
      const rainfall = nasaData.PRECTOTCORR || {};  // Precipitation
      const temperature = nasaData.T2M || {};        // Temperature at 2m
      const humidity = nasaData.RH2M || {};          // Relative Humidity at 2m
      
      const savedRecords = [];
      
      // Process each day
      for (const dateKey in rainfall) {
        const date = this.parseDate(dateKey);
        
        // Skip if data is invalid
        if (rainfall[dateKey] === -999 || rainfall[dateKey] === null) continue;
        
        // Calculate cumulative rainfall
        const rainfall7Day = this.calculateCumulativeRainfall(rainfall, dateKey, 7);
        const rainfall30Day = this.calculateCumulativeRainfall(rainfall, dateKey, 30);
        
        // Create or update record
        const record = await SatelliteData.findOneAndUpdate(
          {
            'location.latitude': lat,
            'location.longitude': lon,
            dataDate: date
          },
          {
            location: { latitude: lat, longitude: lon },
            rainfall: rainfall[dateKey] || 0,
            rainfall7Day,
            rainfall30Day,
            temperature: temperature[dateKey] !== -999 ? temperature[dateKey] : null,
            humidity: humidity[dateKey] !== -999 ? humidity[dateKey] : null,
            source: 'NASA_POWER',
            dataDate: date,
            timestamp: new Date()
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        );
        
        savedRecords.push(record);
      }
      
      console.log(`✅ Saved ${savedRecords.length} satellite data records`);
      return savedRecords;
      
    } catch (error) {
      console.error('❌ Error updating satellite data:', error.message);
      throw error;
    }
  }

  /**
   * Get latest satellite data for a location
   */
  async getLatestData(lat, lon) {
    try {
      const data = await SatelliteData.findOne({
        'location.latitude': lat,
        'location.longitude': lon
      }).sort({ dataDate: -1 });
      
      return data;
    } catch (error) {
      console.error('❌ Error getting latest satellite data:', error.message);
      return null;
    }
  }

  /**
   * Get historical satellite data for a location
   */
  async getHistoricalData(lat, lon, days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const data = await SatelliteData.find({
        'location.latitude': lat,
        'location.longitude': lon,
        dataDate: { $gte: cutoffDate }
      }).sort({ dataDate: -1 });
      
      return data;
    } catch (error) {
      console.error('❌ Error getting historical satellite data:', error.message);
      return [];
    }
  }

  /**
   * Get rainfall summary for ML integration
   */
  async getRainfallSummary(lat, lon) {
    try {
      const latest = await this.getLatestData(lat, lon);
      
      if (!latest) {
        return {
          rainfall24h: 0,
          rainfall7day: 0,
          rainfall30day: 0,
          temperature: null,
          humidity: null,
          riskScore: 0
        };
      }
      
      return {
        rainfall24h: latest.rainfall || 0,
        rainfall7day: latest.rainfall7Day || 0,
        rainfall30day: latest.rainfall30Day || 0,
        temperature: latest.temperature,
        humidity: latest.humidity,
        riskScore: latest.getRainfallRiskScore(),
        lastUpdate: latest.dataDate
      };
    } catch (error) {
      console.error('❌ Error getting rainfall summary:', error.message);
      return null;
    }
  }

  /**
   * Calculate cumulative rainfall over N days
   */
  calculateCumulativeRainfall(rainfallData, currentDateKey, days) {
    const dates = Object.keys(rainfallData).sort();
    const currentIndex = dates.indexOf(currentDateKey);
    
    if (currentIndex === -1) return 0;
    
    let sum = 0;
    let count = 0;
    
    for (let i = currentIndex; i >= 0 && count < days; i--) {
      const value = rainfallData[dates[i]];
      if (value !== -999 && value !== null) {
        sum += value;
      }
      count++;
    }
    
    return sum;
  }

  /**
   * Format date for NASA POWER API (YYYYMMDD)
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Parse date from NASA POWER format (YYYYMMDD)
   */
  parseDate(dateStr) {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  }

  /**
   * Check if satellite data needs update (older than 1 day)
   */
  async needsUpdate(lat, lon) {
    const latest = await this.getLatestData(lat, lon);
    
    if (!latest) return true;
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return latest.dataDate < oneDayAgo;
  }

  /**
   * Auto-update satellite data for default location
   * Call this daily via cron job
   */
  async autoUpdate(lat = 30.97, lon = 76.52) {
    try {
      console.log('🔄 Auto-update: Checking satellite data...');
      
      const needsUpdate = await this.needsUpdate(lat, lon);
      
      if (needsUpdate) {
        console.log('📡 Satellite data outdated, fetching new data...');
        await this.updateSatelliteData(lat, lon, 30);
        console.log('✅ Satellite data updated successfully');
      } else {
        console.log('✓ Satellite data is up to date');
      }
    } catch (error) {
      console.error('❌ Auto-update failed:', error.message);
    }
  }
}

export default new SatelliteService();
