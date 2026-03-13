import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc, deleteDoc, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
    const list = []
    snap.forEach(d => list.push({ id: d.id, ...d.data() }))
    setOrders(list)
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status })
    toast.success(`Status updated to ${status}`)
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x))
  }

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return
    await deleteDoc(doc(db, 'orders', id))
    toast.success('Order deleted')
    setOrders(o => o.filter(x => x.id !== id))
  }

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || (o.status || 'pending') === filter
    const matchSearch = !search || o.name?.toLowerCase().includes(search.toLowerCase())
      || o.phone?.includes(search) || o.productName?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const formatDate = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--secondary)' }}>🛒 Orders</h2>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ padding: '8px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, flex: 1, minWidth: 200 }}
          placeholder="🔍 Search by name, phone, product..."
          value={search} onChange={e => setSearch(e.target.value)} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 14px', borderRadius: 100, border: '2px solid',
              borderColor: filter === s ? 'var(--primary)' : 'var(--border)',
              background: filter === s ? 'var(--primary)' : 'white',
              color: filter === s ? 'white' : 'var(--text)',
              fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize'
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['pending','confirmed','shipped','delivered','cancelled'].map(s => {
          const count = orders.filter(o => (o.status || 'pending') === s).length
          return <span key={s} className={`badge badge-${s}`} style={{ fontSize: 13 }}>{s}: {count}</span>
        })}
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total: {orders.length}</span>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          No orders found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(o => (
            <div key={o.id} className="card" style={{ borderLeft: `4px solid ${
              {'pending':'#f4a261','confirmed':'#4361ee','shipped':'#7209b7','delivered':'#2d6a4f','cancelled':'#dc3545'}[o.status || 'pending']
            }` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                {/* Left: customer info */}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>👤 {o.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>📞 {o.phone}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>📍 {o.address}</div>
                  {o.district && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>🗺 {o.district}</div>}
                </div>

                {/* Center: order info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>📦 {o.productName}</div>
                  {o.selectedSize && <div style={{ fontSize: 13 }}>Size: <strong>{o.selectedSize}</strong></div>}
                  {o.selectedColor && <div style={{ fontSize: 13 }}>Color: <strong>{o.selectedColor}</strong></div>}
                  <div style={{ fontSize: 13, marginTop: 4 }}>Qty: <strong>{o.quantity || 1}</strong></div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16, marginTop: 6 }}>
                    Total: ৳{o.totalPrice}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(o.createdAt)}</div>
                </div>

                {/* Right: status + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                  <span className={`badge badge-${o.status || 'pending'}`} style={{ textAlign: 'center' }}>
                    {o.status || 'pending'}
                  </span>
                  <select onChange={e => updateStatus(o.id, e.target.value)} value={o.status || 'pending'}
                    style={{ padding: '8px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(o.id)}>🗑 Delete</button>
                </div>
              </div>

              {o.note && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff3cd', borderRadius: 8, fontSize: 13 }}>
                  📝 Note: {o.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
