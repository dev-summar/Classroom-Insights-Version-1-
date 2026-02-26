# Production Deployment Guide

This document describes the **MIET Classroom Insights** system for production handoff. It covers architecture, configuration, and deployment only. No application logic, APIs, or UI are modified by this guide.

---

## 1. System Architecture

- **Frontend**: React SPA (Vite), served as static files from a web server or CDN.
- **Backend**: FastAPI (Python) API server; handles Google Classroom sync, analytics, and data access.
- **Database**: MongoDB Atlas (cloud); all persistent data lives here. Local MongoDB is **not** supported.

Data flow: Frontend → Backend (REST API) → MongoDB Atlas. Google Classroom data is synced into the database via the backend using a Google service account; the frontend never talks to Google directly.

---

## 2. Backend Stack

- **Runtime**: Python, FastAPI
- **Database**: MongoDB Atlas
- **Sync**: Google Classroom API (service account); incremental upserts into MongoDB

### 2.1 Incremental Sync Behavior

- Sync **adds or updates** records; it does **not** wipe existing data.
- Courses, teachers, students, coursework, and submissions are **upserted** by stable IDs.
- Existing data in the DB stays; new or changed data from Google Classroom is merged in.

### 2.2 Background Sync (Non-Blocking)

- Sync is triggered via API (`POST /api/sync/all` or per-resource sync endpoints).
- The UI remains visible and responsive during sync; users can keep browsing cached/current data.
- After sync completes, cache is invalidated so subsequent requests see updated data.

---

## 3. Backend: Environment & Run

### 3.1 Required Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Full MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/`). **Required.** Localhost/127.0.0.1 is rejected. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to the Google Cloud service account JSON file (e.g. `./service-account.json`). Used for Google Classroom API. |
| `GOOGLE_IMPERSONATED_USER` | Email of the Google Workspace user (domain admin or delegated) to impersonate for Classroom API access. |

### 3.2 Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port for the backend (default: `8000`). |
| `FRONTEND_ORIGIN` | Allowed CORS origin for the frontend (default: `http://localhost:5173`). Set to production frontend URL in production. |
| `ENV` | Optional; can be set to `production` for environment-specific tooling or checks. Not used by application logic. |

### 3.3 Database Name

- The application uses a **fixed database name**: `classroom_insights`. It is not configurable via environment.

### 3.4 Google Classroom Service Account

- Obtain a Google Cloud service account JSON key with Classroom API access and domain-wide delegation (if impersonating a user).
- Configure the path via **`GOOGLE_APPLICATION_CREDENTIALS`** (environment or `.env`). Do **not** commit the JSON file or any secrets to the repository.

### 3.5 Running the Backend in Production

Use **uvicorn** to run the FastAPI app:

```bash
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Or run the module directly (same effect as above):

```bash
python main.py
```

- `host="0.0.0.0"` allows binding to all interfaces (needed for containers/remote access). Override port with `PORT` if required.

### 3.6 MongoDB Logging in Production

- MongoDB driver logs (pymongo, motor, urllib3) are set to **WARNING** level in the application. INFO-level MongoDB/driver logs are **suppressed** so production logs stay clean.

### 3.7 No Secrets in Repository

- Do **not** commit `.env`, `service-account.json`, or any file containing `MONGODB_URI` or API keys. Use environment variables or a secrets manager in production.

---

## 4. Frontend Stack

- **Build**: React with **Vite**
- **Output**: Static assets in **`dist/`**; only this folder is deployed to a web server or CDN.

### 4.1 Environment: `.env.production`

- Use **`.env.production`** for production builds. This file is used by Vite when running `npm run build`.
- **Do not** commit secrets; only non-secret configuration (e.g. public API base URL) should be in version control if desired.

### 4.2 API Base URL: `VITE_API_BASE_URL`

- The frontend uses **only** **`VITE_API_BASE_URL`** for the backend (see `frontend/src/config/api.js`). All API requests use this base URL.
- Set `VITE_API_BASE_URL` in `.env.production` to the production backend URL (e.g. `https://api.yourdomain.com` or `https://api.yourdomain.com/api` depending on your routing).

### 4.3 Build Steps

1. Install dependencies: `npm install`
2. Configure production env: ensure `VITE_API_BASE_URL` is set in `.env.production`
3. Build: **`npm run build`**
4. Deploy the **`dist/`** directory to your web server or CDN (e.g. Nginx, Apache, or static hosting). Do **not** deploy source or `node_modules`.

---

## 5. Production Behavior Guarantees

- **New users see existing data**: On first load, the UI reads from the backend, which reads from MongoDB. Any data already in the DB (from previous syncs) is shown immediately; no sync is required to see current DB state.
- **Sync is incremental**: Sync endpoints upsert by ID; they do not clear collections. New and updated records are added/updated; existing data remains unless overwritten by newer data for the same ID.
- **UI does not go blank during sync**: Sync runs on the server when triggered (e.g. “Sync Now”). The UI stays visible and can continue to show previously loaded (cached) data.
- **Cached data remains visible**: The backend uses in-memory read-through cache with TTL. Until cache expires or is invalidated after sync, users see cached responses; after sync, cache is invalidated so the next request gets fresh data.
- **Data refreshes after sync**: Once sync completes, cache invalidation ensures that subsequent page loads or refreshes return up-to-date data from the DB.

---

## 6. Deployment Checklist (Production Engineers)

### 6.1 Environment Variables

- [ ] `MONGODB_URI` – MongoDB Atlas URI (no localhost)
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` – Path to service account JSON
- [ ] `GOOGLE_IMPERSONATED_USER` – Impersonated user email
- [ ] `PORT` – Backend port (optional; default 8000)
- [ ] `FRONTEND_ORIGIN` – Production frontend origin for CORS
- [ ] (Optional) `ENV=production`

### 6.2 Backend Build / Start

- [ ] Python dependencies installed (e.g. from `requirements.txt` if present)
- [ ] No secrets in repo; credentials provided via env or secrets manager
- [ ] Start command: `uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}` (or `python main.py`)

### 6.3 Frontend Build / Deploy

- [ ] `VITE_API_BASE_URL` set in `.env.production`
- [ ] `VITE_BASE_PATH=/site/classroom/` set in `.env.production` (so assets and routes use `/site/classroom/`)
- [ ] Run: `npm install` then `npm run build`
- [ ] Deploy only **`dist/`** to web server or CDN

### 6.4 SPA routing (back / forward / refresh)

For **browser back/forward** and **direct URLs** (e.g. `https://pi360.net/site/classroom/silent-students`) and **refresh** to work, the server must serve the SPA’s `index.html` for all paths under `/site/classroom/` (except real files like `/site/classroom/assets/*`).

- **Apache** (e.g. in a `.htaccess` or vhost for the app root):
  ```apache
  RewriteEngine On
  RewriteBase /site/classroom/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /site/classroom/index.html [L]
  ```
- **Nginx**: use a `try_files` fallback so that non-file requests under `/site/classroom/` return `/site/classroom/index.html`.

If this is configured, back, forward, and refresh will work normally in production.

### 6.5 Verification

- [ ] Backend health/readiness: `GET /api/stats` (or `/classrooms/api/stats` if behind proxy) returns 200
- [ ] Frontend loads and can call backend (no CORS errors)
- [ ] Sync: `POST /api/sync/all` (with valid Google credentials) returns success and DB documents increase or update as expected
- [ ] MongoDB Atlas connection confirmed (no local MongoDB)

---

*This document is for production handoff only. It does not replace code or change application behavior.*
