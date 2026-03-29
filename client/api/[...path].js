function normalizeBaseUrl(value) {
  return (value || "").replace(/\/+$/, "");
}

function buildTargetUrl(req) {
  const backendBase = normalizeBaseUrl(process.env.BACKEND_API_BASE || process.env.VITE_API_BASE);
  if (!backendBase) {
    return null;
  }

  const pathParts = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
  const upstreamPath = pathParts.join("/");
  const queryIndex = req.url.indexOf("?");
  const query = queryIndex >= 0 ? req.url.slice(queryIndex) : "";
  return `${backendBase}/api/${upstreamPath}${query}`;
}

function getRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  if (req.body == null) {
    return undefined;
  }

  if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
    return req.body;
  }

  return JSON.stringify(req.body);
}

export default async function handler(req, res) {
  const targetUrl = buildTargetUrl(req);
  if (!targetUrl) {
    res.status(500).json({
      message:
        "Missing BACKEND_API_BASE for Vercel API proxy. Set it to your Spring Boot backend URL, for example https://your-backend-domain.example.com.",
    });
    return;
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) {
      continue;
    }

    const lowerKey = key.toLowerCase();
    if (["host", "connection", "content-length", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto"].includes(lowerKey)) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => headers.append(key, entry));
    } else {
      headers.set(key, value);
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: getRequestBody(req),
      redirect: "manual",
    });

    res.status(upstream.status);

    const contentType = upstream.headers.get("content-type");
    if (contentType) {
      res.setHeader("content-type", contentType);
    }

    const cacheControl = upstream.headers.get("cache-control");
    if (cacheControl) {
      res.setHeader("cache-control", cacheControl);
    }

    const text = await upstream.text();
    res.send(text);
  } catch (error) {
    res.status(502).json({
      message: "Unable to reach the backend API from the Vercel proxy.",
      detail: error instanceof Error ? error.message : "Unknown proxy error",
    });
  }
}
