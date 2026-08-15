import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'rentacarnow_auth'

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth)

  const login = (token, user) => {
    const next = { token, user }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setAuth(next)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }

  const setUser = (user) => {
    const next = { token: auth?.token, user }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setAuth(next)
  }

  const authFetch = async (url, options = {}) => {
    const headers = new Headers(options.headers || {})
    if (auth?.token) {
      headers.set('Authorization', `Bearer ${auth.token}`)
    }
    return fetch(url, { ...options, headers })
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, setUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
