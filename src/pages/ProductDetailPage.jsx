import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const STATUS_LABELS = {
  ACTIVE: { label: 'Available', cls: 'badge-success' },
  SOLD_OUT: { label: 'Sold Out', cls: 'badge-warning' },
  REMOVED: { label: 'Removed', cls: 'badge-danger' },
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [addedMsg, setAddedMsg] = useState('')

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      navigate('/products')
    } catch {
      alert('Failed to delete product.')
    }
  }

  const handleAddToCart = () => {
    addToCart(product, qty)
    setAddedMsg(`${qty} × "${product.title}" added to cart!`)
    setTimeout(() => setAddedMsg(''), 3000)
  }

  if (loading) return <div className="loading page-container">Loading…</div>
  if (error) return <div className="page-container"><div className="alert alert-danger">{error}</div></div>

  const productSellerId = product.sellerId ?? product.seller?.id
  const isSeller = hasRole('SELLER') && (
    productSellerId == null
      ? true
      : String(user?.id) === String(productSellerId)
  )
  const isAdmin = hasRole('ADMIN')
  const status = STATUS_LABELS[product.status] || { label: product.status, cls: 'badge-default' }

  return (
    <div className="page-container">
      <Link to="/products" className="back-link">← Back to Products</Link>

      <div className="product-detail">
        <div className="product-detail-img-wrap">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className="product-detail-img" />
          ) : (
            <div className="product-detail-no-img">No Image</div>
          )}
        </div>

        <div className="product-detail-info">
          <div className="product-detail-header">
            <h1 className="product-detail-title">{product.title}</h1>
            <span className={`badge ${status.cls}`}>{status.label}</span>
          </div>

          <p className="product-detail-desc">{product.description}</p>

          <div className="product-detail-meta">
            <div className="meta-item">
              <span className="meta-label">Price</span>
              <span className="product-price-lg">${Number(product.price).toFixed(2)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Stock</span>
              <span>{product.stock} units</span>
            </div>
          </div>

          {addedMsg && <div className="alert alert-success">{addedMsg}</div>}

          <div className="product-detail-actions">
            {hasRole('BUYER') && product.status === 'ACTIVE' && product.stock > 0 &&
             String(user?.id) !== String(productSellerId) && (
              <div className="qty-row">
                <label className="form-label">Qty:</label>
                <input
                  type="number"
                  className="form-input qty-input"
                  min={1}
                  max={product.stock}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                />
                <button className="btn btn-primary" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              </div>
            )}

            {(isSeller || isAdmin) && (
              <div className="seller-actions">
                {isSeller && (
                  <Link to={`/products/${id}/edit`} className="btn btn-outline">
                    Edit Product
                  </Link>
                )}
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
