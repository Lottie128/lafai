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
            <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
              <CheckCircle size={36} className="text-gold" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl italic font-light gold-sheen mb-4">
            {checkout?.successHeading || 'Your order is confirmed.'}
          </h1>

          {lastOrder && (
            <p className="text-xs uppercase tracking-widest text-gold/70 mb-6">
              Order {lastOrder.id}
            </p>
          )}

          <p className="text-gold/70 leading-relaxed mb-10">
            {checkout?.successBody ||
              "Thank you for choosing La'Fai. Your order will be packaged discreetly and dispatched within 1–2 business days."}
          </p>

          {/* Order details */}
          {lastOrder && (
            <div className="lux-panel p-6 mb-10 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gold/50 text-xs uppercase tracking-wide mb-1">
                    Customer
                  </p>
                  <p className="text-gold/80">{lastOrder.customer?.name}</p>
                </div>
                <div>
                  <p className="text-gold/50 text-xs uppercase tracking-wide mb-1">
                    Total
                  </p>
                  <p className="text-gold font-medium">
                    {formatPrice(lastOrder.total)}
                  </p>
                </div>
                <div>
                  <p className="text-gold/50 text-xs uppercase tracking-wide mb-1">
                    Payment
                  </p>
                  <p className="text-gold/80 capitalize">
                    {lastOrder.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-gold/50 text-xs uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <span className="inline-block text-xs uppercase tracking-wide bg-gold/10 text-gold border border-gold/30 px-2 py-0.5">
                    {lastOrder.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Trust message */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-xs text-gold/60">
            <div className="flex items-center gap-2">
              <Package size={13} className="text-gold/60" />
              Plain, discreet packaging
            </div>
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-gold/60" />
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
