import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signUp(name, email, password)
      setSuccess(true)
      // Some Supabase projects require email confirmation — handle both cases
      setTimeout(() => navigate('/account', { replace: true }), 1500)
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080508] flex overflow-hidden">
      {/* Left column — brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative px-16 py-12">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 70% at 30% 60%, #1a0d1c 0%, #080508 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle 400px at 20% 50%, #c4727a22, transparent)',
          }}
        />
        <div className="relative z-10">
          <Link
            to="/"
            className="font-display text-3xl font-light italic text-[#f5f0f2] tracking-wide hover:text-gold transition-colors"
          >
            La'Fai
          </Link>
        </div>
        <div className="relative z-10">
          <p className="font-display text-5xl font-light italic gold-sheen leading-tight mb-4">
            Join us.
          </p>
          <p className="text-sm text-gold/60 leading-relaxed max-w-xs">
            Create an account to track your orders, save your details, and experience a more personal shopping journey.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-xs text-gold/40 uppercase tracking-widest">
            Discreet &middot; Elegant &middot; Yours
          </p>
        </div>
      </div>

      {/* Right column — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 60% 40%, #120c14 0%, #080508 100%)',
          }}
        />
        <div className="relative z-10 w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link
              to="/"
              className="font-display text-3xl font-light italic text-[#f5f0f2] hover:text-gold transition-colors"
            >
              La'Fai
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-light italic gold-sheen mb-2">
              Create Account
            </h1>
            <p className="text-xs text-gold/60 uppercase tracking-widest">
              Join La'Fai
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400 text-lg">✓</span>
              </div>
              <p className="text-sm text-gold/80 mb-1">Account created!</p>
              <p className="text-xs text-gold/50">Redirecting to your account…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gold/60 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-dark"
                  placeholder="Your name"
                  autoFocus
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="text-xs text-gold/60 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-xs text-gold/60 block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark pr-10"
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/50 hover:text-gold"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gold/60 block mb-1.5">Confirm Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input-dark"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
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
                <UserPlus size={14} />
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gold/50 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-gold hover:text-[#f1d89a] transition-colors"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-gold/10">
            <Link
              to="/"
              className="block text-center text-xs text-gold/40 hover:text-gold transition-colors uppercase tracking-widest"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
