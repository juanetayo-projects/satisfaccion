import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [mode, setMode]         = useState('login') // 'login' | 'forgot'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [resetSent, setResetSent] = useState(false)
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await signIn(email, password)
    if (err) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    if (!email) { setError('Ingrese su correo electrónico'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}#/reset-password`,
    })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setResetSent(true)
    }
  }

  const brandBar = (
    <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-8 pt-8 pb-10 text-center">
      <img
        src="/satisfaccion/logo-blanco.png"
        alt="CAC Santa Bárbara"
        className="h-16 object-contain mx-auto drop-shadow-md"
      />
    </div>
  )

  /* ── Pantalla: Recuperar contraseña ── */
  if (mode === 'forgot') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {brandBar}
            <div className="px-8 pb-8 -mt-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {resetSent ? (
                  <div className="text-center py-4">
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Correo enviado</h2>
                    <p className="text-gray-500 text-sm mb-6">
                      Revise su bandeja de entrada en <strong>{email}</strong>.
                      Haga clic en el enlace del correo para crear una nueva contraseña.
                    </p>
                    <button
                      onClick={() => { setMode('login'); setResetSent(false) }}
                      className="text-primary-600 hover:text-primary-800 text-sm font-semibold flex items-center gap-1.5 mx-auto"
                    >
                      <ArrowLeft size={15} /> Volver al inicio de sesión
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Recuperar contraseña</h2>
                    <p className="text-gray-400 text-sm mb-6">
                      Ingrese su correo y le enviaremos un enlace para restablecer su contraseña.
                    </p>
                    <form onSubmit={handleForgot} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          Correo electrónico
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="usuario@cacsantabarbara.co"
                            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                          {error}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-primary-200 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {loading
                          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
                          : 'Enviar enlace de recuperación'
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setError('') }}
                        className="w-full text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1.5 pt-1"
                      >
                        <ArrowLeft size={14} /> Volver al inicio de sesión
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

  /* ── Pantalla: Inicio de sesión ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {brandBar}
          <div className="px-8 pb-8 -mt-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Consola Administrativa</h2>
              <p className="text-gray-400 text-sm mb-6">Ingrese sus credenciales para continuar</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="usuario@cacsantabarbara.co"
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
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

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-primary-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Ingresando...</>
                    : 'Ingresar'
                  }
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError('') }}
                  className="w-full text-primary-600 hover:text-primary-800 text-sm font-medium pt-1"
                >
                  ¿Olvidé mi contraseña?
                </button>
              </form>
            </div>
          </div>
        </div>
        <p className="text-center text-white/60 text-xs mt-6">
          Sistema de Satisfacción del Usuario v1.0
        </p>
      </div>
    </div>
  )
}
