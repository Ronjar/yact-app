import type { Handle } from '@sveltejs/kit';
import { initSocket } from '$lib/server/socket';

export const handle: Handle = async ({ event, resolve }) => {
  // Im Build läuft SvelteKit bereits in einem Node-Server
  if (!event.locals.__io && (event.platform as any)?.server) {
    initSocket((event.platform as any).server);
    event.locals.__io = true;
  }
  return resolve(event);
};
