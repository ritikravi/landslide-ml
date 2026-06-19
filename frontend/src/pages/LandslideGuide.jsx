import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, BookOpen, Home, CloudRain, MapPin, Package, Radio } from 'lucide-react';

const SECTIONS = [
  {
    id: 'before',
    icon: Home,
    title: 'Before a Landslide',
    color: 'blue',
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    dos: [
      'Know your area — check if your home is in a landslide-prone zone on NDMA maps',
      'Learn warning signs: unusual bulges, cracks in ground or walls, tilting trees/poles',
      'Create a family emergency plan with two evacuation routes',
      'Prepare an emergency kit (see kit checklist below)',
      'Consult local authorities about slope stability near your home',
      'Plant ground cover vegetation on slopes — roots stabilize soil',
      'Install proper drainage to divert water away from slopes',
      'Keep gutters and drains clean — blocked drainage causes saturation',
      'Listen to monsoon weather alerts on All India Radio / Doordarshan',
      'Know the location of nearest shelter and hospital',
    ],
    donts: [
      'Do not build on steep slopes, near drainage valleys or cliff edges',
      'Do not ignore cracks in walls, floors or ground near slopes',
      'Do not cut down trees on slopes — roots hold soil in place',
      'Do not dump waste or rubble on slopes',
      'Do not block natural drainage channels near your property',
      'Do not ignore monsoon warnings or local evacuation orders',
    ]
  },
  {
    id: 'during',
    icon: AlertTriangle,
    title: 'During a Landslide',
    color: 'red',
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    textColor: 'text-red-400',
    dos: [
      'EVACUATE IMMEDIATELY — do not wait for official orders',
      'Move quickly away from the slide path — move sideways (horizontally), not up or down',
      'If escape is impossible, curl into a tight ball and protect your head',
      'If indoors, take cover under a sturdy desk/table away from windows',
      'If outdoors, run to the nearest high ground away from the slide',
      'Stay alert for secondary slides — they often follow the first',
      'Call 112 as soon as you are safe',
      'Alert neighbors, especially elderly and disabled people',
      'Listen to emergency broadcasts on radio',
    ],
    donts: [
      'Do NOT run downhill or along the slide path — move perpendicular to the flow',
      'Do NOT return to the area until authorities say it is safe',
      'Do NOT try to outrun a debris flow — they travel at high speed',
      'Do NOT stop to collect belongings — leave immediately',
      'Do NOT shelter under trees or near cliffs',
      'Do NOT try to cross flooded streams or rivers during a landslide',
      'Do NOT use roads that cross landslide areas',
    ]
  },
  {
    id: 'after',
    icon: CheckCircle,
    title: 'After a Landslide',
    color: 'green',
    border: 'border-green-500/50',
    bg: 'bg-green-500/10',
    textColor: 'text-green-400',
    dos: [
      'Wait for official all-clear before returning to your home',
      'Report injured or trapped persons to emergency services immediately',
      'Check for gas leaks, electrical damage, structural damage before entering buildings',
      'Document damage with photographs for insurance and government compensation',
      'Check on neighbors, especially elderly and vulnerable people',
      'Follow local authority instructions for debris removal',
      'Boil water or use bottled water — landslides often contaminate water supplies',
      'Watch for follow-up slides, especially during continued rainfall',
      'Contact NDMA or state government for disaster relief assistance',
      'Get professional assessment of slope stability before rebuilding',
    ],
    donts: [
      'Do NOT enter landslide-affected buildings without structural assessment',
      'Do NOT use water from taps until water authority confirms safety',
      'Do NOT ignore cracks that appeared after the slide — more slides may follow',
      'Do NOT use electrical appliances in flooded or muddy areas',
      'Do NOT attempt slope repairs without professional engineering advice',
      'Do NOT let children play near landslide debris',
    ]
  },
  {
    id: 'warning',
    icon: Radio,
    title: 'Warning Signs to Watch For',
    color: 'yellow',
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    textColor: 'text-yellow-400',
    dos: [
      '🌧️ Intense or prolonged rainfall over slopes or mountains',
      '💧 Springs, seeps, or saturated ground in unusual places',
      '🌱 Vegetation suddenly tilting on slopes (trees leaning downhill)',
      '🪨 Small rocks or debris falling from slopes',
      '💥 Rumbling, cracking, or unusual sounds from hillsides',
      '🏠 Cracks appearing in walls, floors, ceilings, or foundations',
      '🚧 Road surfaces cracking or slumping near hillsides',
      '🌊 Sudden increase in stream turbidity (muddy water)',
      '📐 Fences, walls, or utility poles tilting or leaning',
      '🕳️ Sinkholes or depressions forming in the ground',
    ],
    donts: [
      'Never ignore a single warning sign — one sign can mean imminent danger',
      'Do not assume the ground is stable just because it was safe last year',
      'Do not wait for multiple warning signs — one is enough to evacuate',
      'Do not stay in a landslide-prone area during heavy monsoon rainfall',
    ]
  },
];

const KIT_ITEMS = [
  { item: 'Water (3L per person per day, for 3 days)', critical: true },
  { item: 'Non-perishable food (3-day supply)', critical: true },
  { item: 'First aid kit with bandages, antiseptic, medicines', critical: true },
  { item: 'Torch/flashlight with extra batteries', critical: true },
  { item: 'Battery-powered or wind-up radio (All India Radio)', critical: true },
  { item: 'Important documents (Aadhaar, property papers) in waterproof bag', critical: true },
  { item: 'Whistle to signal for help', critical: true },
  { item: 'Emergency cash (ATMs may not work during disaster)', critical: true },
  { item: 'Warm clothes and rain gear', critical: false },
  { item: 'Mobile phone with backup power bank (fully charged)', critical: false },
  { item: 'Dust masks (debris causes respiratory issues)', critical: false },
  { item: 'Basic tools: wrench, rope, knife', critical: false },
  { item: 'Local map (roads may be blocked, GPS may not work)', critical: false },
  { item: 'Medication for at least 1 week', critical: false },
];

const COLOR_MAP = {
  blue:   { border: 'border-blue-500/50',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   dosBg: 'bg-blue-500/5',   dontsBg: 'bg-red-500/5' },
  red:    { border: 'border-red-500/50',    bg: 'bg-red-500/10',    text: 'text-red-400',    dosBg: 'bg-green-500/5',  dontsBg: 'bg-red-500/5' },
  green:  { border: 'border-green-500/50',  bg: 'bg-green-500/10',  text: 'text-green-400',  dosBg: 'bg-green-500/5',  dontsBg: 'bg-red-500/5' },
  yellow: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-400', dosBg: 'bg-yellow-500/5', dontsBg: 'bg-red-500/5' },
};

export default function LandslideGuide() {
  const [activeSection, setActiveSection] = useState('before');

  const active = SECTIONS.find(s => s.id === activeSection);
  const c = COLOR_MAP[active.color];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/40 to-slate-900/80 border-2 border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <BookOpen className="w-10 h-10 text-blue-400 flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-wide">
              Landslide Safety Guide
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Based on <strong className="text-white">NDMA India guidelines</strong> and USGS best practices.
              Covers preparation, warning signs, emergency action and recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SECTIONS.map(s => {
          const cc = COLOR_MAP[s.color];
          const isActive = activeSection === s.id;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all duration-200 ${
                isActive ? `${cc.bg} ${cc.border} ${cc.text}` : 'bg-slate-800/60 border-slate-700 text-gray-400 hover:border-slate-600'
              }`}>
              <s.icon className="w-5 h-5 flex-shrink-0" />
              {s.title.split(' ')[0]} {s.title.split(' ')[1]}
            </button>
          );
        })}
      </div>

      {/* Main section */}
      <div className={`border-2 ${c.border} ${c.bg} rounded-xl p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <active.icon className={`w-8 h-8 ${c.text}`} />
          <h2 className={`text-2xl font-bold ${c.text} uppercase tracking-wide`}>{active.title}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Do's */}
          <div className={`${c.dosBg} border border-green-500/20 rounded-xl p-5`}>
            <h3 className="text-base font-bold text-green-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
              <CheckCircle className="w-5 h-5" />
              Do's
            </h3>
            <ul className="space-y-2.5">
              {active.dos.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          {active.donts && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h3 className="text-base font-bold text-red-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <XCircle className="w-5 h-5" />
                Don'ts
              </h3>
              <ul className="space-y-2.5">
                {active.donts.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Kit */}
      <div className="bg-slate-800/60 border-2 border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2 uppercase tracking-wide">
          <Package className="w-6 h-6 text-orange-400" />
          Emergency Go-Bag Checklist
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          Keep this bag packed and ready near your exit. You may only have minutes to leave.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {KIT_ITEMS.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
              item.critical ? 'bg-orange-500/5 border-orange-500/20' : 'bg-slate-700/20 border-slate-600/30'
            }`}>
              <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                item.critical ? 'border-orange-400' : 'border-gray-600'
              }`}>
                {item.critical && <span className="text-orange-400 text-xs">★</span>}
              </div>
              <span className="text-sm text-gray-200">{item.item}</span>
              {item.critical && <span className="ml-auto text-xs text-orange-400 font-bold flex-shrink-0">CRITICAL</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Source */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400">
          Guidelines sourced from <strong className="text-white">NDMA India (National Disaster Management Authority)</strong>,
          USGS Landslide Hazards Program, and WHO Emergency Preparedness guidelines.
          For official government guidelines visit{' '}
          <a href="https://ndma.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-400">ndma.gov.in</a>
        </p>
      </div>
    </div>
  );
}
