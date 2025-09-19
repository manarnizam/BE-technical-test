import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Timer } from '../components/Timer'
import { AdminPanel } from '../components/AdminPanel'
import { resetTimer } from '../lib/api'

export default function ExamPage() {
  const { examId = '' } = useParams()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (user?.role !== 'admin') return
    function handleBeforeUnload() {
      resetTimer(examId).catch(() => {})
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [examId, user])

  async function handleLogout() {
    if (user?.role === 'admin') {
      try { await resetTimer(examId) } catch {}
    }
    logout()
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="row" style={{ gap: 8 }}>
          <div className="avatar">{user?.name?.[0] ?? '?'}</div>
          <div>
            <div className="title">{user?.name}</div>
            <div className="sub">{user?.role}</div>
          </div>
        </div>
        <button className="btn secondary" onClick={handleLogout}>Logout</button>
      </div>

      <div className="card" style={{ alignItems: 'center' }}>
        <h2>Exam: {examId}</h2>
        <div style={{ marginTop: 12 }}>
          <Timer examId={examId} userId={user?.id} />
        </div>
      </div>

      {user?.role === 'admin' ? (
        <div className="card">
          <h3>Admin Controls</h3>
          <AdminPanel examId={examId} />
        </div>
      ) : null}
    </div>
  )
} 