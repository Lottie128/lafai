import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { Lock, Package, ChevronDown, ChevronUp } from 'lucide-react'

const PAYMENT_LABELS = {
  paypal: 'PayPal',
  airtel: 'Airtel Money',
  mtn: 'MTN Mobile Money',
  zamtel: 'Zamtel Kwacha Pay',
}

function OrderSummary({ items, formatPrice, settings, collapsed, setCollapsed }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = settings.shipping || 0
  const tax = subtotal * (settings.taxRate || 0)
  const total = subtotal + shipping + tax

  return (
    <div className="bg-card border border-white/5">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-6 py-4 md:hidden"
      >
        <span className="text-xs uppercase tracking-widest text-[#f5f0f2]/50">
          Order Summary
        </span>
        <div className="flex items-center gap-2">
          <span className="text-accent font-medium">{formatPrice(total)}</span>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </button>

      <div className={`${collapsed ? 'hidden md:block' : 'block'}`}>
        <div className="px-6 py-4 border-b border-white/5 hidden md:block">
          <h3 className="font-display text-lg italic font-light text-[#f5f0f2]">
            Order Summary
          </h3>
        </div>

        {/* Items */}
        <div className="divide-y divide-white/5">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 px-6 py-4">
              <div className="w-14 h-16 bg-surface overflow-hidden flex-shrink-0 relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.qty}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f5f0f2] leading-tight">{item.name}</p>
                {item.size && item.size !== 'One Size' && (
                  <p className="text-xs text-[#f5f0f2]/30 mt-0.5">{item.size}</p>
                )}
              </div>
              <span className="text-sm text-[#f5f0f2]/70">
                {formatPrice(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-t border-white/5 space-y-2">
          <div className="flex justify-between text-sm text-[#f5f0f2]/40">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#f5f0f2]/40">
            <span>Shipping</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#f5f0f2]/40">
            <span>Tax ({(settings.taxRate * 100).toFixed(0)}%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between font-medium text-[#f5f0f2] pt-2 border-t border-white/10">
            <span>Total</span>
            <span className="text-accent text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  const { items, total: cartTotal, clearCart } = useCart()
  const { settings, formatPrice, content } = useStore()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  })
  const [mobilePhone, setMobilePhone] = useState('')

  const subtotal = cartTotal
  const shipping = settings.shipping || 0
  const tax = subtotal * (settings.taxRate || 0)
  const orderTotal = subtotal + shipping + tax

  const payments = settings.payments || {}
  const enabledPayments = Object.entries(payments)
    .filter(([, v]) => v.enabled)
    .map(([k]) => k)

  const updateForm = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }))

  const validateForm = () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      setError('Please fill in all required fields.')
      return false
    }
    if (!paymentMethod) {
      setError('Please select a payment method.')
      return false
    }
    return true
  }

  const saveOrder = (transactionId, method, status = 'Processing') => {
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      customer: form,
      items: items.map((i) => ({ ...i })),
      subtotal,
      shipping,
      tax,
      total: orderTotal,
      currency: settings.currency.code,
      paymentMethod: method,
      transactionId,
      status,
    }
    try {
      const existing = JSON.parse(localStorage.getItem('lafai_orders') || '[]')
      existing.unshift(order)
      localStorage.setItem('lafai_orders', JSON.stringify(existing))
      localStorage.setItem('lafai_last_order', JSON.stringify(order))
    } catch {}
    return order
  }

  const handleMobileMoneyPay = async (method) => {
    if (!validateForm()) return
    if (!mobilePhone) {
      setError('Please enter your mobile phone number.')
      return
    }
    setError('')
    setProcessing(true)
    try {
      const res = await fetch(`/api/${method}-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: mobilePhone,
          amount: orderTotal,
          currency: settings.currency.code,
          orderId: `ORD-${Date.now()}`,
          customerName: form.name,
        }),
      })
      const data = await res.json()
      if (data.success) {
        saveOrder(data.transactionId, method, 'Processing')
        clearCart()
        navigate('/order-success')
      } else {
        setError(data.message || 'Payment failed. Please try again.')
      }
    } catch (e) {
      setError('Payment service unavailable. Please try again later.')
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <p className="font-display text-4xl italic font-light text-[#f5f0f2]/30 mb-6">
              Your bag is empty
            </p>
            <Link to="/products" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="section-heading mb-10">
            {content.checkout?.heading || 'Complete Your Order'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: form */}
            <div className="lg:col-span-3 space-y-8">
              {/* Contact */}
              <div>
                <h2 className="text-xs uppercase tracking-widest text-[#f5f0f2]/50 mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#f5f0f2]/40 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className="input-dark"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#f5f0f2]/40 block mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className="input-dark"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#f5f0f2]/40 block mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className="input-dark"
                      placeholder="+260 97..."
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h2 className="text-xs uppercase tracking-widest text-[#f5f0f2]/50 mb-4">
                  Delivery Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#f5f0f2]/40 block mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      className="input-dark"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#f5f0f2]/40 block mb-1">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateForm('city', e.target.value)}
                      className="input-dark"
                      placeholder="Lusaka"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h2 className="text-xs uppercase tracking-widest text-[#f5f0f2]/50 mb-4">
                  Payment Method
                </h2>

                {enabledPayments.length === 0 ? (
                  <div className="bg-card border border-white/5 p-6 text-center">
                    <p className="text-sm text-[#f5f0f2]/40">
                      No payment methods are currently enabled.
                    </p>
                    <p className="text-xs text-[#f5f0f2]/25 mt-1">
                      Admin: enable payment methods in Settings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enabledPayments.map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-4 p-4 border cursor-pointer transition-all duration-200 ${
                          paymentMethod === method
                            ? 'border-accent bg-accent/5'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => {
                            setPaymentMethod(method)
                            setError('')
                          }}
                          className="accent-[#c4727a]"
                        />
                        <span className="text-sm text-[#f5f0f2]/80">
                          {PAYMENT_LABELS[method]}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Mobile money phone input */}
                {paymentMethod &&
                  paymentMethod !== 'paypal' &&
                  enabledPayments.includes(paymentMethod) && (
                    <div className="mt-4">
                      <label className="text-xs text-[#f5f0f2]/40 block mb-2">
                        {PAYMENT_LABELS[paymentMethod]} Phone Number
                      </label>
                      <input
                        type="tel"
                        value={mobilePhone}
                        onChange={(e) => setMobilePhone(e.target.value)}
                        className="input-dark"
                        placeholder="+260 97..."
                      />
                    </div>
                  )}

                {/* PayPal */}
                {paymentMethod === 'paypal' &&
                  payments.paypal?.clientId && (
                    <div className="mt-4">
                      <PayPalScriptProvider
                        options={{
                          'client-id': payments.paypal.clientId,
                          currency: settings.currency.code === 'ZMW' ? 'USD' : settings.currency.code,
                        }}
                      >
                        <PayPalButtons
                          style={{ layout: 'vertical', color: 'black', shape: 'rect' }}
                          createOrder={async () => {
                            if (!validateForm()) throw new Error('Invalid form')
                            const res = await fetch('/api/paypal-create', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                amount: orderTotal,
                                currency: 'USD',
                                items: items,
                              }),
                            })
                            const data = await res.json()
                            return data.orderID
                          }}
                          onApprove={async (data) => {
                            const res = await fetch('/api/paypal-capture', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ orderID: data.orderID }),
                            })
                            const result = await res.json()
                            if (result.success) {
                              saveOrder(result.transactionId, 'paypal')
                              clearCart()
                              navigate('/order-success')
                            } else {
                              setError('PayPal payment failed.')
                            }
                          }}
                          onError={() => setError('PayPal encountered an error.')}
                        />
                      </PayPalScriptProvider>
                    </div>
                  )}
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 px-4 py-3">
                  {error}
                </p>
              )}

              {/* Submit for mobile money */}
              {paymentMethod &&
                paymentMethod !== 'paypal' &&
                enabledPayments.includes(paymentMethod) && (
                  <button
                    onClick={() => handleMobileMoneyPay(paymentMethod)}
                    disabled={processing}
                    className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <Lock size={14} />
                    {processing
                      ? 'Processing…'
                      : `Pay ${formatPrice(orderTotal)} with ${PAYMENT_LABELS[paymentMethod]}`}
                  </button>
                )}

              <div className="flex items-center gap-3 text-xs text-[#f5f0f2]/25">
                <Package size={13} />
                Discreet packaging · No brand names on outside
              </div>
            </div>

            {/* Right: summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <OrderSummary
                  items={items}
                  formatPrice={formatPrice}
                  settings={settings}
                  collapsed={collapsed}
                  setCollapsed={setCollapsed}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
