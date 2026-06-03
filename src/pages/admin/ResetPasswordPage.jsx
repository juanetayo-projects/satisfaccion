import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const navigate = useNavigate()

  // Supabase JS v2 procesa automáticamente el access_token del hash de la URL
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true)
      }
    })
    // Verificar si ya hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-8 pt-8 pb-10 text-center">
            <img
              src="/satisfaccion/logo-blanco.png"
              alt="CAC Santa Bárbara"
              className="h-16 object-contain mx-auto drop-shadow-md"
            />
          </div>

          <div className="px-8 pb-8 -mt-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

              {success ? (
                <div className="text-center py-4">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <h2 className="text-lg font-bold text-gray-800 mb-2">¡Contraseña actualizada!</h2>
                  <p className="text-gray-500 text-sm">
                    Su contraseña fue cambiada exitosamente. Será redirigido al inicio de sesión en unos segundos...
                  </p>
                </div>
              ) : !sessionReady ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Verificando enlace de recuperación...</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">Nueva contraseña</h2>
                  <p className="text-gray-400 text-sm mb-6">Ingrese y confirme su nueva contraseña.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPwd ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Confirmar contraseña
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPwd ? 'text' : 'password'}
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          required
                          placeholder="Repita la contraseña"
                          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                        <AlertCircle size={15} className="flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-primary-200 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
                        : 'Guardar nueva contraseña'
                      }
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
