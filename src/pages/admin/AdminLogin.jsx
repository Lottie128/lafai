import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (profile?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      }
    })
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut()
        setError('Not authorized as admin. Contact your administrator to grant admin access.')
        setLoading(false)
        return
      }

      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080508] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 60% at 50% 40%, #120c14 0%, #080508 100%)',
          }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-10 blur-[120px]"
          style={{ background: '#c4727a' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-light italic text-[#f5f0f2] mb-1">
            La'Fai
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-[#f5f0f2]/30">
            Admin Access
          </p>
        </div>

        <div className="bg-[#0f0d10] border border-white/5 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#c4727a]/10 border border-[#c4727a]/20 flex items-center justify-center">
              <Lock size={14} className="text-[#c4727a]" />
            </div>
            <div>
              <p className="text-sm text-[#f5f0f2]/80">Admin Sign In</p>
              <p className="text-xs text-[#f5f0f2]/30">Use your admin account credentials.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-[#f5f0f2]/40 block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark"
                placeholder="admin@example.com"
                autoFocus
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs text-[#f5f0f2]/40 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/20 px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <Lock size={13} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#f5f0f2]/20 mt-6">
          La'Fai Admin Panel &mdash; Authorised access only
        </p>
      </div>
    </div>
  )
}
