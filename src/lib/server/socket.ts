import { Server } from 'socket.io';
import { sessions, files, users, invites, createNewShare, createNewInvite } from './store.js';
import { parseAuthCookie } from './cookies.js';
import { v4 as uuid } from 'uuid';
import type { Message, Session, ShareEntry, User } from './types.js';

import type { Server as HttpServer } from 'http';
import 'dotenv/config';
import { bus } from './bus.js';

let io: Server | undefined;

const EXPIRY_MS = parseInt(process.env.PUBLIC_EXPIRY_TIMER_SECONDS ?? "0") * 1000;
const BASE_URL = process.env.PUBLIC_BASE_URL;
const cleanupTimers = new Map<string, NodeJS.Timeout>();


export function initSocket(httpServer: HttpServer) {
	if (io) return io;
	io = new Server(httpServer, {
		path: '/api/socket',
		cors: { origin: '*' }
	});

	const g = globalThis as any;
	if (!g.__yactBusWired) {
		g.__yactBusWired = true;

		bus.on('upload:start', (p: {
			sessionId: string;
			authorId: string;
			fileId: string;
			kind: 'image'|'video'|'file';
			name: string;
		}) => {
			const session = sessions.get(p.sessionId);
			if (!session) return;

			const placeholder = {
				id: `upl-${p.fileId}`,
				authorId: p.authorId,
				createdAt: Date.now(),
				kind: p.kind,
				name: p.name,
				uploadId: p.fileId,
				inProgress: true,
				progress: 0,
			} as any as Message;

			const exists = session.messages.some(m => (m as any).uploadId === p.fileId || m.id === `upl-${p.fileId}`);
			if (!exists) {
				session.messages.push(placeholder);
				io!.to(p.sessionId).emit('messages:added', placeholder);
			}
		});

		bus.on('upload:progress', (p: { sessionId: string; fileId: string; percent: number }) => {
			const session = sessions.get(p.sessionId);
			if (!session) return;
			const msg = session.messages.find(m => (m as any).uploadId === p.fileId || m.id === `upl-${p.fileId}`);
			if (msg) (msg as any).progress = p.percent;
			io!.to(p.sessionId).emit('upload:progress', p);
		});

		bus.on('upload:finished', (p: {
			sessionId: string;
			fileId: string;
			finalUrl: string;
			kind: 'image'|'video'|'file';
			name: string;
		}) => {
			const session = sessions.get(p.sessionId);
			if (!session) return;

			const idx = session.messages.findIndex(m => (m as any).uploadId === p.fileId || m.id === `upl-${p.fileId}`);
			if (idx !== -1) {
				const updated = {
					...(session.messages[idx] as any),
					url: p.finalUrl,
					inProgress: false,
					progress: 100
				};
				session.messages[idx] = updated;
				io!.to(p.sessionId).emit('messages:updated', updated);
			}
		});
	}

	io.on('connection', (socket) => {
		const cookieHeader = socket.handshake.headers.cookie ?? '';
		const fakeCookies = { get: (n: string) => cookieHeader.match(new RegExp(`${n}=([^;]+)`))?.[1] };
		const auth = parseAuthCookie(fakeCookies as any);

		if (!auth) return socket.disconnect();

		const user = users.get(auth.userId);
		if(!user) {
			socket.emit('error:userNotFound');
			return socket.disconnect();
		}
		if (user.sessionId !== auth.sessionId) return socket.disconnect();

		const session = sessions.get(user.sessionId)!;

		if (!session ) {
			socket.emit('error:sessionNotFound');
			return socket.disconnect();
		}

		if (user.socketId === "From invite") {
			const admin = users.get(session.adminId);
			if (admin?.socketId) {
				io!.to(admin.socketId).emit('user:added', serializeUser(user));
			}
		}

		user.socketId = socket.id;
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
				text: text,
				kind: "text",
				createdAt: Date.now()
			};
			session.messages.push(msg);
			io!.to(session.id).emit('messages:added', msg);
		});

		socket.on(
			'messages:addMedia',
			(p: { fileId: string; kind: 'image' | 'video' | 'file'; name: string }, ack?: () => void) => {
				if (!user.isVerified) return;
				const meta = files.get(p.fileId);
				if (!meta || meta.sessionId !== session.id) return;

				const finalUrl = `/file/${p.fileId}`;
				const placeIdx = session.messages.findIndex(m => (m as any).uploadId === p.fileId || m.id === `upl-${p.fileId}`);

				if (placeIdx !== -1) {
					const updated: any = {
						...session.messages[placeIdx],
						kind: p.kind,
						name: p.name,
						url: finalUrl,
						inProgress: false,
						progress: 100
					};
					session.messages[placeIdx] = updated;
					io!.to(session.id).emit('messages:updated', updated);
					ack?.();
					return;
				}

				const msg: Message = {
					id: uuid(),
					authorId: user.id,
					createdAt: Date.now(),
					kind: p.kind,
					url: finalUrl,
					name: p.name
				};
				session.messages.push(msg);
				io!.to(session.id).emit('messages:added', msg);
				ack?.();
			}
		);


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

		socket.on('share:create', (id: string, ack?: (url: string) => void) => {
			if (!user.isVerified) return;


			const msg = session.messages.find((m) => m.id == id);

			if (msg) {
				const shareEntry: ShareEntry = msg?.kind === 'text' ? { type: "text", text: msg.text! } : { type: "file", fileId: msg.url!.split('/').pop()! }
				const code = createNewShare(shareEntry);
				const url = `${BASE_URL ?? socket.handshake.headers.origin ?? ''}/s/${code}`;
				ack?.(url);
			}
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

		socket.on('invite:create', (ack?: (token: string, url: string) => void) => {
			if (user.id !== session.adminId) return;

			const token = createNewInvite(session.id);

			const url = `${BASE_URL ?? socket.handshake.headers.origin ?? ''}/i/${token}`;

			ack?.(token, url);
		});

		socket.on('invite:delete', (token: string, ack?: (ok: boolean) => void) => {
			if (user.id !== session.adminId) return;

			const inv = invites.get(token);
			const ok = !!inv && inv === session.id && invites.delete(token);
			ack?.(ok);
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
		userId: user.id,
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