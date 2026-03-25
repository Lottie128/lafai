import { useState } from 'react'
import { useStore } from '../../context/StoreContext.jsx'
import { Save, Eye, EyeOff, Check, AlertCircle, Github } from 'lucide-react'

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function Section({ title, children }) {
  return (
    <div className="bg-card border border-white/5 p-6 mb-6">
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

export default function AdminSettings() {
  const { settings, updateSettings } = useStore()
  const [form, setForm] = useState(JSON.parse(JSON.stringify(settings)))
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

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

  const handlePasswordChange = async () => {
    setPwError('')
    setPwSuccess(false)
    if (!newPassword || newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }
    const hash = await sha256(newPassword)
    const updated = { ...form, adminPasswordHash: hash }
    setForm(updated)
    updateSettings(updated)
    setNewPassword('')
    setConfirmPassword('')
    setPwSuccess(true)
    setTimeout(() => setPwSuccess(false), 3000)
  }

  const handleGhSave = () => {
    localStorage.setItem('lafai_gh_token', ghToken)
    localStorage.setItem('lafai_gh_owner', ghOwner)
    localStorage.setItem('lafai_gh_repo', ghRepo)
    setGhSaved(true)
    setTimeout(() => setGhSaved(false), 2500)
  }

  const currency = form.currency

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic font-light text-[#f5f0f2] mb-1">
            Settings
          </h1>
          <p className="text-xs text-[#f5f0f2]/30">Store configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary text-xs flex items-center gap-2"
        >
          {saved ? <Check size={13} /> : <Save size={13} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Store Info */}
      <Section title="Store Information">
        <Field label="Store Name">
          <input
            type="text"
            value={form.storeName}
            onChange={(e) => update('storeName', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Tagline">
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => update('tagline', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Contact Email">
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => update('contactEmail', e.target.value)}
            className="input-dark"
          />
        </Field>
      </Section>

      {/* Currency */}
      <Section title="Currency">
        <Field label="Active Currency">
          <select
            value={form.currency.code}
            onChange={(e) => {
              const selected = form.currencies.find((c) => c.code === e.target.value)
              if (selected) update('currency', selected)
            }}
            className="input-dark bg-surface"
          >
            {form.currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Current Symbol">
          <input
            type="text"
            value={form.currency.symbol}
            onChange={(e) =>
              update('currency', { ...form.currency, symbol: e.target.value })
            }
            className="input-dark w-20"
          />
        </Field>
      </Section>

      {/* Pricing */}
      <Section title="Pricing & Tax">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Shipping Cost">
            <input
              type="number"
              value={form.shipping}
              onChange={(e) => update('shipping', parseFloat(e.target.value) || 0)}
              className="input-dark"
              step="0.01"
            />
          </Field>
          <Field label="Tax Rate (e.g. 0.16 = 16%)">
            <input
              type="number"
              value={form.taxRate}
              onChange={(e) => update('taxRate', parseFloat(e.target.value) || 0)}
              className="input-dark"
              step="0.01"
              min="0"
              max="1"
            />
          </Field>
        </div>
      </Section>

      {/* Payments */}
      <Section title="Payment Gateways">
        <p className="text-xs text-[#f5f0f2]/30 mb-5">
          Enable payment methods and enter credentials. For production, also add keys as Vercel environment variables.
        </p>

        {/* PayPal */}
        <div className="border border-white/5 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#f5f0f2]/70 font-medium">PayPal</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.payments.paypal.enabled}
                onChange={(e) => update('payments.paypal.enabled', e.target.checked)}
                className="accent-[#c4727a]"
              />
              <span className="text-xs text-[#f5f0f2]/50">Enable</span>
            </label>
          </div>
          {form.payments.paypal.enabled && (
            <Field label="PayPal Client ID">
              <input
                type="text"
                value={form.payments.paypal.clientId}
                onChange={(e) => update('payments.paypal.clientId', e.target.value)}
                className="input-dark text-xs"
                placeholder="AaBb..."
              />
            </Field>
          )}
        </div>

        {/* Airtel */}
        <div className="border border-white/5 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#f5f0f2]/70 font-medium">Airtel Money</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.payments.airtel.enabled}
                onChange={(e) => update('payments.airtel.enabled', e.target.checked)}
                className="accent-[#c4727a]"
              />
              <span className="text-xs text-[#f5f0f2]/50">Enable</span>
            </label>
          </div>
          {form.payments.airtel.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="API Key">
                <input
                  type="text"
                  value={form.payments.airtel.apiKey}
                  onChange={(e) => update('payments.airtel.apiKey', e.target.value)}
                  className="input-dark text-xs"
                />
              </Field>
              <Field label="Merchant ID">
                <input
                  type="text"
                  value={form.payments.airtel.merchantId}
                  onChange={(e) => update('payments.airtel.merchantId', e.target.value)}
                  className="input-dark text-xs"
                />
              </Field>
            </div>
          )}
        </div>

        {/* MTN */}
        <div className="border border-white/5 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#f5f0f2]/70 font-medium">MTN Mobile Money</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.payments.mtn.enabled}
                onChange={(e) => update('payments.mtn.enabled', e.target.checked)}
                className="accent-[#c4727a]"
              />
              <span className="text-xs text-[#f5f0f2]/50">Enable</span>
            </label>
          </div>
          {form.payments.mtn.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="API Key">
                <input
                  type="text"
                  value={form.payments.mtn.apiKey}
                  onChange={(e) => update('payments.mtn.apiKey', e.target.value)}
                  className="input-dark text-xs"
                />
              </Field>
              <Field label="Subscription Key">
                <input
                  type="text"
                  value={form.payments.mtn.subscriptionKey}
                  onChange={(e) => update('payments.mtn.subscriptionKey', e.target.value)}
                  className="input-dark text-xs"
                />
              </Field>
              <Field label="Environment">
                <select
                  value={form.payments.mtn.targetEnvironment}
                  onChange={(e) => update('payments.mtn.targetEnvironment', e.target.value)}
                  className="input-dark bg-surface text-xs"
                >
                  <option value="sandbox">Sandbox</option>
                  <option value="production">Production</option>
                </select>
              </Field>
            </div>
          )}
        </div>

        {/* Zamtel */}
        <div className="border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#f5f0f2]/70 font-medium">Zamtel Kwacha Pay</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.payments.zamtel.enabled}
                onChange={(e) => update('payments.zamtel.enabled', e.target.checked)}
                className="accent-[#c4727a]"
              />
              <span className="text-xs text-[#f5f0f2]/50">Enable</span>
            </label>
          </div>
          {form.payments.zamtel.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="API Key">
                <input
                  type="text"
                  value={form.payments.zamtel.apiKey}
                  onChange={(e) => update('payments.zamtel.apiKey', e.target.value)}
                  className="input-dark text-xs"
                />
              </Field>
              <Field label="Merchant Code">
                <input
                  type="text"
                  value={form.payments.zamtel.merchantCode}
                  onChange={(e) => update('payments.zamtel.merchantCode', e.target.value)}
                  className="input-dark text-xs"
                />
              </Field>
            </div>
          )}
        </div>
      </Section>

      {/* Social links */}
      <Section title="Social Links">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Instagram URL">
            <input
              type="url"
              value={form.socialLinks?.instagram || ''}
              onChange={(e) => update('socialLinks.instagram', e.target.value)}
              className="input-dark"
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="Facebook URL">
            <input
              type="url"
              value={form.socialLinks?.facebook || ''}
              onChange={(e) => update('socialLinks.facebook', e.target.value)}
              className="input-dark"
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="WhatsApp Number">
            <input
              type="text"
              value={form.socialLinks?.whatsapp || ''}
              onChange={(e) => update('socialLinks.whatsapp', e.target.value)}
              className="input-dark"
              placeholder="+26097..."
            />
          </Field>
        </div>
      </Section>

      {/* Admin password */}
      <Section title="Admin Password">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New Password">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-dark pr-10"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f0f2]/30"
              >
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm New Password">
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-dark"
              placeholder="Repeat password"
            />
          </Field>
        </div>
        {pwError && (
          <p className="text-xs text-red-400 flex items-center gap-1 mt-2">
            <AlertCircle size={12} /> {pwError}
          </p>
        )}
        {pwSuccess && (
          <p className="text-xs text-green-400 flex items-center gap-1 mt-2">
            <Check size={12} /> Password updated successfully.
          </p>
        )}
        <button onClick={handlePasswordChange} className="btn-outline text-xs mt-4">
          Update Password
        </button>
      </Section>

      {/* GitHub Integration */}
      <Section title="GitHub Integration">
        <p className="text-xs text-[#f5f0f2]/30 mb-5 leading-relaxed">
          Enter your GitHub credentials to enable pushing JSON data files directly from the admin panel.
          Requires a Personal Access Token with <code className="text-accent/60">repo</code> write scope.
          Credentials are stored in your browser's localStorage only.
        </p>
        <div className="space-y-4">
          <Field label="GitHub Username">
            <input
              type="text"
              value={ghOwner}
              onChange={(e) => setGhOwner(e.target.value)}
              className="input-dark"
              placeholder="yourusername"
            />
          </Field>
          <Field label="Repository Name">
            <input
              type="text"
              value={ghRepo}
              onChange={(e) => setGhRepo(e.target.value)}
              className="input-dark"
              placeholder="lafai"
            />
          </Field>
          <Field label="Personal Access Token">
            <input
              type="password"
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
              className="input-dark"
              placeholder="ghp_..."
            />
          </Field>
        </div>
        <button
          onClick={handleGhSave}
          className="btn-gold text-xs flex items-center gap-2 mt-4"
        >
          <Github size={13} />
          {ghSaved ? 'Saved!' : 'Save GitHub Credentials'}
        </button>
      </Section>
    </div>
  )
}
