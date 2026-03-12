import { useState, useEffect } from 'react'
import api from '../api/axios'

const STATUS_COLORS = {
  PLACED: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
}

function getStatusLabel(order) {
  if (order.status === 'CANCELLED' && order.cancelledBy === 'SELLER') {
    return 'Seller Cancelled'
  }
  return order.status
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    api.get('/orders/my')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id))

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    setActionLoading(id)
    try {
      const res = await api.patch(`/orders/${id}/cancel`)
      setOrders((prev) => prev.map((o) => o.id === id ? res.data : o))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">My Orders</h1>

      {loading && <div className="loading">Loading orders…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">You haven't placed any orders yet.</div>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div
              className="order-card-header"
              onClick={() => toggleExpand(order.id)}
            >
              <div className="order-meta">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="order-meta-right">
                <span className={`badge ${STATUS_COLORS[order.status] || 'badge-default'}`}>
                  {getStatusLabel(order)}
                </span>
                <span className="order-total">${Number(order.totalAmount).toFixed(2)}</span>
                <span className="expand-icon">{expanded === order.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === order.id && (
              <div className="order-items-list">
                {order.items && (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.productTitle || `Product #${item.productId}`}</td>
                          <td>{item.quantity}</td>
                          <td>${Number(item.unitPrice).toFixed(2)}</td>
                          <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {order.status === 'PLACED' && (
                  <div style={{ padding: '12px 0 4px' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={actionLoading === order.id}
                      onClick={() => handleCancel(order.id)}
                    >
                      {actionLoading === order.id ? '…' : 'Cancel Order'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
