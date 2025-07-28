import { writable } from 'svelte/store';

export interface SessionMeta {
	code: string | undefined;
	isAdmin: boolean | undefined;
}

export const sessionMeta = writable<SessionMeta>({
	code: undefined,
	isAdmin: undefined
});
