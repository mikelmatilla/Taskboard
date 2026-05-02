import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  type DragOverEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getTasks, createTask, updateTaskState, updateTaskPriority, deleteTask } from '../api/tasks'
import type { Task, TaskState, TaskPriority } from '../types'
import ProjectDetailModal from '../components/ProjectDetailModal'

const COLUMNS: { state: TaskState; label: string }[] = [
  { state: 'TODO', label: 'To Do' },
  { state: 'IN_PROGRESS', label: 'In Progress' },
  { state: 'DONE', label: 'Done' },
]

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }

function TaskCard({ task, onDelete, onPriorityChange }: {
  task: Task
  onDelete: (id: number) => void
  onPriorityChange: (id: number, priority: TaskPriority) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="task-card">
      <div className="task-header">
        <select
          className={`priority priority-${task.priority.toLowerCase()}`}
          value={task.priority}
          onChange={(e) => onPriorityChange(task.id, e.target.value as TaskPriority)}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span className="drag-handle" {...listeners} {...attributes}>⠿</span>
          <button className="btn-icon" onClick={() => onDelete(task.id)}>✕</button>
        </div>
      </div>
      <p className="task-name">{task.name}</p>
      {task.description && <p className="task-description">{task.description}</p>}
    </div>
  )
}

function DroppableColumn({ state, label, tasks, onDelete, onPriorityChange }: {
  state: TaskState
  label: string
  tasks: Task[]
  onDelete: (id: number) => void
  onPriorityChange: (id: number, priority: TaskPriority) => void
}) {
  const { setNodeRef } = useDroppable({ id: state })

  return (
    <div className="column">
      <div className="column-header">
        <h3>{label}</h3>
        <span className="column-count">{tasks.length}</span>
      </div>
      <SortableContext
        items={tasks.map((t: Task) => t.id)}
        strategy={verticalListSortingStrategy}
        id={state}
      >
        <div
          ref={setNodeRef}
          className="column-tasks"
          style={{
            minHeight: '200px',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
        >
          {tasks.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onPriorityChange={onPriorityChange}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export default function BoardPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const id = Number(projectId)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', priority: 'MEDIUM' as TaskPriority })
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const lastMutatedRef = useRef<{ taskId: number; state: TaskState } | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }))

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

  const handleDragStart = (event: any) => {
    const task = event.active.data.current?.task
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const taskId = active.id as number
    const overId = over.id as string

    const isColumn = COLUMNS.some(col => col.state === overId)
    const newState = isColumn
      ? (overId as TaskState)
      : tasks?.find((t: Task) => t.id === Number(overId))?.state

    if (!newState) return

    if (
      lastMutatedRef.current?.taskId === taskId &&
      lastMutatedRef.current?.state === newState
    ) return

    const task = tasks?.find((t: Task) => t.id === taskId)
    if (task && task.state !== newState) {
      lastMutatedRef.current = { taskId, state: newState }
      stateMutation.mutate({ taskId, state: newState })
    }
  }

  const handleDragEnd = () => {
    setActiveTask(null)
    lastMutatedRef.current = null
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-left">
          <button className="btn-secondary" onClick={() => navigate('/projects')}>← Back</button>
          <h1>Board</h1>
        </div>
        <div className="header-right">
          <button
            className="btn-icon"
            onClick={() => setShowDetail(true)}
            title="Project details"
            style={{ fontSize: '1.5rem' }}
          >
            ⚙
          </button>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            + New Task
          </button>
        </div>
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
              <option value="HIGH">HIGH</option>
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
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="board">
            {COLUMNS.map(({ state, label }) => (
              <DroppableColumn
                key={state}
                state={state}
                label={label}
                tasks={getTasksByState(state)}
                onDelete={(taskId) => deleteMutation.mutate(taskId)}
                onPriorityChange={(taskId, priority) =>
                  priorityMutation.mutate({ taskId, priority })
                }
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="task-card" style={{ opacity: 0.9, cursor: 'grabbing', transform: 'rotate(2deg)' }}>
                <p className="task-name">{activeTask.name}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
      {showDetail && (
        <ProjectDetailModal
          projectId={id}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  )
}
