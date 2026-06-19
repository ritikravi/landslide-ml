const StatCard = ({ title, value, unit, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/50 shadow-blue-500/20 hover:shadow-blue-500/40',
    cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/50 shadow-cyan-500/20 hover:shadow-cyan-500/40',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50 shadow-yellow-500/20 hover:shadow-yellow-500/40',
    red: 'text-red-500 bg-red-500/10 border-red-500/50 shadow-red-500/20 hover:shadow-red-500/40',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/50 shadow-purple-500/20 hover:shadow-purple-500/40',
    green: 'text-green-500 bg-green-500/10 border-green-500/50 shadow-green-500/20 hover:shadow-green-500/40',
    gray: 'text-gray-500 bg-gray-500/10 border-gray-500/50 shadow-gray-500/20 hover:shadow-gray-500/40'
  };

  const classes = colorClasses[color] || colorClasses.blue;
  const [bgClass, textClass, borderClass, shadowClass, hoverShadow] = classes.split(' ');

  return (
    <div className={`${bgClass} ${textClass} border-2 ${borderClass} rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-lg ${shadowClass} ${hoverShadow} animate-fade-in`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`${textClass} text-lg font-bold uppercase tracking-wide`}>{title}</h3>
        {Icon && <Icon className={`w-10 h-10 ${textClass} animate-float`} />}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-4xl font-bold text-white drop-shadow-lg">{value ?? '--'}</span>
        {unit && <span className="text-gray-300 text-lg font-medium">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;
