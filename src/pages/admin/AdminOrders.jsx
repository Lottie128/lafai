import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../../context/StoreContext.jsx'
import { supabase } from '../../lib/supabase.js'
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

const STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled']
const STATUS_COLORS = {
  Processing: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30',
  Shipped: 'bg-blue-900/30 text-blue-300 border-blue-500/30',
  Delivered: 'bg-green-900/30 text-green-300 border-green-500/30',
  Cancelled: 'bg-red-900/30 text-red-300 border-red-500/30',
}
const PAYMENT_LABELS = {
  paypal: 'PayPal', airtel: 'Airtel Money', mtn: 'MTN MoMo', zamtel: 'Zamtel',
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

export default function AdminOrders() {
  const { formatPrice } = useStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkUpdating, setBulkUpdating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminQuery('get_orders')
      setOrders(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      const updated = await adminQuery('update_order_status', { id: orderId, status })
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: updated.status } : o))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selected.size === 0) return
    setBulkUpdating(true)
    try {
      await adminQuery('bulk_update_orders', { ids: Array.from(selected), status: bulkStatus })
      setOrders((prev) => prev.map((o) => selected.has(o.id) ? { ...o, status: bulkStatus } : o))
      setSelected(new Set())
      setBulkStatus('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBulkUpdating(false)
    }
  }

  const filteredOrders = useMemo(() => {
    let list = [...orders]
    if (statusFilter !== 'All') list = list.filter((o) => o.status === statusFilter)
    if (dateFilter !== 'all') {
      const cutoffs = { today: 0, week: 7, month: 30 }
      const days = cutoffs[dateFilter]
      if (days !== undefined) {
        const since = days === 0
          ? (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()
          : new Date(Date.now() - days * 86400000)
        list = list.filter((o) => new Date(o.created_at) >= since)
      }
    }
    return list
  }, [orders, statusFilter, dateFilter])

  const allSelected = filteredOrders.length > 0 && filteredOrders.every((o) => selected.has(o.id))
  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredOrders.map((o) => o.id)))
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic font-light text-[#f5f0f2] mb-1">Orders</h1>
          <p className="text-xs text-[#f5f0f2]/30">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-xs text-[#f5f0f2]/40 hover:text-[#f5f0f2]/70 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-900/20 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex flex-wrap gap-1">
          {['All', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-all ${
                statusFilter === s
                  ? 'border-[#c4727a] bg-[#c4727a]/10 text-[#c4727a]'
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
          className="input-dark text-xs py-1.5 w-auto"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-5 p-3 bg-[#c4727a]/10 border border-[#c4727a]/20">
          <span className="text-xs text-[#f5f0f2]/60">{selected.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="input-dark text-xs py-1 w-auto"
          >
            <option value="">Set status…</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkStatus || bulkUpdating}
            className="text-xs bg-[#c4727a] hover:bg-[#b5636b] text-white px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            {bulkUpdating ? 'Updating…' : 'Apply'}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-[#f5f0f2]/30 hover:text-[#f5f0f2]/60 transition-colors ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c4727a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#0f0d10] border border-white/5 py-20 text-center">
          <p className="font-display text-2xl italic font-light text-[#f5f0f2]/20 mb-2">No orders found</p>
          <p className="text-xs text-[#f5f0f2]/20">Adjust filters or wait for orders to come in.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select-all header */}
          <div className="flex items-center gap-3 px-5 py-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="accent-[#c4727a]"
            />
            <span className="text-xs text-[#f5f0f2]/20 uppercase tracking-widest">Select all</span>
          </div>

          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#0f0d10] border border-white/5 overflow-hidden">
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(order.id)}
                  onChange={(e) => {
                    e.stopPropagation()
                    setSelected((prev) => {
                      const next = new Set(prev)
                      next.has(order.id) ? next.delete(order.id) : next.add(order.id)
                      return next
                    })
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="accent-[#c4727a] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-[#f5f0f2]/80 font-medium">
                      {order.profiles?.name || order.shipping?.name || 'Guest'}
                    </p>
                    <span className="text-xs text-[#f5f0f2]/25 font-mono">
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#f5f0f2]/30 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {' · '}
                    {PAYMENT_LABELS[order.payment_method] || order.payment_method || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[#c4727a] font-medium text-sm">{formatPrice(order.total)}</span>
                  <span className={`text-[10px] uppercase tracking-wide border px-2 py-0.5 hidden sm:inline ${
                    STATUS_COLORS[order.status] || 'bg-white/5 text-white/30 border-white/10'
                  }`}>
                    {order.status}
                  </span>
                  {expanded === order.id
                    ? <ChevronUp size={14} className="text-[#f5f0f2]/30" />
                    : <ChevronDown size={14} className="text-[#f5f0f2]/30" />
                  }
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-white/5 px-5 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-xs uppercase tracking-widest text-[#f5f0f2]/30 mb-3">Items</p>
                      <div className="space-y-2">
                        {(order.items || []).map((item, i) => (
                          <div key={item.key || i} className="flex items-center gap-3 text-sm">
                            {item.image && (
                              <div className="w-8 h-10 bg-[#080508] overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[#f5f0f2]/70 truncate">{item.name}</p>
                              {item.size && (
                                <p className="text-xs text-[#f5f0f2]/30">{item.size} × {item.qty}</p>
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
                          <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[#f5f0f2] font-medium pt-1 border-t border-white/10">
                          <span>Total</span>
                          <span className="text-[#c4727a]">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#f5f0f2]/30 mb-3">Customer</p>
                        <div className="text-sm space-y-1">
                          <p className="text-[#f5f0f2]/70">{order.shipping?.name}</p>
                          <p className="text-[#f5f0f2]/40">{order.shipping?.email}</p>
                          <p className="text-[#f5f0f2]/40">{order.shipping?.phone}</p>
                          <p className="text-[#f5f0f2]/40">
                            {order.shipping?.address}
                            {order.shipping?.city && `, ${order.shipping.city}`}
                          </p>
                        </div>
                        {order.payment_ref && (
                          <p className="text-[10px] text-[#f5f0f2]/20 mt-2 font-mono">
                            Ref: {order.payment_ref}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#f5f0f2]/30 mb-3">Update Status</p>
                        <div className="space-y-1.5">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              disabled={updatingId === order.id}
                              onClick={() => updateStatus(order.id, s)}
                              className={`w-full text-left text-xs px-3 py-2 border transition-all disabled:opacity-50 ${
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
