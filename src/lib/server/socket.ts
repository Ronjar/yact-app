import { Server } from 'socket.io';
import { sessions, users } from './store.js';
import { parseAuthCookie } from './cookies.js';
import { v4 as uuid } from 'uuid';
import type { Message, Session } from './types.js';
import type { Server as HttpServer } from 'http';
import type { Socket } from 'socket.io-client';

let io: Server | undefined;

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

		if (user.isVerified) {
			socket.emit('session:init', session.code);
			socket.emit('messages:init', session.messages);
		} else {
			socket.emit('verification:pending');

			const admin = users.get(session.adminId);
			if (admin?.socketId) {
				io!.to(admin.socketId).emit('verification:request', {
					userId: user.id,
					sessionId: session.id
				});
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

		socket.on(
			'verification:respond',
			({
				userId,
				accept
			}: {
				userId: string;
				accept: boolean;
			}) => {

				if (user.id === session.adminId) {
					const target = users.get(userId);
					if (!target || target.sessionId !== session.id) return;

					target.isVerified = accept;
					io!.to(target.socketId!).emit('verification:result', accept);

					if (accept) {
						sendInit(session, target.socketId!);
					} else {
						io!.to(target.socketId!).emit('session:rejected');
						io!.sockets.sockets.get(target.socketId!)?.disconnect();
					}
				}
			}
		);


		socket.on('session:delete', () => {
			if (user.id !== session.adminId) return;
			io!.to(session.id).emit('session:deleted');
			io!.in(session.id).socketsLeave(session.id);
			session.messages.length = 0;
			sessions.delete(session.id);
			for (const u of users.values())
				if (u.sessionId === session.id) users.delete(u.id);
		});

		socket.on('disconnect', () => {
			user.socketId = undefined;
		});
	});

	return io;
}

function sendInit(session: Session, target: string){
	io!.to(target!).emit(
		'session:init',
		session.code
	);
	io!.to(target!).emit(
		'messages:init',
		session.messages
	);
}