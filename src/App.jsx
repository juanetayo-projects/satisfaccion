import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import EncuestaPage  from './pages/encuesta/EncuestaPage'
import LoginPage     from './pages/admin/LoginPage'
import AdminLayout   from './components/layout/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import RegistrosPage from './pages/admin/RegistrosPage'
import AnalisisPage  from './pages/admin/AnalisisPage'
import UsuariosPage      from './pages/admin/UsuariosPage'
import QRPage            from './pages/admin/QRPage'
import ResetPasswordPage from './pages/admin/ResetPasswordPage'
import NotFoundPage      from './pages/NotFoundPage'
import LoadingSpinner from './components/ui/LoadingSpinner'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen message="Verificando sesión..." />
  if (!user)   return <Navigate to="/login" replace />
  if (adminOnly && profile?.rol !== 'administrador') return <Navigate to="/admin" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<Navigate to="/encuesta" replace />} />
      <Route path="/encuesta" element={<EncuestaPage />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index         element={<DashboardPage />} />
        <Route path="registros" element={<RegistrosPage />} />
        <Route path="analisis"  element={<AnalisisPage />} />
        <Route path="usuarios"  element={
          <ProtectedRoute adminOnly>
            <UsuariosPage />
          </ProtectedRoute>
        } />
        <Route path="qr" element={<QRPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}
