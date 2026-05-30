import express from 'express';
import { toNodeListener } from 'h3-v2';
import path from 'path';
import { fileURLToPath } from 'url';

// Important: import the default handler
import handler from './dist/server/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static client assets
app.use(express.static(path.join(__dirname, 'dist/client')));

// Pass all other requests to TanStack Start's server SSR handler
app.use(toNodeListener(handler.default || handler));

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
