export type Exam = { id: string; name: string; durationMs: number };

export const EXAMS: Exam[] = [
	{ id: 'exam-1', name: 'OSCE Mock 1', durationMs: 60 * 60 * 1000 },
	{ id: 'exam-2', name: 'Operative Dentistry Quiz', durationMs: 45 * 60 * 1000 },
	{ id: 'exam-3', name: 'Prosthodontics Final', durationMs: 120 * 60 * 1000 },
]; 