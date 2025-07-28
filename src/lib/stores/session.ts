import { writable } from 'svelte/store';

export interface SessionMeta {
	code: string | undefined;
	adminId: string | undefined;
}

export const sessionMeta = writable<SessionMeta>({
	code: undefined,
	adminId: undefined
});
