import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/services/api'

interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  is_email_verified: boolean
  created_at: string
  last_login: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  refreshAccessToken: () => Promise<void>
}

interface RegisterData {
  email: string
  username: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/v1/login/', {
            email,
            password,
          })
          
          const { user, access, refresh } = response.data
          
          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          })
          
          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`
          
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        
        // Remove authorization header
        delete api.defaults.headers.common['Authorization']
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/v1/register/', userData)
          
          const { user, access, refresh } = response.data
          
          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          })
          
          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`
          
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          get().logout()
          return
        }

        try {
          const response = await api.post('/auth/v1/refresh/', {
            refresh: refreshToken,
          })
          
          const { access } = response.data
          
          set({
            accessToken: access,
          })
          
          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`
          
        } catch (error) {
          get().logout()
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
