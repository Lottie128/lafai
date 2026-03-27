import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useStore } from '../context/StoreContext.jsx'

const BADGE_STYLES = {
  Bestseller: 'bg-gold/20 text-gold border border-gold/30',
  New: 'bg-accent/20 text-accent border border-accent/30',
  Sale: 'bg-red-900/40 text-red-300 border border-red-500/30',
}

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const [adding, setAdding] = useState(false)
  const { addItem } = useCart()
  const { formatPrice } = useStore()

  const handleAddToBag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const defaultSize = product.sizes?.[0] || null
    addItem(product, defaultSize)
    setAdding(true)
    setTimeout(() => setAdding(false), 1200)
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="lux-card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />

          {/* Gradient overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Badge */}
          {product.badge && (
            <span
              className={`absolute top-3 left-3 text-[10px] uppercase tracking-widest font-semibold px-2 py-1 ${
                BADGE_STYLES[product.badge] || 'bg-white/10 text-white/70'
              }`}
            >
              {product.badge}
            </span>
          )}

          {/* Add to bag overlay */}
          <div
            className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
              hovered
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            <button
              onClick={handleAddToBag}
              className="w-full bg-gold/15 border border-gold/40 text-gold py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-gold/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={13} />
              {adding ? 'Added' : 'Add to Bag'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest text-gold/70 mb-1">
            {product.category}
          </p>
          <h3 className="font-display text-lg font-light text-[#f5f0f2] leading-snug group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-gold font-medium text-sm drop-shadow-[0_8px_20px_rgba(201,169,110,0.35)]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[#f5f0f2]/30 text-xs line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Size dots */}
          {product.sizes && product.sizes.length > 1 && product.category !== 'Toys' && product.category !== 'Accessories' && (
            <div className="flex items-center gap-1 mt-3">
              {product.sizes.slice(0, 5).map((size) => (
                <span
                  key={size}
                  className="text-[9px] uppercase tracking-wide text-[#f5f0f2]/40 border border-gold/20 px-1.5 py-0.5"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
