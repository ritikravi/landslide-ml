const StatCard = ({ title, value, unit, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    purple: 'text-purple-500'
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        {Icon && <Icon className={`w-6 h-6 ${colorClasses[color]}`} />}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-white">{value ?? '--'}</span>
        {unit && <span className="text-gray-400 text-sm">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;
