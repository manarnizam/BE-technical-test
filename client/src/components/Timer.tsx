import { useEffect, useMemo, useState } from 'react'
import type { ExamTimerPublicState } from '../lib/socket'
import { joinExam, socket } from '../lib/socket'

function formatMs(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function Timer({ examId, userId }: { examId: string; userId?: string }) {
  const [state, setState] = useState<ExamTimerPublicState | null>(null)
  const [now, setNow] = useState<number>(Date.now())

  useEffect(() => {
    joinExam(examId, userId)
    const onState = (s: ExamTimerPublicState) => { if (s.examId === examId) setState(s) }
    const onFinished = (p?: { examId: string }) => { if (!p || p.examId === examId) setState((prev) => (prev ? { ...prev, running: false, remainingMs: 0 } : prev)) }
    socket.on('timer_state', onState)
    socket.on('timer_finished', onFinished)
    return () => {
      socket.off('timer_state', onState)
      socket.off('timer_finished', onFinished)
    }
  }, [examId, userId])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [])

  const displayMs = useMemo(() => {
    if (!state) return 0
    const userDelta = userId ? (state.perUserDeltaMs[userId] || 0) : 0
    const baseRemaining = state.remainingMs + userDelta
    if (!state.running) return Math.max(0, baseRemaining)
    const drift = now - state.serverNowMs
    return Math.max(0, baseRemaining - drift)
  }, [state, now, userId])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, gap: 12 }}>
      <span>{formatMs(displayMs)}</span>
      {state?.running ? <span style={{ fontSize: 16, color: '#10b981' }}>running</span> : <span style={{ fontSize: 16, color: '#ef4444' }}>paused</span>}
    </div>
  )
} 