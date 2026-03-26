import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, X, Search, User, LogOut, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import CartDrawer from './CartDrawer.jsx'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  const { count } = useCart()
  const { settings, content } = useStore()
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setAccountOpen(false)
  }, [location])

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinks = content.nav?.links || [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  const transparent = isHome && !scrolled

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const userInitial = (profile?.name || user?.email || 'U')[0].toUpperCase()

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          transparent
            ? 'bg-transparent'
            : 'bg-surface/95 backdrop-blur-md border-b border-gold/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-2xl font-light italic text-[#f5f0f2] tracking-wide hover:text-gold transition-colors"
          >
            {settings.storeName}
          </Link>

          {/* Center links — desktop */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${
                  location.pathname === link.href
                    ? 'text-gold'
                    : 'text-gold/70 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gold/70 hover:text-gold transition-colors p-1"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Auth — desktop */}
            <div className="hidden md:block relative" ref={accountRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 text-gold/70 hover:text-gold transition-colors p-1"
                    aria-label="Account menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-gold">{userInitial}</span>
                    </div>
                    <ChevronDown size={12} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-[#0f0d10] border border-gold/20 shadow-xl">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-xs text-gold/80 truncate">{profile?.name || 'Account'}</p>
                        <p className="text-[10px] text-gold/50 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/account"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-gold/70 hover:text-gold hover:bg-white/5 transition-colors"
                      >
                        <User size={12} />
                        My Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gold/50 hover:text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut size={12} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                className="text-xs uppercase tracking-widest text-gold/70 hover:text-gold transition-colors p-1"
              >
                Login
              </Link>
            )}
          </div>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-gold/70 hover:text-gold transition-colors p-1"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-[#1a1208] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-gold/70 hover:text-gold transition-colors p-1"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gold/10 bg-surface/95 px-6 py-4">
            <div className="max-w-xl mx-auto relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50"
              />
              <input
                type="text"
                autoFocus
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`
                  }
                }}
                className="input-dark pl-9 text-sm"
              />
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-surface/98 border-t border-gold/10">
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'text-accent'
                      : 'text-[#f5f0f2]/70 hover:text-[#f5f0f2]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/5">
                {user ? (
                  <>
                    <Link
                      to="/account"
                      className="flex items-center gap-2 text-sm text-[#f5f0f2]/70 hover:text-[#f5f0f2] transition-colors mb-3"
                    >
                      <User size={14} />
                      My Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-sm text-gold/50 hover:text-red-400 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm text-[#c4727a] hover:text-[#d48389] transition-colors uppercase tracking-widest"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
