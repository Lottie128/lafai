import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext.jsx'
import { ShoppingCart, Package, TrendingUp, DollarSign } from 'lucide-react'

export default function AdminDashboard() {
  const { products, settings, formatPrice } = useStore()

  const orders = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('lafai_orders') || '[]')
    } catch {
      return []
    }
  }, [])

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const inStock = products.filter((p) => p.inStock).length
  const lowStock = products.filter((p) => !p.inStock).length
  const recent = orders.slice(0, 5)

  const today = new Date().toDateString()
  const todayOrders = orders.filter(
    (o) => new Date(o.date).toDateString() === today
  )

  const STATUS_COLORS = {
    Processing: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30',
    Shipped: 'bg-blue-900/30 text-blue-300 border-blue-500/30',
    Delivered: 'bg-green-900/30 text-green-300 border-green-500/30',
    Cancelled: 'bg-red-900/30 text-red-300 border-red-500/30',
  }

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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: 'Total Orders',
            value: orders.length,
            sub: `${todayOrders.length} today`,
            icon: ShoppingCart,
            color: 'text-accent',
          },
          {
            label: 'Revenue',
            value: formatPrice(revenue),
            sub: `${settings.currency.code}`,
            icon: DollarSign,
            color: 'text-gold',
          },
          {
            label: 'Products',
            value: products.length,
            sub: `${inStock} in stock`,
            icon: Package,
            color: 'text-blue-400',
          },
          {
            label: 'Out of Stock',
            value: lowStock,
            sub: 'Need restocking',
            icon: TrendingUp,
            color: 'text-red-400',
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-card border border-white/5 p-5 hover:border-white/10 transition-colors"
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
        <div className="lg:col-span-2 bg-card border border-white/5">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-sm font-medium text-[#f5f0f2]/70">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs text-accent/60 hover:text-accent transition-colors uppercase tracking-wide"
            >
              View All
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#f5f0f2]/20 text-sm">
              No orders yet.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recent.map((order) => (
                <div
                  key={order.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-[#f5f0f2]/80 truncate">
                      {order.customer?.name}
                    </p>
                    <p className="text-xs text-[#f5f0f2]/30 mt-0.5">
                      {order.id} ·{' '}
                      {new Date(order.date).toLocaleDateString('en-GB')}
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
                    <span className="text-sm text-accent font-medium">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-white/5">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-sm font-medium text-[#f5f0f2]/70">
              Quick Actions
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { to: '/admin/products', label: 'Add New Product' },
              { to: '/admin/orders', label: 'Manage Orders' },
              { to: '/admin/settings', label: 'Store Settings' },
              { to: '/admin/content', label: 'Edit Content' },
              { to: '/', label: 'View Storefront ↗', target: '_blank' },
            ].map(({ to, label, target }) => (
              <Link
                key={to}
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
