import type { RequestHandler } from './$types';
import { parseAuthCookie } from '$lib/server/cookies';
import { files, users } from '$lib/server/store';
import fs from 'node:fs/promises';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const meta = files.get(params.id);
	if (!meta) return new Response('not found', { status: 404 });

	const auth = parseAuthCookie(cookies);
	const me   = auth && users.get(auth.userId);
	if (!me || me.sessionId !== meta.sessionId || !me.isVerified)
		return new Response('forbidden', { status: 403 });

	const buf = await fs.readFile(meta.path);
	return new Response(buf, {
		headers: {
			'content-type': meta.mime,
			'content-disposition': meta.mime.startsWith('image/')
				? 'inline'
				: `attachment; filename="${meta.name}"`
		}
	});
};
