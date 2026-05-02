import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateMe } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, setAuth, token, logout } = useAuthStore()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    username: user?.username ?? '',
  })
  const [success, setSuccess] = useState(false)

  const updateMutation = useMutation({
    mutationFn: () => updateMe(form.username, form.name),
    onSuccess: (updatedUser) => {
      setAuth(updatedUser, token!)
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name.trim() && form.username.trim()) {
      updateMutation.mutate()
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-left">
          <button className="btn-secondary" onClick={() => navigate('/projects')}>← Back</button>
          <h1>Taskboard</h1>
        </div>
      </header>

      <main className="main">
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.75rem' }}>
            My Profile
          </h2>

          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="member-avatar" style={{ width: 56, height: 56, fontSize: '1.3rem' }}>
                {user?.name[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={user?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>

              {success && (
                <p style={{
                  color: 'var(--success)',
                  background: 'var(--success-light)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '0.75rem'
                }}>
                  Profile updated successfully
                </p>
              )}

              <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>

          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Account
            </h3>
            <button className="btn-danger" style={{ padding: '0.55rem 1.2rem' }} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
