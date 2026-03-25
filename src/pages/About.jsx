import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { Link } from 'react-router-dom'

export default function About() {
  const { content } = useStore()
  const { about } = content

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 80% at 30% 50%, #1a0f1e 0%, #080508 70%)',
              }}
            />
            <div
              className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-[100px]"
              style={{ background: '#c4727a' }}
            />
          </div>
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.4em] text-gold/50 mb-6">
              About
            </p>
            <h1
              className="font-display font-light italic text-[#f5f0f2] mb-6"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: '1.05' }}
            >
              {about?.heroHeading || 'Born from Desire.'}
            </h1>
            <p className="text-[#f5f0f2]/50 text-lg font-light leading-relaxed">
              {about?.heroSub}
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="max-w-3xl mx-auto px-6 py-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px bg-accent/20 flex-1" />
            <h2 className="font-display text-2xl italic font-light text-accent/70">
              {about?.storyHeading || 'Our Story'}
            </h2>
            <div className="h-px bg-accent/20 flex-1" />
          </div>
          <div className="space-y-6">
            {(about?.storyBody || '').split('\n\n').map((para, i) => (
              <p
                key={i}
                className="font-display text-xl italic font-light text-[#f5f0f2]/70 leading-relaxed"
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* Values */}
        {about?.values && (
          <section className="bg-surface py-24">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="section-heading text-center mb-16">
                {about?.valuesHeading || 'Our Values'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {about.values.map((val, i) => (
                  <div
                    key={i}
                    className="bg-card border border-white/5 p-8 hover:border-accent/20 transition-colors"
                  >
                    <div className="w-8 h-px bg-accent/50 mb-6" />
                    <h3 className="font-display text-2xl italic font-light text-[#f5f0f2] mb-4">
                      {val.title}
                    </h3>
                    <p className="text-[#f5f0f2]/50 text-sm leading-relaxed">
                      {val.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-24 text-center px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/50 mb-6">
            Discover
          </p>
          <h2 className="section-heading mb-6">Explore the collection.</h2>
          <Link to="/products" className="btn-primary">
            Shop Now
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
