import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { TimerService } from './timer/TimerService';
import { authenticateToken, findUserByCredentials, requireAdmin, signToken } from './auth';
import { EXAMS } from './exams';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

const timerService = new TimerService(io);

app.get('/health', (_: Request, res: Response) => {
	res.json({ ok: true });
});

app.post('/auth/login', (req: Request, res: Response) => {
	const { username, password } = req.body as { username?: string; password?: string };
	if (!username || !password) return res.status(400).json({ ok: false, error: 'username and password are required' });
	const user = findUserByCredentials(username, password);
	if (!user) return res.status(401).json({ ok: false, error: 'invalid credentials' });
	const token = signToken(user);
	res.json({ ok: true, token, user });
});

app.get('/me', authenticateToken as any, (req: any, res: Response) => {
	res.json({ ok: true, user: req.user });
});

app.get('/exams', (_: Request, res: Response) => {
	res.json({ ok: true, exams: EXAMS });
});

app.get('/exams/:examId', (req: Request, res: Response) => {
	const { examId } = req.params;
	const exam = EXAMS.find(e => e.id === examId);
	if (!exam) return res.status(404).json({ ok: false, error: 'exam not found' });
	res.json({ ok: true, exam });
});

app.get('/exams/:examId/timer', (req: Request, res: Response) => {
	const { examId } = req.params;
	const exam = EXAMS.find(e => e.id === examId);
	if (exam) timerService.initializeIfMissing(examId, exam.durationMs);
	const state = timerService.getExamTimerState(examId);
	res.json(state);
});

app.post('/exams/:examId/timer/start', authenticateToken as any, requireAdmin as any, (req: Request, res: Response) => {
	const { examId } = req.params;
	let { durationMs } = req.body as { durationMs?: number };
	if (typeof durationMs !== 'number') {
		const exam = EXAMS.find(e => e.id === examId);
		durationMs = exam?.durationMs ?? 0;
	}
	try {
		timerService.startExamTimer(examId, durationMs);
		res.json({ ok: true });
	} catch (err: any) {
		res.status(400).json({ ok: false, error: err?.message ?? 'start failed' });
	}
});

app.post('/exams/:examId/timer/pause', authenticateToken as any, requireAdmin as any, (req: Request, res: Response) => {
	const { examId } = req.params;
	timerService.pauseExamTimer(examId);
	res.json({ ok: true });
});

app.post('/exams/:examId/timer/reset', authenticateToken as any, requireAdmin as any, (req: Request, res: Response) => {
	const { examId } = req.params;
	const { durationMs } = req.body as { durationMs?: number };
	timerService.resetExamTimer(examId, durationMs);
	res.json({ ok: true });
});

app.post('/exams/:examId/timer/adjust', authenticateToken as any, requireAdmin as any, (req: Request, res: Response) => {
	const { examId } = req.params;
	const { deltaMs, userId } = req.body as { deltaMs: number; userId?: string };
	if (typeof deltaMs !== 'number') {
		return res.status(400).json({ ok: false, error: 'deltaMs is required' });
	}
	timerService.adjustTime(examId, deltaMs, userId);
	res.json({ ok: true });
});

io.on('connection', (socket) => {
	socket.on('join_exam', ({ examId, userId }: { examId: string; userId?: string }) => {
		if (!examId) return;
		const newRoom = timerService.getExamRoom(examId);
		for (const room of socket.rooms) {
			if (room.startsWith('exam:') && room !== newRoom) {
				socket.leave(room);
			}
		}
		const exam = EXAMS.find(e => e.id === examId);
		if (exam) timerService.initializeIfMissing(examId, exam.durationMs);
		socket.join(newRoom);
		socket.data.examId = examId;
		socket.data.userId = userId;
		const state = timerService.getExamTimerState(examId);
		socket.emit('timer_state', state);
	});

	socket.on('disconnect', () => {
		/* no-op */
	});
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
}); 