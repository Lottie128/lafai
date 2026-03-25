import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../context/StoreContext.jsx'
import { Lock, Eye, EyeOff } from 'lucide-react'

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function AdminLogin() {
  const { settings, updateSettings } = useStore()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [settingUp, setSettingUp] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('lafai_admin_authed') === 'true') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [])

  const noPasswordSet = !settings.adminPasswordHash

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (noPasswordSet && !settingUp) {
        // First time — set up password
        setSettingUp(true)
        setLoading(false)
        return
      }

      if (settingUp) {
        if (!newPassword || newPassword.length < 6) {
          setError('Password must be at least 6 characters.')
          setLoading(false)
          return
        }
        const hash = await sha256(newPassword)
        updateSettings({ ...settings, adminPasswordHash: hash })
        localStorage.setItem('lafai_admin_authed', 'true')
        navigate('/admin/dashboard', { replace: true })
        return
      }

      // Normal login
      const hash = await sha256(password)
      if (hash === settings.adminPasswordHash) {
        localStorage.setItem('lafai_admin_authed', 'true')
        navigate('/admin/dashboard', { replace: true })
      } else {
        setError('Incorrect password.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 40%, #120c14 0%, #080508 100%)',
          }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-10 blur-[120px]"
          style={{ background: '#c4727a' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-light italic text-[#f5f0f2] mb-1">
            La'Fai
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-[#f5f0f2]/30">
            Admin Access
          </p>
        </div>

        <div className="bg-card border border-white/5 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Lock size={14} className="text-accent" />
            </div>
            <div>
              <p className="text-sm text-[#f5f0f2]/80">
                {settingUp ? 'Set Admin Password' : noPasswordSet ? 'First Time Setup' : 'Sign In'}
              </p>
              <p className="text-xs text-[#f5f0f2]/30">
                {settingUp
                  ? 'Choose a strong password.'
                  : noPasswordSet
                  ? 'No password set. Click below to create one.'
                  : 'Enter your admin password.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {!noPasswordSet && !settingUp && (
              <div>
                <label className="text-xs text-[#f5f0f2]/40 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark pr-10"
                    placeholder="••••••••"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f0f2]/30 hover:text-[#f5f0f2]/60"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {settingUp && (
              <div>
                <label className="text-xs text-[#f5f0f2]/40 block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-dark pr-10"
                    placeholder="Min. 6 characters"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f0f2]/30 hover:text-[#f5f0f2]/60"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/20 px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <Lock size={13} />
              {loading
                ? 'Please wait…'
                : settingUp
                ? 'Set Password & Enter'
                : noPasswordSet
                ? 'Setup Admin Access'
                : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#f5f0f2]/20 mt-6">
          La'Fai Admin Panel
        </p>
      </div>
    </div>
  )
}
