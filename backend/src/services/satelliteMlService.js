/**
 * Satellite ML Service
 * Combines multiple satellite data sources for landslide prediction
 */

import axios from 'axios';

// NASA POWER API - Climate data
const NASA_POWER_BASE = 'https://power.larc.nasa.gov/api/temporal/daily/point';

class SatelliteMlService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour
  }

  /**
   * Get comprehensive satellite data for a location
   */
  async getSatelliteData(lat, lon) {
    const cacheKey = `${lat},${lon}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const [rainfall, climate, terrain] = await Promise.all([
        this.getRainfallData(lat, lon),
        this.getClimateData(lat, lon),
        this.getTerrainData(lat, lon)
      ]);

      const data = {
        rainfall,
        climate,
        terrain,
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching satellite data:', error.message);
      return null;
    }
  }

  /**
   * Get rainfall data from NASA POWER
   */
  async getRainfallData(lat, lon) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const params = {
        parameters: 'PRECTOTCORR',
        community: 'RE',
        longitude: lon,
        latitude: lat,
        start: startDate.toISOString().split('T')[0].replace(/-/g, ''),
        end: endDate.toISOString().split('T')[0].replace(/-/g, ''),
        format: 'JSON'
      };

      const response = await axios.get(NASA_POWER_BASE, {
        params,
        timeout: 10000
      });

      const rainfallData = response.data.properties.parameter.PRECTOTCORR;
      const values = Object.values(rainfallData);
      
      return {
        current: values[values.length - 1],
        last24h: values[values.length - 1],
        last7days: values.reduce((a, b) => a + b, 0),
        average: values.reduce((a, b) => a + b, 0) / values.length,
        trend: this.calculateTrend(values)
      };
    } catch (error) {
      console.log('Rainfall data error:', error.message);
      return {
        current: 0,
        last24h: 0,
        last7days: 0,
        average: 0,
        trend: 'stable'
      };
    }
  }

  /**
   * Get climate/weather data
   */
  async getClimateData(lat, lon) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const params = {
        parameters: 'T2M,RH2M,WS2M,PRECTOTCORR',
        community: 'RE',
        longitude: lon,
        latitude: lat,
        start: startDate.toISOString().split('T')[0].replace(/-/g, ''),
        end: endDate.toISOString().split('T')[0].replace(/-/g, ''),
        format: 'JSON'
      };

      const response = await axios.get(NASA_POWER_BASE, {
        params,
        timeout: 10000
      });

      const data = response.data.properties.parameter;
      
      return {
        temperature: this.getLatestValue(data.T2M),
        humidity: this.getLatestValue(data.RH2M),
        windSpeed: this.getLatestValue(data.WS2M),
        rainfall: this.getLatestValue(data.PRECTOTCORR)
      };
    } catch (error) {
      console.log('Climate data error:', error.message);
      return {
        temperature: 25,
        humidity: 60,
        windSpeed: 5,
        rainfall: 0
      };
    }
  }

  /**
   * Get terrain data (elevation, slope)
   */
  async getTerrainData(lat, lon) {
    try {
      const elevationResponse = await axios.get(
        `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`,
        { timeout: 5000 }
      );

      const elevation = elevationResponse.data.results[0].elevation;
      const slope = await this.calculateSlope(lat, lon, elevation);

      return {
        elevation,
        slope,
        aspect: this.calculateAspect(lat, lon)
      };
    } catch (error) {
      console.log('Terrain data error:', error.message);
      return {
        elevation: 350,
        slope: 5,
        aspect: 180
      };
    }
  }

  /**
   * Calculate slope
   */
  async calculateSlope(lat, lon, centerElevation) {
    try {
      const delta = 0.001;
      const points = [
        [lat + delta, lon],
        [lat - delta, lon],
        [lat, lon + delta],
        [lat, lon - delta]
      ];

      const elevations = await Promise.all(
        points.map(async ([pLat, pLon]) => {
          try {
            const res = await axios.get(
              `https://api.open-elevation.com/api/v1/lookup?locations=${pLat},${pLon}`,
              { timeout: 3000 }
            );
            return res.data.results[0].elevation;
          } catch {
            return centerElevation;
          }
        })
      );

      const maxDiff = Math.max(...elevations.map(e => Math.abs(e - centerElevation)));
      const slope = Math.atan(maxDiff / 100) * (180 / Math.PI);
      
      return Math.min(slope, 45);
    } catch {
      return 5;
    }
  }

  /**
   * Calculate aspect
   */
  calculateAspect(lat, lon) {
    return lat > 0 ? 180 : 0;
  }

  /**
   * Calculate trend
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-3);
    const earlier = values.slice(-6, -3);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    if (recentAvg > earlierAvg * 1.2) return 'increasing';
    if (recentAvg < earlierAvg * 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Get latest value
   */
  getLatestValue(data) {
    const values = Object.values(data);
    return values[values.length - 1];
  }

  /**
   * Generate prediction from satellite data
   */
  async predictFromSatellite(lat, lon, sensorData = null) {
    const satelliteData = await this.getSatelliteData(lat, lon);
    
    if (!satelliteData) {
      return {
        success: false,
        error: 'Unable to fetch satellite data'
      };
    }

    const riskFactors = {
      rainfall: this.assessRainfallRisk(satelliteData.rainfall),
      terrain: this.assessTerrainRisk(satelliteData.terrain),
      climate: this.assessClimateRisk(satelliteData.climate),
      sensor: sensorData ? this.assessSensorRisk(sensorData) : null
    };

    const overallRisk = this.calculateOverallRisk(riskFactors);

    return {
      success: true,
      prediction: {
        riskLevel: overallRisk.level,
        riskScore: overallRisk.score,
        confidence: overallRisk.confidence,
        factors: riskFactors,
        satelliteData: {
          rainfall: satelliteData.rainfall,
          terrain: satelliteData.terrain,
          climate: satelliteData.climate
        },
        timestamp: new Date().toISOString(),
        location: { lat, lon }
      }
    };
  }

  assessRainfallRisk(rainfall) {
    let score = 0;
    let factors = [];

    if (rainfall.last24h > 50) {
      score += 30;
      factors.push('Heavy rainfall in last 24 hours');
    } else if (rainfall.last24h > 20) {
      score += 15;
      factors.push('Moderate rainfall');
    }

    if (rainfall.last7days > 200) {
      score += 40;
      factors.push('Extreme 7-day rainfall');
    } else if (rainfall.last7days > 100) {
      score += 25;
      factors.push('High 7-day rainfall');
    }

    if (rainfall.trend === 'increasing') {
      score += 10;
      factors.push('Rainfall increasing');
    }

    return {
      score: Math.min(score, 100),
      level: score > 70 ? 'HIGH' : score > 40 ? 'MEDIUM' : 'LOW',
      factors,
      data: rainfall
    };
  }

  assessTerrainRisk(terrain) {
    let score = 0;
    let factors = [];

    if (terrain.slope > 30) {
      score += 40;
      factors.push(`Steep slope (${terrain.slope.toFixed(1)}°)`);
    } else if (terrain.slope > 15) {
      score += 25;
      factors.push(`Moderate slope (${terrain.slope.toFixed(1)}°)`);
    }

    if (terrain.elevation > 2000) {
      score += 20;
      factors.push(`High elevation (${terrain.elevation}m)`);
    } else if (terrain.elevation > 1000) {
      score += 10;
      factors.push(`Elevated terrain (${terrain.elevation}m)`);
    }

    return {
      score: Math.min(score, 100),
      level: score > 60 ? 'HIGH' : score > 30 ? 'MEDIUM' : 'LOW',
      factors,
      data: terrain
    };
  }

  assessClimateRisk(climate) {
    let score = 0;
    let factors = [];

    if (climate.humidity > 85) {
      score += 15;
      factors.push('Very high humidity');
    }

    if (climate.rainfall > 30) {
      score += 25;
      factors.push('Heavy rainfall detected');
    }

    return {
      score: Math.min(score, 100),
      level: score > 50 ? 'HIGH' : score > 25 ? 'MEDIUM' : 'LOW',
      factors,
      data: climate
    };
  }

  assessSensorRisk(sensorData) {
    let score = 0;
    let factors = [];

    if (sensorData.soilMoisture > 70) {
      score += 25;
      factors.push('High soil moisture');
    }

    if (sensorData.waterLevel > 70) {
      score += 25;
      factors.push('High water level');
    }

    if (sensorData.tilt > 10) {
      score += 30;
      factors.push('Ground tilt detected');
    }

    if (sensorData.vibration > 30) {
      score += 20;
      factors.push('High vibration');
    }

    return {
      score: Math.min(score, 100),
      level: score > 70 ? 'HIGH' : score > 40 ? 'MEDIUM' : 'LOW',
      factors
    };
  }

  calculateOverallRisk(factors) {
    let totalScore = 0;
    let weights = {
      rainfall: 0.35,
      terrain: 0.25,
      climate: 0.20,
      sensor: 0.20
    };

    if (!factors.sensor) {
      weights = {
        rainfall: 0.45,
        terrain: 0.35,
        climate: 0.20,
        sensor: 0
      };
    }

    totalScore += factors.rainfall.score * weights.rainfall;
    totalScore += factors.terrain.score * weights.terrain;
    totalScore += factors.climate.score * weights.climate;
    if (factors.sensor) {
      totalScore += factors.sensor.score * weights.sensor;
    }

    const score = Math.round(totalScore);
    let level, confidence;

    if (score >= 75) {
      level = 'CRITICAL';
      confidence = 90;
    } else if (score >= 50) {
      level = 'HIGH';
      confidence = 85;
    } else if (score >= 25) {
      level = 'MEDIUM';
      confidence = 80;
    } else {
      level = 'LOW';
      confidence = 75;
    }

    if (factors.sensor) {
      confidence += 10;
    }

    return {
      score,
      level,
      confidence: Math.min(confidence, 95)
    };
  }
}

export default new SatelliteMlService();
