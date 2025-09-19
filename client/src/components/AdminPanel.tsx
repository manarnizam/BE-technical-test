import { useState } from 'react'
import { adjustTime, pauseTimer, resetTimer, startTimer } from '../lib/api'

export function AdminPanel({ examId }: { examId: string }) {
  const [startMinutes, setStartMinutes] = useState<string>('60')
  const [resetMinutes, setResetMinutes] = useState<string>('60')
  const [userId, setUserId] = useState<string>('')
  const [adjustMinutes, setAdjustMinutes] = useState<string>('1')
  const [busy, setBusy] = useState<boolean>(false)

  async function handleStart() {
    setBusy(true)
    try {
      const ms = Math.max(0, Math.floor(Number(startMinutes) * 60 * 1000))
      await startTimer(examId, ms)
    } finally {
      setBusy(false)
    }
  }

  async function handlePause() {
    setBusy(true)
    try {
      await pauseTimer(examId)
    } finally {
      setBusy(false)
    }
  }

  async function handleReset() {
    setBusy(true)
    try {
      const ms = Math.max(0, Math.floor(Number(resetMinutes) * 60 * 1000))
      await resetTimer(examId, ms)
    } finally {
      setBusy(false)
    }
  }

  async function handleAdjust(sign: 1 | -1) {
    setBusy(true)
    try {
      const delta = Math.floor(Number(adjustMinutes) * 60 * 1000) * sign
      await adjustTime(examId, delta, userId.trim() || undefined)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12, maxWidth: 520 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="number" min="0" value={startMinutes} onChange={(e) => setStartMinutes(e.target.value)} style={{ width: 100 }} />
        <span>min</span>
        <button onClick={handleStart} disabled={busy}>Start</button>
        <button onClick={handlePause} disabled={busy}>Pause</button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="number" min="0" value={resetMinutes} onChange={(e) => setResetMinutes(e.target.value)} style={{ width: 100 }} />
        <span>min</span>
        <button onClick={handleReset} disabled={busy}>Reset</button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input placeholder="userId (optional)" value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: 180 }} />
        <input type="number" value={adjustMinutes} onChange={(e) => setAdjustMinutes(e.target.value)} style={{ width: 100 }} />
        <span>min</span>
        <button onClick={() => handleAdjust(1)} disabled={busy}>+ Add</button>
        <button onClick={() => handleAdjust(-1)} disabled={busy}>- Subtract</button>
        <button onClick={() => { setAdjustMinutes('1'); handleAdjust(1) }} disabled={busy}>+1m</button>
        <button onClick={() => { setAdjustMinutes('1'); handleAdjust(-1) }} disabled={busy}>-1m</button>
      </div>
    </div>
  )
} 