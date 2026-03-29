# Client

## Local Development

Add a `client/.env` file only if you want to override the API target:

```bash
VITE_API_BASE=http://localhost:4040
BACKEND_API_BASE=http://localhost:4040
```

If `VITE_API_BASE` is left empty, local Vite development will use the `/api` proxy from `vite.config.js`.

## Production Deploy

For a static host with direct browser-to-backend calls, set:

```bash
VITE_API_BASE=https://your-backend-domain.example.com
```

The frontend needs a live backend URL in production. If the backend is deployed separately, that backend must also allow the frontend origin with `APP_CORS_ALLOWED_ORIGIN_PATTERNS`.

### Vercel Recommended Setup

This project now includes a Vercel serverless proxy at `/api/*`.

Set this environment variable in Vercel:

```bash
BACKEND_API_BASE=https://your-backend-domain.example.com
```

With `BACKEND_API_BASE` configured, the deployed frontend can keep calling `/api/...` on the same origin and Vercel will forward those requests to the Spring Boot backend. This avoids exposing the backend URL in the browser bundle and fixes `NOT_FOUND` errors caused by posting to the frontend app itself.
