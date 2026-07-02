// Heatmap: average risk score by hour of day
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const getRiskColor = (score) => {
  if (score === null) return 'bg-slate-700/40 text-gray-600';
  if (score >= 75) return 'bg-red-500/80 text-white';
  if (score >= 50) return 'bg-orange-500/70 text-white';
  if (score >= 25) return 'bg-yellow-500/60 text-slate-900';
  return 'bg-green-500/50 text-slate-900';
};

const RiskHeatmap = ({ data = [] }) => {
  if (!data.length) return null;

  // Group risk scores by hour
  const hourBuckets = {};
  HOURS.forEach(h => { hourBuckets[h] = []; });

  data.forEach(d => {
    if (d.riskScore == null) return;
    const hour = new Date(d.timestamp).getHours();
    hourBuckets[hour].push(d.riskScore);
  });

  const hourlyAvg = HOURS.map(h => {
    const scores = hourBuckets[h];
    if (!scores.length) return { hour: h, avg: null };
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { hour: h, avg, count: scores.length };
  });

  const peakHour = hourlyAvg.reduce((best, cur) =>
    cur.avg !== null && (best.avg === null || cur.avg > best.avg) ? cur : best
  , { hour: 0, avg: null });

  const fmt = (h) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}${suffix}`;
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">Hourly Risk Heatmap</h3>
          <p className="text-xs text-gray-400 mt-0.5">Average risk score per hour of day — spot when risk peaks</p>
        </div>
        {peakHour.avg !== null && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm">
            <span className="text-gray-400">Peak hour: </span>
            <span className="text-red-400 font-bold">{fmt(peakHour.hour)}</span>
            <span className="text-gray-400 ml-2">avg score </span>
            <span className="text-white font-bold">{peakHour.avg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-1.5">
        {hourlyAvg.map(({ hour, avg, count }) => (
          <div key={hour} className="flex flex-col items-center gap-1">
            <div
              className={`w-full aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all hover:scale-110 cursor-default ${getRiskColor(avg)}`}
              title={avg !== null ? `${fmt(hour)}: avg ${avg} (${count} readings)` : `${fmt(hour)}: no data`}
            >
              {avg !== null ? avg : '—'}
            </div>
            <span className="text-[9px] text-gray-500">{fmt(hour)}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/50 inline-block"></span> LOW &lt;25</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/60 inline-block"></span> MEDIUM 25–50</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500/70 inline-block"></span> HIGH 50–75</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/80 inline-block"></span> CRITICAL &gt;75</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-700/40 inline-block"></span> No data</span>
      </div>
    </div>
  );
};

export default RiskHeatmap;
