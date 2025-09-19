import { Server } from 'socket.io';

export type ExamTimerPublicState = {
	examId: string;
	running: boolean;
	durationMs: number;
	startedAtMs: number | null;
	pausedRemainingMs: number;
	globalDeltaMs: number;
	perUserDeltaMs: Record<string, number>;
	serverNowMs: number;
	remainingMs: number;
};

type ExamTimerInternal = {
	examId: string;
	durationMs: number;
	running: boolean;
	startedAtMs: number | null;
	pausedRemainingMs: number;
	globalDeltaMs: number;
	perUserDeltaMs: Map<string, number>;
	tick: NodeJS.Timeout | null;
};

export class TimerService {
	private readonly io: Server;
	private readonly timers: Map<string, ExamTimerInternal> = new Map();

	constructor(io: Server) {
		this.io = io;
	}

	getExamRoom(examId: string): string {
		return `exam:${examId}`;
	}

	getExamTimerState(examId: string): ExamTimerPublicState {
		const timer = this.ensureTimer(examId);
		const now = Date.now();
		const remaining = this.computeRemainingMs(timer, now);
		return {
			examId,
			running: timer.running,
			durationMs: timer.durationMs,
			startedAtMs: timer.startedAtMs,
			pausedRemainingMs: timer.pausedRemainingMs,
			globalDeltaMs: timer.globalDeltaMs,
			perUserDeltaMs: Object.fromEntries(timer.perUserDeltaMs.entries()),
			serverNowMs: now,
			remainingMs: remaining
		};
	}

	initializeIfMissing(examId: string, durationMs: number): void {
		const timer = this.ensureTimer(examId);
		if (!timer.running && timer.startedAtMs === null && timer.durationMs === 0 && timer.pausedRemainingMs === 0 && timer.globalDeltaMs === 0 && timer.perUserDeltaMs.size === 0) {
			timer.durationMs = Math.max(0, durationMs);
			timer.pausedRemainingMs = Math.max(0, durationMs);
		}
	}

	startExamTimer(examId: string, durationMs?: number): void {
		const timer = this.ensureTimer(examId, durationMs);
		if (typeof durationMs === 'number' && durationMs >= 0) {
			timer.durationMs = durationMs;
			timer.pausedRemainingMs = durationMs;
		}
		if (timer.running) return;
		timer.running = true;
		timer.startedAtMs = Date.now();
		this.startTick(examId, timer);
		this.broadcastState(examId);
	}

	pauseExamTimer(examId: string): void {
		const timer = this.ensureTimer(examId);
		if (!timer.running) return;
		const now = Date.now();
		timer.pausedRemainingMs = this.computeRemainingMs(timer, now);
		timer.running = false;
		timer.startedAtMs = null;
		this.stopTick(timer);
		this.broadcastState(examId);
	}

	resetExamTimer(examId: string, durationMs?: number): void {
		const timer = this.ensureTimer(examId, durationMs);
		if (typeof durationMs === 'number' && durationMs >= 0) {
			timer.durationMs = durationMs;
		}
		timer.running = false;
		timer.startedAtMs = null;
		timer.pausedRemainingMs = timer.durationMs;
		timer.globalDeltaMs = 0;
		timer.perUserDeltaMs.clear();
		this.stopTick(timer);
		this.broadcastState(examId);
	}

	adjustTime(examId: string, deltaMs: number, userId?: string): void {
		const timer = this.ensureTimer(examId);
		if (!Number.isFinite(deltaMs)) return;
		if (userId) {
			const current = timer.perUserDeltaMs.get(userId) ?? 0;
			timer.perUserDeltaMs.set(userId, current + deltaMs);
		} else {
			timer.globalDeltaMs += deltaMs;
		}
		const now = Date.now();
		const remaining = this.computeRemainingMs(timer, now);
		if (timer.running && remaining <= 0) {
			this.finishExam(examId, timer);
			return;
		}
		this.broadcastState(examId);
	}

	private ensureTimer(examId: string, initialDurationMs?: number): ExamTimerInternal {
		let t = this.timers.get(examId);
		if (!t) {
			const base = typeof initialDurationMs === 'number' ? Math.max(0, initialDurationMs) : 0;
			t = {
				examId,
				durationMs: base,
				running: false,
				startedAtMs: null,
				pausedRemainingMs: base,
				globalDeltaMs: 0,
				perUserDeltaMs: new Map(),
				tick: null
			};
			this.timers.set(examId, t);
		}
		return t;
	}

	private computeRemainingMs(timer: ExamTimerInternal, nowMs: number): number {
		if (timer.running && timer.startedAtMs !== null) {
			const elapsed = nowMs - timer.startedAtMs;
			const base = timer.durationMs + timer.globalDeltaMs - elapsed;
			return Math.max(0, base);
		}
		return Math.max(0, timer.pausedRemainingMs + timer.globalDeltaMs);
	}

	private startTick(examId: string, timer: ExamTimerInternal): void {
		if (timer.tick) return;
		timer.tick = setInterval(() => {
			if (!timer.running) return;
			const now = Date.now();
			const remaining = this.computeRemainingMs(timer, now);
			if (remaining <= 0) {
				this.finishExam(examId, timer);
				return;
			}
			this.broadcastState(examId);
		}, 1000);
	}

	private stopTick(timer: ExamTimerInternal): void {
		if (timer.tick) {
			clearInterval(timer.tick);
			timer.tick = null;
		}
	}

	private finishExam(examId: string, timer: ExamTimerInternal): void {
		timer.running = false;
		timer.startedAtMs = null;
		timer.pausedRemainingMs = 0;
		this.stopTick(timer);
		this.broadcastState(examId);
		this.io.to(this.getExamRoom(examId)).emit('timer_finished', { examId });
	}

	private broadcastState(examId: string): void {
		this.io.to(this.getExamRoom(examId)).emit('timer_state', this.getExamTimerState(examId));
	}
} 