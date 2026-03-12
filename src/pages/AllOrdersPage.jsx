import { useState, useEffect } from 'react'
import api from '../api/axios'

const STATUS_COLORS = {
  PLACED: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
}

export default function AllOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id))

  const filtered = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">All Orders</h1>
        <div className="page-header-right">
          <div className="stats-card">
            <span className="stats-label">Total Orders</span>
            <span className="stats-value">{orders.length}</span>
          </div>
          <div className="stats-card">
            <span className="stats-label">Completed Revenue</span>
            <span className="stats-value">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <select
          className="form-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading && <div className="loading">Loading orders…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">No orders found.</div>
      )}

      <div className="orders-list">
        {filtered.map((order) => (
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
                  {order.status}
                </span>
                <span className="order-total">${Number(order.totalAmount).toFixed(2)}</span>
                <span className="expand-icon">{expanded === order.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === order.id && order.orderItems && (
              <div className="order-items-list">
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
                    {order.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.productTitle || `Product #${item.productId}`}</td>
                        <td>{item.quantity}</td>
                        <td>${Number(item.unitPrice).toFixed(2)}</td>
                        <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
