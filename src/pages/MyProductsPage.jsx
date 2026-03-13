import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const STATUS_LABELS = {
  ACTIVE: { label: 'Available', cls: 'badge-success' },
  SOLD_OUT: { label: 'Sold Out', cls: 'badge-warning' },
  REMOVED: { label: 'Removed', cls: 'badge-danger' },
}

export default function MyProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/products/my')
      .then((res) => setProducts(res.data))
      .catch(() => setError('Failed to load your products.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      if (err.response?.status === 403) {
        alert('You can only delete your own products.')
      } else {
        alert('Failed to delete product.')
      }
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Products</h1>
        <Link to="/products/new" className="btn btn-primary">+ Add New Product</Link>
      </div>

      {loading && <div className="loading">Loading your products…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <p>You haven't added any products yet.</p>
          <Link to="/products/new" className="btn btn-primary">Add Your First Product</Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const status = STATUS_LABELS[p.status] || { label: p.status, cls: 'badge-default' }
                return (
                  <tr key={p.id}>
                    <td>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: 56, height: 56, background: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#94a3b8' }}>No img</div>
                      )}
                    </td>
                    <td>
                      <Link to={`/products/${p.id}`} style={{ fontWeight: 600 }}>{p.title}</Link>
                      {p.description && (
                        <div className="product-table-desc">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${Number(p.price).toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/products/${p.id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
