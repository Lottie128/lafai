import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { Mail, Clock, Shield } from 'lucide-react'

export default function Contact() {
  const { content, settings } = useStore()
  const { contact } = content

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, this would send to an email service
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Header */}
        <div className="bg-surface border-b border-white/5 py-20 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/50 mb-4">
            Support
          </p>
          <h1 className="section-heading mb-4">
            {contact?.heading || 'Get in Touch'}
          </h1>
          <p className="text-[#f5f0f2]/40 max-w-md mx-auto text-sm leading-relaxed">
            {contact?.subheading}
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Info */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Mail size={15} className="text-accent/60" />
                <h3 className="text-xs uppercase tracking-widest text-[#f5f0f2]/50">
                  Email
                </h3>
              </div>
              <a
                href={`mailto:${contact?.email || settings.contactEmail}`}
                className="text-[#f5f0f2]/70 hover:text-accent transition-colors text-sm"
              >
                {contact?.email || settings.contactEmail}
              </a>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Clock size={15} className="text-accent/60" />
                <h3 className="text-xs uppercase tracking-widest text-[#f5f0f2]/50">
                  Hours
                </h3>
              </div>
              <p className="text-[#f5f0f2]/50 text-sm">{contact?.hours}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Shield size={15} className="text-accent/60" />
                <h3 className="text-xs uppercase tracking-widest text-[#f5f0f2]/50">
                  Privacy
                </h3>
              </div>
              <p className="text-[#f5f0f2]/40 text-sm leading-relaxed">
                {contact?.note}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="bg-card border border-white/5 p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                  <Mail size={20} className="text-accent" />
                </div>
                <h3 className="font-display text-2xl italic font-light text-[#f5f0f2] mb-3">
                  Message received.
                </h3>
                <p className="text-[#f5f0f2]/40 text-sm">
                  We'll respond within 24 hours with complete discretion.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-[#f5f0f2]/40 block mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-dark"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#f5f0f2]/40 block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="input-dark"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="input-dark"
                    placeholder="Order enquiry, returns, etc."
                  />
                </div>
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    className="input-dark resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
                <p className="text-xs text-[#f5f0f2]/25 text-center">
                  All enquiries handled with complete discretion.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
