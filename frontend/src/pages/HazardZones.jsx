import { useState } from 'react';
import { MapPin, AlertTriangle, Users, Calendar, ExternalLink, Info } from 'lucide-react';

// Real data sourced from ISRO Landslide Atlas of India (NRSC, 2023)
// covering ~80,000 mapped landslides across 17 states + 2 UTs (1998–2022)
const HAZARD_ZONES = [
  {
    id: 1, name: 'Rudraprayag, Uttarakhand', lat: 30.2847, lng: 78.9820,
    risk: 'CRITICAL', state: 'Uttarakhand',
    deaths: '5,000+', year: 2013, event: 'Kedarnath Disaster',
    description: 'Highest landslide risk district in India per ISRO Atlas. Houses Kedarnath shrine on unstable Himalayan slopes. 2013 cloudburst triggered catastrophic debris flows.',
    area: '2,439 km²', annualEvents: '150+', source: 'ISRO NRSC Landslide Atlas 2023'
  },
  {
    id: 2, name: 'Tehri Garhwal, Uttarakhand', lat: 30.3780, lng: 78.4800,
    risk: 'CRITICAL', state: 'Uttarakhand',
    deaths: '200+', year: 2021, event: 'Multiple monsoon events',
    description: 'Second highest landslide exposure in India. Steep terrain, seismic zone V, heavy monsoon rainfall. Tehri dam reservoir influences slope stability.',
    area: '3,642 km²', annualEvents: '100+', source: 'ISRO NRSC Landslide Atlas 2023'
  },
  {
    id: 3, name: 'Wayanad, Kerala', lat: 11.6854, lng: 76.1320,
    risk: 'CRITICAL', state: 'Kerala',
    deaths: '400+', year: 2024, event: 'Mundakkai-Chooralmala Disaster',
    description: 'Western Ghats region with intense monsoon. July 2024 landslide killed 400+ in Mundakkai village. Densely forested slopes destabilized by deforestation and extreme rainfall.',
    area: '2,131 km²', annualEvents: '80+', source: 'Kerala State Disaster Management Authority'
  },
  {
    id: 4, name: 'Pithoragarh, Uttarakhand', lat: 29.5827, lng: 80.2181,
    risk: 'CRITICAL', state: 'Uttarakhand',
    deaths: '100+', year: 2023, event: 'Annual monsoon landslides',
    description: 'Border district with Nepal in high Himalayas. Glacial retreat and permafrost thaw increasing instability. NH-9 frequently blocked.',
    area: '7,110 km²', annualEvents: '90+', source: 'ISRO NRSC Landslide Atlas 2023'
  },
  {
    id: 5, name: 'Chamoli, Uttarakhand', lat: 30.4000, lng: 79.3290,
    risk: 'CRITICAL', state: 'Uttarakhand',
    deaths: '200+', year: 2021, event: 'Rishiganga Glacier Burst',
    description: 'Feb 2021 glacier burst triggered flash flood killing 200+. Highly unstable glaciated terrain. Location of Nanda Devi Biosphere Reserve.',
    area: '8,030 km²', annualEvents: '120+', source: 'NDMA India Report 2021'
  },
  {
    id: 6, name: 'Idukki, Kerala', lat: 9.9189, lng: 76.9728,
    risk: 'HIGH', state: 'Kerala',
    deaths: '52+', year: 2021, event: 'Rajamala Landslide',
    description: 'High-altitude tea plantation district. 2021 Rajamala landslide killed 52 workers. Intense SW monsoon, deforestation and soil disturbance key factors.',
    area: '4,358 km²', annualEvents: '60+', source: 'Kerala SDMA'
  },
  {
    id: 7, name: 'Darjeeling, West Bengal', lat: 27.0360, lng: 88.2627,
    risk: 'HIGH', state: 'West Bengal',
    deaths: '100+', year: 2022, event: 'Monsoon landslides',
    description: 'Highly populated hill station on unstable slopes. Tea gardens and settlements at extreme risk. Annual monsoon causes road blockages and casualties.',
    area: '3,149 km²', annualEvents: '70+', source: 'ISRO NRSC Landslide Atlas 2023'
  },
  {
    id: 8, name: 'Mangan (North Sikkim)', lat: 27.5142, lng: 88.5326,
    risk: 'CRITICAL', state: 'Sikkim',
    deaths: '150+', year: 2023, event: 'Glacial Lake Outburst Flood',
    description: 'Oct 2023 GLOF from South Lhonak Lake triggered massive debris flow killing 150+. Teesta River valley highly vulnerable to glacier-related events.',
    area: '4,226 km²', annualEvents: '50+', source: 'NDMA India 2023'
  },
  {
    id: 9, name: 'Kullu, Himachal Pradesh', lat: 31.9579, lng: 77.1095,
    risk: 'HIGH', state: 'Himachal Pradesh',
    deaths: '50+', year: 2023, event: 'Monsoon 2023 landslides',
    description: 'Kullu-Manali valley corridor. Heavy tourist activity on fragile slopes. 2023 monsoon caused widespread destruction. NH-3 frequently disrupted.',
    area: '5,503 km²', annualEvents: '80+', source: 'ISRO NRSC Landslide Atlas 2023'
  },
  {
    id: 10, name: 'Mandi, Himachal Pradesh', lat: 31.7090, lng: 76.9320,
    risk: 'HIGH', state: 'Himachal Pradesh',
    deaths: '30+', year: 2023, event: 'Multiple 2023 events',
    description: 'Highly landslide-prone district on Beas River valley. 2023 monsoon caused dam spillway concerns. Dense road network exposed to rockfalls.',
    area: '3,950 km²', annualEvents: '60+', source: 'HP State Disaster Management'
  },
  {
    id: 11, name: 'Aizawl, Mizoram', lat: 23.7271, lng: 92.7176,
    risk: 'HIGH', state: 'Mizoram',
    deaths: '30+', year: 2022, event: 'Aizawl city landslides',
    description: 'Capital city built on extremely steep terrain. High urban density on vulnerable slopes. Annual monsoon causes building collapses and fatalities.',
    area: '3,576 km²', annualEvents: '40+', source: 'ISRO NRSC Landslide Atlas 2023'
  },
  {
    id: 12, name: 'Kohima, Nagaland', lat: 25.6701, lng: 94.1077,
    risk: 'HIGH', state: 'Nagaland',
    deaths: '20+', year: 2022, event: 'Northeast monsoon events',
    description: 'Capital on ridge terrain. Poorly consolidated soils and intense rainfall. Frequent road and infrastructure damage during monsoon season.',
    area: '1,463 km²', annualEvents: '30+', source: 'ISRO NRSC Landslide Atlas 2023'
  },
  {
    id: 13, name: 'Shimla, Himachal Pradesh', lat: 31.1048, lng: 77.1734,
    risk: 'HIGH', state: 'Himachal Pradesh',
    deaths: '20+', year: 2023, event: 'Urban landslides 2023',
    description: 'Historic hill station facing increasing urban landslide risk due to unplanned construction. Summer Capital infrastructure repeatedly damaged.',
    area: '5,131 km²', annualEvents: '40+', source: 'HP State Disaster Management'
  },
  {
    id: 14, name: 'Almora, Uttarakhand', lat: 29.5971, lng: 79.6591,
    risk: 'MEDIUM', state: 'Uttarakhand',
    deaths: '15+', year: 2022, event: 'Annual monsoon events',
    description: 'Kumaon Himalaya district with moderate-high landslide activity. Ancient town on ridge with increasing population pressure on slopes.',
    area: '3,090 km²', annualEvents: '30+', source: 'ISRO NRSC Landslide Atlas 2023'
  },
  {
    id: 15, name: 'Malappuram, Kerala', lat: 11.0730, lng: 76.0740,
    risk: 'HIGH', state: 'Kerala',
    deaths: '60+', year: 2019, event: 'Kavalappara Landslide',
    description: 'Aug 2019 Kavalappara landslide buried entire village killing 60+. Western Ghats foothills with laterite soils highly vulnerable to intense rainfall.',
    area: '3,550 km²', annualEvents: '35+', source: 'Kerala SDMA'
  },
];

const RISK_COLORS = {
  CRITICAL: { dot: 'bg-red-500',    border: 'border-red-500/60',    bg: 'bg-red-500/10',    text: 'text-red-400',    badge: 'bg-red-500/20 text-red-300 border-red-500/40' },
  HIGH:     { dot: 'bg-orange-500', border: 'border-orange-500/60', bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  MEDIUM:   { dot: 'bg-yellow-500', border: 'border-yellow-500/60', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
};

export default function HazardZones() {
  const [selected, setSelected] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [filterState, setFilterState] = useState('ALL');

  const states = ['ALL', ...new Set(HAZARD_ZONES.map(z => z.state))];
  const filtered = HAZARD_ZONES.filter(z =>
    (filterRisk === 'ALL' || z.risk === filterRisk) &&
    (filterState === 'ALL' || z.state === filterState)
  );

  const stats = {
    critical: HAZARD_ZONES.filter(z => z.risk === 'CRITICAL').length,
    high: HAZARD_ZONES.filter(z => z.risk === 'HIGH').length,
    medium: HAZARD_ZONES.filter(z => z.risk === 'MEDIUM').length,
    totalDeaths: '6,400+',
  };

  const mapUrl = selected
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selected.lng - 0.8}%2C${selected.lat - 0.8}%2C${selected.lng + 0.8}%2C${selected.lat + 0.8}&layer=mapnik&marker=${selected.lat}%2C${selected.lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=68.0%2C6.0%2C98.0%2C37.0&layer=mapnik`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/40 to-slate-900/80 border-2 border-red-500/40 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-10 h-10 text-red-400 flex-shrink-0 animate-pulse mt-1" />
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-wide">
              India Landslide Hazard Zones
            </h1>
            <p className="text-gray-300 text-sm mt-2 max-w-3xl">
              Based on <span className="text-red-400 font-semibold">ISRO / NRSC Landslide Atlas of India (2023)</span> — 
              ~80,000 mapped landslides across 17 states covering the Himalayas and Western Ghats (1998–2022). 
              India ranks <span className="text-red-400 font-semibold">#1 in the world</span> for fatal landslides.
            </p>
            <a
              href="https://www.isro.gov.in/Landslide_Atlas_India.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
            >
              <ExternalLink className="w-3 h-3" /> Source: ISRO.gov.in
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical Zones', value: stats.critical, color: 'text-red-400', bg: 'border-red-500/30' },
          { label: 'High Risk Zones', value: stats.high, color: 'text-orange-400', bg: 'border-orange-500/30' },
          { label: 'Medium Risk Zones', value: stats.medium, color: 'text-yellow-400', bg: 'border-yellow-500/30' },
          { label: 'Est. Deaths (mapped events)', value: stats.totalDeaths, color: 'text-white', bg: 'border-slate-500/30' },
        ].map(s => (
          <div key={s.label} className={`bg-slate-800/60 border ${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(r => (
            <button key={r} onClick={() => setFilterRisk(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filterRisk === r
                  ? r === 'CRITICAL' ? 'bg-red-500/30 border-red-500 text-red-300'
                  : r === 'HIGH' ? 'bg-orange-500/30 border-orange-500 text-orange-300'
                  : r === 'MEDIUM' ? 'bg-yellow-500/30 border-yellow-500 text-yellow-300'
                  : 'bg-blue-500/30 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-600 text-gray-400 hover:border-slate-500'
              }`}>{r}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {states.map(s => (
            <button key={s} onClick={() => setFilterState(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filterState === s
                  ? 'bg-blue-500/30 border-blue-500/70 text-blue-300'
                  : 'bg-slate-800 border-slate-600 text-gray-400 hover:border-slate-500'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Main content: Map + List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="bg-slate-800/60 border-2 border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-400" />
              {selected ? `📍 ${selected.name}` : 'India Overview Map'}
            </h3>
            {selected && (
              <button onClick={() => setSelected(null)}
                className="text-xs text-gray-400 hover:text-white border border-slate-600 px-2 py-1 rounded">
                ← Back to India
              </button>
            )}
          </div>
          <div className="relative h-[480px]">
            <iframe
              key={selected?.id ?? 'india'}
              src={mapUrl}
              width="100%" height="100%"
              style={{ border: 'none', filter: 'invert(0.9) hue-rotate(180deg) brightness(0.8) saturate(0.7)' }}
              title="Hazard Zone Map"
              loading="lazy"
            />
            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-2 text-xs space-y-1">
              {[['CRITICAL','bg-red-500'],['HIGH','bg-orange-500'],['MEDIUM','bg-yellow-500']].map(([l,c])=>(
                <div key={l} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${c}`} />
                  <span className="text-gray-300">{l}</span>
                </div>
              ))}
            </div>
            {selected && (
              <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-2 text-xs max-w-[180px]">
                <p className={`font-bold ${RISK_COLORS[selected.risk].text}`}>{selected.risk} RISK</p>
                <p className="text-white font-semibold mt-0.5">{selected.name}</p>
                <p className="text-red-400 mt-0.5">Deaths: {selected.deaths}</p>
              </div>
            )}
          </div>
        </div>

        {/* Zone list */}
        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {filtered.map(zone => {
            const c = RISK_COLORS[zone.risk];
            const isSelected = selected?.id === zone.id;
            return (
              <div
                key={zone.id}
                onClick={() => setSelected(isSelected ? null : zone)}
                className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                  isSelected
                    ? `${c.border} ${c.bg} shadow-lg`
                    : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${c.dot} ${zone.risk === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                    <h4 className="text-white font-bold text-sm">{zone.name}</h4>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${c.badge}`}>
                    {zone.risk}
                  </span>
                </div>

                <p className="text-gray-400 text-xs leading-relaxed mb-3 ml-5">{zone.description}</p>

                <div className="grid grid-cols-3 gap-2 ml-5">
                  <div className="bg-slate-700/30 rounded-lg px-2 py-1.5 text-center">
                    <Users className="w-3 h-3 text-red-400 mx-auto mb-0.5" />
                    <p className="text-red-400 font-bold text-xs">{zone.deaths}</p>
                    <p className="text-gray-500 text-[10px]">Deaths</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg px-2 py-1.5 text-center">
                    <Calendar className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
                    <p className="text-blue-400 font-bold text-xs">{zone.annualEvents}</p>
                    <p className="text-gray-500 text-[10px]">Events/yr</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg px-2 py-1.5 text-center">
                    <Info className="w-3 h-3 text-green-400 mx-auto mb-0.5" />
                    <p className="text-green-400 font-bold text-xs">{zone.year}</p>
                    <p className="text-gray-500 text-[10px]">Last Major</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 ml-5 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      <span className="text-white font-semibold">Event: </span>{zone.event}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      <span className="text-white font-semibold">Area: </span>{zone.area}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 italic">Source: {zone.source}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.openstreetmap.org/?mlat=${zone.lat}&mlon=${zone.lng}#map=12/${zone.lat}/${zone.lng}`, '_blank');
                      }}
                      className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-3 h-3" /> Open in OpenStreetMap
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400">
          Data sourced from the <strong className="text-white">ISRO/NRSC Landslide Atlas of India (2023)</strong>, 
          NDMA India reports, Kerala SDMA, and HP State Disaster Management Authority.
          This map shows government-identified high-risk zones and is intended for awareness only.
          Always follow official advisories from local authorities during monsoon season.
        </p>
      </div>
    </div>
  );
}
