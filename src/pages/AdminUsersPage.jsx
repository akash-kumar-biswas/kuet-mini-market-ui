import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    api.get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (user) => {
    const action = user.enabled ? 'deactivate' : 'activate'
    setActionLoading(user.id)
    try {
      await api.patch(`/admin/users/${user.id}/${action}`)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, enabled: !u.enabled } : u
        )
      )
    } catch {
      alert(`Failed to ${action} user.`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <div className="stats-card">
          <span className="stats-label">Total Users</span>
          <span className="stats-value">{users.length}</span>
        </div>
      </div>

      {loading && <div className="loading">Loading users…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && users.length === 0 && (
        <div className="empty-state">No users found.</div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <div className="role-tags">
                      {user.roles?.map((r) => (
                        <span key={r} className="role-tag">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.enabled ? 'badge-success' : 'badge-danger'}`}>
                      {user.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${user.enabled ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggle(user)}
                      disabled={actionLoading === user.id}
                    >
                      {actionLoading === user.id
                        ? '…'
                        : user.enabled
                        ? 'Deactivate'
                        : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
