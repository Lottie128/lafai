import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext.jsx'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/content', icon: FileText, label: 'Content' },
]

export default function AdminLayout() {
  const { settings } = useStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('lafai_admin_authed')
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-base flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-surface border-r border-white/5 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <p className="font-display text-xl font-light italic text-[#f5f0f2]">
            {settings.storeName}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#f5f0f2]/30 mt-0.5">
            Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 mb-0.5 ${
                  isActive
                    ? 'bg-accent/10 text-accent border-r-2 border-accent'
                    : 'text-[#f5f0f2]/50 hover:text-[#f5f0f2]/80 hover:bg-white/5'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-surface border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
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

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
