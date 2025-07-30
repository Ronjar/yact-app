import { defineConfig, type ViteDevServer } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import type { Server as NodeServer } from 'http';

const webSocketServer = {
	name: 'webSocketServer',
	async configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const httpServer = server.httpServer as unknown as NodeServer;

		const { initSocket } = await import('./src/lib/server/socket');
		initSocket(httpServer);
	}
};

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), webSocketServer]
});
