import express from 'express';
import { resolvePlaylist } from './playlistService.js';

const app = express();
const PORT = Number(process.env.API_PORT || 8787);
const HOST = process.env.API_HOST || '127.0.0.1';

app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/api/resolve-playlist', async (req, res) => {
  const url = String(req.body?.url || '').trim();
  if (!url) {
    res.status(400).json({ error: 'Missing playlist URL.' });
    return;
  }

  try {
    const payload = await resolvePlaylist(url);
    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to resolve playlist.';
    res.status(422).json({ error: message });
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`playlist api ready on http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set API_PORT to a free port, for example: API_PORT=8790 npm run dev`);
  } else {
    console.error('Failed to start playlist api.', err);
  }
  process.exit(1);
});
