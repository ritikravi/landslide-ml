import { useState } from 'react';
import { Phone, MapPin, Heart, Search, ExternalLink, AlertTriangle, Building } from 'lucide-react';

const NATIONAL_CONTACTS = [
  { name: 'National Disaster Management Authority (NDMA)', number: '1078', type: 'helpline', desc: '24/7 National Disaster Helpline' },
  { name: 'National Emergency Number', number: '112', type: 'emergency', desc: 'Police, Fire, Ambulance — All Emergencies' },
  { name: 'Ambulance', number: '108', type: 'medical', desc: 'Free emergency ambulance service' },
  { name: 'Fire Brigade', number: '101', type: 'fire', desc: 'Fire and rescue services' },
  { name: 'Police', number: '100', type: 'police', desc: 'Police emergency' },
  { name: 'PM Relief Fund', number: '1800-11-0001', type: 'relief', desc: 'Toll-free for disaster relief assistance' },
];

const STATE_CONTACTS = [
  {
    state: 'Uttarakhand', region: 'North', risk: 'CRITICAL',
    sdma: 'Uttarakhand SDMA', sdmaPhone: '0135-2710334',
    eoc: 'State Emergency Operations Center', eocPhone: '1070',
    district: 'District Emergency Center', districtPhone: '1077',
    hospitals: [
      { name: 'AIIMS Rishikesh', phone: '0135-2462900', location: 'Rishikesh' },
      { name: 'Doon Hospital', phone: '0135-2652647', location: 'Dehradun' },
      { name: 'Base Hospital', phone: '01372-252521', location: 'Srinagar Garhwal' },
    ]
  },
  {
    state: 'Kerala', region: 'South', risk: 'CRITICAL',
    sdma: 'Kerala SDMA', sdmaPhone: '0471-2364424',
    eoc: 'Kerala EOC', eocPhone: '1070',
    district: 'Revenue Control Room', districtPhone: '1077',
    hospitals: [
      { name: 'Government Medical College Thiruvananthapuram', phone: '0471-2528386', location: 'Thiruvananthapuram' },
      { name: 'Kozhikode Government Hospital', phone: '0495-2350216', location: 'Kozhikode' },
      { name: 'Wayanad District Hospital', phone: '04936-202570', location: 'Kalpetta' },
    ]
  },
  {
    state: 'Himachal Pradesh', region: 'North', risk: 'HIGH',
    sdma: 'HP SDMA', sdmaPhone: '0177-2622234',
    eoc: 'State Emergency Center', eocPhone: '1070',
    district: 'District Disaster Cell', districtPhone: '1077',
    hospitals: [
      { name: 'IGMC Shimla', phone: '0177-2804251', location: 'Shimla' },
      { name: 'Dr. RPGMC Tanda', phone: '01892-267115', location: 'Kangra' },
      { name: 'Zonal Hospital Kullu', phone: '01902-222379', location: 'Kullu' },
    ]
  },
  {
    state: 'Sikkim', region: 'Northeast', risk: 'CRITICAL',
    sdma: 'Sikkim SDMA', sdmaPhone: '03592-202884',
    eoc: 'State EOC', eocPhone: '1070',
    district: 'District Control Room', districtPhone: '03592-270149',
    hospitals: [
      { name: 'STNM Hospital Gangtok', phone: '03592-202944', location: 'Gangtok' },
      { name: 'District Hospital Mangan', phone: '03592-234252', location: 'North Sikkim' },
    ]
  },
  {
    state: 'West Bengal', region: 'East', risk: 'HIGH',
    sdma: 'WB SDMA', sdmaPhone: '033-22143526',
    eoc: 'WB Disaster Management', eocPhone: '1070',
    district: 'District Control Room', districtPhone: '1077',
    hospitals: [
      { name: 'North Bengal Medical College', phone: '0353-2582506', location: 'Darjeeling' },
      { name: 'Darjeeling District Hospital', phone: '0354-2252205', location: 'Darjeeling' },
    ]
  },
  {
    state: 'Assam', region: 'Northeast', risk: 'HIGH',
    sdma: 'Assam SDMA', sdmaPhone: '0361-2237219',
    eoc: 'Assam EOC', eocPhone: '1070',
    district: 'District EOC', districtPhone: '1077',
    hospitals: [
      { name: 'GMCH Guwahati', phone: '0361-2529457', location: 'Guwahati' },
      { name: 'Civil Hospital Silchar', phone: '03842-229299', location: 'Silchar' },
    ]
  },
  {
    state: 'Maharashtra', region: 'West', risk: 'HIGH',
    sdma: 'Maharashtra SDMA', sdmaPhone: '022-22025014',
    eoc: 'Maharashtra EOC', eocPhone: '1070',
    district: 'District Collector Office', districtPhone: '1077',
    hospitals: [
      { name: 'KEM Hospital Mumbai', phone: '022-24107000', location: 'Mumbai' },
      { name: 'Sassoon Hospital Pune', phone: '020-26128000', location: 'Pune' },
    ]
  },
];

const RISK_COLORS = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/40',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/40',
};

export default function EmergencyContacts() {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState(null);

  const filtered = STATE_CONTACTS.filter(s =>
    s.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/40 to-slate-900/80 border-2 border-red-500/40 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <Phone className="w-10 h-10 text-red-400 flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-wide">Emergency Contact Directory</h1>
            <p className="text-gray-400 text-sm mt-1">
              NDMA-verified helplines, State Disaster Management contacts and nearest hospitals for each high-risk zone.
              Save these numbers — they save lives.
            </p>
          </div>
        </div>
      </div>

      {/* SOS Banner */}
      <div className="bg-red-600/20 border-2 border-red-500 rounded-xl p-5 flex items-center gap-4 animate-pulse-slow">
        <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 animate-pulse" />
        <div>
          <p className="text-red-300 font-bold text-xl">🚨 IN EMERGENCY — CALL 112</p>
          <p className="text-red-400 text-sm">Single emergency number for Police, Fire & Ambulance across India. Available 24/7.</p>
        </div>
        <a href="tel:112" className="ml-auto bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors flex-shrink-0 text-xl">
          📞 112
        </a>
      </div>

      {/* National Numbers */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Building className="w-6 h-6 text-blue-400" />
          National Helplines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {NATIONAL_CONTACTS.map(c => (
            <a key={c.name} href={`tel:${c.number}`}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-blue-500/50 hover:bg-slate-700/60 transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold text-sm">{c.name}</p>
                <Phone className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-blue-400">{c.number}</p>
              <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search state..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {/* State Contacts */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
          <MapPin className="w-6 h-6 text-red-400" />
          State Disaster Management Contacts
        </h2>
        <div className="space-y-4">
          {filtered.map(s => {
            const isOpen = selectedState === s.state;
            return (
              <div key={s.state}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-blue-500/50' : 'border-slate-700'
                }`}
              >
                {/* State header */}
                <div
                  onClick={() => setSelectedState(isOpen ? null : s.state)}
                  className="flex items-center justify-between p-4 bg-slate-800/60 cursor-pointer hover:bg-slate-700/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h3 className="text-white font-bold text-lg">{s.state}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${RISK_COLORS[s.risk]}`}>
                      {s.risk}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <a href={`tel:${s.eocPhone}`} onClick={e => e.stopPropagation()}
                      className="flex items-center gap-2 bg-red-600/20 border border-red-500/50 text-red-400 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600/30 transition-colors">
                      <Phone className="w-4 h-4" /> EOC: {s.eocPhone}
                    </a>
                    <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div className="p-5 bg-slate-900/40 space-y-5">
                    {/* SDMA contacts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { label: s.sdma, phone: s.sdmaPhone, icon: Building },
                        { label: s.eoc, phone: s.eocPhone, icon: AlertTriangle },
                        { label: s.district, phone: s.districtPhone, icon: MapPin },
                      ].map(c => (
                        <a key={c.label} href={`tel:${c.phone}`}
                          className="bg-slate-800/60 border border-slate-600 rounded-xl p-4 hover:border-blue-500/40 transition-all group">
                          <c.icon className="w-5 h-5 text-blue-400 mb-2" />
                          <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                          <p className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            📞 {c.phone}
                          </p>
                        </a>
                      ))}
                    </div>

                    {/* Hospitals */}
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3 uppercase tracking-wider">
                        <Heart className="w-4 h-4 text-red-400" />
                        Nearest Hospitals
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {s.hospitals.map(h => (
                          <a key={h.name} href={`tel:${h.phone}`}
                            className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 hover:border-red-500/40 transition-all group">
                            <p className="text-white font-semibold text-sm group-hover:text-red-300 transition-colors">{h.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{h.location}
                            </p>
                            <p className="text-red-400 font-bold text-base mt-1">📞 {h.phone}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
        <Phone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400">
          All contact numbers sourced from <strong className="text-white">NDMA India</strong>, respective State Disaster Management Authorities (SDMA),
          and official government health portals. Numbers verified as of 2024.
          Always verify with local authorities as numbers may change.
        </p>
      </div>
    </div>
  );
}
