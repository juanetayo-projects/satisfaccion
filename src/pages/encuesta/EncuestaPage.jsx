import { useState } from 'react'
import { CheckCircle, Send, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  SEDES, ENTIDADES, SERVICIOS, EXPERIENCIA_GLOBAL,
  MOTIVOS_INSATISFACCION, RATING_COLORS, EXPERIENCIA_COLORS
} from '../../lib/constants'
import StarRating from '../../components/ui/StarRating'

const INITIAL = {
  nombre_completo: '', numero_identificacion: '', telefono: '',
  sede: '', entidad_salud: '', servicio: '',
  p1_recepcion: null, p2_personal_asistencial: null, p3_comodidad: null,
  p4_experiencia_global: '', p5_motivo_insatisfaccion: '',
  p6_recomendaria: '', comentarios: '',
}

function SelectField({ label, name, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        >
          <option value="">— Seleccione —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

function TextField({ label, name, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />
    </div>
  )
}

export default function EncuestaPage() {
  const [form, setForm]     = useState(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  function handle(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const { error: err } = await supabase
        .from('satisfaccion_respuestas')
        .insert([{
          ...form,
          fecha: new Date().toISOString(),
        }])
      if (err) throw err
      setSubmitted(true)
    } catch (e) {
      setError(e.message || 'Error al enviar. Por favor intente de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={44} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Gracias por su opinión!</h2>
          <p className="text-gray-500 mb-8">
            Su evaluación ha sido registrada exitosamente. Su retroalimentación nos ayuda a mejorar continuamente la calidad del servicio.
          </p>
          <button
            onClick={() => { setForm(INITIAL); setSubmitted(false) }}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Registrar otra encuesta
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center mb-3">
            <img
              src="/logo-blanco.png"
              alt="Clínica de Alta Complejidad Santa Bárbara"
              className="h-16 object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-2xl font-extrabold mt-4 mb-1">Encuesta de Satisfacción</h1>
          <p className="text-primary-200 text-sm">Su opinión es muy importante para nosotros</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Datos personales */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-base font-bold text-primary-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            Datos del Paciente
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <TextField label="Nombre completo" name="nombre_completo" value={form.nombre_completo} onChange={handle} placeholder="Ingrese su nombre completo" />
            </div>
            <TextField label="Número de identificación" name="numero_identificacion" value={form.numero_identificacion} onChange={handle} type="text" placeholder="Cédula / Tarjeta de identidad" />
            <TextField label="Teléfono de contacto" name="telefono" value={form.telefono} onChange={handle} type="tel" placeholder="3XX XXX XXXX" />
          </div>
        </section>

        {/* Información de la atención */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-base font-bold text-primary-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            Información de la Atención
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Sede de atención" name="sede" value={form.sede} onChange={handle} options={SEDES} required />
            <SelectField label="Entidad de salud" name="entidad_salud" value={form.entidad_salud} onChange={handle} options={ENTIDADES} required />
            <div className="sm:col-span-2">
              <SelectField label="Servicio en que fue atendido" name="servicio" value={form.servicio} onChange={handle} options={SERVICIOS} required />
            </div>
          </div>
        </section>

        {/* Calificaciones */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-base font-bold text-primary-700 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            Calificación del Servicio
          </h2>
          <p className="text-xs text-gray-500 mb-5 bg-gray-50 rounded-xl px-4 py-2">
            Seleccione un número del 1 al 5 siendo <strong>1 = Muy malo</strong> y <strong>5 = Excelente</strong>
          </p>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Recepción</label>
              <StarRating value={form.p1_recepcion} onChange={v => setForm(f => ({ ...f, p1_recepcion: v }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Personal asistencial</label>
              <StarRating value={form.p2_personal_asistencial} onChange={v => setForm(f => ({ ...f, p2_personal_asistencial: v }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Comodidad, orden y confort</label>
              <StarRating value={form.p3_comodidad} onChange={v => setForm(f => ({ ...f, p3_comodidad: v }))} />
            </div>
          </div>
        </section>

        {/* Experiencia global */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-base font-bold text-primary-700 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            Experiencia Global
          </h2>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ¿Cómo califica su experiencia general?
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCIA_GLOBAL.map(opt => {
              const color = EXPERIENCIA_COLORS[opt]
              const selected = form.p4_experiencia_global === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, p4_experiencia_global: opt }))}
                  className={`
                    px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150
                    ${selected
                      ? `${color.bg} ${color.text} border-transparent scale-105 shadow-md`
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    }
                  `}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </section>

        {/* Motivo y recomendación */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-base font-bold text-primary-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">5</span>
            Información Adicional
          </h2>
          <div className="space-y-4">
            <SelectField
              label="Motivo de insatisfacción (opcional)"
              name="p5_motivo_insatisfaccion"
              value={form.p5_motivo_insatisfaccion}
              onChange={handle}
              options={MOTIVOS_INSATISFACCION}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ¿Recomendaría nuestra IPS a sus amigos y familiares?<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="flex gap-3">
                {['Si', 'No'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, p6_recomendaria: opt }))}
                    className={`
                      flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all
                      ${form.p6_recomendaria === opt
                        ? opt === 'Si'
                          ? 'bg-green-500 text-white border-green-500 shadow-md'
                          : 'bg-red-500 text-white border-red-500 shadow-md'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }
                    `}
                  >
                    {opt === 'Si' ? '👍 Sí' : '👎 No'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                name="comentarios"
                value={form.comentarios}
                onChange={handle}
                rows={3}
                placeholder="Comparta cualquier comentario o sugerencia..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !form.sede || !form.entidad_salud || !form.servicio || !form.p6_recomendaria}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {submitting ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
          ) : (
            <><Send size={20} /> Enviar Encuesta</>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 pb-6">
          Sus datos son confidenciales y serán usados únicamente para mejorar nuestros servicios.
        </p>
      </form>
    </div>
  )
}
