import api from './axios'
import type { AuthResponse, User } from '../types'

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const register = async (
  email: string,
  password: string,
  username: string,
  name: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', { email, password, username, name })
  return response.data
}

export const getMe = async (): Promise<User> => {
  const response = await api.get('/auth/me')
  return response.data
}

export const updateMe = async (username: string, name: string): Promise<User> => {
  const response = await api.put('/auth/me', { username, name })
  return response.data
}
