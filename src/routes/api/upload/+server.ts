import { json, error, type RequestHandler } from '@sveltejs/kit';
import { v4 as uuid } from 'uuid';
import path from 'node:path';
import fs from 'node:fs/promises';
import { parseAuthCookie } from '$lib/server/cookies';
import { files, users } from '$lib/server/store';

const UP_DIR = 'private_uploads';
const allow = /^(image|video|application|text)\//;

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const auth = parseAuthCookie(cookies);
	const me   = auth && users.get(auth.userId);
	if (!me || !me.isVerified) throw error(403, 'forbidden');

	const data = await request.formData();
	const file = data.get('file') as File | null;
	if (!file) throw error(400, 'missing file');
	if (!allow.test(file.type)) throw error(415, 'type');

	const id    = uuid();
	const ext   = file.name.split('.').pop() || file.type.split('/')[1];
	const fname = `${id}.${ext}`;
	const full  = path.join(UP_DIR, fname);

	await fs.mkdir(UP_DIR, { recursive: true });
	await fs.writeFile(full, Buffer.from(await file.arrayBuffer()));

	files.set(id, {
		path: full,
		sessionId: me.sessionId,
		mime: file.type,
		name: file.name
	});

	const kind = file.type.startsWith('image/')
		? 'image'
		: file.type.startsWith('video/')
		? 'video'
		: 'file';

	return json({ fileId: id, kind, name: file.name, url: `${url.origin}/file/${id}` });
};