import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext.jsx'
import { supabase } from '../../lib/supabase.js'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  Users,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/content', icon: FileText, label: 'Content' },
]

export default function AdminLayout() {
  const { settings } = useStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checking, setChecking] = useState(true)
  const [adminUser, setAdminUser] = useState(null)
  const [checkError, setCheckError] = useState('')

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          setCheckError(`Session error: ${sessionError.message}`)
          setChecking(false)
          return
        }
        if (!session) {
          navigate('/admin', { replace: true })
          return
        }
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, name')
          .eq('id', session.user.id)
          .single()
        if (profileError) {
          setCheckError(`Profile error: ${profileError.message}`)
          setChecking(false)
          return
        }
        if (profile?.role !== 'admin') {
          await supabase.auth.signOut()
          navigate('/admin', { replace: true })
          return
        }
        setAdminUser({ ...session.user, name: profile.name })
        setChecking(false)
      } catch (err) {
        setCheckError(err.message || 'Failed to verify admin session.')
        setChecking(false)
      }
    }
    checkAdmin()
  }, [navigate])

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#080508] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c4727a] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (checkError) {
    return (
      <div className="min-h-screen bg-[#080508] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center lux-panel p-8">
          <h1 className="font-display text-2xl italic font-light gold-sheen mb-3">
            Admin Session Error
          </h1>
          <p className="text-gold/70 text-sm mb-6">{checkError}</p>
          <button
            onClick={() => navigate('/admin', { replace: true })}
            className="btn-outline text-xs"
          >
            Back to Admin Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080508] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-[#0a080b] border-r border-white/5 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-6 border-b border-white/5">
          <p className="font-display text-xl font-light italic text-[#f5f0f2]">
            {settings.storeName}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#f5f0f2]/30 mt-0.5">
            Admin
          </p>
        </div>

        <nav className="flex-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 mb-0.5 ${
                  isActive
                    ? 'bg-[#c4727a]/10 text-[#c4727a] border-r-2 border-[#c4727a]'
                    : 'text-[#f5f0f2]/50 hover:text-[#f5f0f2]/80 hover:bg-white/5'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          {adminUser && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-[#f5f0f2]/40 truncate">{adminUser.name || 'Admin'}</p>
              <p className="text-[10px] text-[#f5f0f2]/20 truncate">{adminUser.email}</p>
            </div>
          )}
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#f5f0f2]/30 hover:text-[#f5f0f2]/60 transition-colors"
          >
            <ExternalLink size={15} />
            View Store
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#f5f0f2]/30 hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#0a080b] border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[#f5f0f2]/50 hover:text-[#f5f0f2] transition-colors"
            >
              <Menu size={20} />
            </button>
            <p className="text-sm text-[#f5f0f2]/40 font-medium">
              {settings.storeName} — Admin
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#f5f0f2]/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
