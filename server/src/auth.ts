import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type Role = 'admin' | 'student';
export type User = { id: string; username: string; name: string; role: Role };

type UserWithPassword = User & { password: string };

const USERS: UserWithPassword[] = [
	{ id: 'admin-1', username: 'admin', name: 'Admin', role: 'admin', password: 'admin123' },
	{ id: 'student-1', username: 'student', name: 'Student', role: 'student', password: 'student123' },
];

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-prepx';

export function findUserByCredentials(username: string, password: string): User | null {
	const u = USERS.find((x) => x.username === username && x.password === password);
	if (!u) return null;
	const { password: _p, ...user } = u;
	return user;
}

export function signToken(user: User): string {
	return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): User | null {
	try {
		return jwt.verify(token, JWT_SECRET) as User;
	} catch {
		return null;
	}
}

export function authenticateToken(req: Request & { user?: User }, res: Response, next: NextFunction) {
	const authHeader = req.headers['authorization'];
	if (!authHeader) return res.status(401).json({ ok: false, error: 'missing authorization header' });
	const [scheme, token] = authHeader.split(' ');
	if (scheme !== 'Bearer' || !token) return res.status(401).json({ ok: false, error: 'invalid authorization header' });
	const user = verifyToken(token);
	if (!user) return res.status(401).json({ ok: false, error: 'invalid token' });
	req.user = user;
	next();
}

export function requireAdmin(req: Request & { user?: User }, res: Response, next: NextFunction) {
	if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok: false, error: 'admin only' });
	next();
} 