import { shares, files } from '$lib/server/store';
import type { RequestHandler } from './$types';

import fs from 'node:fs/promises';

export const GET: RequestHandler = async ({ params }) => {
  const entry = shares.get(params.code);
  if (!entry) return new Response('not found', { status: 404 });

  // 1)  Nur Text  → plain text
  if (entry.type === 'text')
    return new Response(entry.text, { headers:{'content-type':'text/plain; charset=utf-8'} });

  // 2)  Datei    → Meta suchen, Buffer streamen
  const meta = files.get(entry.fileId);
  if (!meta) return new Response('gone', { status: 410 });

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
