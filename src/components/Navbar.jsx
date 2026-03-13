import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/login')
  }

  const handleNavLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/products" onClick={handleNavLinkClick}>KUET Mini Market</Link>
      </div>

      <button
        type="button"
        className="navbar-toggle"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? 'x' : '='}
      </button>

      <div className={`navbar-links ${isMenuOpen ? 'navbar-links-open' : ''}`}>
        <Link to="/products" onClick={handleNavLinkClick}>Products</Link>

        {!user && (
          <>
            <Link to="/login" onClick={handleNavLinkClick}>Login</Link>
            <Link to="/register" onClick={handleNavLinkClick} className="btn btn-primary btn-sm" style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}>Register</Link>
          </>
        )}

        {user && hasRole('SELLER') && (
          <>
            <Link to="/my-products" onClick={handleNavLinkClick}>My Products</Link>
            <Link to="/products/new" onClick={handleNavLinkClick}>+ Add Product</Link>
            <Link to="/orders/sales" onClick={handleNavLinkClick}>Sales</Link>
          </>
        )}

        {user && hasRole('BUYER') && (
          <>
            <Link to="/cart" onClick={handleNavLinkClick} className="cart-link">
              Cart
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
            <Link to="/orders/my" onClick={handleNavLinkClick}>My Orders</Link>
          </>
        )}

        {user && hasRole('ADMIN') && (
          <>
            <Link to="/orders/all" onClick={handleNavLinkClick}>All Orders</Link>
            <Link to="/admin/users" onClick={handleNavLinkClick}>Users</Link>
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
