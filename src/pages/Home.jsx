import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import Hero from '../components/Hero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { ArrowRight, Lock, Package, Star } from 'lucide-react'

const CATEGORIES = [
  { name: 'Lingerie', emoji: '✦', desc: 'Sheer, lace, and structured designs' },
  { name: 'Luxurious Robes', emoji: '✦', desc: 'Silk, satin, and velvet layers' },
  { name: 'Cards', emoji: '✦', desc: 'Gift-ready love notes' },
  { name: 'Masquerade Masks', emoji: '✦', desc: 'Velvet, lace, and statement masks' },
  { name: 'Toys', emoji: '✦', desc: 'Premium adult wellness products' },
  { name: 'Leggings', emoji: '✦', desc: 'Second-skin silhouettes' },
  { name: 'Gloves', emoji: '✦', desc: 'Elegant evening accents' },
  { name: 'Nighties', emoji: '✦', desc: 'Soft, sensual sleepwear' },
]

export default function Home() {
  const { products, content } = useStore()

  const featured = products.filter((p) => p.featured).slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />

        {/* Features bar */}
        <div className="bg-surface border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Package, label: 'Discreet Packaging', desc: 'Plain, unmarked boxes' },
              { icon: Lock, label: 'Secure Checkout', desc: 'Encrypted & private' },
              { icon: Star, label: 'Premium Quality', desc: 'Curated with care' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#f5f0f2]/70 font-medium">
                    {label}
                  </p>
                  <p className="text-xs text-[#f5f0f2]/30">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured products */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold/60 mb-3">
                Featured
              </p>
              <h2 className="section-heading gold-sheen">
                {content.featured?.heading || 'The Edit'}
              </h2>
              <p className="text-gold/60 text-sm mt-3">
                {content.featured?.subheading}
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-[#f5f0f2]/50 hover:text-accent transition-colors group"
            >
              View All
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link to="/products" className="btn-outline">
              View All Products
            </Link>
          </div>
        </section>

        {/* Category grid */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[#0a070a]" />
            <div
              className="absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(circle at 20% 20%, rgba(201, 169, 110, 0.08) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(196, 114, 122, 0.08) 0%, transparent 50%)',
              }}
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-gold/60 mb-3">
                Collections
              </p>
              <h2 className="section-heading gold-sheen">
                {content.categories?.heading || 'Shop by Category'}
              </h2>
              <div className="lux-line mt-5" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/products?category=${cat.name}`}
                  className="group lux-card p-6 text-center"
                >
                  <div className="relative z-10">
                    <div className="text-gold/70 text-lg mb-4 font-display italic">
                      {cat.emoji}
                    </div>
                    <h3 className="font-display text-lg font-light italic text-[#f5f0f2] group-hover:text-gold transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-[#f5f0f2]/40 mt-2 leading-snug">
                      {cat.desc}
                    </p>
                    <div className="mt-4 h-px w-8 mx-auto bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Editorial banner */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 80% at 70% 50%, #1a0a10 0%, #080508 70%)',
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1/2 opacity-5"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1617922001778-e87c16a8d9a4?auto=format&fit=crop&w=900&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-gold/50 mb-6">
                Our Promise
              </p>
              <h2
                className="font-display font-light italic gold-sheen mb-6"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1.1' }}
              >
                Every body deserves to feel exquisite.
              </h2>
              <p className="text-gold/60 text-base leading-relaxed mb-8 max-w-md">
                We curate with intention. Every piece selected for how it feels against
                skin, how it makes you feel within.
              </p>
              <Link to="/about" className="btn-outline">
                Read Our Story
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
