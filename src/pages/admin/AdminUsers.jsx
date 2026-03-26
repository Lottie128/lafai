import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { RefreshCw, Users } from 'lucide-react'

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

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminQuery('get_users')
      setUsers(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic font-light text-[#f5f0f2] mb-1">Customers</h1>
          <p className="text-xs text-[#f5f0f2]/30">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
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

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or city…"
          className="input-dark max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c4727a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f0d10] border border-white/5 py-20 text-center">
          <Users size={32} className="text-[#f5f0f2]/10 mx-auto mb-3" />
          <p className="font-display text-2xl italic font-light text-[#f5f0f2]/20 mb-2">
            No customers yet
          </p>
          <p className="text-xs text-[#f5f0f2]/20">
            Users who sign up will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-[#0f0d10] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Name', 'Email', 'Phone', 'City', 'Joined', 'Orders'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-[#f5f0f2]/25 font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((user) => {
                  const orderCount = Array.isArray(user.orders)
                    ? user.orders.length
                    : (user.orders?.[0]?.count ?? 0)
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#c4727a]/20 border border-[#c4727a]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-semibold text-[#c4727a]">
                              {(user.name || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-[#f5f0f2]/70">
                            {user.name || <span className="text-[#f5f0f2]/25 italic">No name</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#f5f0f2]/50">
                        {user.email || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#f5f0f2]/40">
                        {user.phone || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#f5f0f2]/40">
                        {user.city || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#f5f0f2]/30">
                        {user.updated_at
                          ? new Date(user.updated_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 text-[#f5f0f2]/50">
                          {orderCount}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
