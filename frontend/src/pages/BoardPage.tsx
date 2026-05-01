import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask, updateTaskState, updateTaskPriority, deleteTask } from '../api/tasks'
import type { Task, TaskState, TaskPriority } from '../types'

const COLUMNS: { state: TaskState; label: string }[] = [
  { state: 'TODO', label: 'To Do' },
  { state: 'IN_PROGRESS', label: 'In Progress' },
  { state: 'DONE', label: 'Done' },
]

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }

export default function BoardPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const id = Number(projectId)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', priority: 'MEDIUM' as TaskPriority })

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => getTasks(id),
  })

  const createMutation = useMutation({
    mutationFn: () => createTask(id, form.name, form.description, form.priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      setForm({ name: '', description: '', priority: 'MEDIUM' })
      setShowForm(false)
    },
  })

  const stateMutation = useMutation({
    mutationFn: ({ taskId, state }: { taskId: number; state: TaskState }) =>
      updateTaskState(id, taskId, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })

  const priorityMutation = useMutation({
    mutationFn: ({ taskId, priority }: { taskId: number; priority: TaskPriority }) =>
        updateTaskPriority(id, taskId, priority),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => deleteTask(id, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name.trim()) createMutation.mutate()
  }

  const getTasksByState = (state: TaskState) =>
    tasks?.filter((t: Task) => t.state === state)
      .sort((a: Task, b: Task) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) ?? []

  return (
    <div className="page">
      <header className="header">
        <div className="header-left">
          <button className="btn-secondary" onClick={() => navigate('/projects')}>← Back</button>
          <h1>Board</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + New Task
        </button>
      </header>

      {showForm && (
        <div className="task-form-bar">
          <form onSubmit={handleCreate} className="inline-form">
            <input
              placeholder="Task name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
              required
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <p style={{ padding: '2rem' }}>Loading...</p>
      ) : (
        <div className="board">
          {COLUMNS.map(({ state, label }) => (
            <div key={state} className="column">
              <div className="column-header">
                <h3>{label}</h3>
                <span className="column-count">{getTasksByState(state).length}</span>
              </div>
              <div className="column-tasks">
                {getTasksByState(state).map((task: Task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                        <select
                        className={`priority priority-${task.priority.toLowerCase()}`}
                        value={task.priority}
                        onChange={(e) => priorityMutation.mutate({
                            taskId: task.id,
                            priority: e.target.value as TaskPriority
                        })}
                        >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        </select>
                        <button
                        className="btn-icon"
                        onClick={() => deleteMutation.mutate(task.id)}
                        >
                        ✕
                        </button>
                    </div>
                    <p className="task-name">{task.name}</p>
                    {task.description && (
                        <p className="task-description">{task.description}</p>
                    )}
                    <div className="task-actions">
                        {state !== 'TODO' && (
                        <button
                            className="btn-move"
                            onClick={() => stateMutation.mutate({
                            taskId: task.id,
                            state: state === 'IN_PROGRESS' ? 'TODO' : 'IN_PROGRESS'
                            })}
                        >
                            ←
                        </button>
                        )}
                        {state !== 'DONE' && (
                        <button
                            className="btn-move"
                            onClick={() => stateMutation.mutate({
                            taskId: task.id,
                            state: state === 'TODO' ? 'IN_PROGRESS' : 'DONE'
                            })}
                        >
                            →
                        </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
