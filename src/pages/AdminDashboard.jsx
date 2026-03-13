import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [prodSnap, ordSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5)))
      ])

      const allOrders = await getDocs(collection(db, 'orders'))
      let pending = 0, revenue = 0
      allOrders.forEach(d => {
        const o = d.data()
        if (o.status === 'pending' || !o.status) pending++
        if (o.status === 'delivered') revenue += Number(o.totalPrice || 0)
      })

      setStats({
        products: prodSnap.size,
        orders: allOrders.size,
        pending,
        revenue
      })

      const recent = []
      ordSnap.forEach(d => recent.push({ id: d.id, ...d.data() }))
      setRecentOrders(recent)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: '📦', color: '#4361ee' },
    { label: 'Total Orders', value: stats.orders, icon: '🛒', color: '#7209b7' },
    { label: 'Pending Orders', value: stats.pending, icon: '⏳', color: '#f4a261' },
    { label: 'Revenue (Delivered)', value: `৳${stats.revenue.toLocaleString()}`, icon: '💰', color: '#2d6a4f' },
  ]

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--secondary)' }}>
        📊 Dashboard
      </h2>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700 }}>🕐 Recent Orders</h3>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
            No orders yet. Share your product links to get orders!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Customer', 'Product', 'Phone', 'Total', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>{o.name}</td>
                    <td style={{ padding: '12px' }}>{o.productName}</td>
                    <td style={{ padding: '12px' }}>{o.phone}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>৳{o.totalPrice}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${o.status || 'pending'}`}>{o.status || 'pending'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
