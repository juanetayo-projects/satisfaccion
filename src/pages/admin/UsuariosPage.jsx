import { useState, useEffect } from 'react'
import {
  Users, Plus, Pencil, Trash2, X, Save,
  ChevronDown, Shield, UserCheck, Mail, User,
  Key, Info, CheckCircle, ExternalLink, RefreshCw
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { ROLES } from '../../lib/constants'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'

const BLANK_NEW  = { uuid: '', nombre: '', email: '', rol: 'encuestador', activo: true }
const BLANK_EDIT = { nombre: '', rol: 'encuestador', activo: true }

/* ─── Paso guía para crear usuario ─────────────────────────────── */
function GuiaSteps() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Info size={16} className="text-blue-600 flex-shrink-0" />
        <span className="text-sm font-bold text-blue-800">¿Cómo crear un nuevo usuario?</span>
      </div>
      <ol className="space-y-2.5">
        {[
          {
            num: '1',
            title: 'Crear en Supabase Authentication',
            desc: 'Abra Supabase → Authentication → Users → "Add user" → ingrese correo y contraseña.',
            link: 'https://supabase.com/dashboard/project/ycbzchoclantbkjglfvn/auth/users',
            linkLabel: 'Ir a Supabase Auth',
          },
          {
            num: '2',
            title: 'Copiar el UUID',
            desc: 'Después de crear el usuario en Supabase, copie el UUID (ej: 4791df53-8810-...).',
          },
          {
            num: '3',
            title: 'Registrar en el sistema',
            desc: 'Haga clic en "Vincular usuario", pegue el UUID y complete los datos del perfil.',
          },
        ].map(step => (
          <li key={step.num} className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {step.num}
            </span>
            <div>
              <div className="text-sm font-semibold text-blue-900">{step.title}</div>
              <div className="text-xs text-blue-700 mt-0.5">{step.desc}</div>
              {step.link && (
                <a href={step.link} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline mt-1">
                  {step.linkLabel} <ExternalLink size={11} />
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ─── Modal Vincular (crear perfil para auth user existente) ──── */
function ModalVincular({ onClose, onSaved }) {
  const [form, setForm]   = useState(BLANK_NEW)
  const [saving, setSaving] = useState(false)
  const [error, setError]  = useState('')

  function handle(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function save() {
    if (!form.uuid.trim()) { setError('El UUID es obligatorio'); return }
    if (!form.email.trim()) { setError('El correo es obligatorio'); return }
    setSaving(true)
    setError('')
    try {
      const { error: e } = await supabase.from('profiles').insert([{
        id:     form.uuid.trim(),
        email:  form.email.trim().toLowerCase(),
        nombre: form.nombre.trim(),
        rol:    form.rol,
        activo: form.activo,
      }])
      if (e) throw e
      onSaved()
    } catch (e) {
      setError(e.message.includes('foreign key') || e.message.includes('violates')
        ? 'El UUID no corresponde a ningún usuario en Supabase Authentication. Verifique que lo copió correctamente.'
        : e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Vincular usuario al sistema</h2>
            <p className="text-xs text-gray-400 mt-0.5">El usuario debe existir primero en Supabase Authentication</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Recordatorio del paso 1 */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-3 text-xs text-amber-800">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <span>Antes de continuar, asegúrese de haber creado el usuario en{' '}
              <a href="https://supabase.com/dashboard/project/ycbzchoclantbkjglfvn/auth/users"
                target="_blank" rel="noreferrer" className="underline font-semibold">
                Supabase Authentication
              </a> y copiar su UUID.
            </span>
          </div>

          {/* UUID */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              UUID de Supabase <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="uuid" value={form.uuid} onChange={handle}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Cópielo desde Supabase → Authentication → Users → columna UID.</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="email" type="email" value={form.email} onChange={handle}
                placeholder="usuario@cacsantabarbara.co"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nombre completo</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="nombre" value={form.nombre} onChange={handle}
                placeholder="Nombre completo del usuario"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Rol</label>
            <div className="relative">
              <select name="rol" value={form.rol} onChange={handle}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              <strong>Administrador:</strong> acceso completo al panel. <strong>Encuestador:</strong> solo registro de encuestas.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="activo" checked={form.activo} onChange={handle}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
            <span className="text-sm font-medium text-gray-700">Usuario activo</span>
          </label>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50 transition-colors">
            {saving
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Vinculando...</>
              : <><CheckCircle size={15} /> Vincular usuario</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Modal Editar ──────────────────────────────────────────────── */
function ModalEditar({ user, onClose, onSaved }) {
  const [form, setForm]   = useState({ nombre: user.nombre || '', rol: user.rol || 'encuestador', activo: user.activo !== false })
  const [saving, setSaving] = useState(false)
  const [error, setError]  = useState('')

  function handle(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      const { error: e } = await supabase
        .from('profiles')
        .update({ nombre: form.nombre, rol: form.rol, activo: form.activo })
        .eq('id', user.id)
      if (e) throw e
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">Editar usuario</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Correo</label>
            <div className="px-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-mono">
              {user.email}
            </div>
          </div>
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nombre completo</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="nombre" value={form.nombre} onChange={handle} placeholder="Nombre del usuario"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          {/* Rol */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Rol</label>
            <div className="relative">
              <select name="rol" value={form.rol} onChange={handle}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="activo" checked={form.activo} onChange={handle}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
            <span className="text-sm font-medium text-gray-700">Usuario activo</span>
          </label>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</div>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50 transition-colors">
            {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</> : <><Save size={15} /> Guardar</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Página principal ──────────────────────────────────────────── */
export default function UsuariosPage() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showVincular, setShowVincular] = useState(false)
  const [editUser, setEditUser]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { profile } = useAuth()

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function handleDelete() {
    setDeleteLoading(true)
    await supabase.from('profiles').delete().eq('id', deleteTarget.id)
    setDeleteTarget(null)
    setDeleteLoading(false)
    loadUsers()
  }

  if (profile?.rol !== 'administrador') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600">Acceso restringido</h2>
        <p className="text-gray-400 text-sm mt-2">Solo los administradores pueden gestionar usuarios.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Usuarios</h1>
          <p className="text-gray-400 text-sm">{users.length} usuario(s) registrado(s) en el sistema</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadUsers}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} />
          </button>
          <button onClick={() => setShowVincular(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={15} /> Vincular usuario
          </button>
        </div>
      </div>

      {/* Guía de pasos */}
      <GuiaSteps />

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay usuarios registrados en el sistema</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Usuario', 'Correo', 'UUID', 'Rol', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                          {u.nombre?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-gray-800 whitespace-nowrap">{u.nombre || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-400 truncate block max-w-[140px]" title={u.id}>
                        {u.id?.slice(0, 8)}…
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${u.rol === 'administrador' ? 'bg-primary-100 text-primary-700' : 'bg-teal-100 text-teal-700'}`}>
                        {u.rol === 'administrador' ? <Shield size={11} /> : <UserCheck size={11} />}
                        {ROLES[u.rol] || u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
                        ${u.activo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditUser(u)} className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors" title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Eliminar">
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
      </div>

      {/* Modals */}
      {showVincular && (
        <ModalVincular
          onClose={() => setShowVincular(false)}
          onSaved={() => { setShowVincular(false); loadUsers() }}
        />
      )}
      {editUser && (
        <ModalEditar
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); loadUsers() }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar usuario del sistema"
        message={`¿Está seguro de eliminar el perfil de "${deleteTarget?.nombre || deleteTarget?.email}"? El usuario seguirá existiendo en Supabase Authentication pero no podrá acceder al sistema.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  )
}
