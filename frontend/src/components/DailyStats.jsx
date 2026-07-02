import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';

const LEVEL_COLOR = {
  LOW:      'text-green-400',
  MEDIUM:   'text-yellow-400',
  HIGH:     'text-orange-400',
  CRITICAL: 'text-red-400',
};

const scoreToLevel = (s) => s >= 75 ? 'CRITICAL' : s >= 50 ? 'HIGH' : s >= 25 ? 'MEDIUM' : 'LOW';

const DailyStats = ({ history = [] }) => {
  if (!history.length) return null;

  // Filter to today's readings
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayData = history.filter(d => new Date(d.timestamp) >= todayStart);
  const source = todayData.length >= 3 ? todayData : history;
  const label = todayData.length >= 3 ? "Today's" : 'Recent';

  const scores = source.map(d => d.riskScore ?? 0).filter(s => s > 0);
  if (!scores.length) return null;

  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const max = Math.max(...scores);
  const min = Math.min(...scores);

  // Simple trend: compare first half avg vs second half avg
  const mid = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, mid).reduce((a, b) => a + b, 0) / (mid || 1);
  const secondHalf = scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid || 1);
  const diff = secondHalf - firstHalf;
  const TrendIcon = diff > 3 ? TrendingUp : diff < -3 ? TrendingDown : Minus;
  const trendColor = diff > 3 ? 'text-red-400' : diff < -3 ? 'text-green-400' : 'text-gray-400';
  const trendLabel = diff > 3 ? 'Rising' : diff < -3 ? 'Falling' : 'Stable';

  const stats = [
    { label: `${label} Min`, value: min, sub: scoreToLevel(min), color: LEVEL_COLOR[scoreToLevel(min)] },
    { label: `${label} Avg`, value: avg, sub: scoreToLevel(avg), color: LEVEL_COLOR[scoreToLevel(avg)] },
    { label: `${label} Max`, value: max, sub: scoreToLevel(max), color: LEVEL_COLOR[scoreToLevel(max)] },
    { label: 'Trend', value: trendLabel, sub: `${Math.abs(diff.toFixed(1))} pts`, color: trendColor, icon: TrendIcon },
    { label: 'Readings', value: source.length, sub: 'data points', color: 'text-blue-400' },
  ];

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{label} Risk Summary</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-700/40 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <div className="flex items-center justify-center gap-1">
              {s.icon && <s.icon className={`w-4 h-4 ${s.color}`} />}
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyStats;
