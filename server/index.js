import express from 'express';
import cors from 'cors';
import { resolvePlaylist } from './playlistService.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'Backend running' });
});

// Health check
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set PORT to a free port or close the current process.`);
  } else {
    console.error('Failed to start server.', err);
  }
  process.exit(1);
});
