import { useState, useEffect } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'

export default function ProductsPage() {
  const { user, hasRole } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  // SELLERs default to ALL so they can see their own SOLD_OUT/REMOVED products
  const [statusFilter, setStatusFilter] = useState(
    () => (hasRole('SELLER') || hasRole('ADMIN')) ? 'ALL' : 'ACTIVE'
  )

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/products')
      setProducts(res.data)
    } catch {
      setError('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts((p) => p.filter((x) => x.id !== id))
    } catch {
      alert('Failed to delete product.')
    }
  }

  const filtered = products
    .filter((p) => {
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
      const matchesSearch = search === '' || p.title.toLowerCase().startsWith(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <div className="filters">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SOLD_OUT">Sold Out</option>
            <option value="REMOVED">Removed</option>
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading products…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">No products found.</div>
      )}

      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={(hasRole('SELLER') || hasRole('ADMIN')) ? handleDelete : undefined}
          />
        ))}
      </div>
    </div>
  )
}
