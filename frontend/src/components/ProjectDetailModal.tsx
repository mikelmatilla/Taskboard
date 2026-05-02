import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjectById, addMember } from '../api/projects'

interface Props {
  projectId: number
  onClose: () => void
}

export default function ProjectDetailModal({ projectId, onClose }: Props) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  })

  const addMemberMutation = useMutation({
    mutationFn: (memberEmail: string) => addMember(projectId, memberEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setEmail('')
      setError('')
    },
    onError: () => {
      setError('User not found or already a member')
    },
  })

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) addMemberMutation.mutate(email.trim())
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project?.name}</h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: '1.2rem' }}>✕</button>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : project ? (
          <div className="modal-body">
            <h3>Members</h3>
            <div className="members-list">
              <div className="member-row">
                <div className="member-avatar">{project.owner.name[0].toUpperCase()}</div>
                <div>
                  <p className="member-name">{project.owner.name}</p>
                  <p className="member-email">{project.owner.email}</p>
                </div>
                <span className="badge">Owner</span>
              </div>
              {project.members.map((member) => (
                <div key={member.id} className="member-row">
                  <div className="member-avatar">{member.name[0].toUpperCase()}</div>
                  <div>
                    <p className="member-name">{member.name}</p>
                    <p className="member-email">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="invite-section">
              <h3>Invite member</h3>
              <form onSubmit={handleAddMember} className="inline-form">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary" disabled={addMemberMutation.isPending}>
                  {addMemberMutation.isPending ? 'Inviting...' : 'Invite'}
                </button>
              </form>
              {error && <p className="error">{error}</p>}
            </div>

            <div className="invite-section">
              <h3>Details</h3>
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span>{new Date(project.creationDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last updated</span>
                <span>{new Date(project.lastUpdateDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total members</span>
                <span>{project.members.length + 1}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
