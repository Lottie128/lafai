import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { SlidersHorizontal, X } from 'lucide-react'

const CATEGORIES = ['All', 'Lingerie', 'Intimates', 'Toys', 'Sets', 'Accessories']
const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
]

export default function Products() {
  const { products } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const categoryParam = searchParams.get('category') || 'All'
  const sortParam = searchParams.get('sort') || 'featured'
  const queryParam = searchParams.get('q') || ''

  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.includes(categoryParam) ? categoryParam : 'All'
  )
  const [sort, setSort] = useState(sortParam)
  const [search, setSearch] = useState(queryParam)

  const setCategory = (cat) => {
    setSelectedCategory(cat)
    const p = new URLSearchParams(searchParams)
    if (cat === 'All') p.delete('category')
    else p.set('category', cat)
    setSearchParams(p)
  }

  const filteredProducts = useMemo(() => {
    let list = [...products]

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.includes(q))
      )
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        list.sort((a, b) => (b.id > a.id ? 1 : -1))
        break
      default:
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return list
  }, [products, selectedCategory, sort, search])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Header */}
        <div className="bg-surface border-b border-white/5 py-14 px-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/50 mb-3">
              Collection
            </p>
            <h1 className="section-heading">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h1>
            <p className="text-[#f5f0f2]/30 text-sm mt-2">
              {filteredProducts.length} piece{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Filters bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-10">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs uppercase tracking-widest px-4 py-2 border transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-white/10 text-[#f5f0f2]/40 hover:border-white/20 hover:text-[#f5f0f2]/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark text-xs w-40 py-2"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-dark text-xs py-2 w-auto pr-8 cursor-pointer bg-surface"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <p className="font-display text-3xl italic font-light text-[#f5f0f2]/20 mb-4">
                Nothing found
              </p>
              <p className="text-sm text-[#f5f0f2]/30">
                Try adjusting your filters or search.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
