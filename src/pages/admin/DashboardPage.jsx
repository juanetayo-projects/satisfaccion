import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  ClipboardList, Star, ThumbsUp, TrendingUp,
  Users, Activity, ExternalLink
} from 'lucide-react'
import { useSurveyStats } from '../../hooks/useSurveyData'
import MetricCard from '../../components/ui/MetricCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { CHART_COLORS, EXPERIENCIA_COLORS } from '../../lib/constants'
import { Link } from 'react-router-dom'

const EXPERIENCIA_ORDER = ['Muy buena', 'Buena', 'Regular', 'Mala', 'Muy mala']

export default function DashboardPage() {
  const { stats, loading } = useSurveyStats()

  if (loading) return <LoadingSpinner message="Cargando estadísticas..." />

  if (!stats) return (
    <div className="text-center py-20 text-gray-400">
      No hay datos disponibles todavía.
      <div className="mt-4">
        <Link to="/encuesta" target="_blank" className="text-primary-600 hover:underline flex items-center gap-1 justify-center text-sm">
          Ir a la encuesta <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  )

  const experienciaData = EXPERIENCIA_ORDER.map(name => ({
    name,
    value: stats.experienciaGlobal[name] || 0,
    fill: EXPERIENCIA_COLORS[name]?.hex || '#9CA3AF',
  }))

  const sedeData = Object.entries(stats.porSede)
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Resumen de la encuesta de satisfacción</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Encuestas"
          value={stats.total.toLocaleString()}
          subtitle="registros totales"
          icon={ClipboardList}
          color="blue"
        />
        <MetricCard
          title="Promedio Recepción"
          value={`${stats.avgRecepcion}/5`}
          subtitle="calificación media"
          icon={Star}
          color="teal"
        />
        <MetricCard
          title="Recomendarían"
          value={`${stats.pctRecomienda}%`}
          subtitle="de los pacientes"
          icon={ThumbsUp}
          color="green"
        />
        <MetricCard
          title="Experiencia"
          value={`${stats.avgComodidad}/5`}
          subtitle="comodidad promedio"
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Promedios por dimensión */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="font-bold text-gray-700 text-base mb-4">Promedios por Dimensión</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Recepción', value: stats.avgRecepcion, color: '#1B4F8A' },
            { label: 'Personal', value: stats.avgPersonal,   color: '#00B4D8' },
            { label: 'Comodidad', value: stats.avgComodidad, color: '#22C55E' },
          ].map(d => (
            <div key={d.label} className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-2">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke={d.color} strokeWidth="3"
                    strokeDasharray={`${(d.value / 5) * 88} 88`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-lg font-bold text-gray-800">{d.value}</span>
              </div>
              <div className="text-xs font-semibold text-gray-600">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experiencia global */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="font-bold text-gray-700 text-base mb-4">Experiencia Global</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={experienciaData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Respuestas" radius={[6, 6, 0, 0]}>
                {experienciaData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tendencia mensual */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="font-bold text-gray-700 text-base mb-4">Tendencia Mensual</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone" dataKey="count" name="Encuestas"
                stroke="#1B4F8A" strokeWidth={2.5}
                dot={{ r: 4, fill: '#1B4F8A' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Por sede */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="font-bold text-gray-700 text-base mb-4">Distribución por Sede</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sedeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {sedeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {sedeData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <div className="text-sm text-gray-600 flex-1 truncate">{s.name}</div>
                <div className="text-sm font-bold text-gray-800">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap">
        <Link to="/admin/registros" className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <ClipboardList size={16} /> Ver registros
        </Link>
        <Link to="/admin/analisis" className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <TrendingUp size={16} /> Análisis detallado
        </Link>
        <Link to="/encuesta" target="_blank" className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <ExternalLink size={16} /> Abrir encuesta
        </Link>
      </div>
    </div>
  )
}
