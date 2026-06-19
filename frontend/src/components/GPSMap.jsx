import { useEffect, useRef } from 'react';
import { MapPin, Satellite, Navigation } from 'lucide-react';

// Using OpenStreetMap via iframe embed - no API key needed
const GPSMap = ({ sensorData }) => {
  const lat = sensorData?.latitude;
  const lng = sensorData?.longitude;
  const hasGPS = lat && lng && lat !== 0 && lng !== 0;

  // Real GPS coordinates or fallback to LPU (Lovely Professional University) as default
  const displayLat = hasGPS ? lat : 31.2548;
  const displayLng = hasGPS ? lng : 75.7057;
  const zoom = 16;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${displayLng - 0.005}%2C${displayLat - 0.005}%2C${displayLng + 0.005}%2C${displayLat + 0.005}&layer=mapnik&marker=${displayLat}%2C${displayLng}`;

  const openInMaps = () => {
    window.open(`https://www.openstreetmap.org/?mlat=${displayLat}&mlon=${displayLng}#map=${zoom}/${displayLat}/${displayLng}`, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-xl overflow-hidden shadow-xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" />
            Sensor Location
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {hasGPS
              ? `GPS Active — ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`
              : 'GPS Searching — Showing default location'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* GPS status badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            hasGPS
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${hasGPS ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-ping'}`} />
            {hasGPS ? 'GPS LOCK' : 'SEARCHING'}
          </div>
          {/* Open in maps button */}
          <button
            onClick={openInMaps}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
          >
            <Navigation className="w-3 h-3" />
            Open Map
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full h-[250px]">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 'none', filter: 'invert(0.9) hue-rotate(180deg) brightness(0.85) saturate(0.8)' }}
          title="Sensor Location Map"
          loading="lazy"
        />
        {/* Risk overlay badge on map */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Satellite className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-gray-300 font-medium">Monitoring Zone</span>
          </div>
          {hasGPS ? (
            <p className="text-green-400 font-bold mt-1">{lat.toFixed(4)}°N {lng.toFixed(4)}°E</p>
          ) : (
            <p className="text-yellow-400 font-bold mt-1">Acquiring signal...</p>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 divide-x divide-slate-700/50 border-t border-slate-700/50">
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Latitude</p>
          <p className="text-sm font-bold text-white">{hasGPS ? `${lat.toFixed(4)}°` : 'N/A'}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Longitude</p>
          <p className="text-sm font-bold text-white">{hasGPS ? `${lng.toFixed(4)}°` : 'N/A'}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Signal</p>
          <p className={`text-sm font-bold ${hasGPS ? 'text-green-400' : 'text-yellow-400'}`}>
            {sensorData?.satellites ? `${sensorData.satellites} sats` : hasGPS ? 'Active' : 'Weak'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GPSMap;
