import { spawn } from 'node:child_process';
import spotifyUrlInfoFactory from 'spotify-url-info';

const MAX_TRACKS = 12;
const SEARCH_CONCURRENCY = 3;
const SEARCH_TIMEOUT_MS = 9000;

const ART_PRESETS = [
  { bg: ['#0d0d2b', '#1a0533'], shape: 'city' },
  { bg: ['#0a1a0a', '#001a1a'], shape: 'wave' },
  { bg: ['#1a0800', '#2d0a00'], shape: 'fire' },
  { bg: ['#001a10', '#0a0a1a'], shape: 'circles' }
];

const { getDetails } = spotifyUrlInfoFactory(fetch);

function inferPlatform(urlObj) {
  const host = urlObj.hostname.toLowerCase();
  if (host.includes('spotify')) return 'Spotify';
  if (host.includes('youtube') || host.includes('youtu.be')) return 'YouTube';
  if (host.includes('soundcloud')) return 'SoundCloud';
  if (host.includes('apple')) return 'Apple Music';
  if (host.includes('deezer')) return 'Deezer';
  if (host.includes('tidal')) return 'TIDAL';
  return 'External';
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function sanitizeTrackName(raw, idx) {
  const text = String(raw || '').replace(/\s+/g, ' ').trim();
  return text || `Track ${idx + 1}`;
}

function pickThumbnail(obj) {
  if (!obj || typeof obj !== 'object') return '';

  const directCandidates = [obj.thumbnail, obj.image, obj.coverUrl, obj.artwork];
  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }

  const collections = [obj.thumbnails, obj.images, obj['coverArt']?.sources, obj.album?.images];
  for (const list of collections) {
    if (!Array.isArray(list)) continue;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const item = list[i];
      if (typeof item === 'string' && item.trim()) return item.trim();
      if (item && typeof item.url === 'string' && item.url.trim()) return item.url.trim();
    }
  }

  return '';
}

function runYtDlp(url) {
  const pythonCmd = process.platform === 'win32' ? 'py' : 'python3';
  const args = ['-m', 'yt_dlp', '--dump-single-json', '--skip-download', '--flat-playlist', url];

  return new Promise((resolve, reject) => {
    const child = spawn(pythonCmd, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      reject(new Error(`yt-dlp spawn failed: ${err.message}`));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || 'yt-dlp failed to read playlist link.'));
        return;
      }
      try {
        const json = JSON.parse(stdout);
        resolve(json);
      } catch {
        reject(new Error('Could not parse yt-dlp response.'));
      }
    });
  });
}

async function resolveSpotifyPlaylist(url) {
  const details = await getDetails(url);
  const list = Array.isArray(details?.tracks) ? details.tracks : [];

  const tracks = list.map((item, idx) => {
    const name = sanitizeTrackName(item?.name || item?.title, idx);
    const artist = String(item?.artist || '').trim() || 'Unknown Artist';
    const sec = Math.max(1, Math.floor((item?.duration || 180000) / 1000));
    const thumbnail = pickThumbnail(item);
    return { name, artist, total: sec, thumbnail };
  });

  return {
    platform: 'Spotify',
    name: String(details?.title || details?.name || 'Spotify Playlist'),
    tracks
  };
}

async function resolveGenericPlaylist(url, platform) {
  const data = await runYtDlp(url);
  const rawEntries = Array.isArray(data?.entries) && data.entries.length ? data.entries : [data];

  const tracks = rawEntries.map((entry, idx) => {
    const title = sanitizeTrackName(entry?.title || entry?.id, idx);
    const artist = String(entry?.channel || entry?.uploader || '').trim();
    const total = Math.max(0, Math.floor(entry?.duration || 0));
    return {
      name: title,
      artist,
      total,
      youtubeId: data?.extractor_key === 'YoutubeTab' ? entry?.id : undefined,
      thumbnail: pickThumbnail(entry)
    };
  });

  return {
    platform,
    name: String(data?.title || `${platform} Playlist`),
    tracks
  };
}

async function searchYoutubeVideoId(query) {
  const data = await runYtDlp(`ytsearch1:${query}`);
  const entry = Array.isArray(data?.entries) ? data.entries[0] : null;
  if (!entry?.id) return null;
  const thumbnail = pickThumbnail(entry) || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`;

  return {
    youtubeId: entry.id,
    total: Math.max(0, Math.floor(entry.duration || 0)),
    thumbnail
  };
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Search timeout')), timeoutMs);
    })
  ]);
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const output = new Array(items.length).fill(null);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      output[idx] = await mapper(items[idx], idx);
    }
  });

  await Promise.all(workers);
  return output.filter(Boolean);
}

async function mapTracksToYoutube(sourceTracks) {
  const limited = sourceTracks.slice(0, MAX_TRACKS);

  const mapped = await mapWithConcurrency(limited, SEARCH_CONCURRENCY, async (source, i) => {
    let youtube = null;

    if (source.youtubeId) {
      youtube = {
        youtubeId: source.youtubeId,
        total: source.total || 0,
        thumbnail: source.thumbnail || `https://i.ytimg.com/vi/${source.youtubeId}/hqdefault.jpg`
      };
    } else {
      const query = `${source.name} ${source.artist || ''} audio`.trim();
      try {
        youtube = await withTimeout(searchYoutubeVideoId(query), SEARCH_TIMEOUT_MS);
      } catch {
        youtube = null;
      }
    }

    if (!youtube?.youtubeId) return null;

    const total = youtube.total > 0 ? youtube.total : source.total > 0 ? source.total : 180;
    return {
      id: i,
      name: source.name,
      artist: source.artist || 'Unknown Artist',
      duration: formatDuration(total),
      total,
      youtubeId: youtube.youtubeId,
      thumbnail: source.thumbnail || youtube.thumbnail || `https://i.ytimg.com/vi/${youtube.youtubeId}/hqdefault.jpg`,
      art: ART_PRESETS[i % ART_PRESETS.length]
    };
  });

  return mapped;
}

export async function resolvePlaylist(urlString) {
  let urlObj;
  try {
    urlObj = new URL(urlString);
  } catch {
    throw new Error('Enter a valid URL.');
  }

  const platform = inferPlatform(urlObj);
  const source =
    platform === 'Spotify'
      ? await resolveSpotifyPlaylist(urlObj.toString())
      : await resolveGenericPlaylist(urlObj.toString(), platform);

  if (!source.tracks.length) {
    throw new Error('No tracks found in that playlist URL.');
  }

  const tracks = await mapTracksToYoutube(source.tracks);
  if (!tracks.length) {
    throw new Error('Could not find playable YouTube matches for this playlist.');
  }

  return {
    url: urlObj.toString(),
    platform: source.platform,
    name: source.name,
    tracks,
    sourceTrackCount: source.tracks.length,
    importedTrackCount: tracks.length
  };
}
