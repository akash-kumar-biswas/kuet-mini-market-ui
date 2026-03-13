import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    roles: [],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleRoleChange = (e) => {
    const { value, checked } = e.target
    setForm((f) => ({
      ...f,
      roles: checked
        ? [...f.roles, value]
        : f.roles.filter((r) => r !== value),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.roles.length === 0) {
      setError('Please select at least one role.')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Join KUET Mini Market today</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              value={form.fullName}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder=""
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">I want to (select one or both)</label>
            <div className="role-selector">
              <label className={`role-option ${form.roles.includes('BUYER') ? 'role-option-active' : ''}`}>
                <input
                  type="checkbox"
                  value="BUYER"
                  checked={form.roles.includes('BUYER')}
                  onChange={handleRoleChange}
                />
                <span>🛒 Buy products</span>
              </label>
              <label className={`role-option ${form.roles.includes('SELLER') ? 'role-option-active' : ''}`}>
                <input
                  type="checkbox"
                  value="SELLER"
                  checked={form.roles.includes('SELLER')}
                  onChange={handleRoleChange}
                />
                <span>🏪 Sell products</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
