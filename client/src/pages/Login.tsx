import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(username, password)
      nav('/exams')
    } catch (err) {
      setError('Invalid credentials')
    } finally {
      setBusy(false)
    }
  }

  function fillAdmin() {
    setUsername('admin'); setPassword('admin123')
  }
  function fillStudent() {
    setUsername('student'); setPassword('student123')
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Sign in</h2>
        <form onSubmit={submit} className="form">
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="input" />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          {error ? <div className="error">{error}</div> : null}
          <button type="submit" className="btn" disabled={busy}>Continue</button>
        </form>
        <div className="row" style={{ marginTop: 12, gap: 8 }}>
          <button className="btn secondary" onClick={fillAdmin} disabled={busy}>Use Admin</button>
          <button className="btn secondary" onClick={fillStudent} disabled={busy}>Use Student</button>
        </div>
      </div>
    </div>
  )
} 