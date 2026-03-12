import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/products">🛍️ KUET Mini Market</Link>
      </div>

      <div className="navbar-links">
        <Link to="/products">Products</Link>

        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}>Register</Link>
          </>
        )}

        {user && hasRole('SELLER') && (
          <>
            <Link to="/my-products">My Products</Link>
            <Link to="/products/new">+ Add Product</Link>
            <Link to="/orders/sales">Sales</Link>
          </>
        )}

        {user && hasRole('BUYER') && (
          <>
            <Link to="/cart" className="cart-link">
              Cart
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
            <Link to="/orders/my">My Orders</Link>
          </>
        )}

        {user && hasRole('ADMIN') && (
          <>
            <Link to="/orders/all">All Orders</Link>
            <Link to="/admin/users">Users</Link>
          </>
        )}

        {user && (
          <div className="navbar-user">
            <span className="user-name">
              {user.email}
              {user.roles && (
                <span className="role-badge">
                  {user.roles.map(r => r.charAt(0) + r.slice(1).toLowerCase()).join(' & ')}
                </span>
              )}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
