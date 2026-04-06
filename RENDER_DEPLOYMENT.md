# VinylTab - Render Deployment Guide

## Project Structure

The project is now properly structured for Render deployment with two separate services:

```
VinylTab/
├── server/                   # Backend service (Node/Express)
│   ├── package.json         # Backend dependencies
│   ├── index.js            # Express server entry point
│   └── playlistService.js  # Playlist resolution logic
├── src/                     # Frontend (React)
│   ├── App.jsx            # Updated with VITE_API_URL
│   ├── components/        # UI components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilities
│   └── data/              # Data files
├── public/                # Static files
├── package.json          # Frontend dependencies
├── vite.config.js        # Frontend build config (updated)
├── .gitignore            # Git ignore rules (created)
├── .env.example          # Environment variables template
└── README.md
```

## Backend Configuration (server/package.json)

The backend has its own `package.json` with:

- **name**: `vinyltab-backend`
- **type**: `module` (ES modules)
- **dependencies**: express, cors, spotify-url-info
- **entry point**: `index.js`

## Backend Server (server/index.js)

Key changes made:

- ✅ Uses `process.env.PORT` (default: 3000) - compatible with Render
- ✅ Uses `process.env.PORT || 3000` in app.listen()
- ✅ Added CORS middleware to handle cross-origin requests
- ✅ Added root route `GET /` returning `{ status: "Backend running" }`
- ✅ Comprehensive error handling with try/catch
- ✅ Port conflict detection and graceful error messages

## Frontend Configuration (src/App.jsx)

Key changes made:

- ✅ Reads API URL from `import.meta.env.VITE_API_URL`
- ✅ Defaults to `http://localhost:3000` for local development
- ✅ Replaces `/api/...` with `${API_URL}/api/...` in fetch calls
- ✅ No hardcoded localhost in frontend code
- ✅ Better error messages with dynamic API URL

## Vite Configuration (vite.config.js)

Updated for consistency:

- ✅ Dev proxy now uses `process.env.PORT` (default 3000)
- ✅ Simplified from `API_PORT` to `PORT`

## Environment Variables

### Local Development (.env)

```
PORT=3000
VITE_API_URL=http://localhost:3000
```

### Render Deployment

- **Backend service environment**:
  ```
  PORT=3000  (Render automatically assigns this)
  ```
- **Frontend service environment**:
  ```
  VITE_API_URL=https://your-backend-service.onrender.com
  # (Use the actual Render backend URL)
  ```

## Render Deployment Configuration

### Backend Service

- **Name**: `vinyltab-backend`
- **Root Directory**: `./server`
- **Environment**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Instance Type**: Free/Starter
- **Environment Variables**:
  ```
  PORT=3000
  ```

### Frontend Service (Static Site)

- **Name**: `vinyltab-frontend`
- **Root Directory**: `./`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  ```
  VITE_API_URL=https://your-backend-service.onrender.com
  ```

## API Endpoints

- `GET /` - Backend health check → `{ status: "Backend running" }`
- `GET /api/health` - API health check → `{ ok: true }`
- `POST /api/resolve-playlist` - Resolve playlist from URL

## CORSConfiguration

The backend includes CORS middleware allowing requests from:

- Any origin (for maximum compatibility)
- Can be restricted later if needed by modifying:
  ```javascript
  app.use(
    cors({
      origin: "https://your-frontend-url.onrender.com",
      credentials: true,
    }),
  );
  ```

## Running Locally

```bash
# Terminal 1: Start backend
cd server
npm install
npm start
# Backend runs on http://localhost:3000

# Terminal 2: Start frontend
npm install
VITE_API_URL=http://localhost:3000 npm run dev
# Frontend runs on http://localhost:5173
```

## Before Deploying to Render

1. ✅ Backend has `server/package.json`
2. ✅ `server/index.js` uses `process.env.PORT`
3. ✅ Frontend reads from `VITE_API_URL`
4. ✅ `.gitignore` created with proper exclusions
5. ✅ CORS enabled on backend
6. ✅ Error handling in place
7. ✅ Environment variables configured
8. ✅ No hardcoded localhost in frontend

## Troubleshooting

- **CORS errors**: Ensure backend has `cors` middleware (already added)
- **API not found**: Check `VITE_API_URL` environment variable is set correctly
- **Port conflicts**: Set different `PORT` values for multiple services
- **Build errors**: Ensure all dependencies are in appropriate `package.json` files

## Migration from Old Setup

Changes from previous configuration:

- Old: `API_PORT` / `API_HOST` → New: `PORT`
- Old: `VITE_API_BASE_URL` → New: `VITE_API_URL`
- Old: No root route → New: Added `GET /` route
- Old: No CORS → New: Added CORS middleware
- Old: Backend mixed with frontend → New: Separated `server/` and frontend

## Build & Deploy

```bash
# Frontend production build
npm run build
# Output: dist/ folder ready for Render static site

# Backend ready to deploy
# Root: ./server
# Start: node index.js
```
