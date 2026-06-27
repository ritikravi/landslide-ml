/**
 * Weather Service — OpenWeatherMap Integration
 * Fetches real-time rainfall and weather data for sensor coordinates
 * Free tier: 60 calls/min, 1M calls/month
 * API: https://api.openweathermap.org/data/2.5/weather
 */

import axios from 'axios';

const OWM_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const OWM_BASE    = 'https://api.openweathermap.org/data/2.5';

// Cache weather data for 10 minutes to respect free tier limits
let weatherCache = null;
let cacheTime    = null;
const CACHE_TTL  = 10 * 60 * 1000; // 10 minutes

export class WeatherService {

  /**
   * Fetch current weather for given coordinates
   * Returns rainfall (mm/h), humidity, temperature, wind speed
   */
  async getWeatherForLocation(lat, lng) {
    if (!OWM_API_KEY) {
      return this.getFallbackWeather();
    }

    // Return cached data if fresh
    if (weatherCache && cacheTime && (Date.now() - cacheTime) < CACHE_TTL) {
      return weatherCache;
    }

    try {
      const response = await axios.get(`${OWM_BASE}/weather`, {
        params: {
          lat,
          lon: lng,
          appid: OWM_API_KEY,
          units: 'metric'
        },
        timeout: 8000
      });

      const d = response.data;

      const weather = {
        // Rainfall in mm over last 1 hour (rain.1h) or 3 hours
        rainfall1h:     d.rain?.['1h']   ?? 0,
        rainfall3h:     d.rain?.['3h']   ?? 0,

        // General conditions
        humidity:       d.main?.humidity   ?? 0,
        temperature:    d.main?.temp       ?? 0,
        feelsLike:      d.main?.feels_like ?? 0,
        pressure:       d.main?.pressure   ?? 0,
        windSpeed:      d.wind?.speed      ?? 0,
        windDeg:        d.wind?.deg        ?? 0,

        // Cloud cover (high clouds = potential rain)
        cloudiness:     d.clouds?.all      ?? 0,

        // Weather description
        condition:      d.weather?.[0]?.main        ?? 'Unknown',
        description:    d.weather?.[0]?.description ?? 'Unknown',
        icon:           d.weather?.[0]?.icon        ?? '',

        // Location info
        locationName:   d.name ?? 'Unknown',
        country:        d.sys?.country ?? '',

        // Timestamps
        sunrise:        d.sys?.sunrise ? new Date(d.sys.sunrise * 1000).toISOString() : null,
        sunset:         d.sys?.sunset  ? new Date(d.sys.sunset  * 1000).toISOString() : null,
        timestamp:      new Date().toISOString(),

        // Risk assessment from weather
        rainfallRisk:   this.assessRainfallRisk(d.rain?.['1h'] ?? 0, d.rain?.['3h'] ?? 0),
        source:         'OpenWeatherMap'
      };

      weatherCache = weather;
      cacheTime    = Date.now();

      console.log(`🌧️  Weather fetched: ${weather.condition}, Rain: ${weather.rainfall1h}mm/h, Humidity: ${weather.humidity}%`);
      return weather;

    } catch (error) {
      console.error(`❌ Weather API error: ${error.message}`);
      return this.getFallbackWeather();
    }
  }

  /**
   * Get weather for default location (LPU, Punjab) when no GPS fix
   */
  async getDefaultWeather() {
    return this.getWeatherForLocation(31.2548, 75.7057);
  }

  /**
   * Assess rainfall risk level based on IMD rainfall classification
   * IMD Scale: Light <2.5mm/h, Moderate 2.5-7.5, Heavy 7.5-35.5, Very Heavy >35.5
   */
  assessRainfallRisk(rain1h, rain3h) {
    const r = Math.max(rain1h, rain3h / 3);

    if (r === 0)        return { level: 'NONE',       score: 0,  label: 'No rainfall',          color: 'green'  };
    if (r < 2.5)        return { level: 'LIGHT',      score: 10, label: 'Light rain',            color: 'blue'   };
    if (r < 7.5)        return { level: 'MODERATE',   score: 25, label: 'Moderate rain',         color: 'yellow' };
    if (r < 35.5)       return { level: 'HEAVY',      score: 50, label: 'Heavy rain',            color: 'orange' };
    if (r < 64.4)       return { level: 'VERY_HEAVY', score: 75, label: 'Very heavy rain',       color: 'red'    };
    return               { level: 'EXTREME',     score: 95, label: 'Extremely heavy rain',   color: 'red'    };
  }

  /**
   * Calculate weather-adjusted risk boost
   * Rainfall increases landslide risk significantly
   */
  calculateWeatherRiskBoost(weather) {
    if (!weather) return 0;

    let boost = 0;

    // Rainfall contribution (IMD-based)
    boost += weather.rainfallRisk?.score ?? 0;

    // High humidity = soil saturation risk
    if (weather.humidity > 90) boost += 10;
    else if (weather.humidity > 75) boost += 5;

    // Heavy wind on saturated slopes
    if (weather.windSpeed > 10) boost += 5;

    return Math.min(boost, 50); // Cap weather boost at 50 points
  }

  /**
   * Fallback when no API key or network error
   */
  getFallbackWeather() {
    return {
      rainfall1h:   0,
      rainfall3h:   0,
      humidity:     0,
      temperature:  0,
      windSpeed:    0,
      cloudiness:   0,
      condition:    'Unknown',
      description:  'Weather data unavailable',
      rainfallRisk: { level: 'UNKNOWN', score: 0, label: 'No data', color: 'gray' },
      source:       'Unavailable — add OPENWEATHER_API_KEY to .env'
    };
  }
}

export default new WeatherService();
