export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colors = {
    blue:   'from-primary-600 to-primary-500',
    teal:   'from-secondary-500 to-secondary-400',
    green:  'from-green-600 to-green-400',
    orange: 'from-orange-500 to-orange-400',
    red:    'from-red-600 to-red-400',
    purple: 'from-purple-600 to-purple-400',
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`bg-gradient-to-r ${colors[color]} p-4 flex items-center justify-between`}>
        {Icon && <Icon size={32} className="text-white opacity-90" />}
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-sm font-semibold text-gray-700 mt-1">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  )
}
