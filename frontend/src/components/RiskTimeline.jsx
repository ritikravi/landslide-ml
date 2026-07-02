import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

const RISK_COLORS = { LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  const level = score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW';
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-bold" style={{ color: RISK_COLORS[level] }}>
        Risk Score: {score} — {level}
      </p>
    </div>
  );
};

const RiskTimeline = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-center text-gray-400">
        No risk history yet — data will appear as readings come in
      </div>
    );
  }

  const chartData = [...data].reverse().slice(-60).map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: item.riskScore ?? 0,
  }));

  const scores = chartData.map(d => d.score);
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const max = Math.max(...scores);
  const min = Math.min(...scores);

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">Risk Score Timeline</h3>
        <div className="flex gap-4 text-sm">
          <span className="text-green-400">Min: <b>{min}</b></span>
          <span className="text-yellow-400">Avg: <b>{avg}</b></span>
          <span className="text-red-400">Max: <b>{max}</b></span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          {/* Threshold lines */}
          <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'LOW', fill: '#22c55e', fontSize: 10, position: 'insideTopLeft' }} />
          <ReferenceLine y={50} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'MEDIUM', fill: '#eab308', fontSize: 10, position: 'insideTopLeft' }} />
          <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'HIGH', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#3b82f6' }}
            name="Risk Score"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block"></span> LOW (&lt;25)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-yellow-500 inline-block"></span> MEDIUM (25–50)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-500 inline-block"></span> HIGH (50–75)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block"></span> CRITICAL (&gt;75)</span>
      </div>
    </div>
  );
};

export default RiskTimeline;
