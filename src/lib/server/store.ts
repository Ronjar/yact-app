import type { Session, User } from './types';

const g = globalThis as any;

if (!g.__yactStore) {
	g.__yactStore = {
		sessions: new Map<string, Session>(),
		users:    new Map<string, User>(),
		shares:	  new Map<string, string>()
	};
}

export const sessions: Map<string, Session> = g.__yactStore.sessions;
export const users:    Map<string, User>    = g.__yactStore.users;
export const shares: Map<string, string>    = g.__yactStore.shares;

export const getSessionByCode = (code: string) =>
	[...sessions.values()].find((s) => s.code === code);