import { useState } from 'react'
import {
  Search, Filter, Download, Plus, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Printer,
  X, ChevronDown, Check, RefreshCw
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSurveyData } from '../../hooks/useSurveyData'
import { SEDES, SERVICIOS, ENTIDADES, RATING_COLORS, EXPERIENCIA_COLORS } from '../../lib/constants'
import { exportToExcel, exportToCSV, exportToPDF } from '../../lib/exportUtils'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import RecordModal from './RecordModal'

function RatingBadge({ value }) {
  if (!value) return <span className="text-gray-300">—</span>
  const c = RATING_COLORS[value]
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${c.bg} ${c.text}`}>
      {value}
    </span>
  )
}

function ExperienciaBadge({ value }) {
  if (!value) return <span className="text-gray-300">—</span>
  const c = EXPERIENCIA_COLORS[value] || {}
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {value}
    </span>
  )
}

export default function RegistrosPage() {
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState(null)
  const [modalMode, setModalMode] = useState(null) // 'view'|'edit'|'new'
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, total, loading, page, setPage, pageSize, refetch } = useSurveyData(filters)

  const totalPages = Math.ceil(total / pageSize)

  function openModal(row, mode) { setSelected(row); setModalMode(mode) }
  function closeModal() { setSelected(null); setModalMode(null) }

  async function handleDelete() {
    setDeleteLoading(true)
    await supabase.from('satisfaccion_respuestas').delete().eq('id', deleteTarget.id)
    setDeleteTarget(null)
    setDeleteLoading(false)
    refetch()
  }

  async function exportAll() {
    const { data: all } = await supabase
      .from('satisfaccion_respuestas')
      .select('*')
      .order('fecha', { ascending: false })
    return all || []
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Registros</h1>
          <p className="text-gray-400 text-sm">{total.toLocaleString()} encuestas registradas</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              onClick={() => setShowFilters(v => !v)}
            >
              <Download size={15} /> Exportar <ChevronDown size={13} />
            </button>
          </div>
          <button
            onClick={() => { setSelected(null); setModalMode('new') }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} /> Nuevo registro
          </button>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Buscar por nombre o identificación..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter size={15} /> Filtros
          </button>
          <button
            onClick={refetch}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectFilter label="Sede" options={SEDES} value={filters.sede || ''} onChange={v => setFilters(f => ({ ...f, sede: v }))} />
            <SelectFilter label="Servicio" options={SERVICIOS} value={filters.servicio || ''} onChange={v => setFilters(f => ({ ...f, servicio: v }))} />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Desde</label>
              <input type="date" value={filters.desde || ''} onChange={e => setFilters(f => ({ ...f, desde: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hasta</label>
              <input type="date" value={filters.hasta || ''} onChange={e => setFilters(f => ({ ...f, hasta: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div className="col-span-full flex gap-2 justify-end mt-1">
              <button
                onClick={() => setFilters({})}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={13} /> Limpiar filtros
              </button>
              {/* Export buttons */}
              <button onClick={async () => exportToExcel(await exportAll())}
                className="flex items-center gap-1.5 text-xs font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                <FileSpreadsheet size={13} /> Excel
              </button>
              <button onClick={async () => exportToCSV(await exportAll())}
                className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                <FileText size={13} /> CSV
              </button>
              <button onClick={async () => exportToPDF(await exportAll())}
                className="flex items-center gap-1.5 text-xs font-medium bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">
                <Printer size={13} /> PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <ClipboardListIcon />
            <p className="mt-2 text-sm">No se encontraron registros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Fecha', 'Paciente', 'Sede', 'Servicio', 'P1', 'P2', 'P3', 'Experiencia', 'Recomienda', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {row.fecha ? format(new Date(row.fecha), 'dd/MM/yy', { locale: es }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 truncate max-w-[140px]">{row.nombre_completo || '—'}</div>
                      <div className="text-xs text-gray-400">{row.numero_identificacion}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[120px] truncate">{row.sede}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[140px] truncate">{row.servicio}</td>
                    <td className="px-4 py-3"><RatingBadge value={row.p1_recepcion} /></td>
                    <td className="px-4 py-3"><RatingBadge value={row.p2_personal_asistencial} /></td>
                    <td className="px-4 py-3"><RatingBadge value={row.p3_comodidad} /></td>
                    <td className="px-4 py-3"><ExperienciaBadge value={row.p4_experiencia_global} /></td>
                    <td className="px-4 py-3">
                      {row.p6_recomendaria === 'Si'
                        ? <span className="text-green-600 font-semibold text-xs flex items-center gap-1"><Check size={12} /> Sí</span>
                        : <span className="text-red-500 font-semibold text-xs flex items-center gap-1"><X size={12} /> No</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openModal(row, 'view')} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Ver">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openModal(row, 'edit')} className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors" title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Mostrando {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} de {total}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-600">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-gray-600 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-600">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalMode && (
        <RecordModal
          mode={modalMode}
          record={selected}
          onClose={closeModal}
          onSaved={() => { closeModal(); refetch() }}
        />
      )}
      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar registro"
        message={`¿Está seguro de eliminar el registro de "${deleteTarget?.nombre_completo || 'este paciente'}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  )
}

function SelectFilter({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none text-sm border border-gray-200 rounded-xl px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
        >
          <option value="">Todos</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

function ClipboardListIcon() {
  return (
    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
      </svg>
    </div>
  )
}
