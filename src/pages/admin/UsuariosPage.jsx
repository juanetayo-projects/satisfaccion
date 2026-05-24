import { useState, useEffect } from 'react'
import {
  Users, Plus, Pencil, Trash2, X, Save,
  ChevronDown, Shield, UserCheck, Mail, User
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { ROLES } from '../../lib/constants'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'

const BLANK = { nombre: '', email: '', rol: 'encuestador', activo: true }

export default function UsuariosPage() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm]         = useState(BLANK)
  const [saving, setSaving]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError]       = useState('')
  const { profile }             = useAuth()

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

  function openNew() { setEditUser(null); setForm(BLANK); setError(''); setShowModal(true) }
  function openEdit(u) { setEditUser(u); setForm({ nombre: u.nombre || '', email: u.email || '', rol: u.rol || 'encuestador', activo: u.activo !== false }); setError(''); setShowModal(true) }

  async function save() {
    setSaving(true)
    setError('')
    try {
      if (!editUser) {
        // Invite new user via Supabase Admin — we update profile after auth creates the user
        // For simplicity, insert directly into profiles (admin must handle auth separately)
        const { error: e } = await supabase.from('profiles').insert([{
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
          activo: form.activo,
        }])
        if (e) throw e
      } else {
        const { error: e } = await supabase
          .from('profiles')
          .update({ nombre: form.nombre, rol: form.rol, activo: form.activo })
          .eq('id', editUser.id)
        if (e) throw e
      }
      setShowModal(false)
      loadUsers()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    await supabase.from('profiles').delete().eq('id', deleteTarget.id)
    setDeleteTarget(null)
    setDeleteLoading(false)
    loadUsers()
  }

  function handle(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Usuarios</h1>
          <p className="text-gray-400 text-sm">{users.length} usuario(s) registrados</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} /> Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay usuarios registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Usuario', 'Correo', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                      <span className="font-medium text-gray-800">{u.nombre || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${u.rol === 'administrador' ? 'bg-primary-100 text-primary-700' : 'bg-teal-100 text-teal-700'}`}>
                      {u.rol === 'administrador' ? <Shield size={11} /> : <UserCheck size={11} />}
                      {ROLES[u.rol] || u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${u.activo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg">
                {editUser ? 'Editar usuario' : 'Nuevo usuario'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nombre completo</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="nombre" value={form.nombre} onChange={handle} placeholder="Nombre del usuario"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              {!editUser && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="email" type="email" value={form.email} onChange={handle} placeholder="usuario@cacsantabarbara.co"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">El usuario recibirá una invitación por correo desde Supabase.</p>
                </div>
              )}

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
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50 transition-colors">
                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</> : <><Save size={15} /> Guardar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar usuario"
        message={`¿Está seguro de eliminar el usuario "${deleteTarget?.nombre || deleteTarget?.email}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  )
}
