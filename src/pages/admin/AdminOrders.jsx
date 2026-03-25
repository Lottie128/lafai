import { useState, useMemo } from 'react'
import { useStore } from '../../context/StoreContext.jsx'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

const STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled']
const STATUS_COLORS = {
  Processing: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30',
  Shipped: 'bg-blue-900/30 text-blue-300 border-blue-500/30',
  Delivered: 'bg-green-900/30 text-green-300 border-green-500/30',
  Cancelled: 'bg-red-900/30 text-red-300 border-red-500/30',
}

const PAYMENT_LABELS = {
  paypal: 'PayPal',
  airtel: 'Airtel Money',
  mtn: 'MTN MoMo',
  zamtel: 'Zamtel',
}

function getDateRange(filter) {
  const now = new Date()
  if (filter === 'today') {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (filter === 'week') {
    const d = new Date(now - 7 * 86400000)
    return d
  }
  if (filter === 'month') {
    const d = new Date(now - 30 * 86400000)
    return d
  }
  return null
}

export default function AdminOrders() {
  const { formatPrice } = useStore()
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lafai_orders') || '[]')
    } catch {
      return []
    }
  })

  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const updateStatus = (orderId, status) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status } : o
    )
    setOrders(updated)
    localStorage.setItem('lafai_orders', JSON.stringify(updated))
  }

  const filteredOrders = useMemo(() => {
    let list = [...orders]
    if (statusFilter !== 'All') {
      list = list.filter((o) => o.status === statusFilter)
    }
    const since = getDateRange(dateFilter)
    if (since) {
      list = list.filter((o) => new Date(o.date) >= since)
    }
    return list
  }, [orders, statusFilter, dateFilter])

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl italic font-light text-[#f5f0f2] mb-1">
          Orders
        </h1>
        <p className="text-xs text-[#f5f0f2]/30">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1">
          {['All', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-all ${
                statusFilter === s
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-white/10 text-[#f5f0f2]/30 hover:border-white/20 hover:text-[#f5f0f2]/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-dark text-xs py-1.5 bg-surface w-auto"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-card border border-white/5 py-20 text-center">
          <p className="font-display text-2xl italic font-light text-[#f5f0f2]/20 mb-2">
            No orders found
          </p>
          <p className="text-xs text-[#f5f0f2]/20">
            Adjust filters or wait for orders to come in.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-white/5 overflow-hidden"
            >
              {/* Row */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/2 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-[#f5f0f2]/80 font-medium">
                        {order.customer?.name || 'Unknown'}
                      </p>
                      <span className="text-xs text-[#f5f0f2]/25">{order.id}</span>
                    </div>
                    <p className="text-xs text-[#f5f0f2]/30 mt-0.5">
                      {new Date(order.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · '}
                      {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-accent font-medium text-sm">
                    {formatPrice(order.total)}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wide border px-2 py-0.5 hidden sm:inline ${
                      STATUS_COLORS[order.status] || 'bg-white/5 text-white/30 border-white/10'
                    }`}
                  >
                    {order.status}
                  </span>
                  {expanded === order.id ? (
                    <ChevronUp size={14} className="text-[#f5f0f2]/30" />
                  ) : (
                    <ChevronDown size={14} className="text-[#f5f0f2]/30" />
                  )}
                </div>
              </div>

              {/* Expanded */}
              {expanded === order.id && (
                <div className="border-t border-white/5 px-5 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Items */}
                    <div className="md:col-span-2">
                      <p className="text-xs uppercase tracking-widest text-[#f5f0f2]/30 mb-3">
                        Items
                      </p>
                      <div className="space-y-2">
                        {(order.items || []).map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="w-8 h-10 bg-surface overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[#f5f0f2]/70 truncate">{item.name}</p>
                              {item.size && (
                                <p className="text-xs text-[#f5f0f2]/30">
                                  {item.size} × {item.qty}
                                </p>
                              )}
                            </div>
                            <span className="text-[#f5f0f2]/50 text-xs">
                              {formatPrice(item.price * item.qty)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 text-xs space-y-1">
                        <div className="flex justify-between text-[#f5f0f2]/30">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[#f5f0f2]/30">
                          <span>Shipping</span>
                          <span>{formatPrice(order.shipping)}</span>
                        </div>
                        <div className="flex justify-between text-[#f5f0f2]/30">
                          <span>Tax</span>
                          <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between text-[#f5f0f2] font-medium pt-1 border-t border-white/10">
                          <span>Total</span>
                          <span className="text-accent">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer + status */}
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#f5f0f2]/30 mb-3">
                          Customer
                        </p>
                        <div className="text-sm space-y-1">
                          <p className="text-[#f5f0f2]/70">{order.customer?.name}</p>
                          <p className="text-[#f5f0f2]/40">{order.customer?.email}</p>
                          <p className="text-[#f5f0f2]/40">{order.customer?.phone}</p>
                          <p className="text-[#f5f0f2]/40">
                            {order.customer?.address}
                            {order.customer?.city && `, ${order.customer.city}`}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#f5f0f2]/30 mb-3">
                          Update Status
                        </p>
                        <div className="space-y-1.5">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              className={`w-full text-left text-xs px-3 py-2 border transition-all ${
                                order.status === s
                                  ? STATUS_COLORS[s]
                                  : 'border-white/10 text-[#f5f0f2]/30 hover:border-white/20 hover:text-[#f5f0f2]/60'
                              }`}
                            >
                              {order.status === s ? '✓ ' : ''}{s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
