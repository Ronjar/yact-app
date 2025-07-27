import type { Session, User } from './types';

/** globally shared in-memory “DB” (works across multiple bundles) */
const g = globalThis as any;

if (!g.__yactStore) {
	g.__yactStore = {
		sessions: new Map<string, Session>(),
		users:    new Map<string, User>()
	};
}

export const sessions: Map<string, Session> = g.__yactStore.sessions;
export const users:    Map<string, User>    = g.__yactStore.users;

/** helper */
export const getSessionByCode = (code: string) =>
	[...sessions.values()].find((s) => s.code === code);
