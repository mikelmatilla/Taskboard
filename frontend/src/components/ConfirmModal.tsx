interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirm</h2>
          <button className="btn-icon" onClick={onCancel} style={{ fontSize: '1.2rem' }}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{message}</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-danger" style={{ padding: '0.55rem 1.2rem' }} onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}