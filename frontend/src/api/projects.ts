import api from './axios'
import type { Project } from '../types'

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects')
  return response.data
}

export const createProject = async (name: string): Promise<Project> => {
  const response = await api.post('/projects', { name })
  return response.data
}

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`/projects/${id}`)
}

export const getProjectById = async (id: number): Promise<Project> => {
  const response = await api.get(`/projects/${id}`)
  return response.data
}

export const addMember = async (projectId: number, memberEmail: string): Promise<Project> => {
  const response = await api.post(`/projects/${projectId}/members`, { email: memberEmail })
  return response.data
}
