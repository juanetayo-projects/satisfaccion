import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Filter, X, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  SEDES, SERVICIOS, EXPERIENCIA_GLOBAL,
  CHART_COLORS, EXPERIENCIA_COLORS, RATING_COLORS
} from '../../lib/constants'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const EXPERIENCIA_ORDER = ['Muy buena', 'Buena', 'Regular', 'Mala', 'Muy mala']

const MESES = [
  { value: '01', label: 'Enero' },   { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },   { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },    { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },   { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
]

const currentYear = new Date().getFullYear()
const ANOS = Array.from({ length: currentYear - 2022 }, (_, i) => String(2023 + i))

export default function AnalisisPage() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [showF, setShowF]     = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('satisfaccion_respuestas').select('*')

      if (filters.sede)     q = q.eq('sede', filters.sede)
      if (filters.servicio) q = q.eq('servicio', filters.servicio)

      // Año y mes combinados
      if (filters.ano && filters.mes) {
        const start = `${filters.ano}-${filters.mes}-01`
        const end   = `${filters.ano}-${filters.mes}-31T23:59:59`
        q = q.gte('fecha', start).lte('fecha', end)
      } else if (filters.ano) {
        q = q.gte('fecha', `${filters.ano}-01-01`).lte('fecha', `${filters.ano}-12-31T23:59:59`)
      } else if (filters.desde) {
        q = q.gte('fecha', filters.desde)
      }

      if (filters.hasta && !filters.mes) q = q.lte('fecha', filters.hasta + 'T23:59:59')

      const { data: rows } = await q
      // Filtro de mes sin año: client-side
      let result = rows || []
      if (filters.mes && !filters.ano) {
        result = result.filter(r => r.fecha && r.fecha.slice(5, 7) === filters.mes)
      }
      setData(result)
      setLoading(false)
    }
    load()
  }, [filters])

  if (loading) return <LoadingSpinner message="Calculando análisis..." />

  const total = data.length

  const avg = (field) => {
    const vals = data.filter(r => r[field]).map(r => r[field])
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  }

  function ratingDist(field) {
    return [1, 2, 3, 4, 5].map(n => ({
      rating: n,
      count: data.filter(r => r[field] === n).length,
      fill: RATING_COLORS[n].hex,
    }))
  }

  const expDist = EXPERIENCIA_ORDER.map(name => ({
    name,
    count: data.filter(r => r.p4_experiencia_global === name).length,
    fill: EXPERIENCIA_COLORS[name]?.hex || '#9CA3AF',
  }))

  const sedeDist = [...new Set(data.map(r => r.sede).filter(Boolean))]
    .map(sede => ({
      sede: sede.length > 18 ? sede.slice(0, 18) + '…' : sede,
      count: data.filter(r => r.sede === sede).length,
    }))
    .sort((a, b) => b.count - a.count)

  const monthlyExp = (() => {
    const map = {}
    data.forEach(r => {
      if (!r.fecha) return
      const m = r.fecha.slice(0, 7)
      if (!map[m]) map[m] = {}
      const exp = r.p4_experiencia_global
      if (exp) map[m][exp] = (map[m][exp] || 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, vals]) => ({ month, ...vals }))
  })()

  const radarData = [
    { dimension: 'Recepción', score: avg('p1_recepcion') },
    { dimension: 'Personal',  score: avg('p2_personal_asistencial') },
    { dimension: 'Comodidad', score: avg('p3_comodidad') },
  ]

  const motivosDist = (() => {
    const map = {}
    data.forEach(r => {
      if (r.p5_motivo_insatisfaccion) {
        map[r.p5_motivo_insatisfaccion] = (map[r.p5_motivo_insatisfaccion] || 0) + 1
      }
    })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.length > 35 ? name.slice(0, 35) + '…' : name,
        count,
      }))
  })()

  const recomiendaPct = total ? Math.round(data.filter(r => r.p6_recomendaria === 'Si').length / total * 100) : 0

  const mesLabel = filters.mes ? MESES.find(m => m.value === filters.mes)?.label : null
  const periodoLabel = [filters.ano, mesLabel].filter(Boolean).join(' - ') || 'Todo el período'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Análisis</h1>
          <p className="text-gray-400 text-sm">{total.toLocaleString()} registros · {periodoLabel}</p>
        </div>
        <button
          onClick={() => setShowF(v => !v)}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors ${showF ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Filter size={15} /> Filtros
        </button>
      </div>

      {showF && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Año */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Año</label>
              <div className="relative">
                <select value={filters.ano || ''} onChange={e => setFilters(f => ({ ...f, ano: e.target.value, mes: '' }))}
                  className="w-full appearance-none text-sm border border-gray-200 rounded-xl px-3 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                  <option value="">Todos</option>
                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Mes */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Mes</label>
              <div className="relative">
                <select value={filters.mes || ''} onChange={e => setFilters(f => ({ ...f, mes: e.target.value }))}
                  className="w-full appearance-none text-sm border border-gray-200 rounded-xl px-3 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                  <option value="">Todos</option>
                  {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sede */}
            <FSelect label="Sede" options={SEDES} value={filters.sede || ''} onChange={v => setFilters(f => ({ ...f, sede: v }))} />

            {/* Servicio */}
            <FSelect label="Servicio" options={SERVICIOS} value={filters.servicio || ''} onChange={v => setFilters(f => ({ ...f, servicio: v }))} />
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={() => setFilters({})} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              <X size={13} /> Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Prom. Recepción',  value: avg('p1_recepcion').toFixed(1),             color: '#1B4F8A', max: 5 },
          { label: 'Prom. Personal',   value: avg('p2_personal_asistencial').toFixed(1),  color: '#00B4D8', max: 5 },
          { label: 'Prom. Comodidad',  value: avg('p3_comodidad').toFixed(1),             color: '#22C55E', max: 5 },
          { label: 'Recomendarían',    value: `${recomiendaPct}%`,                        color: '#F97316', max: 100 },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 hover:shadow-lg transition-shadow">
            <div className="text-2xl font-extrabold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs font-semibold text-gray-500 mt-1">{kpi.label}</div>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{
                width: `${kpi.value.includes('%') ? recomiendaPct : (parseFloat(kpi.value) / 5) * 100}%`,
                background: kpi.color,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Perfil de Calidad">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
              <Radar name="Promedio" dataKey="score" stroke="#1B4F8A" fill="#1B4F8A" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip formatter={v => v.toFixed(2)} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución Experiencia Global">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={expDist} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Respuestas" radius={[6, 6, 0, 0]}>
                {expDist.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución — Recepción">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingDist('p1_recepcion')} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Respuestas" radius={[4, 4, 0, 0]}>
                {ratingDist('p1_recepcion').map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución — Personal Asistencial">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingDist('p2_personal_asistencial')} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Respuestas" radius={[4, 4, 0, 0]}>
                {ratingDist('p2_personal_asistencial').map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Encuestas por Sede">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sedeDist} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="sede" type="category" tick={{ fontSize: 10 }} width={110} />
              <Tooltip />
              <Bar dataKey="count" name="Encuestas" fill="#1B4F8A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Motivos de Insatisfacción">
          {motivosDist.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">Sin motivos registrados</p>
            : (
              <div className="space-y-3">
                {motivosDist.map((m, i) => {
                  const pct = total ? Math.round((m.count / total) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 truncate max-w-[75%]">{m.name}</span>
                        <span className="font-semibold text-gray-800">{m.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </ChartCard>
      </div>

      {monthlyExp.length > 0 && (
        <ChartCard title="Evolución Mensual por Experiencia">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyExp}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {EXPERIENCIA_ORDER.map(exp => (
                <Line key={exp} type="monotone" dataKey={exp}
                  stroke={EXPERIENCIA_COLORS[exp]?.hex} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow p-6">
      <h2 className="font-bold text-gray-700 text-base mb-4">{title}</h2>
      {children}
    </div>
  )
}

function FSelect({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none text-sm border border-gray-200 rounded-xl px-3 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
          <option value="">Todos</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
