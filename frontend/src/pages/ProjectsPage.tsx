import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getProjects, createProject, deleteProject } from '../api/projects'
import { useAuthStore } from '../store/authStore'
import ProjectDetailModal from '../components/ProjectDetailModal'
import ConfirmModal from '../components/ConfirmModal'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()

  const [newProjectName, setNewProjectName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [confirmProjectId, setConfirmProjectId] = useState<number | null>(null)

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => createProject(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setNewProjectName('')
      setShowForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (newProjectName.trim()) {
      createMutation.mutate(newProjectName.trim())
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)

  return (
    <div className="page">
      <header className="header">
        <h1>Taskboard</h1>
        <div className="header-right">
          <span className="header-user">{user?.name}</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <main className="main">
        <div className="page-title-row">
          <h2>My Projects</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            + New Project
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="inline-form">
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              autoFocus
            />
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        )}

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="projects-grid">
            {projects?.map((project) => (
              <div key={project.id} className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
                <button
                  className="btn-icon card-settings"
                  style={{ fontSize: '1.5rem' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedProjectId(project.id)
                  }}
                  title="Project details"
                >
                  ⚙
                </button>
                <h3>{project.name}</h3>
                <p>{project.members.length +1} members</p>  
                <button
                  className="btn-danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmProjectId(project.id)
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
            {projects?.length === 0 && (
              <div className="empty-state">
                <p>No projects yet</p>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  Create your first project
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
        />
      )}
      {confirmProjectId && (
        <ConfirmModal
          message="Are you sure you want to delete this project? All tasks will be deleted too."
          onConfirm={() => {
            deleteMutation.mutate(confirmProjectId)
            setConfirmProjectId(null)
          }}
          onCancel={() => setConfirmProjectId(null)}
        />
      )}
    </div>
  )
}
