import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

// Decode JWT payload (base64url) — no verification needed, just read claims
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return {}
  }
}

// Re-normalize a stored user object (handles old localStorage values)
function normalizeUser(u, token) {
  if (!u) return null

  // Some backends wrap user info: { token, user: { id, email, ... }, roles: [] }
  // Others return flat: { token, id, email, roles: [] }
  const base = u.user ?? u

  // Decode JWT to fill in any missing fields the response body omits
  const jwtClaims = token ? decodeJwt(token) : {}

  // id: try response body first, then JWT claims (sub is often the id or email)
  const idFromResponse = base.id ?? base.userId ?? base.user_id ?? u.id
  const idFromJwt = isNaN(Number(jwtClaims.sub)) ? undefined : Number(jwtClaims.sub)
  const emailFromJwt = isNaN(Number(jwtClaims.sub)) ? jwtClaims.sub : undefined

  const resolvedId = idFromResponse ?? idFromJwt
  const resolvedEmail = base.email || u.email || emailFromJwt || jwtClaims.email || ''

  return {
    ...base,
    id: resolvedId,
    fullName: base.fullName || base.full_name || u.fullName || u.full_name || '',
    email: resolvedEmail,
    // roles may arrive as [{name:'SELLER'}] or ['SELLER'] or [{authority:'ROLE_SELLER'}]
    roles: ((base.roles || u.roles) || []).map((r) => {
      if (typeof r === 'string') return r.replace(/^ROLE_/, '')
      return (r.name || r.authority || '').replace(/^ROLE_/, '')
    }),
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      return stored ? normalizeUser(JSON.parse(stored), token) : null
    } catch {
      return null
    }
  })

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, ...raw } = res.data
    const userData = normalizeUser(raw, token)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { token, ...raw } = res.data
    const userData = normalizeUser(raw, token)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const hasRole = (role) => user?.roles?.includes(role)

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
