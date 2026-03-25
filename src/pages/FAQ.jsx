import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-6 text-left group"
      >
        <span
          className={`font-display text-xl italic font-light transition-colors ${
            open ? 'text-accent' : 'text-[#f5f0f2]/80 group-hover:text-[#f5f0f2]'
          }`}
        >
          {item.q}
        </span>
        <span className="flex-shrink-0 mt-1 text-[#f5f0f2]/30">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && (
        <div className="pb-6">
          <p className="text-[#f5f0f2]/50 text-sm leading-relaxed pl-0">
            {item.a}
          </p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const { content } = useStore()
  const faqItems = content.faq || []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Header */}
        <div className="bg-surface border-b border-white/5 py-20 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/50 mb-4">
            Support
          </p>
          <h1 className="section-heading mb-4">Frequently Asked Questions</h1>
          <p className="text-[#f5f0f2]/30 text-sm">
            Questions? We have answers — and we're always discrete.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-16">
          {faqItems.length > 0 ? (
            <div>
              {faqItems.map((item, i) => (
                <FAQItem key={i} item={item} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-center text-[#f5f0f2]/30">
              No FAQ items yet.
            </p>
          )}

          {/* Still have questions */}
          <div className="mt-16 bg-card border border-white/5 p-8 text-center">
            <h3 className="font-display text-2xl italic font-light text-[#f5f0f2] mb-3">
              Still have questions?
            </h3>
            <p className="text-[#f5f0f2]/40 text-sm mb-6">
              Our support team responds within 24 hours.
            </p>
            <Link to="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
