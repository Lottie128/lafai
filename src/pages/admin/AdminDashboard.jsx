import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext.jsx'
import { supabase } from '../../lib/supabase.js'
import { ShoppingCart, Package, TrendingUp, Users } from 'lucide-react'

const STATUS_COLORS = {
  Processing: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30',
  Shipped: 'bg-blue-900/30 text-blue-300 border-blue-500/30',
  Delivered: 'bg-green-900/30 text-green-300 border-green-500/30',
  Cancelled: 'bg-red-900/30 text-red-300 border-red-500/30',
}

async function adminQuery(action, params = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  const res = await fetch('/api/admin-query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, ...params }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export default function AdminDashboard() {
  const { products, formatPrice, settings } = useStore()
  const [stats, setStats] = useState({ orderCount: 0, totalRevenue: 0, userCount: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [statsData, ordersData] = await Promise.all([
          adminQuery('get_stats'),
          adminQuery('get_orders'),
        ])
        setStats(statsData)
        setRecentOrders((ordersData || []).slice(0, 8))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const inStock = products.filter((p) => p.inStock).length

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl italic font-light text-[#f5f0f2] mb-1">
          Dashboard
        </h1>
        <p className="text-xs text-[#f5f0f2]/30">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/20 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: 'Total Orders',
            value: loading ? '…' : stats.orderCount,
            sub: 'All time',
            icon: ShoppingCart,
            color: 'text-[#c4727a]',
          },
          {
            label: 'Revenue',
            value: loading ? '…' : formatPrice(stats.totalRevenue),
            sub: settings.currency?.code || 'ZMW',
            icon: TrendingUp,
            color: 'text-[#c9a96e]',
          },
          {
            label: 'Products',
            value: products.length,
            sub: `${inStock} in stock`,
            icon: Package,
            color: 'text-blue-400',
          },
          {
            label: 'Customers',
            value: loading ? '…' : stats.userCount,
            sub: 'Registered',
            icon: Users,
            color: 'text-purple-400',
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-[#0f0d10] border border-white/5 p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-[#f5f0f2]/30">
                {label}
              </p>
              <Icon size={15} className={`${color} opacity-60`} />
            </div>
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            <p className="text-xs text-[#f5f0f2]/25 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#0f0d10] border border-white/5">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-sm font-medium text-[#f5f0f2]/70">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-xs text-[#c4727a]/60 hover:text-[#c4727a] transition-colors uppercase tracking-wide"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-[#c4727a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#f5f0f2]/20 text-sm">
              No orders yet.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-[#f5f0f2]/80 truncate">
                      {order.profiles?.name || order.shipping?.name || 'Guest'}
                    </p>
                    <p className="text-xs text-[#f5f0f2]/30 mt-0.5">
                      {order.id.slice(0, 8).toUpperCase()} ·{' '}
                      {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-[10px] uppercase tracking-wide border px-2 py-0.5 ${
                        STATUS_COLORS[order.status] || 'bg-white/5 text-white/30 border-white/10'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm text-[#c4727a] font-medium">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-[#0f0d10] border border-white/5">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-sm font-medium text-[#f5f0f2]/70">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { to: '/admin/products', label: 'Add New Product' },
              { to: '/admin/orders', label: 'Manage Orders' },
              { to: '/admin/users', label: 'View Customers' },
              { to: '/admin/settings', label: 'Payment Settings' },
              { to: '/admin/content', label: 'Edit Content' },
              { to: '/', label: 'View Storefront ↗', target: '_blank' },
            ].map(({ to, label, target }) => (
              <Link
                key={label}
                to={to}
                target={target}
                className="block px-4 py-2.5 text-sm text-[#f5f0f2]/50 hover:text-[#f5f0f2] hover:bg-white/5 transition-all border border-white/5 hover:border-white/10"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
