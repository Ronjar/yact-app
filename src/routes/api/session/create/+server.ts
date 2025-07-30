import { json, type RequestHandler } from '@sveltejs/kit';
import { v4 as uuid } from 'uuid';
import { sessions, users } from '$lib/server/store';
import { setAuthCookie } from '$lib/server/cookies';
import { randomSessionCode, randomName } from '$lib/server/randomAssetGenerator';

export const POST: RequestHandler = ({ cookies }) => {
	const sessionId = uuid();
	const adminId = uuid();
	const sessionCode = randomSessionCode();

	sessions.set(sessionId, { id: sessionId, code: sessionCode, adminId, messages: [] });
	users.set(adminId, { id: adminId, name: randomName(), sessionId, isVerified: true });

	setAuthCookie(cookies, adminId, sessionId);

	return json({ sessionId, sessionCode, adminId });
};