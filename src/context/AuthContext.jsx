import { createContext, useCallback, useContext, useState } from 'react'
import { API_ERROR_MESSAGE } from '../utils/api'

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

  const login = useCallback((token, user) => {
    const next = { token, user }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setAuth(next)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }, [])

  const setUser = useCallback((user) => {
    setAuth((prev) => {
      const next = { token: prev?.token, user }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const authFetch = useCallback(async (url, options = {}) => {
    const headers = new Headers(options.headers || {})
    const stored = readStoredAuth()
    if (stored?.token) {
      headers.set('Authorization', `Bearer ${stored.token}`)
    }
    try {
      return await fetch(url, { ...options, headers })
    } catch {
      throw new Error(API_ERROR_MESSAGE)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout, setUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
