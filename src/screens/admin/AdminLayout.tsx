import { useEffect, useState } from 'react'
import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Trophy, LogOut, Shield } from 'lucide-react'
import { cn } from '../../lib/utils'

export function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check custom session in localStorage
    const loggedIn = localStorage.getItem('penca_admin_logged_in') === 'true'
    setIsAuthenticated(loggedIn)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('penca_admin_logged_in')
    localStorage.removeItem('penca_admin_user')
    setIsAuthenticated(false)
    navigate('/admin/login')
  }

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Verificando acceso...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const navItems = [
    { name: 'Gestión de Partidos', path: '/admin/matches', icon: LayoutDashboard },
    { name: 'Ver Pronósticos', path: '/admin/predictions', icon: Users },
    { name: 'Ganadores', path: '/admin/winners', icon: Trophy },
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 md:min-h-screen flex flex-col">
        <div className="p-4 md:p-6 flex items-center gap-3 border-b border-slate-800">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin Penca</h1>
            <p className="text-xs text-slate-400">Agrotec</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
