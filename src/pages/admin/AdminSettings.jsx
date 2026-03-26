import { useState, useEffect } from 'react'
import { useStore } from '../../context/StoreContext.jsx'
import { supabase } from '../../lib/supabase.js'
import { Save, Eye, EyeOff, Check, Github, RefreshCw } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div className="bg-[#0f0d10] border border-white/5 p-6 mb-6">
      <h3 className="text-xs uppercase tracking-widest text-[#f5f0f2]/40 mb-5 pb-3 border-b border-white/5">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-[#f5f0f2]/50 block mb-1">{label}</label>
      {hint && <p className="text-[10px] text-[#f5f0f2]/20 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
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

// Payment gateway config: keys stored in Supabase site_settings
const GATEWAY_FIELDS = {
  airtel: [
    { key: 'airtel_client_id', label: 'Client ID' },
    { key: 'airtel_client_secret', label: 'Client Secret' },
    { key: 'airtel_api_key', label: 'API Key' },
  ],
  mtn: [
    { key: 'mtn_api_key', label: 'API Key' },
    { key: 'mtn_subscription_key', label: 'Subscription Key' },
    { key: 'mtn_user_id', label: 'User ID' },
  ],
  zamtel: [
    { key: 'zamtel_api_key', label: 'API Key' },
    { key: 'zamtel_merchant_id', label: 'Merchant ID' },
  ],
  paypal: [
    { key: 'paypal_client_id', label: 'Client ID' },
    { key: 'paypal_client_secret', label: 'Client Secret' },
  ],
}

const GATEWAY_LABELS = {
  airtel: 'Airtel Money',
  mtn: 'MTN Mobile Money',
  zamtel: 'Zamtel Kwacha Pay',
  paypal: 'PayPal',
}

const GATEWAY_COLORS = {
  airtel: 'text-red-400',
  mtn: 'text-yellow-400',
  zamtel: 'text-green-400',
  paypal: 'text-blue-400',
}

export default function AdminSettings() {
  const { settings, updateSettings } = useStore()
  const [form, setForm] = useState(JSON.parse(JSON.stringify(settings)))
  const [saved, setSaved] = useState(false)

  // Supabase payment keys
  const [activeGateway, setActiveGateway] = useState('airtel')
  const [gatewayKeys, setGatewayKeys] = useState({})
  const [keysLoading, setKeysLoading] = useState(true)
  const [keysError, setKeysError] = useState('')
  const [savingKey, setSavingKey] = useState('')
  const [keySaved, setKeySaved] = useState('')
  const [showKeys, setShowKeys] = useState({})

  // GitHub state
  const [ghToken, setGhToken] = useState(localStorage.getItem('lafai_gh_token') || '')
  const [ghOwner, setGhOwner] = useState(localStorage.getItem('lafai_gh_owner') || '')
  const [ghRepo, setGhRepo] = useState(localStorage.getItem('lafai_gh_repo') || '')
  const [ghSaved, setGhSaved] = useState(false)

  const update = (path, value) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleGhSave = () => {
    localStorage.setItem('lafai_gh_token', ghToken)
    localStorage.setItem('lafai_gh_owner', ghOwner)
    localStorage.setItem('lafai_gh_repo', ghRepo)
    setGhSaved(true)
    setTimeout(() => setGhSaved(false), 2500)
  }

  useEffect(() => {
    const loadKeys = async () => {
      setKeysLoading(true)
      setKeysError('')
      try {
        const data = await adminQuery('get_settings')
        const map = {}
        ;(data || []).forEach((row) => { map[row.key] = row.value || '' })
        setGatewayKeys(map)
      } catch (err) {
        setKeysError(err.message)
      } finally {
        setKeysLoading(false)
      }
    }
    loadKeys()
  }, [])

  const handleSaveKey = async (key) => {
    setSavingKey(key)
    setKeysError('')
    try {
      await adminQuery('update_setting', { key, value: gatewayKeys[key] || '' })
      setKeySaved(key)
      setTimeout(() => setKeySaved(''), 2000)
    } catch (err) {
      setKeysError(err.message)
    } finally {
      setSavingKey('')
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic font-light text-[#f5f0f2] mb-1">Settings</h1>
          <p className="text-xs text-[#f5f0f2]/30">Store configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-[#c4727a] hover:bg-[#b5636b] text-white text-xs px-4 py-2 flex items-center gap-2 transition-colors"
        >
          {saved ? <Check size={13} /> : <Save size={13} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Store Info */}
      <Section title="Store Information">
        <Field label="Store Name">
          <input type="text" value={form.storeName}
            onChange={(e) => update('storeName', e.target.value)} className="input-dark" />
        </Field>
        <Field label="Tagline">
          <input type="text" value={form.tagline}
            onChange={(e) => update('tagline', e.target.value)} className="input-dark" />
        </Field>
        <Field label="Contact Email">
          <input type="email" value={form.contactEmail}
            onChange={(e) => update('contactEmail', e.target.value)} className="input-dark" />
        </Field>
      </Section>

      {/* Currency */}
      <Section title="Currency & Pricing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Active Currency">
            <select
              value={form.currency.code}
              onChange={(e) => {
                const selected = form.currencies?.find((c) => c.code === e.target.value)
                if (selected) update('currency', selected)
              }}
              className="input-dark"
            >
              {(form.currencies || []).map((c) => (
                <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
              ))}
            </select>
          </Field>
          <Field label="Currency Symbol">
            <input type="text" value={form.currency.symbol}
              onChange={(e) => update('currency', { ...form.currency, symbol: e.target.value })}
              className="input-dark" />
          </Field>
          <Field label="Shipping Cost">
            <input type="number" value={form.shipping}
              onChange={(e) => update('shipping', parseFloat(e.target.value) || 0)}
              className="input-dark" step="0.01" />
          </Field>
          <Field label="Tax Rate (0.16 = 16%)">
            <input type="number" value={form.taxRate}
              onChange={(e) => update('taxRate', parseFloat(e.target.value) || 0)}
              className="input-dark" step="0.01" min="0" max="1" />
          </Field>
        </div>
      </Section>

      {/* Payment gateways — keys from Supabase */}
      <Section title="Payment Gateways">
        <p className="text-xs text-[#f5f0f2]/30 mb-5 leading-relaxed">
          API credentials are stored securely in Supabase and read only by Vercel serverless functions.
          Enable/disable payment methods below, then enter API keys per gateway.
        </p>

        {/* Enable toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Object.entries(GATEWAY_LABELS).map(([key, label]) => (
            <label key={key} className={`flex items-center gap-2 cursor-pointer p-3 border transition-all ${
              form.payments?.[key]?.enabled ? 'border-[#c4727a]/40 bg-[#c4727a]/5' : 'border-white/10'
            }`}>
              <input
                type="checkbox"
                checked={form.payments?.[key]?.enabled || false}
                onChange={(e) => update(`payments.${key}.enabled`, e.target.checked)}
                className="accent-[#c4727a]"
              />
              <span className={`text-xs font-medium ${GATEWAY_COLORS[key]}`}>{label}</span>
            </label>
          ))}
        </div>

        {/* Gateway tabs */}
        <div className="flex gap-0 mb-5 border-b border-white/5">
          {Object.entries(GATEWAY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveGateway(key)}
              className={`px-4 py-2.5 text-xs uppercase tracking-widest border-b-2 transition-all ${
                activeGateway === key
                  ? `border-[#c4727a] ${GATEWAY_COLORS[key]}`
                  : 'border-transparent text-[#f5f0f2]/30 hover:text-[#f5f0f2]/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {keysError && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/20 px-3 py-2 mb-4">
            {keysError}
          </p>
        )}

        {keysLoading ? (
          <div className="flex items-center gap-2 text-xs text-[#f5f0f2]/30 py-4">
            <RefreshCw size={12} className="animate-spin" />
            Loading keys from Supabase…
          </div>
        ) : (
          <div className="space-y-4">
            {(GATEWAY_FIELDS[activeGateway] || []).map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-[#f5f0f2]/50 block mb-1.5">{label}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys[key] ? 'text' : 'password'}
                      value={gatewayKeys[key] || ''}
                      onChange={(e) => setGatewayKeys((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="input-dark pr-10 text-xs font-mono"
                      placeholder="Not set"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f0f2]/30 hover:text-[#f5f0f2]/60"
                    >
                      {showKeys[key] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveKey(key)}
                    disabled={savingKey === key}
                    className="bg-[#c4727a]/20 hover:bg-[#c4727a]/30 border border-[#c4727a]/30 text-[#c4727a] text-xs px-3 py-2 transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                  >
                    {keySaved === key ? <Check size={11} /> : <Save size={11} />}
                    {savingKey === key ? 'Saving…' : keySaved === key ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Social links */}
      <Section title="Social Links">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Instagram URL">
            <input type="url" value={form.socialLinks?.instagram || ''}
              onChange={(e) => update('socialLinks.instagram', e.target.value)}
              className="input-dark" placeholder="https://instagram.com/..." />
          </Field>
          <Field label="Facebook URL">
            <input type="url" value={form.socialLinks?.facebook || ''}
              onChange={(e) => update('socialLinks.facebook', e.target.value)}
              className="input-dark" placeholder="https://facebook.com/..." />
          </Field>
          <Field label="WhatsApp Number">
            <input type="text" value={form.socialLinks?.whatsapp || ''}
              onChange={(e) => update('socialLinks.whatsapp', e.target.value)}
              className="input-dark" placeholder="+26097..." />
          </Field>
        </div>
      </Section>

      {/* GitHub Integration */}
      <Section title="GitHub Integration">
        <p className="text-xs text-[#f5f0f2]/30 mb-5 leading-relaxed">
          GitHub credentials for pushing JSON data files from the admin panel.
          Requires a Personal Access Token with <code className="text-[#c4727a]/60">repo</code> write scope.
          Stored in localStorage only.
        </p>
        <div className="space-y-4">
          <Field label="GitHub Username">
            <input type="text" value={ghOwner} onChange={(e) => setGhOwner(e.target.value)}
              className="input-dark" placeholder="yourusername" />
          </Field>
          <Field label="Repository Name">
            <input type="text" value={ghRepo} onChange={(e) => setGhRepo(e.target.value)}
              className="input-dark" placeholder="lafai" />
          </Field>
          <Field label="Personal Access Token">
            <input type="password" value={ghToken} onChange={(e) => setGhToken(e.target.value)}
              className="input-dark" placeholder="ghp_..." />
          </Field>
        </div>
        <button onClick={handleGhSave}
          className="bg-[#c9a96e]/20 hover:bg-[#c9a96e]/30 border border-[#c9a96e]/30 text-[#c9a96e] text-xs px-4 py-2 flex items-center gap-2 mt-4 transition-colors">
          <Github size={13} />
          {ghSaved ? 'Saved!' : 'Save GitHub Credentials'}
        </button>
      </Section>
    </div>
  )
}
