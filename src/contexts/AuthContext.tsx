import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { apiService } from '@/services/api'

interface User {
  id: number
  email: string
  full_name: string
  level: string
  language: string
  verified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiService.getMe()
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiService.login(email, password)
    if (response.success && response.data) {
      await refreshUser()
      return { success: true, message: response.message }
    }
    return { success: false, message: response.message || 'Invalid email or password' }
  }, [refreshUser])

  const logout = useCallback(async () => {
    await apiService.logout()
    setUser(null)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const response = await apiService.register(email, password, name)
    if (response.success) {
      return { success: true, message: response.message }
    }
    return { success: false, message: response.message || 'Registration failed' }
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refreshUser,
  }), [user, isLoading, login, logout, register, refreshUser])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
