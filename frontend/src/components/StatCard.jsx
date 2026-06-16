const StatCard = ({ title, value, unit, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10',
    cyan: 'text-cyan-500 bg-cyan-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    red: 'text-red-500 bg-red-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    green: 'text-green-500 bg-green-500/10',
    gray: 'text-gray-500 bg-gray-500/10'
  };

  const bgClass = colorClasses[color]?.split(' ')[1] || 'bg-blue-500/10';
  const textClass = colorClasses[color]?.split(' ')[0] || 'text-blue-500';

  return (
    <div className={`${bgClass} border-2 ${textClass} border-opacity-50 rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`${textClass} text-lg font-bold uppercase tracking-wide`}>{title}</h3>
        {Icon && <Icon className={`w-10 h-10 ${textClass}`} />}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-4xl font-bold text-white">{value ?? '--'}</span>
        {unit && <span className="text-gray-300 text-lg font-medium">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;
