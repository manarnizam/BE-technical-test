import { io } from 'socket.io-client'

export type ExamTimerPublicState = {
  examId: string
  running: boolean
  durationMs: number
  startedAtMs: number | null
  pausedRemainingMs: number
  globalDeltaMs: number
  perUserDeltaMs: Record<string, number>
  serverNowMs: number
  remainingMs: number
}

export const socket = io('/', {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
})

export function joinExam(examId: string, userId?: string) {
  socket.emit('join_exam', { examId, userId })
}
