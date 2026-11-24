import { createContext, useCallback, useContext, useState } from 'react'
import { API_ERROR_MESSAGE } from '../utils/api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'rentacarnow_auth'

function decodeTokenPayload(token) {
  try {
    const part = token.split('.')[1]
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = decodeTokenPayload(token)
  if (!payload || typeof payload.exp !== 'number') return true
  return payload.exp * 1000 <= Date.now()
}

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token || isTokenExpired(parsed.token)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    localStorage.removeItem(STORAGE_KEY)
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
      const res = await fetch(url, { ...options, headers })
      if (res.status === 401) {
        localStorage.removeItem(STORAGE_KEY)
        setAuth(null)
      }
      return res
    } catch {
      throw new Error(API_ERROR_MESSAGE)
    }
  }, [setAuth])

  return (
    <AuthContext.Provider value={{ auth, login, logout, setUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
