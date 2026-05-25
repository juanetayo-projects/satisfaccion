import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, BarChart3,
  Users, LogOut, X
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { to: '/admin/registros', label: 'Registros',  icon: ClipboardList },
  { to: '/admin/analisis',  label: 'Análisis',   icon: BarChart3 },
  { to: '/admin/usuarios',  label: 'Usuarios',   icon: Users, adminOnly: true },
]

export default function Sidebar({ open, onToggle }) {
  const { profile, signOut } = useAuth()

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onToggle} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30 flex flex-col
        bg-gradient-to-b from-primary-700 to-primary-900
        transition-all duration-300 ease-in-out
        ${open ? 'w-64' : 'w-0 lg:w-64'}
        overflow-hidden
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-primary-600">
          <img
            src="/satisfaccion/logo-blanco.png"
            alt="CAC Santa Bárbara"
            className="h-10 object-contain"
          />
          <button onClick={onToggle} className="lg:hidden text-primary-300 hover:text-white ml-2">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems
            .filter(item => !item.adminOnly || profile?.rol === 'administrador')
            .map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-primary-300 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))
          }
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-primary-600">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
              {profile?.nombre?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-medium truncate">{profile?.nombre || 'Usuario'}</div>
              <div className="text-primary-300 text-xs capitalize">{profile?.rol}</div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-primary-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
