import { useState } from 'react'
import { useStore } from '../../context/StoreContext.jsx'
import { Plus, Pencil, Trash2, X, Save, Github, Check, AlertCircle } from 'lucide-react'

const EMPTY_PRODUCT = {
  id: '',
  slug: '',
  name: '',
  brand: "La'Fai",
  price: '',
  originalPrice: '',
  category: 'Lingerie',
  badge: '',
  description: '',
  images: [''],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  inStock: true,
  featured: false,
  tags: [],
}

const CATEGORIES = ['Lingerie', 'Intimates', 'Toys', 'Sets', 'Accessories']

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminProducts() {
  const { products, updateProducts, formatPrice } = useStore()
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [githubStatus, setGithubStatus] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const openAdd = () => {
    setForm({ ...EMPTY_PRODUCT, id: `prod-${Date.now()}` })
    setEditing(null)
    setModal('add')
  }

  const openEdit = (product) => {
    setForm({
      ...product,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      images: product.images?.length ? product.images : [''],
      tags: product.tags || [],
      sizes: product.sizes || [],
    })
    setEditing(product.id)
    setModal('edit')
  }

  const closeModal = () => {
    setModal(null)
    setEditing(null)
    setForm(EMPTY_PRODUCT)
  }

  const updateField = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSave = () => {
    const slug = form.slug || slugify(form.name)
    const product = {
      ...form,
      slug,
      price: parseFloat(form.price) || 0,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      images: form.images.filter((img) => img.trim()),
      tags: typeof form.tags === 'string'
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : form.tags,
      sizes: typeof form.sizes === 'string'
        ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : form.sizes,
      badge: form.badge || null,
    }

    let updated
    if (modal === 'edit') {
      updated = products.map((p) => (p.id === editing ? product : p))
    } else {
      updated = [...products, product]
    }
    updateProducts(updated)
    closeModal()
  }

  const handleDelete = (id) => {
    updateProducts(products.filter((p) => p.id !== id))
    setDeleteConfirm(null)
  }

  const handleGitHubPush = async () => {
    const token = localStorage.getItem('lafai_gh_token')
    const owner = localStorage.getItem('lafai_gh_owner')
    const repo = localStorage.getItem('lafai_gh_repo')

    if (!token || !owner || !repo) {
      setGithubStatus({ type: 'error', msg: 'GitHub credentials not set. Go to Settings → GitHub Integration.' })
      return
    }

    setGithubStatus({ type: 'loading', msg: 'Pushing to GitHub…' })

    try {
      // Get current SHA
      const getRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/src/data/products.json`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
      )
      const getJson = await getRes.json()
      const sha = getJson.sha

      const content = btoa(unescape(encodeURIComponent(JSON.stringify(products, null, 2))))

      const putRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/src/data/products.json`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update products.json via La'Fai admin`,
            content,
            sha,
          }),
        }
      )

      if (putRes.ok) {
        setGithubStatus({ type: 'success', msg: 'Pushed to GitHub successfully!' })
      } else {
        const err = await putRes.json()
        setGithubStatus({ type: 'error', msg: err.message || 'GitHub push failed.' })
      }
    } catch (e) {
      setGithubStatus({ type: 'error', msg: 'Network error during GitHub push.' })
    }

    setTimeout(() => setGithubStatus(null), 5000)
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic font-light text-[#f5f0f2] mb-1">
            Products
          </h1>
          <p className="text-xs text-[#f5f0f2]/30">{products.length} products</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGitHubPush}
            className="btn-gold text-xs flex items-center gap-2"
          >
            <Github size={13} />
            Push to GitHub
          </button>
          <button onClick={openAdd} className="btn-primary text-xs flex items-center gap-2">
            <Plus size={13} />
            Add Product
          </button>
        </div>
      </div>

      {/* GitHub status */}
      {githubStatus && (
        <div
          className={`mb-6 px-4 py-3 text-sm flex items-center gap-2 border ${
            githubStatus.type === 'success'
              ? 'bg-green-900/20 border-green-500/20 text-green-300'
              : githubStatus.type === 'error'
              ? 'bg-red-900/20 border-red-500/20 text-red-300'
              : 'bg-blue-900/20 border-blue-500/20 text-blue-300'
          }`}
        >
          {githubStatus.type === 'success' ? (
            <Check size={14} />
          ) : githubStatus.type === 'error' ? (
            <AlertCircle size={14} />
          ) : null}
          {githubStatus.msg}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[#f5f0f2]/30 text-xs uppercase tracking-widest">
                <th className="text-left px-4 py-3 font-normal">Product</th>
                <th className="text-left px-4 py-3 font-normal hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-normal">Price</th>
                <th className="text-left px-4 py-3 font-normal hidden sm:table-cell">Stock</th>
                <th className="text-left px-4 py-3 font-normal hidden lg:table-cell">Featured</th>
                <th className="px-4 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-surface overflow-hidden flex-shrink-0">
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[#f5f0f2]/80 truncate max-w-[180px]">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-[#f5f0f2]/30 truncate">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-[#f5f0f2]/40 uppercase tracking-wide">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-accent">{formatPrice(product.price)}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`text-[10px] uppercase tracking-wide border px-2 py-0.5 ${
                        product.inStock
                          ? 'border-green-500/30 text-green-400 bg-green-900/20'
                          : 'border-red-500/30 text-red-400 bg-red-900/20'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs ${product.featured ? 'text-gold' : 'text-[#f5f0f2]/20'}`}>
                      {product.featured ? '★ Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 text-[#f5f0f2]/30 hover:text-accent transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      {deleteConfirm === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-2 py-1 text-[10px] bg-red-900/40 text-red-300 border border-red-500/30 hover:bg-red-900/60 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-[10px] text-[#f5f0f2]/30 hover:text-[#f5f0f2]/60 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-1.5 text-[#f5f0f2]/30 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-white/10 w-full max-w-2xl my-8">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="font-display text-xl italic font-light text-[#f5f0f2]">
                {modal === 'add' ? 'Add Product' : 'Edit Product'}
              </h2>
              <button onClick={closeModal} className="text-[#f5f0f2]/40 hover:text-[#f5f0f2]">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      updateField('name', e.target.value)
                      if (!editing) updateField('slug', slugify(e.target.value))
                    }}
                    className="input-dark"
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="input-dark"
                    placeholder="auto-generated"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1">Price *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    className="input-dark"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1">
                    Original Price (if on sale)
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => updateField('originalPrice', e.target.value)}
                    className="input-dark"
                    placeholder="Leave blank"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="input-dark bg-surface"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1">Badge</label>
                  <select
                    value={form.badge || ''}
                    onChange={(e) => updateField('badge', e.target.value)}
                    className="input-dark bg-surface"
                  >
                    <option value="">None</option>
                    <option value="New">New</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#f5f0f2]/40 block mb-1">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="input-dark resize-none"
                  placeholder="Elegant product description…"
                />
              </div>

              <div>
                <label className="text-xs text-[#f5f0f2]/40 block mb-1">
                  Image URLs (one per line)
                </label>
                <textarea
                  rows={3}
                  value={Array.isArray(form.images) ? form.images.join('\n') : form.images}
                  onChange={(e) =>
                    updateField('images', e.target.value.split('\n'))
                  }
                  className="input-dark resize-none text-xs"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1">
                    Sizes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(form.sizes) ? form.sizes.join(', ') : form.sizes}
                    onChange={(e) =>
                      updateField(
                        'sizes',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    className="input-dark"
                    placeholder="XS, S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#f5f0f2]/40 block mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                    onChange={(e) =>
                      updateField(
                        'tags',
                        e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                      )
                    }
                    className="input-dark"
                    placeholder="lace, silk, luxury"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => updateField('inStock', e.target.checked)}
                    className="accent-[#c4727a]"
                  />
                  <span className="text-sm text-[#f5f0f2]/60">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => updateField('featured', e.target.checked)}
                    className="accent-[#c4727a]"
                  />
                  <span className="text-sm text-[#f5f0f2]/60">Featured on Home</span>
                </label>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
              <button onClick={closeModal} className="btn-outline text-xs">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary text-xs flex items-center gap-2"
              >
                <Save size={12} />
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
