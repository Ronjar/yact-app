import { randomInviteToken, randomName, randomSessionCode, randomShareCode } from './randomAssetGenerator.js';
import type { Session, User } from './types';
import { v4 as uuid } from 'uuid';

const g = globalThis as any;

if (!g.__yactStore) {
	g.__yactStore = {
		sessions:	new Map<string, Session>(),
		users:		new Map<string, User>(),
		invites:	new Map<string, string>(),
		shares:		new Map<string, string>()
	};
}

export const sessions: Map<string, Session>	= g.__yactStore.sessions;
export const users:    Map<string, User>	= g.__yactStore.users;
export const invites:    Map<string, string>	= g.__yactStore.invites;
export const shares: Map<string, string>	= g.__yactStore.shares;

export const getSessionByCode = (code: string) =>
	[...sessions.values()].find((s) => s.code === code);

export function createNewUser(sessionId: string, isVerified: boolean = false, socketId: string | undefined = undefined): User{
	const userId = uuid();
	const user: User = { id: userId, name: randomName(), sessionId: sessionId, isVerified: isVerified, socketId: socketId };
	users.set(userId, user);
	return user;
}

export function createNewSession(): {session: Session, admin: User} {
	const sessionId = uuid();
	const admin = createNewUser(sessionId, true);
	const session: Session = {
		id: sessionId,
		code: randomSessionCode(),
		adminId: admin.id,
		messages: []
	};
	users.set(admin.id, admin);
	sessions.set(sessionId, session);
	return { session, admin };
}

export function createNewShare(text: string): string {
	const shareCode = randomShareCode();
	shares.set(shareCode, text);
	return shareCode;
}

export function createNewInvite(sessionId: string): string {
	const inviteToken = randomInviteToken();
	invites.set(inviteToken, sessionId);
	return inviteToken;
}