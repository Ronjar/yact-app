import { json, error, type RequestHandler } from '@sveltejs/kit';
import { v4 as uuid } from 'uuid';
import path from 'node:path';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import { parseAuthCookie } from '$lib/server/cookies';
import { files, users } from '$lib/server/store';
import { bus } from '$lib/server/bus';

const UP_DIR = 'private_uploads';
const allow = /^(image|video|application|text)\//;

const MIN_EMIT_MS = 50;

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const auth = parseAuthCookie(cookies);
	const me = auth && users.get(auth.userId);
	if (!me || !me.isVerified) throw error(403, 'forbidden');

	const data = await request.formData();
	const file = data.get('file') as File | null;
	if (!file) throw error(400, 'missing file');
	if (!allow.test(file.type)) throw error(415, 'type');

	const id = uuid();
	const ext = file.name.split('.').pop() || file.type.split('/')[1];
	const fname = `${id}.${ext}`;
	const full = path.join(UP_DIR, fname);

	await fs.mkdir(UP_DIR, { recursive: true });

	const kind = file.type.startsWith('image/')
		? 'image'
		: file.type.startsWith('video/')
			? 'video'
			: 'file';


	bus.emit('upload:start', {
		sessionId: me.sessionId,
		authorId: me.id,
		fileId: id,
		kind,
		name: file.name
	});

	const size = file.size;
	const reader = (file.stream() as ReadableStream<Uint8Array>).getReader();
	const ws = fsSync.createWriteStream(full);

	let written = 0;
	let lastEmit = 0;
	const SUBCHUNK = 64 * 1024;

	await new Promise<void>(async (resolve, reject) => {
		ws.on('error', reject);
		ws.on('finish', resolve);

		while (true) {
			const { value, done } = await reader.read();
			if (done) break;

			if (value && value.byteLength) {

				for (let off = 0; off < value.byteLength; off += SUBCHUNK) {
					const seg = value.subarray(off, Math.min(off + SUBCHUNK, value.byteLength));

					if (!ws.write(Buffer.from(seg))) {
						await new Promise(r => ws.once('drain', r));
					}
					written += seg.byteLength;

					const now = Date.now();
					const percent = Math.max(0, Math.min(100, Math.round((written / size) * 100)));

					if (percent === 100 || now - lastEmit >= MIN_EMIT_MS) {
						lastEmit = now;
						bus.emit('upload:progress', { sessionId: me.sessionId, fileId: id, percent });
					}
				}
			}
		}
		ws.end();
	});
	files.set(id, {
		path: full,
		sessionId: me.sessionId,
		mime: file.type,
		name: file.name
	});

	const finalUrl = `${url.origin}/file/${id}`;
	bus.emit('upload:finished', {
		sessionId: me.sessionId,
		fileId: id,
		finalUrl,
		kind,
		name: file.name
	});

	return json({ fileId: id, kind, name: file.name, url: finalUrl });
};