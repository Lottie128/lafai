import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import {
  ShoppingBag,
  Package,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function ProductDetail() {
  const { slug } = useParams()
  const { products, formatPrice } = useStore()
  const { addItem } = useCart()
  const navigate = useNavigate()

  const product = products.find((p) => p.slug === slug)
  const [selectedSize, setSelectedSize] = useState(null)
  const [imageIndex, setImageIndex] = useState(0)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-display text-4xl italic font-light text-[#f5f0f2]/30 mb-6">
              Product not found
            </p>
            <Link to="/products" className="btn-outline">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4)

  const needsSize =
    product.sizes && product.sizes.length > 1 && product.sizes[0] !== 'One Size'

  const handleAddToBag = () => {
    if (needsSize && !selectedSize) {
      setSizeError(true)
      return
    }
    setSizeError(false)
    addItem(product, selectedSize || product.sizes?.[0] || null)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const images = product.images || []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <nav className="flex items-center gap-2 text-xs text-gold/50">
            <Link to="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/products"
              className="hover:text-gold transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <Link
              to={`/products?category=${product.category}`}
              className="hover:text-gold transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gold/70">{product.name}</span>
          </nav>
        </div>

        {/* Product */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Images */}
            <div>
              {/* Main image */}
              <div className="relative aspect-[4/5] lux-frame overflow-hidden mb-3">
                <img
                  src={images[imageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                />
                {product.badge && (
                  <span
                    className={`absolute top-4 left-4 text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 ${
                      {
                        Bestseller: 'bg-gold/25 text-gold border border-gold/40',
                        New: 'bg-gold/20 text-gold border border-gold/30',
                        Sale: 'bg-red-900/40 text-red-300 border border-red-500/30',
                      }[product.badge] || 'bg-gold/10 text-gold border border-gold/20'
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImageIndex((i) => (i - 1 + images.length) % images.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setImageIndex((i) => (i + 1) % images.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`w-16 h-20 overflow-hidden flex-shrink-0 border-2 transition-all ${
                        i === imageIndex
                          ? 'border-gold'
                          : 'border-transparent opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-widest text-gold/70 mb-3">
                {product.brand} · {product.category}
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-light italic gold-sheen leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-gold text-2xl font-medium">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-gold/50 text-lg line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gold/20 mb-6" />

              {/* Description */}
              <p className="font-display text-lg italic font-light text-gold/70 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Size selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-widest text-gold/60">
                      Size
                      {selectedSize && (
                        <span className="ml-2 text-gold">{selectedSize}</span>
                      )}
                    </p>
                    {sizeError && (
                      <p className="text-xs text-red-400">Please select a size</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size)
                          setSizeError(false)
                        }}
                        className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-gold/80 bg-gold/10 text-gold'
                            : 'border-gold/20 text-gold/60 hover:border-gold/50 hover:text-gold'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to bag */}
              <button
                onClick={handleAddToBag}
                className={`btn-primary w-full flex items-center justify-center gap-3 mb-4 ${
                  added ? 'bg-green-800 hover:bg-green-800' : ''
                }`}
              >
                <ShoppingBag size={16} />
                {added ? 'Added to Bag ✓' : 'Add to Bag'}
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="flex items-center gap-2 text-xs text-gold/60">
                  <Package size={13} className="text-gold/60" />
                  Discreet packaging
                </div>
                <div className="flex items-center gap-2 text-xs text-gold/60">
                  <Lock size={13} className="text-gold/60" />
                  Secure checkout
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-gold/10">
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/products?q=${tag}`}
                      className="text-[10px] uppercase tracking-widest text-gold/60 border border-gold/20 px-2.5 py-1 hover:text-gold hover:border-gold/40 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-24">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px bg-gold/20 flex-1" />
                <h2 className="font-display text-2xl italic font-light text-gold/70">
                  You might also like
                </h2>
                <div className="h-px bg-gold/20 flex-1" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
