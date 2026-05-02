import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTask } from '../api/tasks'
import type { Task } from '../types'

interface Props {
  task: Task
  projectId: number
  onClose: () => void
}

export default function TaskEditModal({ task, projectId, onClose }: Props) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(task.name)
  const [description, setDescription] = useState(task.description ?? '')

  const updateMutation = useMutation({
    mutationFn: () => updateTask(projectId, task.id, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      onClose()
    },
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit task</h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: '1.2rem' }}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                color: 'var(--text)',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button
              className="btn-primary"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !name.trim()}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
