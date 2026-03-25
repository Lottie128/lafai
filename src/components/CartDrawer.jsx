import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useStore } from '../context/StoreContext.jsx'

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, total, count } = useCart()
  const { formatPrice, settings } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const subtotal = total
  const shipping = settings.shipping || 0
  const tax = subtotal * (settings.taxRate || 0)
  const orderTotal = subtotal + shipping + tax

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface z-50 flex flex-col transition-transform duration-400 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-accent" />
            <h2 className="font-display text-xl font-light italic text-[#f5f0f2]">
              Your Bag
            </h2>
            {count > 0 && (
              <span className="text-xs text-[#f5f0f2]/40">({count})</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#f5f0f2]/40 hover:text-[#f5f0f2] transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <ShoppingBag size={40} className="text-white/10 mb-4" />
              <p className="font-display text-2xl italic font-light text-[#f5f0f2]/40 mb-2">
                Your bag is empty
              </p>
              <p className="text-sm text-[#f5f0f2]/30 mb-8">
                Discover something to desire.
              </p>
              <button onClick={onClose} className="btn-outline text-xs">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {items.map((item) => (
                <div key={item.key} className="flex gap-4 px-6 py-5">
                  <div className="w-20 h-24 bg-card overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-display text-base font-light text-[#f5f0f2] leading-tight">
                          {item.name}
                        </h4>
                        {item.size && item.size !== 'One Size' && (
                          <p className="text-xs text-[#f5f0f2]/40 mt-0.5 uppercase tracking-wide">
                            Size: {item.size}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-[#f5f0f2]/30 hover:text-accent transition-colors flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-white/10">
                        <button
                          onClick={() => updateQty(item.key, item.qty - 1)}
                          className="px-2 py-1 text-[#f5f0f2]/50 hover:text-[#f5f0f2] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-1 text-sm text-[#f5f0f2] border-x border-white/10 min-w-[2rem] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          className="px-2 py-1 text-[#f5f0f2]/50 hover:text-[#f5f0f2] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-accent font-medium text-sm">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/5 px-6 py-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-[#f5f0f2]/50">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#f5f0f2]/50">
                <span>Shipping</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#f5f0f2]/50">
                <span>Tax ({(settings.taxRate * 100).toFixed(0)}%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-[#f5f0f2] font-medium pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="text-accent">{formatPrice(orderTotal)}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full text-center">
              Proceed to Checkout
            </button>
            <p className="text-center text-xs text-[#f5f0f2]/25 mt-3">
              Discreet packaging · Secure payment
            </p>
          </div>
        )}
      </div>
    </>
  )
}
