import { useState, useEffect } from 'react'
import api from '../api/axios'

const STATUS_COLORS = {
  PLACED: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
}

function getStatusLabel(order) {
  if (order.status === 'CANCELLED' && order.cancelledBy === 'BUYER') {
    return 'Buyer Cancelled'
  }
  return order.status
}

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    api.get('/orders/sales')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Failed to load sales orders.'))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id))

  const handleComplete = async (id) => {
    setActionLoading(id + '-complete')
    try {
      const res = await api.patch(`/orders/${id}/complete`)
      setOrders((prev) => prev.map((o) => o.id === id ? res.data : o))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete order.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return
    setActionLoading(id + '-cancel')
    try {
      const res = await api.patch(`/orders/${id}/cancel`)
      setOrders((prev) => prev.map((o) => o.id === id ? res.data : o))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.')
    } finally {
      setActionLoading(null)
    }
  }

  // Revenue = only COMPLETED orders
  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Sales Orders</h1>
        <div className="stats-card">
          <span className="stats-label">Completed Revenue</span>
          <span className="stats-value">${totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {loading && <div className="loading">Loading sales…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">No sales orders yet.</div>
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
                {order.buyerName && (
                  <span className="order-buyer">by {order.buyerName}</span>
                )}
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
                  <div className="order-inline-actions">
                    <button
                      className="btn btn-success btn-sm"
                      disabled={actionLoading === order.id + '-complete'}
                      onClick={() => handleComplete(order.id)}
                    >
                      {actionLoading === order.id + '-complete' ? '…' : 'Mark Complete'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={actionLoading === order.id + '-cancel'}
                      onClick={() => handleCancel(order.id)}
                    >
                      {actionLoading === order.id + '-cancel' ? '…' : 'Cancel Order'}
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
