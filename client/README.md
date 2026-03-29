# Client

## Local Development

Add a `client/.env` file only if you want to override the API target:

```bash
VITE_API_BASE=http://localhost:4040
```

If `VITE_API_BASE` is left empty, local Vite development will use the `/api` proxy from `vite.config.js`.

## Production Deploy

For Vercel or any other static host, set:

```bash
VITE_API_BASE=https://your-backend-domain.example.com
```

The frontend needs a live backend URL in production. If the backend is deployed separately, that backend must also allow the frontend origin with `APP_CORS_ALLOWED_ORIGIN_PATTERNS`.
