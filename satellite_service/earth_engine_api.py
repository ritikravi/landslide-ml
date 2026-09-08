"""
Google Earth Engine API Service
Provides near real-time satellite data for landslide monitoring
"""
import os
import ee
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Earth Engine with Service Account support
def initialize_earth_engine():
    """Initialize Earth Engine with service account or local auth"""
    service_account_key = os.getenv('GEE_SERVICE_ACCOUNT_KEY')
    
    if service_account_key:
        # Production: Use service account
        try:
            import json
            credentials_dict = json.loads(service_account_key)
            service_account_email = credentials_dict['client_email']
            project_id = credentials_dict.get('project_id', 'spaceclub-501318')
            
            credentials = ee.ServiceAccountCredentials(
                email=service_account_email,
                key_data=service_account_key
            )
            
            ee.Initialize(credentials=credentials, project=project_id)
            print(f"✅ Earth Engine initialized with service account: {service_account_email}")
            return True
        except Exception as e:
            print(f"❌ Service account init failed: {e}")
            return False
    else:
        # Local development: Try multiple projects
        projects = ['spaceclub-501318', 'rmna-street-495308', 'verdant-abacus-480107-i9']
        
        for project_id in projects:
            try:
                ee.Initialize(project=project_id)
                print(f"✅ Earth Engine initialized with project: {project_id}")
                return True
            except:
                continue
        
        print("⚠️  Earth Engine not initialized")
        return False

# Initialize on startup
ee_initialized = initialize_earth_engine()

# Default location (Chandigarh region)
DEFAULT_LAT = 30.97
DEFAULT_LON = 76.52


def get_gpm_rainfall(lat, lon, hours=24):
    """
    Get near real-time rainfall from GPM IMERG
    Updates every 30 minutes, 4-6 hour delay
    """
    try:
        point = ee.Geometry.Point([lon, lat])
        
        # Calculate date range
        end_date = datetime.now() - timedelta(hours=6)  # Account for delay
        start_date = end_date - timedelta(hours=hours)
        
        # GPM IMERG dataset (30-minute intervals)
        gpm = ee.ImageCollection('NASA/GPM_L3/IMERG_V06')
        
        # Filter by date and location
        rainfall = gpm \
            .filterDate(start_date.isoformat(), end_date.isoformat()) \
            .filterBounds(point)
        
        # Select precipitation and sum over period
        total_rainfall = rainfall.select('precipitationCal').sum()
        
        # Get value at point (5km buffer for better coverage)
        result = total_rainfall.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=point.buffer(5000),  # 5km radius
            scale=10000  # 10km resolution
        ).getInfo()
        
        rainfall_mm = result.get('precipitationCal', 0)
        
        return {
            'rainfall_mm': round(rainfall_mm, 2) if rainfall_mm else 0,
            'hours': hours,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'source': 'GPM_IMERG_V06',
            'resolution_km': 10,
            'delay_hours': 4-6
        }
        
    except Exception as e:
        print(f"❌ Error fetching GPM data: {e}")
        return {'error': str(e), 'rainfall_mm': 0}


def get_sentinel2_ndvi(lat, lon, days=30):
    """
    Get vegetation health (NDVI) from Sentinel-2
    10m resolution, 5-day revisit
    """
    try:
        point = ee.Geometry.Point([lon, lat])
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Sentinel-2 Surface Reflectance
        s2 = ee.ImageCollection('COPERNICUS/S2_SR')
        
        # Get least cloudy recent image
        recent = s2 \
            .filterBounds(point) \
            .filterDate(start_date.isoformat(), end_date.isoformat()) \
            .sort('CLOUDY_PIXEL_PERCENTAGE') \
            .first()
        
        # Calculate NDVI: (NIR - Red) / (NIR + Red)
        # B8 = NIR, B4 = Red
        ndvi = recent.normalizedDifference(['B8', 'B4'])
        
        # Get NDVI value at point
        result = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=point.buffer(1000),  # 1km radius
            scale=10  # 10m resolution
        ).getInfo()
        
        ndvi_value = result.get('nd', None)
        
        # Get image date
        image_date = ee.Date(recent.get('system:time_start')).format('YYYY-MM-dd').getInfo()
        
        # Interpret NDVI value
        if ndvi_value is not None:
            if ndvi_value > 0.6:
                health = 'Healthy'
                risk = 'Low'
            elif ndvi_value > 0.3:
                health = 'Moderate'
                risk = 'Medium'
            else:
                health = 'Stressed'
                risk = 'High'
        else:
            health = 'Unknown'
            risk = 'Unknown'
        
        return {
            'ndvi': round(ndvi_value, 3) if ndvi_value else None,
            'vegetation_health': health,
            'slope_stability_risk': risk,
            'image_date': image_date,
            'days_searched': days,
            'source': 'Sentinel-2 SR',
            'resolution_m': 10
        }
        
    except Exception as e:
        print(f"❌ Error fetching Sentinel-2 NDVI: {e}")
        return {'error': str(e), 'ndvi': None}


def get_rainfall_summary(lat, lon):
    """
    Get comprehensive rainfall data from multiple timeframes
    """
    try:
        # Get different time periods
        rainfall_3h = get_gpm_rainfall(lat, lon, hours=3)
        rainfall_24h = get_gpm_rainfall(lat, lon, hours=24)
        rainfall_7d = get_gpm_rainfall(lat, lon, hours=24*7)
        
        return {
            'last_3_hours': rainfall_3h,
            'last_24_hours': rainfall_24h,
            'last_7_days': rainfall_7d,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error getting rainfall summary: {e}")
        return {'error': str(e)}


# API Routes

@app.route('/')
def index():
    """API information"""
    return jsonify({
        'name': 'Google Earth Engine Satellite API',
        'version': '1.0.0',
        'status': 'operational',
        'endpoints': {
            'gpm_rainfall': '/gpm/rainfall?lat=30.97&lon=76.52&hours=24',
            'sentinel2_ndvi': '/sentinel2/ndvi?lat=30.97&lon=76.52',
            'rainfall_summary': '/rainfall/summary?lat=30.97&lon=76.52',
            'health': '/health'
        },
        'note': 'Requires Earth Engine authentication'
    })


@app.route('/health')
def health():
    """Health check"""
    try:
        # Test EE connection
        ee.Number(1).getInfo()
        return jsonify({
            'status': 'ok',
            'earth_engine': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'earth_engine': 'not connected',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 503


@app.route('/gpm/rainfall')
def gpm_rainfall():
    """Get GPM rainfall data"""
    lat = float(request.args.get('lat', DEFAULT_LAT))
    lon = float(request.args.get('lon', DEFAULT_LON))
    hours = int(request.args.get('hours', 24))
    
    data = get_gpm_rainfall(lat, lon, hours)
    
    return jsonify({
        'success': True,
        'location': {'latitude': lat, 'longitude': lon},
        'data': data
    })


@app.route('/sentinel2/ndvi')
def sentinel2_ndvi():
    """Get Sentinel-2 NDVI (vegetation health)"""
    lat = float(request.args.get('lat', DEFAULT_LAT))
    lon = float(request.args.get('lon', DEFAULT_LON))
    days = int(request.args.get('days', 30))
    
    data = get_sentinel2_ndvi(lat, lon, days)
    
    return jsonify({
        'success': True,
        'location': {'latitude': lat, 'longitude': lon},
        'data': data
    })


@app.route('/rainfall/summary')
def rainfall_summary():
    """Get comprehensive rainfall summary"""
    lat = float(request.args.get('lat', DEFAULT_LAT))
    lon = float(request.args.get('lon', DEFAULT_LON))
    
    data = get_rainfall_summary(lat, lon)
    
    return jsonify({
        'success': True,
        'location': {'latitude': lat, 'longitude': lon},
        'data': data
    })


@app.route('/combined/analysis')
def combined_analysis():
    """Get combined rainfall + vegetation analysis for ML"""
    lat = float(request.args.get('lat', DEFAULT_LAT))
    lon = float(request.args.get('lon', DEFAULT_LON))
    
    try:
        # Get all data
        rainfall_24h = get_gpm_rainfall(lat, lon, hours=24)
        rainfall_7d = get_gpm_rainfall(lat, lon, hours=24*7)
        ndvi_data = get_sentinel2_ndvi(lat, lon)
        
        # Combined analysis
        analysis = {
            'rainfall': {
                'last_24h_mm': rainfall_24h.get('rainfall_mm', 0),
                'last_7d_mm': rainfall_7d.get('rainfall_mm', 0),
                'source': 'GPM IMERG',
                'delay_hours': '4-6'
            },
            'vegetation': {
                'ndvi': ndvi_data.get('ndvi'),
                'health': ndvi_data.get('vegetation_health'),
                'slope_risk': ndvi_data.get('slope_stability_risk'),
                'source': 'Sentinel-2'
            },
            'ml_features': {
                'gpm_rainfall_24h': rainfall_24h.get('rainfall_mm', 0),
                'gpm_rainfall_7d': rainfall_7d.get('rainfall_mm', 0),
                'ndvi': ndvi_data.get('ndvi', 0),
                'vegetation_stressed': 1 if ndvi_data.get('ndvi', 1) < 0.3 else 0
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'location': {'latitude': lat, 'longitude': lon},
            'data': analysis
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    print(f"🛰️  Google Earth Engine API starting on port {port}")
    print(f"🌍 Default location: {DEFAULT_LAT}, {DEFAULT_LON}")
    app.run(host='0.0.0.0', port=port, debug=False)
