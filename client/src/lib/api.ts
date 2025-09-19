import axios from 'axios'

export type Role = 'admin' | 'student'
export type User = { id: string; username: string; name: string; role: Role }

export function setAuthToken(token: string | null) {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete axios.defaults.headers.common['Authorization']
}

export async function login(username: string, password: string) {
  const { data } = await axios.post('/auth/login', { username, password })
  return data as { ok: boolean; token: string; user: User }
}

export async function me() {
  const { data } = await axios.get('/me')
  return data as { ok: boolean; user: User }
}

export async function listExams() {
  const { data } = await axios.get('/exams')
  return data as { ok: boolean; exams: { id: string; name: string; durationMs: number }[] }
}

export async function getTimer(examId: string) {
  const { data } = await axios.get(`/exams/${encodeURIComponent(examId)}/timer`)
  return data
}

export async function startTimer(examId: string, durationMs: number) {
  const { data } = await axios.post(`/exams/${encodeURIComponent(examId)}/timer/start`, { durationMs })
  return data
}

export async function pauseTimer(examId: string) {
  const { data } = await axios.post(`/exams/${encodeURIComponent(examId)}/timer/pause`)
  return data
}

export async function resetTimer(examId: string, durationMs?: number) {
  const payload: any = {}
  if (typeof durationMs === 'number') payload.durationMs = durationMs
  const { data } = await axios.post(`/exams/${encodeURIComponent(examId)}/timer/reset`, payload)
  return data
}

export async function adjustTime(examId: string, deltaMs: number, userId?: string) {
  const { data } = await axios.post(`/exams/${encodeURIComponent(examId)}/timer/adjust`, { deltaMs, userId })
  return data
} 