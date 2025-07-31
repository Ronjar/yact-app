import { json } from '@sveltejs/kit';
import { randomName } from './randomAssetGenerator';
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

export function createNewUser(sessionId: string, isVerified: boolean = false, socketId: string = ""): User{
	const userId = uuid();
	const user: User = { id: userId, name: randomName(), sessionId: sessionId, isVerified: isVerified, socketId: socketId };
	users.set(userId, user);
	return user;
}
