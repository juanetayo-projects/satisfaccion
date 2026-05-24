import { useState, useEffect } from 'react'
import { X, Save, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  SEDES, ENTIDADES, SERVICIOS, EXPERIENCIA_GLOBAL,
  MOTIVOS_INSATISFACCION, RATING_COLORS, EXPERIENCIA_COLORS
} from '../../lib/constants'
import StarRating from '../../components/ui/StarRating'
import { format } from 'date-fns'

const BLANK = {
  nombre_completo: '', numero_identificacion: '', telefono: '',
  sede: '', entidad_salud: '', servicio: '',
  p1_recepcion: null, p2_personal_asistencial: null, p3_comodidad: null,
  p4_experiencia_global: '', p5_motivo_insatisfaccion: '',
  p6_recomendaria: '', comentarios: '',
}

export default function RecordModal({ mode, record, onClose, onSaved }) {
  const [form, setForm]     = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const isView = mode === 'view'
  const title  = mode === 'new' ? 'Nuevo Registro' : mode === 'edit' ? 'Editar Registro' : 'Ver Registro'

  useEffect(() => {
    if (record) setForm({ ...BLANK, ...record })
    else setForm(BLANK)
  }, [record])

  function handle(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      if (mode === 'new') {
        const { error: e } = await supabase
          .from('satisfaccion_respuestas')
          .insert([{ ...form, fecha: new Date().toISOString() }])
        if (e) throw e
      } else {
        const { id, created_at, ...rest } = form
        const { error: e } = await supabase
          .from('satisfaccion_respuestas')
          .update(rest)
          .eq('id', record.id)
        if (e) throw e
      }
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function Field({ label, name, type = 'text', placeholder }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
        {isView
          ? <div className="text-sm text-gray-800 bg-gray-50 rounded-xl px-4 py-2.5 min-h-[40px]">{form[name] || '—'}</div>
          : <input
              type={type}
              name={name}
              value={form[name] || ''}
              onChange={handle}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
        }
      </div>
    )
  }

  function SelectF({ label, name, options }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
        {isView
          ? <div className="text-sm text-gray-800 bg-gray-50 rounded-xl px-4 py-2.5 min-h-[40px]">{form[name] || '—'}</div>
          : (
            <div className="relative">
              <select name={name} value={form[name] || ''} onChange={handle}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">— Seleccione —</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )
        }
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {record?.fecha && (
            <div className="text-xs text-gray-400">
              Registrado: {format(new Date(record.fecha), 'dd/MM/yyyy HH:mm')}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Nombre completo" name="nombre_completo" />
            </div>
            <Field label="Identificación" name="numero_identificacion" />
            <Field label="Teléfono" name="telefono" type="tel" />
            <SelectF label="Sede" name="sede" options={SEDES} />
            <SelectF label="Entidad de salud" name="entidad_salud" options={ENTIDADES} />
            <div className="sm:col-span-2">
              <SelectF label="Servicio" name="servicio" options={SERVICIOS} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Recepción</label>
            <StarRating value={form.p1_recepcion} onChange={v => setForm(f => ({ ...f, p1_recepcion: v }))} disabled={isView} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Personal asistencial</label>
            <StarRating value={form.p2_personal_asistencial} onChange={v => setForm(f => ({ ...f, p2_personal_asistencial: v }))} disabled={isView} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Comodidad, orden y confort</label>
            <StarRating value={form.p3_comodidad} onChange={v => setForm(f => ({ ...f, p3_comodidad: v }))} disabled={isView} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Experiencia Global</label>
            {isView
              ? <div className="text-sm text-gray-800 bg-gray-50 rounded-xl px-4 py-2.5">{form.p4_experiencia_global || '—'}</div>
              : (
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCIA_GLOBAL.map(opt => {
                    const c = EXPERIENCIA_COLORS[opt]
                    const sel = form.p4_experiencia_global === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => setForm(f => ({ ...f, p4_experiencia_global: opt }))}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${sel ? `${c.bg} ${c.text} border-transparent` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )
            }
          </div>

          <SelectF label="Motivo insatisfacción" name="p5_motivo_insatisfaccion" options={MOTIVOS_INSATISFACCION} />

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">¿Recomendaría?</label>
            {isView
              ? <div className="text-sm text-gray-800 bg-gray-50 rounded-xl px-4 py-2.5">{form.p6_recomendaria || '—'}</div>
              : (
                <div className="flex gap-3">
                  {['Si', 'No'].map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setForm(f => ({ ...f, p6_recomendaria: opt }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all
                        ${form.p6_recomendaria === opt
                          ? opt === 'Si' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                        }`}>
                      {opt === 'Si' ? '👍 Sí' : '👎 No'}
                    </button>
                  ))}
                </div>
              )
            }
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Comentarios</label>
            {isView
              ? <div className="text-sm text-gray-800 bg-gray-50 rounded-xl px-4 py-2.5 min-h-[60px]">{form.comentarios || '—'}</div>
              : <textarea name="comentarios" value={form.comentarios || ''} onChange={handle} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            }
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</div>
          )}
        </div>

        {/* Footer */}
        {!isView && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</> : <><Save size={15} /> Guardar</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
