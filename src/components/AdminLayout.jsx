import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useState } from 'react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
]

export default function AdminLayout({ user }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logout = async () => {
    await signOut(auth)
    toast.success('Logged out')
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--secondary)', color: 'white',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: sidebarOpen ? 0 : '-240px', bottom: 0, zIndex: 100,
        transition: 'left 0.3s',
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
      }} className="sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
            🛍 Raka Mart
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 10, marginBottom: 4,
                background: isActive ? 'var(--primary)' : 'transparent',
                color: 'white', fontSize: 14, fontWeight: isActive ? 600 : 400,
                transition: 'background 0.2s'
              })}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            {user?.email}
          </div>
          <button className="btn btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', width: '100%' }} onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99
      }} />}

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{
          background: 'white', padding: '0 24px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 50
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4
          }}>☰</button>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--secondary)' }}>
            🛍 Raka Mart Admin
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .sidebar { left: 0 !important; }
          main { padding-left: 260px !important; }
        }
      `}</style>
    </div>
  )
}
