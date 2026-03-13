import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'

const DISTRICTS = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Narsingdi', 'Manikganj', 'Munshiganj', 'Rajbari',
  'Faridpur', 'Gopalganj', 'Madaripur', 'Shariatpur', 'Chattogram', 'Cox\'s Bazar',
  'Rangamati', 'Bandarban', 'Khagrachhari', 'Noakhali', 'Feni', 'Lakshmipur',
  'Chandpur', 'Brahmanbaria', 'Cumilla', 'Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj',
  'Rajshahi', 'Natore', 'Naogaon', 'Chapainawabganj', 'Pabna', 'Sirajganj', 'Bogura', 'Joypurhat',
  'Khulna', 'Bagerhat', 'Satkhira', 'Jashore', 'Narail', 'Magura', 'Jhenaidah',
  'Kushtia', 'Meherpur', 'Chuadanga', 'Barisal', 'Pirojpur', 'Jhalokati', 'Patuakhali',
  'Bhola', 'Barguna', 'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat',
  'Nilphamari', 'Panchagarh', 'Thakurgaon', 'Mymensingh', 'Jamalpur', 'Netrakona',
  'Sherpur', 'Kishoreganj'
]

export default function OrderPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [shippingType, setShippingType] = useState('inside')
  const [quantity, setQuantity] = useState(1)

  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    district: 'Dhaka', selectedSize: '', selectedColor: '', note: ''
  })

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      const snap = await getDoc(doc(db, 'products', productId))
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() })
        const p = snap.data()
        if (p.sizes?.length) setForm(f => ({ ...f, selectedSize: p.sizes[0] }))
        const colors = p.colors?.split(',').map(c => c.trim()).filter(Boolean) || []
        if (colors.length) setForm(f => ({ ...f, selectedColor: colors[0] }))
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const isInsideDhaka = shippingType === 'inside'
  const shipping = product ? (isInsideDhaka ? (product.shippingInside || 60) : (product.shippingOutside || 120)) : 0
  const basePrice = product ? (product.discountPrice || product.price) : 0
  const total = (basePrice * quantity) + shipping

  const colors = product?.colors?.split(',').map(c => c.trim()).filter(Boolean) || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.address) {
      toast.error('Please fill all required fields!')
      return
    }
    if (product?.sizes?.length && !form.selectedSize) {
      toast.error('Please select a size!')
      return
    }

    setSubmitting(true)
    try {
      const orderData = {
        ...form,
        productId: product.id,
        productName: product.name,
        productNameBn: product.namebn || '',
        quantity,
        basePrice,
        shipping,
        totalPrice: total,
        shippingType,
        status: 'pending',
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, 'orders'), orderData)

      // Email notification via EmailJS or simple fetch (using formspree)
      try {
        await sendEmailNotification(orderData)
      } catch (err) { /* Email errors don't block order */ }

      navigate('/thank-you', { state: { name: form.name, total, product: product.name } })
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const sendEmailNotification = async (order) => {
    // Using EmailJS free service - no backend needed
    const EMAILJS_SERVICE = service_1225
    const EMAILJS_TEMPLATE = template_ynhzjwd
    const EMAILJS_KEY = p8llOMRQSZeYU6Bzk // Replace after setup

    if (EMAILJS_KEY === p8llOMRQSZeYU6Bzk) return // Skip if not configured

    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE,
        template_id: EMAILJS_TEMPLATE,
        user_id: EMAILJS_KEY,
        template_params: {
          to_email: 'bappi616@gmail.com',
          customer_name: order.name,
          customer_phone: order.phone,
          customer_address: order.address,
          customer_district: order.district,
          product_name: order.productName,
          size: order.selectedSize || 'N/A',
          color: order.selectedColor || 'N/A',
          quantity: order.quantity,
          total_price: order.totalPrice,
          shipping_type: order.shippingType
        }
      })
    })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div className="spinner" />
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>😕</div>
      <h2>Product not found</h2>
      <p style={{ color: 'var(--text-muted)' }}>This product link is invalid or has been removed.</p>
    </div>
  )

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Noto Sans Bengali, Sora, sans-serif' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--secondary), #0a1628)',
        color: 'white', textAlign: 'center', padding: '14px 16px'
      }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>🛍 Raka Mart</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Fast Delivery • Cash on Delivery • Easy Return</div>
      </div>

      {/* Title */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        color: 'white', padding: '24px 16px', textAlign: 'center'
      }}>
        {product.namebn && <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, fontFamily: 'Noto Sans Bengali, sans-serif' }}>{product.namebn}</h1>}
        <h2 style={{ fontSize: 16, fontWeight: 400, opacity: 0.9, marginBottom: 12 }}>{product.name}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
          {product.discountPrice && (
            <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: 18 }}>৳{product.price}</span>
          )}
          <span style={{ fontSize: 32, fontWeight: 800 }}>৳{product.discountPrice || product.price}</span>
        </div>
        <a href="#order-form" style={{
          display: 'inline-block', marginTop: 16,
          background: 'white', color: 'var(--primary)',
          padding: '12px 32px', borderRadius: 100, fontWeight: 700, fontSize: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>📋 অর্ডার করতে চাই</a>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 40px' }}>

        {/* Image Gallery */}
        {product.images?.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <img src={product.images[activeImg]} alt={product.name} style={{
              width: '100%', maxHeight: 420, objectFit: 'contain',
              borderRadius: 16, border: '1px solid var(--border)', background: '#f8f8f8'
            }} />
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', padding: '4px 0' }}>
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setActiveImg(i)} style={{
                    width: 70, height: 70, objectFit: 'cover', borderRadius: 10, cursor: 'pointer',
                    border: `3px solid ${activeImg === i ? 'var(--primary)' : 'var(--border)'}`,
                    flexShrink: 0
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {(product.descriptionbn || product.description) && (
          <div style={{ marginTop: 20, background: '#f8f9fa', borderRadius: 12, padding: 16 }}>
            {product.descriptionbn && (
              <p style={{ fontFamily: 'Noto Sans Bengali, sans-serif', marginBottom: product.description ? 10 : 0, lineHeight: 1.8 }}>
                {product.descriptionbn}
              </p>
            )}
            {product.description && <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{product.description}</p>}
          </div>
        )}

        {/* Trust badges */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20,
          background: '#fff8f0', border: '1px solid #ffe0c0', borderRadius: 12, padding: 16
        }}>
          {['🚚 দ্রুত ডেলিভারি', '💵 ক্যাশ অন ডেলিভারি', '🔄 সহজ রিটার্ন'].map(t => (
            <div key={t} style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, fontFamily: 'Noto Sans Bengali, sans-serif' }}>{t}</div>
          ))}
        </div>

        {/* ORDER FORM */}
        <div id="order-form" style={{
          marginTop: 24, background: 'white', border: '2px solid var(--primary)',
          borderRadius: 16, padding: '24px 20px', boxShadow: '0 8px 32px rgba(230,57,70,0.15)'
        }}>
          <h2 style={{
            textAlign: 'center', fontSize: 20, fontWeight: 800, marginBottom: 20,
            color: 'var(--secondary)', fontFamily: 'Noto Sans Bengali, sans-serif'
          }}>✍️ অর্ডার ফর্ম পূরণ করুন</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>আপনার নাম *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="আপনার পূর্ণ নাম লিখুন" required />
            </div>

            <div className="form-group">
              <label style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>ফোন নম্বর *</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="01XXXXXXXXX" required />
            </div>

            <div className="form-group">
              <label style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>সম্পূর্ণ ঠিকানা *</label>
              <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                rows={2} placeholder="বাড়ি নম্বর, রাস্তা, এলাকা..." required />
            </div>

            <div className="form-group">
              <label style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>জেলা *</label>
              <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="form-group">
                <label style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>সাইজ *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.sizes.map(sz => (
                    <button type="button" key={sz} onClick={() => setForm(f => ({ ...f, selectedSize: sz }))} style={{
                      padding: '8px 18px', borderRadius: 8, border: '2px solid',
                      borderColor: form.selectedSize === sz ? 'var(--primary)' : 'var(--border)',
                      background: form.selectedSize === sz ? 'var(--primary)' : 'white',
                      color: form.selectedSize === sz ? 'white' : 'var(--text)',
                      fontWeight: 700, cursor: 'pointer', fontSize: 14
                    }}>{sz}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div className="form-group">
                <label style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>কালার</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {colors.map(c => (
                    <button type="button" key={c} onClick={() => setForm(f => ({ ...f, selectedColor: c }))} style={{
                      padding: '8px 18px', borderRadius: 8, border: '2px solid',
                      borderColor: form.selectedColor === c ? 'var(--primary)' : 'var(--border)',
                      background: form.selectedColor === c ? 'var(--primary)' : 'white',
                      color: form.selectedColor === c ? 'white' : 'var(--text)',
                      fontWeight: 600, cursor: 'pointer', fontSize: 13
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="form-group">
              <label style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>পরিমাণ</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
                  width: 36, height: 36, borderRadius: 8, border: '2px solid var(--border)',
                  background: 'white', fontSize: 20, cursor: 'pointer', fontWeight: 700
                }}>−</button>
                <span style={{ fontSize: 20, fontWeight: 700, minWidth: 30, textAlign: 'center' }}>{quantity}</span>
                <button type="button" onClick={() => setQuantity(q => q + 1)} style={{
                  width: 36, height: 36, borderRadius: 8, border: '2px solid var(--border)',
                  background: 'white', fontSize: 20, cursor: 'pointer', fontWeight: 700
                }}>+</button>
              </div>
            </div>

            {/* Shipping */}
            <div className="form-group">
              <label style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>ডেলিভারি এলাকা *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { val: 'inside', label: 'ঢাকার ভেতরে', cost: product.shippingInside || 60 },
                  { val: 'outside', label: 'ঢাকার বাইরে', cost: product.shippingOutside || 120 }
                ].map(opt => (
                  <label key={opt.val} onClick={() => setShippingType(opt.val)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '12px', borderRadius: 10, border: '2px solid',
                    borderColor: shippingType === opt.val ? 'var(--primary)' : 'var(--border)',
                    background: shippingType === opt.val ? '#fff5f5' : 'white',
                    cursor: 'pointer', textAlign: 'center'
                  }}>
                    <input type="radio" name="shipping" value={opt.val} checked={shippingType === opt.val}
                      onChange={() => setShippingType(opt.val)} style={{ marginBottom: 4 }} />
                    <span style={{ fontFamily: 'Noto Sans Bengali, sans-serif', fontWeight: 600, fontSize: 14 }}>{opt.label}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>৳{opt.cost}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>বিশেষ নোট (ঐচ্ছিক)</label>
              <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                rows={2} placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..." />
            </div>

            {/* Order Summary */}
            <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 12, fontFamily: 'Noto Sans Bengali, sans-serif' }}>📋 অর্ডার সারাংশ</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                <span>পণ্যের মূল্য ({quantity}x৳{basePrice})</span>
                <strong>৳{basePrice * quantity}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                <span>ডেলিভারি চার্জ</span>
                <strong>৳{shipping}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, borderTop: '2px solid var(--border)', paddingTop: 10, color: 'var(--primary)' }}>
                <span>মোট মূল্য</span>
                <span>৳{total}</span>
              </div>
            </div>

            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '16px', fontSize: 18, fontWeight: 800,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(230,57,70,0.4)',
              fontFamily: 'Noto Sans Bengali, Sora, sans-serif',
              transform: submitting ? 'none' : 'translateY(0)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              {submitting ? '⏳ অর্ডার করা হচ্ছে...' : `✅ অর্ডার করুন - ৳${total}`}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12, fontFamily: 'Noto Sans Bengali, sans-serif' }}>
              🔒 ক্যাশ অন ডেলিভারি • পণ্য হাতে পেয়ে টাকা দিন
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
