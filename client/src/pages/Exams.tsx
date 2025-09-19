import { useEffect, useState } from 'react'
import { listExams } from '../lib/api'
import { Link } from 'react-router-dom'

export default function ExamsPage() {
  const [exams, setExams] = useState<{ id: string; name: string; durationMs: number }[]>([])

  useEffect(() => {
    listExams().then((r) => setExams(r.exams))
  }, [])

  return (
    <div className="container">
      <div className="card">
        <h2>Choose an exam</h2>
        <ul className="list">
          {exams.map((e) => (
            <li key={e.id} className="list-item">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div className="title">{e.name}</div>
                  <div className="sub">{Math.round(e.durationMs / 60000)} min</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <Link to={`/exam/${encodeURIComponent(e.id)}`} className="btn">Open</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 