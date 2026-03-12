import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const STATUS_LABELS = {
  ACTIVE: { label: 'Available', cls: 'badge-success' },
  SOLD_OUT: { label: 'Sold Out', cls: 'badge-warning' },
  REMOVED: { label: 'Removed', cls: 'badge-danger' },
}

export default function ProductCard({ product, onDelete }) {
  const { user, hasRole } = useAuth()
  const { addToCart } = useCart()

  const status = STATUS_LABELS[product.status] || { label: product.status, cls: 'badge-default' }
  // Handle multiple possible backend field shapes:
  // flat sellerId, nested seller.id, or completely absent (backend will enforce 403)
  const productSellerId = product.sellerId ?? product.seller?.id
  const isSeller = hasRole('SELLER') && (
    productSellerId == null
      ? true  // can't determine ownership; show button; backend enforces
      : String(user?.id) === String(productSellerId)
  )
  const isAdmin = hasRole('ADMIN')

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-img-link">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} className="product-card-img" />
        ) : (
          <div className="product-card-img product-card-no-img">No Image</div>
        )}
      </Link>

      <div className="product-card-body">
        <div className="product-card-header">
          <h3 className="product-card-title">
            <Link to={`/products/${product.id}`}>{product.title}</Link>
          </h3>
          <span className={`badge ${status.cls}`}>{status.label}</span>
        </div>

        <p className="product-card-desc">{product.description}</p>

        <div className="product-card-footer">
          <span className="product-price">${Number(product.price).toFixed(2)}</span>
          <span className="product-stock">Stock: {product.stock}</span>
        </div>

        <div className="product-card-actions">
          {hasRole('BUYER') && product.status === 'ACTIVE' && product.stock > 0 &&
           String(user?.id) !== String(productSellerId) && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          )}
          {isSeller && (
            <Link to={`/products/${product.id}/edit`} className="btn btn-outline btn-sm">
              Edit
            </Link>
          )}
          {(isSeller || isAdmin) && onDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(product.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
