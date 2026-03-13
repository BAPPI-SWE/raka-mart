import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'

const CATEGORIES = ['Clothing', 'Electronics', 'Footwear', 'Accessories', 'Home & Living', 'Beauty', 'Other']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', 'Free Size']
const SITE_URL = window.location.origin

const EMPTY_FORM = {
  name: '', namebn: '', category: 'Clothing',
  price: '', discountPrice: '', description: '', descriptionbn: '',
  images: '', sizes: [], colors: '', shippingInside: 60, shippingOutside: 120,
  active: true
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    const snap = await getDocs(collection(db, 'products'))
    const list = []
    snap.forEach(d => list.push({ id: d.id, ...d.data() }))
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    setProducts(list)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        shippingInside: Number(form.shippingInside),
        shippingOutside: Number(form.shippingOutside),
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
        updatedAt: serverTimestamp()
      }

      if (editId) {
        await updateDoc(doc(db, 'products', editId), data)
        toast.success('Product updated!')
      } else {
        data.createdAt = serverTimestamp()
        await addDoc(collection(db, 'products'), data)
        toast.success('Product added!')
      }

      setShowForm(false)
      setForm(EMPTY_FORM)
      setEditId(null)
      loadProducts()
    } catch (err) {
      toast.error('Error saving product')
    }
    setSaving(false)
  }

  const handleEdit = (p) => {
    setForm({ ...p, images: (p.images || []).join('\n'), sizes: p.sizes || [] })
    setEditId(p.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await deleteDoc(doc(db, 'products', id))
    toast.success('Deleted!')
    loadProducts()
  }

  const copyLink = (id) => {
    const url = `${SITE_URL}/order/${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('Order link copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleSize = (sz) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(sz) ? f.sizes.filter(s => s !== sz) : [...f.sizes, sz]
    }))
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--secondary)' }}>📦 Products</h2>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(!showForm) }}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, borderTop: '4px solid var(--primary)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{editId ? '✏️ Edit Product' : '➕ New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label>Product Name (English) *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Premium Black Denim Jeans" required />
              </div>
              <div className="form-group">
                <label>Product Name (বাংলা)</label>
                <input value={form.namebn} onChange={e => setForm(f => ({ ...f, namebn: e.target.value }))}
                  placeholder="e.g. ব্ল্যাক ডেনিম জিন্স" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Original Price (৳) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="2050" required />
              </div>
              <div className="form-group">
                <label>Sale Price (৳) – leave blank if no discount</label>
                <input type="number" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                  placeholder="1650" />
              </div>
              <div className="form-group">
                <label>Shipping - Inside Dhaka (৳)</label>
                <input type="number" value={form.shippingInside} onChange={e => setForm(f => ({ ...f, shippingInside: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Shipping - Outside Dhaka (৳)</label>
                <input type="number" value={form.shippingOutside} onChange={e => setForm(f => ({ ...f, shippingOutside: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Colors (comma separated)</label>
                <input value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))}
                  placeholder="Jet Black, Navy Blue, White" />
              </div>
            </div>

            {/* Sizes */}
            <div className="form-group">
              <label>Available Sizes</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {SIZES.map(sz => (
                  <button type="button" key={sz} onClick={() => toggleSize(sz)} style={{
                    padding: '6px 14px', borderRadius: 8, border: '2px solid',
                    borderColor: form.sizes.includes(sz) ? 'var(--primary)' : 'var(--border)',
                    background: form.sizes.includes(sz) ? 'var(--primary)' : 'white',
                    color: form.sizes.includes(sz) ? 'white' : 'var(--text)',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer'
                  }}>{sz}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Description (English)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Product details, material, features..." />
            </div>
            <div className="form-group">
              <label>Description (বাংলা)</label>
              <textarea value={form.descriptionbn} onChange={e => setForm(f => ({ ...f, descriptionbn: e.target.value }))}
                rows={3} placeholder="পণ্যের বিস্তারিত..." style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }} />
            </div>
            <div className="form-group">
              <label>Image URLs (one per line)</label>
              <textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                rows={4} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
              <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                💡 Upload images to imgbb.com, imgur.com, or cloudinary.com and paste the links here
              </small>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? '⏳ Saving...' : editId ? '✔ Update Product' : '✔ Save Product'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditId(null) }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ color: 'var(--text-muted)' }}>No products yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Click "Add Product" to create your first product!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {products.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Image */}
              <div style={{
                width: 80, height: 80, borderRadius: 10, overflow: 'hidden',
                background: 'var(--bg)', flexShrink: 0, border: '1px solid var(--border)'
              }}>
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32 }}>📦</div>}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{p.name}</div>
                {p.namebn && <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Noto Sans Bengali, sans-serif' }}>{p.namebn}</div>}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.category}</span>
                  {p.discountPrice ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 13 }}>৳{p.price}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>৳{p.discountPrice}</span>
                    </>
                  ) : (
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>৳{p.price}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-success btn-sm" onClick={() => copyLink(p.id)}>
                  {copiedId === p.id ? '✓ Copied!' : '🔗 Copy Link'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑</button>
              </div>

              {/* Link preview */}
              <div style={{ width: '100%', background: 'var(--bg)', borderRadius: 8, padding: '8px 12px', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>ORDER LINK: </span>
                <span style={{ fontSize: 12, wordBreak: 'break-all', color: 'var(--primary)' }}>{SITE_URL}/order/{p.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
