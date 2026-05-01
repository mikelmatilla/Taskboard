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