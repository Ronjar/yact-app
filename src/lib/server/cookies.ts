import { serialize } from 'cookie';
import type { Cookies } from '@sveltejs/kit';

export const COOKIE = 'yact';

/** writes `{userId,sessionId}` cookie */
export function setAuthCookie(cookies: Cookies, userId: string, sessionId: string) {
	cookies.set(
		COOKIE,
		JSON.stringify({ userId, sessionId }),
		{ path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 }
	);
}

export function parseAuthCookie(cookies: Cookies) {
	const raw = cookies.get(COOKIE);
	if (!raw) return null;
	try {
		return JSON.parse(decodeURIComponent(raw));
	} catch {
		return null;
	}
}

export function clearAuthCookie(cookies: Cookies) {
	cookies.delete(COOKIE, { path: '/' });
}
