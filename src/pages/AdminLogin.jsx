import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      navigate('/admin')
    } catch (err) {
      toast.error('Wrong email or password!')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, var(--secondary) 0%, #0d2137 100%)',
      padding: 16
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card" style={{ borderRadius: 20, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            margin: '-24px -24px 24px', padding: '32px 24px', textAlign: 'center', color: 'white'
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🛍</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Raka Mart</h1>
            <p style={{ fontSize: 13, opacity: 0.85 }}>Admin Login</p>
          </div>

          <form onSubmit={login}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? '⏳ Logging in...' : '🔐 Login to Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
