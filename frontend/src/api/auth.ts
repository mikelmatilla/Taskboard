import api from './axios'
import type { AuthResponse } from '../types'

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
