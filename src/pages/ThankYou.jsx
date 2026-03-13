import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function ThankYou() {
  const { state } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)',
      padding: 16, fontFamily: 'Noto Sans Bengali, Sora, sans-serif'
    }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
        {/* Success Card */}
        <div style={{
          background: 'white', borderRadius: 24, padding: '48px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)'
        }}>
          <div style={{ fontSize: 80, marginBottom: 16, animation: 'bounce 1s' }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2d6a4f', marginBottom: 8 }}>
            অর্ডার সফল হয়েছে!
          </h1>
          <p style={{ fontSize: 16, color: '#555', marginBottom: 24, lineHeight: 1.7 }}>
            {state?.name ? `ধন্যবাদ ${state.name}!` : 'ধন্যবাদ!'} আপনার অর্ডারটি গ্রহণ করা হয়েছে।
            আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।
          </p>

          {state?.total && (
            <div style={{
              background: '#f0fdf4', border: '2px solid #bbf7d0',
              borderRadius: 12, padding: '16px 24px', marginBottom: 24
            }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>মোট মূল্য</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#2d6a4f' }}>৳{state.total}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>পণ্য পেলে পরিশোধ করুন</div>
            </div>
          )}

          <div style={{ background: '#fff8f0', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: '#c77400' }}>📌 পরবর্তী পদক্ষেপ:</div>
            {[
              '📞 আমরা আপনাকে কল করব',
              '📦 পণ্য প্রস্তুত করা হবে',
              '🚚 দ্রুত ডেলিভারি দেওয়া হবে',
              '💵 পণ্য পেলে টাকা দিন'
            ].map(step => (
              <div key={step} style={{ fontSize: 14, marginBottom: 6, color: '#555' }}>{step}</div>
            ))}
          </div>

          <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
            কোনো সমস্যা হলে আমাদের Facebook Page-এ মেসেজ করুন
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => window.history.back()} style={{
              padding: '14px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--primary, #e63946), #c1121f)',
              color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer'
            }}>
              আরেকটি অর্ডার করুন
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: '#aaa' }}>
          Powered by 🛍 Raka Mart
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
