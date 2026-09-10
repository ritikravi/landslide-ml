# Global Landslide Hazard Zones Feature

## Overview
Monitor real-time conditions in 12 of the world's most landslide-prone regions with live satellite data and historical analysis.

---

## 🌍 Covered Regions

### India (7 zones)
1. **Chamoli District, Uttarakhand** - Site of 2021 disaster
2. **Idukki District, Kerala** - Western Ghats, 2020 Rajamala landslide
3. **Kinnaur District, Himachal Pradesh** - Critical NH-5 highway zone
4. **Mahabaleshwar, Maharashtra** - Hill station, 2021 Taliye disaster
5. **Gangtok & Surrounding, Sikkim** - Eastern Himalayan capital
6. **Ramban District, J&K** - Critical Jammu-Srinagar highway
7. **Darjeeling Hills, West Bengal** - Tea region, 2015 disaster

### International (5 zones)
8. **Sindhupalchok, Nepal** - Most affected by 2015 earthquake
9. **Wenchuan County, China** - 2008 earthquake epicenter
10. **Benguet Province, Philippines** - Mining region, typhoon-prone
11. **Mocoa, Colombia** - 2017 mudflow disaster
12. **Amalfi Coast, Italy** - UNESCO heritage site

---

## 📊 Features

### For Each Hazard Zone:
- **Static Information:**
  - Location coordinates
  - Historical risk level (LOW/MEDIUM/HIGH/CRITICAL)
  - Description
  - Population at risk
  - Vulnerable area
  - Historical disaster events
  - Monitoring status

- **Live Satellite Data:**
  - Current risk assessment (real-time)
  - Rainfall data (24h, 7-day totals)
  - Terrain analysis (elevation, slope)
  - Climate conditions (temperature, humidity)
  - Risk score (0-100) with confidence level
  - 4 risk factor breakdown:
    - Rainfall Risk
    - Terrain Risk
    - Climate Risk
    - Sensor Risk (if available)

---

## 🎯 Use Cases

### 1. Disaster Management Authorities
- Monitor multiple high-risk zones simultaneously
- Filter by country or risk level
- Get live risk assessments for evacuation planning

### 2. Researchers & Scientists
- Access comprehensive historical event data
- Compare real-time conditions across regions
- Study landslide patterns globally

### 3. Travelers & Tourists
- Check current conditions before visiting hill stations
- View live reports for popular destinations
- Understand historical risks

### 4. Local Communities
- Monitor conditions in your region
- View live satellite data updates
- Access historical event information

### 5. Media & Journalists
- Get accurate, live risk data
- Access historical context
- Monitor developing situations

---

## 🛰️ Data Sources

### Real-Time Satellite Data:
- **NASA POWER** - Climate and rainfall
- **Open Elevation API** - Terrain elevation
- **GPM IMERG** - Precipitation data

### Historical Data:
- ISRO/NRSC Landslide Atlas
- Geological Survey of India (GSI)
- International disaster databases
- Local monitoring agencies

---

## 📱 How to Use

### 1. Browse Hazard Zones
- Navigate to "Hazard Zones" in the sidebar
- View all 12 zones with risk indicators
- See summary statistics at the top

### 2. Filter Zones
- Filter by **Country** (India, Nepal, China, Philippines, Colombia, Italy)
- Filter by **Risk Level** (CRITICAL, HIGH, MEDIUM, LOW)
- Reset filters to view all zones

### 3. View Live Reports
- Click on any zone card
- View comprehensive live report with:
  - Current risk assessment
  - 4 risk factor breakdown
  - Historical disaster events
  - Monitoring status
  - Satellite data details

### 4. Understand Risk Levels
- **🔴 CRITICAL** - Immediate danger, evacuation may be needed
- **🟠 HIGH** - Significant risk, prepare for evacuation
- **🟡 MEDIUM** - Moderate risk, monitor conditions
- **🟢 LOW** - Normal conditions, routine monitoring

---

## 📈 Statistics Dashboard

View overall statistics:
- Total hazard zones tracked
- Count by risk level (Critical/High/Medium/Low)
- Distribution by country
- Total population at risk

---

## 🔄 Data Updates

- **Satellite Data**: Updated every 5 minutes (cached for 1 hour)
- **Risk Assessments**: Real-time based on current conditions
- **Historical Data**: Updated as new events occur
- **Zone Database**: Regularly expanded with new regions

---

## 🚀 Coming Soon

- **Mobile alerts** for high-risk zones
- **Email notifications** for selected zones
- **Trend analysis** showing risk changes over time
- **Community reports** from local residents
- **Webcam integration** for visual monitoring
- **More zones** - expanding to 50+ regions worldwide

---

## 🔗 API Endpoints

For developers integrating with the system:

```
GET /api/hazard-zones
GET /api/hazard-zones/:id
GET /api/hazard-zones/:id/live-report
GET /api/hazard-zones/stats/summary
```

Query parameters:
- `country` - Filter by country name
- `riskLevel` - Filter by risk level

---

## 📊 Risk Factor Details

### Rainfall Risk (35% weight)
- 24-hour accumulation
- 7-day totals
- Rainfall trend analysis
- Intensity classification

### Terrain Risk (25% weight)
- Slope angle (0-45°)
- Elevation (meters above sea level)
- Aspect (direction of slope)
- Stability assessment

### Climate Risk (20% weight)
- Current temperature
- Humidity levels
- Wind speed
- Weather patterns

### Sensor Risk (20% weight - when available)
- Soil moisture
- Water level
- Ground tilt
- Vibration activity

---

## 🌟 Key Benefits

1. **Comprehensive Coverage** - 12 major hazard zones worldwide
2. **Live Data** - Real-time satellite monitoring
3. **Historical Context** - Learn from past disasters
4. **User-Friendly** - Easy filtering and navigation
5. **Scientific Accuracy** - NASA and geological survey data
6. **Actionable Intelligence** - Clear risk levels and recommendations

---

## 📞 Support & Contributions

- Report new hazard zones: Submit via GitHub
- Update historical data: Community contributions welcome
- Technical issues: Check API documentation
- Feature requests: Open an issue on GitHub

---

**Last Updated:** September 10, 2026  
**Total Zones:** 12 regions across 6 countries  
**Data Sources:** NASA POWER, Open Elevation, GSI, ISRO, International agencies
