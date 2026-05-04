import api from './axios'
import type { Task, TaskPriority, TaskState } from '../types'

export const getTasks = async (projectId: number): Promise<Task[]> => {
  const response = await api.get(`/projects/${projectId}/tasks`)
  return response.data
}

export const createTask = async (
  projectId: number,
  name: string,
  description: string,
  priority: TaskPriority
): Promise<Task> => {
  const response = await api.post(`/projects/${projectId}/tasks`, {
    name,
    description,
    priority,
  })
  return response.data
}

export const updateTaskState = async (
  projectId: number,
  taskId: number,
  state: TaskState
): Promise<Task> => {
  const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/state`, { state })
  return response.data
}

export const updateTaskPriority = async (
  projectId: number,
  taskId: number,
  priority: TaskPriority
): Promise<Task> => {
  const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/priority`, { priority })
  return response.data
}

export const deleteTask = async (projectId: number, taskId: number): Promise<void> => {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`)
}

export const updateTask = async (
  projectId: number,
  taskId: number,
  name: string,
  description: string
): Promise<Task> => {
  const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, {
    name,
    description,
  })
  return response.data
}
