import express from 'express';
import { createServer } from 'http';
import { initSocket } from '../build/server-lib/socket.js';   // <- JS!
import { handler } from '../build/handler.js';

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);

initSocket(server);   // Socket.IO hängt sich hier an
app.use(handler);     // alle anderen Requests -> SvelteKit

server.listen(port, () =>
  console.log(`🚀 listening on http://localhost:${port}`)
);
