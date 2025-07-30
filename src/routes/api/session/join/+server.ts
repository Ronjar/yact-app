import { json, error, type RequestHandler } from '@sveltejs/kit';
import { v4 as uuid } from 'uuid';
import { users, getSessionByCode } from '$lib/server/store';
import { setAuthCookie } from '$lib/server/cookies';
import { randomName } from '$lib/server/randomAssetGenerator';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { code } = await request.json() as { code: string };
	const session = getSessionByCode(code);
	if (!session) throw error(404, 'Session not found');

	const userId = uuid();
	users.set(userId, { id: userId, name: randomName(), sessionId: session.id, isVerified: false });
	setAuthCookie(cookies, userId, session.id);

	return json({ sessionId: session.id, userId, adminId: session.adminId });
};