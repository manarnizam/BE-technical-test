import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, me as apiMe, setAuthToken, type User } from '../lib/api'

export type AuthContextType = {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))

  useEffect(() => {
    setAuthToken(token)
    if (token) localStorage.setItem('auth_token', token)
    else localStorage.removeItem('auth_token')
  }, [token])

  useEffect(() => {
    if (!token) return
    apiMe().then((r) => setUser(r.user)).catch(() => setUser(null))
  }, [token])

  async function login(username: string, password: string) {
    const r = await apiLogin(username, password)
    setToken(r.token)
    setUser(r.user)
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ user, token, login, logout }), [user, token])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
} 