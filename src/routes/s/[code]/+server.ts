import { shares } from '$lib/server/store';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
  const text = shares.get(params.code);
  if (!text) return new Response('Not found', { status: 404 });

  return new Response(text, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
};