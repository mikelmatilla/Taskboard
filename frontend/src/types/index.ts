export interface User {
  id: number
  email: string
  username: string
  name: string
}

export interface Project {
  id: number
  name: string
  owner: User
  members: User[]
  creationDate: string
  lastUpdateDate: string
}

export type TaskState = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Task {
  id: number
  name: string
  description: string | null
  state: TaskState
  priority: TaskPriority
  createdBy: User
  assignedTo: User | null
  dueDate: string | null
  creationDate: string
  lastUpdateDate: string
}

export interface AuthResponse {
  token: string
  user: User
}
