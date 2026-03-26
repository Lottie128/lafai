import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(next, { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your credentials.')
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
            Welcome back.
          </p>
          <p className="text-sm text-gold/60 leading-relaxed max-w-xs">
            Sign in to your account to view your orders, manage your profile, and enjoy a seamless shopping experience.
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
              Sign In
            </h1>
            <p className="text-xs text-gold/60 uppercase tracking-widest">
              Access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gold/60 block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark"
                placeholder="you@example.com"
                autoFocus
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
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              <LogIn size={14} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gold/50 mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-gold hover:text-[#f1d89a] transition-colors"
            >
              Create one
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
