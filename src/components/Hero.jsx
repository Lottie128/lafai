import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  const { content, settings } = useStore()
  const { hero } = content

  const headingLines = hero.heading.split('\n')

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, #1a0f1e 0%, #0d0810 50%, #080508 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(201,169,110,0.25) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(201,169,110,0.18) 0%, transparent 45%)',
          }}
        />
        {/* Ambient blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: '#c4727a' }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-[100px] pointer-events-none"
          style={{ background: '#c9a96e' }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-15 blur-[90px] pointer-events-none"
          style={{ background: '#9d4f57' }}
        />
        {/* Film grain */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <p className="text-xs uppercase tracking-[0.45em] text-gold/80 mb-10 font-light">
          {settings.storeName} — {settings.tagline}
        </p>

        {/* Headline */}
        <h1 className="font-display font-light italic leading-none mb-8">
          {headingLines.map((line, i) => (
            <span
              key={i}
              className="block gold-sheen"
              style={{
                fontSize: 'clamp(4rem, 12vw, 9rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.02em',
              }}
            >
              {line}
            </span>
          ))}
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/80" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent via-gold/60 to-transparent" />
        </div>

        {/* Subheading */}
        <p
          className="text-gold/90 text-base md:text-lg font-light max-w-xl mx-auto mb-12 leading-relaxed"
          style={{ textShadow: '0 4px 24px rgba(201, 169, 110, 0.35)' }}
        >
          {hero.subheading}
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/products"
            className="btn-primary flex items-center gap-3 group"
          >
            {hero.cta}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link to="/about" className="btn-outline">
            Our Story
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-base to-transparent z-10 pointer-events-none" />

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-30">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#f5f0f2]">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-[#f5f0f2] to-transparent animate-pulse" />
      </div>
    </section>
  )
}
