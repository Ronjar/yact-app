import { Server } from 'socket.io';
import { sessions, users, shares } from './store.js';
import { parseAuthCookie } from './cookies.js';
import { v4 as uuid } from 'uuid';
import type { Message, Session, User } from './types.js';
import type { Server as HttpServer } from 'http';
import { randomShareCode } from './randomAssetGenerator.js';

let io: Server | undefined;

const EXPIRY_MS = parseInt(process.env.PUBLIC_EXPIRY_TIMER_SECONDS?? "0") * 1000;
const cleanupTimers = new Map<string, NodeJS.Timeout>();


export function initSocket(httpServer: HttpServer) {
	if (io) return io;
	io = new Server(httpServer, {
		path: '/api/socket',
		cors: { origin: '*' }
	});

	io.on('connection', (socket) => {
		const cookieHeader = socket.handshake.headers.cookie ?? '';
		const fakeCookies = { get: (n: string) => cookieHeader.match(new RegExp(`${n}=([^;]+)`))?.[1] };
		const auth = parseAuthCookie(fakeCookies as any);

		if (!auth) return socket.disconnect();

		const user = users.get(auth.userId);
		if (!user || user.sessionId !== auth.sessionId) return socket.disconnect();

		user.socketId = socket.id;
		const session = sessions.get(user.sessionId)!;
		socket.join(session.id);

		if (cleanupTimers.has(session.id)) {
			clearTimeout(cleanupTimers.get(session.id)!);
			cleanupTimers.delete(session.id);
		}

		if (user.isVerified) {
			sendInit(session, user, user.id === session.adminId);
		} else {
			socket.emit('verification:pending');

			const admin = users.get(session.adminId);
			if (admin?.socketId) {
				io!.to(admin.socketId).emit('verification:request', serializeUser(user));
			}
		}

		socket.on('messages:add', (text: string) => {
			if (!user.isVerified) return;
			const msg: Message = {
				id: uuid(),
				authorId: user.id,
				text,
				createdAt: Date.now()
			};
			session.messages.push(msg);
			io!.to(session.id).emit('messages:added', msg);
		});

		socket.on('messages:delete', (id: string) => {
			const idx = session.messages.findIndex(
				(m) =>
					m.id === id &&
					(m.authorId === user.id || user.id === session.adminId)
			);
			if (idx === -1) return;
			session.messages.splice(idx, 1);
			io!.to(session.id).emit('messages:deleted', id);
		});

		socket.on('share:create', (payload: { text: string }, cb?: (url: string) => void) => {
			if (!user.isVerified) return;

			const code = randomShareCode();
			shares.set(code, payload.text);

			const url = `${socket.handshake.headers.origin ?? ''}/s/${code}`;
			cb?.(url);
			socket.emit('share:created', { code, url });
		});

		socket.on('verification:respond', ({ userId, accept }: { userId: string; accept: boolean }) => {
			if (user.id !== session.adminId) return;
			const target = users.get(userId);
			if (!target || target.sessionId !== session.id) return;

			target.isVerified = accept;

			if (accept) {
				sendInit(session, target, false);
				io!.to(session.id).emit('user:updated', serializeUser(target));
			} else {
				io!.to(target.socketId!).emit('verification:result', false);
				io!.to(session.id).emit('user:removed', { userId: target.id });
				io!.sockets.sockets.get(target.socketId!)?.disconnect();
				users.delete(target.id);
			}
		});

		socket.on('session:delete', () => {
			if (user.id !== session.adminId) return;
			io!.to(session.id).emit('session:deleted');
			io!.in(session.id).socketsLeave(session.id);
			sessions.delete(session.id);
			for (const u of users.values())
				if (u.sessionId === session.id) users.delete(u.id);
		});

		socket.on('user:delete', (userId: string) => {
			let userToBeDeleted = users.get(userId);
			if (user.id === session.adminId || user.id === userId) {
				io!.to(session.id).emit('user:removed', { userId: userId });
				io!.sockets.sockets.get(users.get(userId)?.socketId!)?.disconnect();
				users.delete(userId);
			}
		});

		socket.on('disconnect', () => {
			user.socketId = undefined;

			if (EXPIRY_MS != 0 && !io!.sockets.adapter.rooms.get(session.id)) {
				const t = setTimeout(() => {
					if (!io!.sockets.adapter.rooms.get(session.id)) {
						io!.to(session.id).emit('session:deleted');
						sessions.delete(session.id);
						for (const u of users.values())
							if (u.sessionId === session.id) users.delete(u.id);
					}
					cleanupTimers.delete(session.id);
				}, EXPIRY_MS);

				cleanupTimers.set(session.id, t);
			}
		});
	});

	return io;
}

function sendInit(session: Session, user: User, isAdmin: boolean) {
	const userList = [...users.values()]
		.filter((u) => u.sessionId === session.id)
		.map(serializeUser);
	io!.to(user.socketId!).emit('session:init', {
		code: session.code,
		isAdmin: isAdmin,
		users: userList,
		name: user.name
	});
	io!.to(user.socketId!).emit('messages:init', session.messages);
	if (!isAdmin) io!.to(user.socketId!).emit('verification:result', true);
}

function serializeUser(u: User) {
	return { id: u.id, name: u.name, isVerified: u.isVerified };
}
