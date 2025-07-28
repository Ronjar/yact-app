import type { PageServerLoad, Actions } from './$types';
import { parseAuthCookie, clearAuthCookie } from '$lib/server/cookies';

export const load: PageServerLoad = ({ cookies }) => {
	const auth = parseAuthCookie(cookies);
	return { autoResume: auth ?? null };
};

export const actions: Actions = {
	resetAuth: async ({ cookies }) => {
		clearAuthCookie(cookies);
		return { ok: true };
	}
};
