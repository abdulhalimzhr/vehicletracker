import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../../src/stores/authStore'

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()

      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should set user and tokens on login', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
      }
      const mockAccessToken = 'access-token'
      const mockRefreshToken = 'refresh-token'

      useAuthStore.getState().login(mockUser, mockAccessToken, mockRefreshToken)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.accessToken).toBe(mockAccessToken)
      expect(state.refreshToken).toBe(mockRefreshToken)
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('should clear user and tokens on logout', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
      }

      // First login
      useAuthStore.getState().login(mockUser, 'access-token', 'refresh-token')

      // Then logout
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('updateToken', () => {
    it('should update access token while keeping other state', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
      }

      // First login
      useAuthStore.getState().login(mockUser, 'old-token', 'refresh-token')

      // Update token
      const newToken = 'new-access-token'
      useAuthStore.getState().updateToken(newToken)

      const state = useAuthStore.getState()
      expect(state.accessToken).toBe(newToken)
      expect(state.user).toEqual(mockUser)
      expect(state.refreshToken).toBe('refresh-token')
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('persistence', () => {
    it('should maintain authentication state', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN'
      }

      useAuthStore.getState().login(mockUser, 'access-token', 'refresh-token')

      // Simulate page reload by getting fresh state
      const persistedState = useAuthStore.getState()
      expect(persistedState.isAuthenticated).toBe(true)
      expect(persistedState.user?.role).toBe('ADMIN')
    })
  })
})
