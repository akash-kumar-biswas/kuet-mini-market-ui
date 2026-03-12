import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../api/axios'
import { useState } from 'react'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (items.length === 0) return
    setError('')
    setLoading(true)
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      })
      clearCart()
      navigate('/orders/my')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
        <h1 className="page-title">Your Cart</h1>
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Your Cart</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.productId} className="cart-item">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="cart-item-img" />
              ) : (
                <div className="cart-item-img cart-item-no-img" />
              )}

              <div className="cart-item-info">
                <h3 className="cart-item-title">{item.title}</h3>
                <span className="cart-item-price">${Number(item.price).toFixed(2)} each</span>
              </div>

              <div className="cart-item-qty">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >−</button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >+</button>
              </div>

              <span className="cart-item-subtotal">
                ${(item.price * item.quantity).toFixed(2)}
              </span>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeFromCart(item.productId)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Placing Order…' : 'Place Order'}
          </button>
          <button
            className="btn btn-outline btn-block"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
