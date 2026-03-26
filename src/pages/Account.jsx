import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Package, Save, LogOut, Check } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { useStore } from '../context/StoreContext.jsx'

const STATUS_COLORS = {
  Processing: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30',
  Shipped: 'bg-blue-900/30 text-blue-300 border-blue-500/30',
  Delivered: 'bg-green-900/30 text-green-300 border-green-500/30',
  Cancelled: 'bg-red-900/30 text-red-300 border-red-500/30',
}

export default function Account() {
  const { user, profile, loading, signOut, updateProfile } = useAuth()
  const { formatPrice } = useStore()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?next=/account', { replace: true })
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
      })
    }
  }, [profile])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    setOrdersLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setOrders(data || [])
    setOrdersLoading(false)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      await updateProfile(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const summarizeItems = (items) => {
    if (!items || !items.length) return '—'
    if (items.length === 1) return items[0].name
    return `${items[0].name} +${items.length - 1} more`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080508] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c4727a] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col bg-[#080508]">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
            <h1 className="font-display text-4xl font-light italic gold-sheen mb-1">
              My Account
            </h1>
            <p className="text-xs text-gold/60">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs text-gold/50 hover:text-red-400 transition-colors uppercase tracking-widest"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-8 border-b border-gold/10">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'orders', label: 'Orders', icon: Package },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest border-b-2 transition-all ${
                  activeTab === id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-gold/60 hover:text-gold'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="lux-panel p-6 md:p-8">
              <h2 className="text-xs uppercase tracking-widest text-gold/60 mb-6 pb-4 border-b border-gold/10">
                Personal Information
              </h2>
              <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
                <div>
                  <label className="text-xs text-gold/60 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="input-dark"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-xs text-gold/60 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input-dark opacity-50 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gold/40 mt-1">Email cannot be changed here.</p>
                </div>
                <div>
                  <label className="text-xs text-gold/60 block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input-dark"
                    placeholder="+260 97..."
                  />
                </div>
                <div>
                  <label className="text-xs text-gold/60 block mb-1.5">Delivery Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="input-dark"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="text-xs text-gold/60 block mb-1.5">City / Town</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="input-dark"
                    placeholder="Lusaka"
                  />
                </div>

                {saveError && (
                  <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/20 px-3 py-2">
                    {saveError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {saved ? <Check size={13} /> : <Save size={13} />}
                  {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="lux-panel">
              <div className="px-6 py-4 border-b border-gold/10">
                <h2 className="text-xs uppercase tracking-widest text-gold/60">
                  Order History
                </h2>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-display text-2xl italic font-light text-gold/40 mb-3">
                    No orders yet
                  </p>
                  <Link to="/products" className="btn-outline text-xs">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gold/10">
                        {['Order', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-gold/50 font-normal"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/10">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4 text-xs text-gold/60 font-mono">
                            {order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 text-xs text-gold/60">
                            {new Date(order.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-xs text-gold/70 max-w-[180px] truncate">
                            {summarizeItems(order.items)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gold font-medium">
                            {formatPrice(order.total)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-[10px] uppercase tracking-wide border px-2 py-0.5 ${
                                STATUS_COLORS[order.status] ||
                                'bg-white/5 text-white/30 border-white/10'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
