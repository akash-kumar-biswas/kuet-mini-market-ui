import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const STATUSES = ['ACTIVE', 'SOLD_OUT', 'REMOVED']

const emptyForm = {
  title: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  status: 'ACTIVE',
}

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${id}`)
      .then((res) => {
        const { title, description, price, stock, imageUrl, status } = res.data
        setForm({ title, description, price, stock, imageUrl: imageUrl || '', status })
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setFetchLoading(false))
  }, [id, isEdit])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    }
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload)
        navigate('/my-products')
      } else {
        await api.post('/products', payload)
        navigate('/my-products')
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You are not allowed to modify this product.')
      } else {
        setError(err.response?.data?.message || 'Failed to save product.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return <div className="loading page-container">Loading…</div>

  return (
    <div className="page-container">
      <div className="form-card">
        <h2 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={form.title}
              onChange={handleChange}
              placeholder="Product title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input form-textarea"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your product…"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                name="price"
                className="form-input"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input
                type="number"
                name="stock"
                className="form-input"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              name="imageUrl"
              className="form-input"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {isEdit && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-input"
                value={form.status}
                onChange={handleChange}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/products')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
