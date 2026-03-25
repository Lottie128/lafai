import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { CheckCircle, Package, Mail } from 'lucide-react'

export default function OrderSuccess() {
  const { content, formatPrice } = useStore()
  const { checkout } = content

  let lastOrder = null
  try {
    const stored = localStorage.getItem('lafai_last_order')
    if (stored) lastOrder = JSON.parse(stored)
  } catch {}

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <CheckCircle size={36} className="text-accent" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl italic font-light text-[#f5f0f2] mb-4">
            {checkout?.successHeading || 'Your order is confirmed.'}
          </h1>

          {lastOrder && (
            <p className="text-xs uppercase tracking-widest text-gold/50 mb-6">
              Order {lastOrder.id}
            </p>
          )}

          <p className="text-[#f5f0f2]/50 leading-relaxed mb-10">
            {checkout?.successBody ||
              "Thank you for choosing La'Fai. Your order will be packaged discreetly and dispatched within 1–2 business days."}
          </p>

          {/* Order details */}
          {lastOrder && (
            <div className="bg-card border border-white/5 p-6 mb-10 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#f5f0f2]/30 text-xs uppercase tracking-wide mb-1">
                    Customer
                  </p>
                  <p className="text-[#f5f0f2]/70">{lastOrder.customer?.name}</p>
                </div>
                <div>
                  <p className="text-[#f5f0f2]/30 text-xs uppercase tracking-wide mb-1">
                    Total
                  </p>
                  <p className="text-accent font-medium">
                    {formatPrice(lastOrder.total)}
                  </p>
                </div>
                <div>
                  <p className="text-[#f5f0f2]/30 text-xs uppercase tracking-wide mb-1">
                    Payment
                  </p>
                  <p className="text-[#f5f0f2]/70 capitalize">
                    {lastOrder.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-[#f5f0f2]/30 text-xs uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <span className="inline-block text-xs uppercase tracking-wide bg-accent/10 text-accent border border-accent/20 px-2 py-0.5">
                    {lastOrder.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Trust message */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-xs text-[#f5f0f2]/30">
            <div className="flex items-center gap-2">
              <Package size={13} className="text-accent/40" />
              Plain, discreet packaging
            </div>
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-accent/40" />
              Confirmation sent to your email
            </div>
          </div>

          <Link
            to="/products"
            className="btn-outline"
          >
            {checkout?.successCta || 'Continue Shopping'}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
