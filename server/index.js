import express from 'express';
import cors from 'cors';
import { resolvePlaylist } from './playlistService.js';

const app = express();

// ✅ Use dynamic port (Render requirement)
const PORT = process.env.PORT || 10000;

// ✅ CORS (restrict later for production if needed)
app.use(cors());
app.use(express.json());

// ✅ Root route
app.get('/', (req, res) => {
  res.json({ status: 'Backend running 🚀' });
});

// ✅ Health check
app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

// ✅ Main API
app.post('/api/resolve-playlist', async (req, res) => {
  const url = String(req.body?.url || '').trim();

  if (!url) {
    return res.status(400).json({ error: 'Missing playlist URL.' });
  }

  try {
    const payload = await resolvePlaylist(url);
    res.json(payload);
  } catch (err) {
    console.error('Playlist error:', err);
    const message =
      err instanceof Error ? err.message : 'Failed to resolve playlist.';
    res.status(422).json({ error: message });
  }
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
